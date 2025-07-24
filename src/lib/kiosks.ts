import type { Kiosk } from '@/lib/types';

export const kiosks: Kiosk[] = [
  { id: 'k001', name: 'Kiosco BA Chalco', latitude: 19.2625, longitude: -98.8986, city: 'Chalco', state: 'Estado de México', type: 'Bodega Aurrera', active: true, radiusOverride: 150 },
  { id: 'k002', name: 'Kiosco Fijo Zócalo CDMX', latitude: 19.4326, longitude: -99.1332, city: 'Ciudad de México', state: 'CDMX', type: 'Kiosco Aviva Tu Compra', active: true, radiusOverride: null },
  { id: 'k003', name: 'Kiosco Móvil Monterrey', latitude: 25.6866, longitude: -100.3161, city: 'Monterrey', state: 'Nuevo León', type: 'Kiosco Aviva Tu Compra', active: false, radiusOverride: null },
  { id: 'k004', name: 'Kiosco BA Guadalajara Centro', latitude: 20.6767, longitude: -103.3475, city: 'Guadalajara', state: 'Jalisco', type: 'Bodega Aurrera', active: true, radiusOverride: null },
  { id: 'k005', name: 'Kiosco Otro Cancún', latitude: 21.1619, longitude: -86.8515, city: 'Cancún', state: 'Quintana Roo', type: 'Kiosco Aviva Tu Compra', active: true, radiusOverride: 200 },
  { id: 'k006', name: 'Kiosco Fijo Tijuana', latitude: 32.5149, longitude: -117.0382, city: 'Tijuana', state: 'Baja California', type: 'Bodega Aurrera', active: true, radiusOverride: null },
];
