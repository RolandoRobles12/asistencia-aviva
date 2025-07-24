
'use server';

/**
 * @fileOverview A Genkit flow for generating an automated daily check-in report.
 *
 * - generateAutomatedReport - Creates and formats an email report for check-ins.
 * - AutomatedReportInput - The input type for the flow.
 * - AutomatedReportOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { kiosks } from '@/lib/kiosks';
import { format, parseISO, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Checkin, Kiosk } from '@/lib/types';

// This is a simplified Checkin type for the flow.
// In a real app, this would be imported from a shared types file.
const CheckinSchema = z.object({
  id: z.string(),
  user: z.object({
    name: z.string(),
    avatar: z.string(),
  }),
  kioskId: z.string(),
  type: z.enum(['Entrada', 'Comida', 'Salida']),
  date: z.string(), // Expecting 'YYYY-MM-DD HH:mm'
  punctuality: z.enum(['A tiempo', 'Retrasado', 'Anticipado']),
  location: z.enum(['Válida', 'Inválida']),
});

const KioskSchema = z.object({
  id: z.string(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  city: z.string(),
  state: z.string(),
  type: z.enum(['Bodega Aurrera', 'Kiosco Aviva Tu Compra']),
  active: z.boolean(),
  radiusOverride: z.number().nullable(),
});

const AutomatedReportInputSchema = z.object({
  targetKioskType: z.string().default('all').describe('The type of kiosk to report on. "all" for every type.'),
  targetUserId: z.string().optional().describe('The ID of a specific user to report on.'),
  targetCheckinType: z.string().default('all').describe('The type of check-in to include. "all" for every type.'),
  dateRange: z.object({
      from: z.string().describe("The start date in YYYY-MM-DD format."),
      to: z.string().describe("The end date in YYYY-MM-DD format."),
  }).optional().describe("The date range for the report."),
  allCheckins: z.array(CheckinSchema).describe('A list of all check-in records.'),
  allKiosks: z.array(KioskSchema).describe('A list of all available kiosks.'),
  allUsers: z.array(z.object({ id: z.string(), name: z.string() })).describe("A list of all users for name lookup."),
});
export type AutomatedReportInput = z.infer<typeof AutomatedReportInputSchema>;

const AutomatedReportOutputSchema = z.object({
  email: z.object({
    subject: z.string(),
    body: z.string().describe("The body of the email, formatted as plain text with newlines (\\n)."),
  }),
  attachmentData: z.string().describe('The data for the report attachment, formatted as CSV.'),
  summary: z.object({
    totalRecords: z.number(),
    reportDate: z.string(),
    filterSummary: z.string(),
  }),
});
export type AutomatedReportOutput = z.infer<typeof AutomatedReportOutputSchema>;

export async function generateAutomatedReport(input: AutomatedReportInput): Promise<AutomatedReportOutput> {
  return generateAutomatedReportFlow(input);
}


const generateAutomatedReportFlow = ai.defineFlow(
  {
    name: 'generateAutomatedReportFlow',
    inputSchema: AutomatedReportInputSchema,
    outputSchema: AutomatedReportOutputSchema,
  },
  async (input) => {
    const today = new Date();
    const reportDateLong = format(today, "dd 'de' MMMM 'de' yyyy", { locale: es });
    
    const kioskMap = new Map(input.allKiosks.map(k => [k.id, k]));
    const userMap = new Map(input.allUsers.map(u => [u.id, u]));

    // Build filter summary string
    let filterDescriptions = [];
    if (input.targetKioskType && input.targetKioskType !== 'all') {
        filterDescriptions.push(`Tipo de Kiosco: ${input.targetKioskType}`);
    } else {
        filterDescriptions.push(`Tipo de Kiosco: Todos`);
    }

    if (input.targetUserId) {
        filterDescriptions.push(`Usuario: ${userMap.get(input.targetUserId)?.name || 'Desconocido'}`);
    }
    if (input.targetCheckinType && input.targetCheckinType !== 'all') {
        filterDescriptions.push(`Tipo de Registro: ${input.targetCheckinType}`);
    }

    let reportDateForSubject = reportDateLong;
    let reportDateForBody = reportDateLong;
    let reportDay = today;

    if (input.dateRange) {
        const from = parseISO(input.dateRange.from);
        const to = parseISO(input.dateRange.to);
        const fromFormatted = format(from, "dd 'de' MMMM 'de' yyyy", { locale: es });
        const toFormatted = format(to, "dd 'de' MMMM 'de' yyyy", { locale: es });
        
        if (format(from, 'yyyy-MM-dd') === format(to, 'yyyy-MM-dd')) {
            reportDateForSubject = fromFormatted;
            reportDateForBody = fromFormatted;
            filterDescriptions.push(`Fecha: ${fromFormatted}`);
            reportDay = from; // Use the specific date from range
        } else {
            reportDateForSubject = `${fromFormatted} al ${toFormatted}`;
            reportDateForBody = `del ${fromFormatted} al ${toFormatted}`;
            filterDescriptions.push(`Periodo: ${format(from, "dd/MM/yyyy")} - ${format(to, "dd/MM/yyyy")}`);
        }
    } else {
         filterDescriptions.push(`Fecha: ${reportDateLong}`);
    }
    const filterSummary = filterDescriptions.join(', ');


    const relevantCheckins = input.allCheckins.filter(checkin => {
      // Kiosk Type Filter
      if (input.targetKioskType !== 'all') {
        const kiosk = kioskMap.get(checkin.kioskId);
        if (!kiosk || kiosk.type !== input.targetKioskType) {
          return false;
        }
      }

      // User Filter
      if (input.targetUserId) {
          const user = mockUsers.find(u => u.name === checkin.user.name);
          if (!user || user.id !== input.targetUserId) return false;
      }
      
      // Checkin Type Filter
      if (input.targetCheckinType !== 'all') {
        if (checkin.type !== input.targetCheckinType) return false;
      }

      // Date Range Filter
      if (input.dateRange) {
        const checkinDate = parseISO(checkin.date.replace(' ', 'T'));
        const from = startOfDay(parseISO(input.dateRange.from));
        const to = endOfDay(parseISO(input.dateRange.to));
        if (!isWithinInterval(checkinDate, { start: from, end: to })) {
            return false;
        }
      }

      return true;
    });

    let subject: string;
    let body: string;
    let attachmentData: string;

    const kioskTypeForBody = input.targetKioskType === 'all' ? 'todos los kioscos' : `los kioscos ${input.targetKioskType}`;
    const isThursday = reportDay.getDay() === 4; // 0:Sun, 1:Mon, ..., 4:Thu
    const isBodegaReport = input.targetKioskType === 'Bodega Aurrera';

    let summaryNote = '';
    if (isThursday && isBodegaReport) {
        summaryNote = '\n- NOTA: Hoy es jueves, normalmente día de descanso para Bodega Aurrera.';
    }
    
    if (relevantCheckins.length > 0) {
      subject = `Lista de asistencia del ${reportDateForSubject}`;
      body = `Estimado equipo,\n\nAdjunto encontrarán la lista de asistencia para ${kioskTypeForBody}, correspondiente al día ${reportDateForBody}.\n\nResumen:\n- Total de registros: ${relevantCheckins.length} asistencias${summaryNote}\n\nSaludos,\nSistema de Check-in Aviva`;

      // Generate CSV data
      const csvHeader = "ID,Colaborador,Kiosco,Tipo,Fecha y Hora,Puntualidad,Ubicacion\n";
      const csvRows = relevantCheckins.map(c => {
        const kioskName = kioskMap.get(c.kioskId)?.name || 'Desconocido';
        return `"${c.id}","${c.user.name}","${kioskName}","${c.type}","${c.date}","${c.punctuality}","${c.location}"`;
      });
      attachmentData = csvHeader + csvRows.join('\n');

    } else {
       subject = `SIN REGISTROS: Lista de asistencia del ${reportDateForSubject}`;
       body = `Estimado equipo,\n\nEste es un aviso para indicar que no se encontraron registros de asistencia para ${kioskTypeForBody} el día ${reportDateForBody} con los filtros aplicados.\n\nFiltros aplicados: ${filterSummary}\n\nNo se requiere ninguna acción.\n\nSaludos,\nSistema de Check-in Aviva`;
       attachmentData = "No hay datos para generar el reporte con los filtros seleccionados.";
    }

    return {
      email: {
        subject,
        body,
      },
      attachmentData,
      summary: {
        totalRecords: relevantCheckins.length,
        reportDate: format(today, 'yyyy-MM-dd'),
        filterSummary: filterSummary,
      }
    };
  }
);

// This is needed for the filter, it should be passed from the client
const mockUsers = [
  { id: 'user01', name: 'Rolando Robles', email: 'rolando.robles@avivacredito.com', role: 'Super Admin', team: 'N/A', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user02', name: 'Ana Pérez', email: 'ana.perez@example.com', role: 'Admin', team: 'N/A', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user03', name: 'Juan García', email: 'juan.garcia@example.com', role: 'Supervisor', team: 'Promotores CDMX', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user04', name: 'Carlos López', email: 'carlos.lopez@example.com', role: 'Promotor', team: 'Promotores CDMX', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user05', name: 'Sofía Hernández', email: 'sofia.hernandez@example.com', role: 'Promotor', team: 'Promotores Jalisco', status: 'Inactivo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user06', name: 'Pedro Sánchez', email: 'pedro.sanchez@example.com', role: 'Promotor', team: 'Promotores Jalisco', status: 'Inactivo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user07', name: 'Diego Ramírez', email: 'diego.ramirez@example.com', role: 'Promotor', team: 'Promotores CDMX', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png'},
];
