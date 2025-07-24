
export type Kiosk = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  type: 'Bodega Aurrera' | 'Kiosco Aviva Tu Compra';
  active: boolean;
  radiusOverride: number | null;
};

export type CheckinType = 'Entrada' | 'Comida' | 'Salida';

export type Checkin = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  kioskId: string;
  type: CheckinType;
  date: string;
  punctuality: 'A tiempo' | 'Retrasado' | 'Anticipado';
  location: 'Válida' | 'Inválida';
  photo?: string;
};

export type TimeOffRequest = {
  id: string;
  user: {
    name: string;
    avatar: string;
  };
  type: 'Vacaciones' | 'Incapacidad' | 'Permiso';
  reason: string;
  startDate: string;
  endDate: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  comments?: string;
};

    