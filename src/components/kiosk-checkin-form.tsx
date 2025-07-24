"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { openDB, type IDBPDatabase } from 'idb';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getClosestKiosk, submitCheckin } from "@/app/actions";
import { kiosks } from "@/lib/kiosks";
import { Camera, Loader2, Building, VideoOff, SwitchCamera, Trash2, Wifi, WifiOff, UploadCloud } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const createFormSchema = (notesRequired: boolean) => z.object({
  kioskId: z.string({ required_error: "Por favor, selecciona un kiosco." }).min(1, "Por favor, selecciona un kiosco."),
  checkinType: z.enum(["entrada", "comida", "salida"], {
    required_error: "Debes seleccionar un tipo de check-in.",
  }),
  photos: z
    .array(z.custom<File>(val => val instanceof File, "Se requiere una foto."))
    .min(1, "Se requiere al menos una foto.")
    .refine((files) => files.every(file => file.size <= 5 * 1024 * 1024), `El tamaño máximo por foto es 5MB.`),
  notes: notesRequired 
    ? z.string().min(1, "Las notas son obligatorias.").max(500, "Las notas no pueden exceder los 500 caracteres.")
    : z.string().max(500, "Las notas no pueden exceder los 500 caracteres.").optional(),
  userEmail: z.string().email(),
  userId: z.string(),
  userName: z.string(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});


type CheckinType = "entrada" | "comida" | "salida";
type FacingMode = "user" | "environment";
type FormSchemaType = z.infer<ReturnType<typeof createFormSchema>>;
type PendingCheckin = FormSchemaType & { id: number; photos: File[] };


const checkinTypes: { value: CheckinType; label: string }[] = [
    { value: "entrada", label: "Entrada" },
    { value: "comida", label: "Comida" },
    { value: "salida", label: "Salida" },
];

export function KioskCheckinForm({ notesRequired }: { notesRequired: boolean }) {
  const { toast } = useToast();
  const { user, isFirebaseConfigured } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [db, setDb] = useState<IDBPDatabase | null>(null);


  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const formSchema = useMemo(() => createFormSchema(notesRequired), [notesRequired]);

  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kioskId: "",
      checkinType: "entrada",
      notes: "",
      photos: [],
      userEmail: user?.email || "",
      userId: user?.uid || "",
      userName: user?.displayName || "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  useEffect(() => {
    if (user) {
      form.setValue('userEmail', user.email || "");
      form.setValue('userId', user.uid);
      form.setValue('userName', user.displayName || "");
    }
  }, [user, form]);
  
  useEffect(() => {
    async function initDb() {
      try {
        const database = await openDB('asistencia-aviva-db', 1, {
          upgrade(db) {
            if (!db.objectStoreNames.contains('pending-checkins')) {
              db.createObjectStore('pending-checkins', { keyPath: 'id', autoIncrement: true });
            }
          },
        });
        setDb(database);
      } catch (e) {
        console.error("Failed to initialize database", e);
        toast({
          variant: "destructive",
          title: "Error de Base de Datos",
          description: "No se pudo inicializar la base de datos para el modo offline."
        });
      }
    }
    initDb();
  }, [toast]);

  const updatePendingCount = useCallback(async () => {
    if (!db) return;
    try {
      const count = await db.count('pending-checkins');
      setPendingCount(count);
    } catch (e) {
      console.error("Failed to update pending count", e);
    }
  }, [db]);

  const processPendingCheckins = useCallback(async () => {
    if (!db || !user?.email || !isFirebaseConfigured) return;
    try {
      const pending = await db.getAll('pending-checkins');
      if (pending.length === 0) return;

      toast({
        title: "Sincronizando...",
        description: `Enviando ${pending.length} check-in(s) pendientes.`,
      });

      let successCount = 0;
      for (const checkin of pending as PendingCheckin[]) {
        const formData = new FormData();
        formData.append("kioskId", checkin.kioskId);
        formData.append("checkinType", checkin.checkinType);
        checkin.photos.forEach((photo, index) => {
            const file = new File([photo], photo.name, { type: photo.type });
            formData.append(`photo_${index}`, file);
        });
        if (checkin.notes) formData.append("notes", checkin.notes);
        formData.append("userEmail", checkin.userEmail);
        formData.append("userId", checkin.userId);
        formData.append("userName", checkin.userName);
        if(checkin.latitude) formData.append("latitude", checkin.latitude.toString());
        if(checkin.longitude) formData.append("longitude", checkin.longitude.toString());


        const result = await submitCheckin(formData);
        if (result.success) {
          await db.delete('pending-checkins', checkin.id);
          successCount++;
        } else {
           console.error("Failed to submit pending checkin:", result.message);
        }
      }
      
      const remainingCount = await db.count('pending-checkins');
      setPendingCount(remainingCount);

      if (remainingCount === 0 && successCount > 0) {
        toast({
          title: "Sincronización completa",
          description: "Todos los check-ins pendientes han sido enviados.",
        });
      } else if (remainingCount > 0) {
         toast({
          variant: "destructive",
          title: "Error de Sincronización",
          description: `No se pudieron enviar todos los registros. ${remainingCount} pendientes.`,
        });
      }
    } catch(e) {
      console.error("Failed to process pending checkins", e);
      toast({
        variant: "destructive",
        title: "Error de Sincronización",
        description: "No se pudieron enviar los registros pendientes.",
      });
    }
  }, [db, toast, user, isFirebaseConfigured]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'onLine' in navigator) {
      setIsOnline(navigator.onLine);
      if(navigator.onLine) {
        processPendingCheckins();
      }
    }
    
    const handleOnline = () => {
      setIsOnline(true);
      processPendingCheckins();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    updatePendingCount();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processPendingCheckins, updatePendingCount]);
  
  useEffect(() => {
    if (!navigator.geolocation) {
      toast({
        variant: "destructive",
        title: "Error de Geolocalización",
        description: "Tu navegador no soporta la geolocalización.",
      });
      setLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("latitude", latitude);
        form.setValue("longitude", longitude);
        try {
          const closest = await getClosestKiosk(latitude, longitude);
          if (closest?.closestKioskId) {
            form.setValue("kioskId", closest.closestKioskId, { shouldValidate: true });
            toast({
              title: "Kiosco Sugerido",
              description: "Hemos seleccionado el kiosco más cercano a tu ubicación.",
            });
          }
        } catch (error) {
           console.error("Could not get closest kiosk, likely missing API key.", error);
           toast({
            variant: "default", 
            title: "Ubicación Manual",
            description: "No se pudo sugerir un kiosco. Por favor, selecciónalo manualmente.",
          });
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        toast({
          variant: "destructive",
          title: "Permiso denegado",
          description: "No se pudo acceder a tu ubicación. Por favor, habilita los permisos.",
        });
        setLoadingLocation(false);
      }
    );
  }, [form, toast]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);

        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acceso a la cámara denegado',
          description: 'Por favor, habilita los permisos de la cámara en tu navegador.',
        });
      }
    };
    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast, facingMode]);


  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      setIsTakingPicture(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `evidence-${Date.now()}.jpg`, { type: "image/jpeg" });
            const currentPhotos = form.getValues("photos") || [];
            form.setValue("photos", [...currentPhotos, file], { shouldValidate: true });
            setPhotoPreviews(prev => [...prev, URL.createObjectURL(file)]);
          }
          setIsTakingPicture(false);
        }, 'image/jpeg');
      } else {
        setIsTakingPicture(false);
      }
    }
  };

  const removePicture = (indexToRemove: number) => {
    const currentPreviews = [...photoPreviews];
    URL.revokeObjectURL(currentPreviews[indexToRemove]);
    currentPreviews.splice(indexToRemove, 1);
    setPhotoPreviews(currentPreviews);

    const currentPhotos = [...form.getValues("photos")];
    currentPhotos.splice(indexToRemove, 1);
    form.setValue("photos", currentPhotos, { shouldValidate: true });
  }

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const resetForm = useCallback(() => {
    const defaultValues = {
      kioskId: "",
      checkinType: "entrada" as CheckinType,
      notes: "",
      photos: [],
      userEmail: user?.email || "",
      userId: user?.uid || "",
      userName: user?.displayName || "",
      latitude: undefined,
      longitude: undefined,
    }
    form.reset(defaultValues);
    photoPreviews.forEach(URL.revokeObjectURL);
    setPhotoPreviews([]);
  }, [form, photoPreviews, user]);

  async function onSubmit(values: FormSchemaType) {
    setIsSubmitting(true);

    const checkinDataForDb = {
        ...values,
        photos: values.photos.map(p => new File([p], p.name, {type: p.type})) // Clone files for IndexedDB
    }

    if (!isOnline) {
      if (!db) {
        toast({ variant: "destructive", title: "Error", description: "La base de datos no está disponible. No se puede guardar el check-in." });
        setIsSubmitting(false);
        return;
      }
      try {
        await db.add('pending-checkins', checkinDataForDb);
        await updatePendingCount();
        toast({
          title: "Modo Offline",
          description: "Tu check-in se guardó y se enviará cuando te conectes.",
        });
        resetForm();
      } catch (e) {
        console.error("Failed to save pending checkin", e);
        toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el check-in para enviarlo luego." });
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const formData = new FormData();
    formData.append("kioskId", values.kioskId);
    formData.append("checkinType", values.checkinType);
    formData.append("userEmail", values.userEmail);
    formData.append("userId", values.userId);
    formData.append("userName", values.userName);
    if(values.latitude) formData.append("latitude", values.latitude.toString());
    if(values.longitude) formData.append("longitude", values.longitude.toString());

    values.photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
    });
    if(values.notes) formData.append("notes", values.notes);

    try {
        const result = await submitCheckin(formData);
        if (result.success) {
            toast({ title: "Éxito", description: result.message, variant: "default" });
            resetForm();
            await processPendingCheckins();
        } else {
            toast({ variant: "destructive", title: "Error", description: result.message || "No se pudo guardar el registro." });
        }
    } catch (error) {
        toast({ variant: "destructive", title: "Error Inesperado", description: "Ocurrió un error al enviar el formulario." });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-2xl">Registrar Check-in</CardTitle>
                <CardDescription>Completa el formulario para registrar tu asistencia.</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
                <span>{isOnline ? "Online" : "Offline"}</span>
                {pendingCount > 0 && (
                    <div className="flex items-center gap-1 bg-amber-100 text-amber-800 p-1 px-2 rounded-md">
                        <UploadCloud className="h-4 w-4" />
                        <span>{pendingCount}</span>
                    </div>
                )}
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="kioskId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kiosco</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={loadingLocation}>
                    <FormControl>
                      <SelectTrigger>
                        {loadingLocation ? (
                           <span className="flex items-center gap-2 text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            Detectando ubicación...
                           </span>
                        ) : (
                          <SelectValue placeholder="Selecciona un kiosco" />
                        )}
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {kiosks.map((kiosk) => (
                        <SelectItem key={kiosk.id} value={kiosk.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span>{kiosk.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="checkinType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Tipo de Check-in</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                    >
                      {checkinTypes.map(type => (
                        <FormItem key={type.value}>
                          <FormControl>
                            <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                          </FormControl>
                          <FormLabel
                             htmlFor={type.value}
                             className={`flex flex-col items-center justify-center rounded-md border-2 p-4 cursor-pointer transition-all ${
                               field.value === type.value 
                                 ? 'border-primary bg-primary text-primary-foreground' 
                                 : 'border-muted bg-popover hover:bg-accent hover:text-accent-foreground'
                             }`}
                          >
                           {type.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="photos"
              render={() => (
                <FormItem>
                  <FormLabel>Fotos de Evidencia</FormLabel>
                  <FormControl>
                     <div className="space-y-4">
                        <div className="w-full aspect-video rounded-md overflow-hidden border bg-muted flex items-center justify-center relative">
                          <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                           <canvas ref={canvasRef} className="hidden"></canvas>
                           {hasMultipleCameras && (
                            <Button type="button" variant="outline" size="icon" className="absolute bottom-4 right-4 rounded-full" onClick={toggleCamera}>
                                <SwitchCamera />
                                <span className="sr-only">Cambiar cámara</span>
                            </Button>
                           )}
                        </div>
                        
                        {hasCameraPermission === false && (
                           <Alert variant="destructive">
                             <VideoOff className="h-4 w-4" />
                             <AlertTitle>Cámara no disponible</AlertTitle>
                             <AlertDescription>
                               No se pudo acceder a la cámara. Por favor, revisa los permisos en tu navegador.
                             </AlertDescription>
                           </Alert>
                        )}
                        
                        <div className="flex justify-center">
                          <Button type="button" className="w-full max-w-xs" onClick={takePicture} disabled={isSubmitting || isTakingPicture || hasCameraPermission !== true}>
                            {isTakingPicture ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Camera className="mr-2 h-4 w-4" />}
                            {isTakingPicture ? 'Procesando...' : 'Capturar Foto'}
                          </Button>
                        </div>
                        
                        {photoPreviews.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {photoPreviews.map((src, index) => (
                                    <div key={index} className="relative group">
                                        <Image src={src} alt={`Vista previa ${index + 1}`} width={150} height={150} className="rounded-md object-cover aspect-square w-full" />
                                        <Button 
                                          type="button" 
                                          variant="destructive" 
                                          size="icon" 
                                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                          onClick={() => removePicture(index)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Eliminar foto</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas {notesRequired ? "" : "(Opcional)"}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Añade cualquier comentario relevante aquí..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting || !form.formState.isValid || !db || (isFirebaseConfigured === false && isOnline)}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? "Enviando..." : (isOnline ? "Registrar Check-in" : "Guardar para Enviar Luego")}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}