// actions-server-fixed.ts
// Corrección completa para errores de Server Components
"use server";

import { kioskAutolocation, type KioskAutolocationInput } from "@/ai/flows/kiosk-autolocation";
import { kiosks } from "@/lib/kiosks";
import { timeOffRequests as mockTimeOffRequests } from "@/lib/time-off";
import { z } from "zod";
import { isWithinInterval, parseISO, format } from "date-fns";
import { db, storage, isFirebaseConfigured } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  doc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import type { TimeOffRequest } from "@/lib/types";
import { sendSlackMessage } from "@/services/slack";

/* ---------- 1. Validación de archivos para Server Actions ---------- */
// Función para validar si es un archivo válido en el servidor
function isValidFile(value: unknown): value is File {
  if (typeof value !== 'object' || value === null) return false;
  
  // En el servidor, FormData.get() puede devolver File o string
  // Verificamos las propiedades que debe tener un archivo
  const file = value as any;
  return (
    typeof file.name === 'string' &&
    typeof file.size === 'number' &&
    typeof file.type === 'string' &&
    typeof file.stream === 'function'
  );
}

/* ---------- 2. Esquema de check-ins corregido ---------- */
const checkinSchema = z.object({
  userEmail: z.string().email(),
  userId: z.string(),
  userName: z.string(),
  kioskId: z.string(),
  checkinType: z.enum(["entrada", "comida", "salida"]),
  photos: z.array(z.any()).refine(
    (photos) => photos.every(photo => isValidFile(photo)),
    "Todas las fotos deben ser archivos válidos"
  ),
  notes: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

/* ---------- 3. Obtener kiosco cercano ---------- */
export async function getClosestKiosk(latitude: number, longitude: number) {
  try {
    const input: KioskAutolocationInput = { latitude, longitude, kioskList: kiosks };
    return await kioskAutolocation(input);
  } catch (error) {
    console.error("Error getting closest kiosk:", error);
    return null;
  }
}

/* ---------- 4. Helper: días libres aprobados ---------- */
function hasApprovedLeave(userEmail: string, checkinDate: Date): boolean {
  const superAdmins = [
    "rolando.9834@gmail.com",
    "rolando.robles@avivacredito.com",
  ];
  if (superAdmins.includes(userEmail)) return false;

  const mockUserRequest = mockTimeOffRequests.find((req) => {
    if (userEmail.includes("carlos")) return req.user.name === "Carlos López";
    if (userEmail.includes("juan")) return req.user.name === "Juan García";
    return false;
  });
  if (!mockUserRequest) return false;

  const approved = mockTimeOffRequests.filter(
    (r) => r.user.name === mockUserRequest.user.name && r.status === "Aprobado",
  );
  return approved.some((r) =>
    isWithinInterval(checkinDate, { start: parseISO(r.startDate), end: parseISO(r.endDate) }),
  );
}

/* ---------- 5. submitCheckin corregido ---------- */
export async function submitCheckin(formData: FormData) {
  try {
    // Extraer datos básicos
    const userEmail = formData.get("userEmail") as string;
    const userId = formData.get("userId") as string;
    const userName = formData.get("userName") as string;
    const kioskId = formData.get("kioskId") as string;
    const checkinType = formData.get("checkinType") as string;
    const notesEntry = formData.get("notes");
    const notes = typeof notesEntry === "string" ? notesEntry : undefined;
    
    // Manejar coordenadas opcionales
    const latitudeStr = formData.get("latitude") as string;
    const longitudeStr = formData.get("longitude") as string;
    const latitude = latitudeStr ? parseFloat(latitudeStr) : undefined;
    const longitude = longitudeStr ? parseFloat(longitudeStr) : undefined;

    // Extraer fotos de manera segura
    const photos: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("photo_") && isValidFile(value)) {
        photos.push(value as File);
      }
    }

    const raw = {
      userEmail,
      userId,
      userName,
      kioskId,
      checkinType,
      notes,
      photos,
      latitude,
      longitude,
    };

    // Validar datos
    const validated = checkinSchema.safeParse(raw);
    if (!validated.success) {
      console.error("Validation error:", validated.error.flatten().fieldErrors);
      return { 
        success: false, 
        message: "Datos inválidos.", 
        errors: validated.error.flatten().fieldErrors 
      } as const;
    }

    const validatedData = validated.data;

    // Verificar días libres
    if (hasApprovedLeave(validatedData.userEmail, new Date())) {
      return { success: false, message: "No se puede registrar. Día libre aprobado." } as const;
    }

    // Verificar configuración de Firebase
    if (!db || !storage) {
      return { success: false, message: "Firebase no configurado." } as const;
    }

    // Subir fotos
    const photoURLs: string[] = [];
    for (const photo of validatedData.photos) {
      try {
        const fileName = (photo.name || 'photo').split('.').pop() || 'jpg';
        const photoRef = ref(storage, `checkins/${validatedData.userId}/${uuidv4()}.${fileName}`);
        
        // Convertir File a ArrayBuffer para Firebase
        const arrayBuffer = await photo.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        const uploadResult = await uploadBytes(photoRef, uint8Array, {
          contentType: photo.type,
        });
        
        const downloadURL = await getDownloadURL(uploadResult.ref);
        photoURLs.push(downloadURL);
      } catch (uploadError) {
        console.error("Error uploading photo:", uploadError);
        return { success: false, message: "Error al subir las fotos." } as const;
      }
    }

    // Guardar en Firestore
    await addDoc(collection(db, "checkins"), {
      userId: validatedData.userId,
      userEmail: validatedData.userEmail,
      userName: validatedData.userName,
      kioskId: validatedData.kioskId,
      type: validatedData.checkinType,
      notes: validatedData.notes || "",
      photoURLs,
      location: validatedData.latitude && validatedData.longitude ? {
        latitude: validatedData.latitude,
        longitude: validatedData.longitude
      } : null,
      createdAt: serverTimestamp(),
    });

    return { success: true, message: "Check-in registrado con éxito." } as const;

  } catch (error) {
    console.error("Error submitting check-in:", error);
    return { success: false, message: "Error al guardar el registro." } as const;
  }
}

/* ---------- 6. Time-off Actions ---------- */
const timeOffRequestSchema = z.object({
  userName: z.string().min(1),
  userAvatar: z.string().url().optional(),
  type: z.enum(["Vacaciones", "Incapacidad", "Permiso"]),
  reason: z.string().min(1).max(200),
  startDate: z.date(),
  endDate: z.date(),
});

export async function submitTimeOffRequest(data: z.infer<typeof timeOffRequestSchema>) {
  try {
    const validated = timeOffRequestSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, message: "Datos inválidos." } as const;
    }

    const newRequest: Omit<TimeOffRequest, "id"> = {
      user: { 
        name: validated.data.userName, 
        avatar: validated.data.userAvatar || "https://placehold.co/32x32.png" 
      },
      type: validated.data.type,
      reason: validated.data.reason,
      startDate: format(validated.data.startDate, "yyyy-MM-dd"),
      endDate: format(validated.data.endDate, "yyyy-MM-dd"),
      status: "Pendiente",
    };

    // Usar mock si Firebase no está configurado
    if (!isFirebaseConfigured || !db) {
      mockTimeOffRequests.push({ id: `TO${Date.now()}`, ...newRequest });
      return { success: true, message: "Solicitud enviada (simulado)." } as const;
    }

    // Guardar en Firebase
    await addDoc(collection(db, "timeOffRequests"), newRequest);
    return { success: true, message: "Solicitud enviada." } as const;

  } catch (error) {
    console.error("Error submitting time off request:", error);
    return { success: false, message: "Error al enviar solicitud." } as const;
  }
}

export async function getTimeOffRequests(): Promise<TimeOffRequest[]> {
  try {
    // Usar mock si Firebase no está configurado
    if (!isFirebaseConfigured || !db) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockTimeOffRequests;
    }

    // Obtener de Firebase
    const q = query(collection(db, "timeOffRequests"), orderBy("startDate", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ 
      id: doc.id, 
      ...(doc.data() as Omit<TimeOffRequest, "id">) 
    }));

  } catch (error) {
    console.error("Error getting time off requests:", error);
    return mockTimeOffRequests;
  }
}

const timeOffStatusSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["Aprobado", "Rechazado"]),
});

export async function updateTimeOffStatus(data: { requestId: string; status: "Aprobado" | "Rechazado" }) {
  try {
    const validated = timeOffStatusSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, message: "Datos inválidos." } as const;
    }

    // Usar mock si Firebase no está configurado
    if (!isFirebaseConfigured || !db) {
      const request = mockTimeOffRequests.find((r) => r.id === data.requestId);
      if (request) {
        request.status = data.status;
      }
      return { success: true, message: `Solicitud marcada como ${data.status} (simulado).` } as const;
    }

    // Actualizar en Firebase
    await updateDoc(doc(db, "timeOffRequests", data.requestId), { 
      status: data.status 
    });
    return { success: true, message: `Solicitud marcada como ${data.status}.` } as const;

  } catch (error) {
    console.error("Error updating time off status:", error);
    return { success: false, message: "Error al actualizar." } as const;
  }
}

const timeOffCommentsSchema = z.object({
  requestId: z.string().min(1),
  comments: z.string().max(500),
});

export async function updateTimeOffComments(data: { requestId: string; comments: string }) {
  try {
    const validated = timeOffCommentsSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, message: "Datos inválidos." } as const;
    }

    // Usar mock si Firebase no está configurado
    if (!isFirebaseConfigured || !db) {
      const request = mockTimeOffRequests.find((r) => r.id === data.requestId);
      if (request) {
        (request as any).comments = data.comments;
      }
      return { success: true, message: "Comentarios actualizados (simulado)." } as const;
    }

    // Actualizar en Firebase
    await updateDoc(doc(db, "timeOffRequests", data.requestId), { 
      comments: data.comments 
    });
    return { success: true, message: "Comentarios actualizados." } as const;

  } catch (error) {
    console.error("Error updating time off comments:", error);
    return { success: false, message: "Error al guardar comentarios." } as const;
  }
}

/* ---------- 7. Slack test ---------- */
const slackTestSchema = z.object({
  botToken: z.string().min(1),
  userId: z.string().min(1),
});

export async function sendTestSlackMessage(data: { botToken: string; userId: string }) {
  try {
    const validated = slackTestSchema.safeParse(data);
    if (!validated.success) {
      return { 
        success: false, 
        message: "Datos inválidos.", 
        errors: validated.error.flatten().fieldErrors 
      } as const;
    }

    const result = await sendSlackMessage({
      botToken: validated.data.botToken,
      channel: validated.data.userId,
      text: "¡Hola! Este es un mensaje de prueba desde la plataforma Asistencia Aviva.",
    });

    return result.ok
      ? { success: true, message: "Mensaje enviado." }
      : { success: false, message: `Error de Slack: ${result.error}` };

  } catch (error) {
    console.error("Error sending test Slack message:", error);
    return { success: false, message: "Error interno." } as const;
  }
}