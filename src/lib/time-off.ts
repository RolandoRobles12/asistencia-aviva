import type { TimeOffRequest } from '@/lib/types';

export const timeOffRequests: TimeOffRequest[] = [
  { id: 'TO001', user: { name: 'Carlos López', avatar: 'https://placehold.co/32x32.png' }, type: 'Vacaciones', reason: 'Viaje familiar programado', startDate: '2024-08-05', endDate: '2024-08-10', status: 'Pendiente' },
  { id: 'TO002', user: { name: 'Juan García', avatar: 'https://placehold.co/32x32.png' }, type: 'Incapacidad', reason: 'Cirugía menor', startDate: '2024-07-29', endDate: '2024-07-31', status: 'Aprobado' },
  { id: 'TO003', user: { name: 'Ana Pérez', avatar: 'https://placehold.co/32x32.png' }, type: 'Permiso', reason: 'Asunto personal urgente', startDate: '2024-07-25', endDate: '2024-07-25', status: 'Rechazado', comments: 'No se cuenta con cobertura para la fecha.' },
  { id: 'TO004', user: { name: 'Sofía Hernández', avatar: 'https://placehold.co/32x32.png' }, type: 'Vacaciones', reason: 'Descanso', startDate: '2024-09-01', endDate: '2024-09-07', status: 'Pendiente' },
];
