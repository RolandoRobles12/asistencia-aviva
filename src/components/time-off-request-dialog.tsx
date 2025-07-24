"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { submitTimeOffRequest } from '@/app/actions';
import type { DateRange } from 'react-day-picker';

const timeOffRequestFormSchema = z.object({
  type: z.enum(['Vacaciones', 'Incapacidad', 'Permiso'], {
    required_error: 'Debes seleccionar un tipo de solicitud.',
  }),
  dateRange: z.object({
    from: z.date({ required_error: 'La fecha de inicio es requerida.' }),
    to: z.date({ required_error: 'La fecha de fin es requerida.' }),
  }),
  reason: z.string().min(10, 'El motivo debe tener al menos 10 caracteres.').max(200),
});

type TimeOffRequestFormValues = z.infer<typeof timeOffRequestFormSchema>;

interface TimeOffRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: {
    name: string;
    avatar: string;
  };
}

export function TimeOffRequestDialog({ isOpen, onOpenChange, user }: TimeOffRequestDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TimeOffRequestFormValues>({
    resolver: zodResolver(timeOffRequestFormSchema),
    defaultValues: {
      type: 'Vacaciones',
      reason: '',
      dateRange: {
        from: undefined,
        to: undefined,
      },
    },
  });

  const onSubmit = async (data: TimeOffRequestFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await submitTimeOffRequest({
        userName: user.name,
        userAvatar: user.avatar,
        type: data.type,
        startDate: data.dateRange.from,
        endDate: data.dateRange.to,
        reason: data.reason,
      });

      if (result.success) {
        toast({
          title: 'Solicitud Enviada',
          description: result.message,
        });
        onOpenChange(false);
        form.reset();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error al Enviar',
          description: result.message,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error inesperado',
        description: 'No se pudo procesar la solicitud. Intenta de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Días Libres</DialogTitle>
          <DialogDescription>
            Completa el formulario para enviar tu solicitud de ausencia.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Solicitud</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                      <SelectItem value="Incapacidad">Incapacidad Médica</SelectItem>
                      <SelectItem value="Permiso">Permiso Especial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Periodo</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value?.from && 'text-muted-foreground'
                          )}
                        >
                          {field.value?.from ? (
                            field.value.to ? (
                              <>
                                {format(field.value.from, 'dd LLL, y', { locale: es })} -{' '}
                                {format(field.value.to, 'dd LLL, y', { locale: es })}
                              </>
                            ) : (
                              format(field.value.from, 'dd LLL, y', { locale: es })
                            )
                          ) : (
                            <span>Elige un rango de fechas</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={field.value?.from}
                        selected={field.value as DateRange}
                        onSelect={field.onChange}
                        numberOfMonths={1}
                        locale={es}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe brevemente el motivo de tu solicitud..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Solicitud
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
