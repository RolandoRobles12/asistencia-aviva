// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

// Validar que las variables existan
const requiredEnvVars = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
};

// Verificar variables de entorno
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing environment variable: FIREBASE_${key.toUpperCase()}`);
  }
}

// Inicializar solo si no existe
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: requiredEnvVars.projectId,
        clientEmail: requiredEnvVars.clientEmail,
        // Reemplazar \\n con saltos de línea reales
        privateKey: requiredEnvVars.privateKey.replace(/\\n/g, '\n'),
      }),
      storageBucket: requiredEnvVars.storageBucket,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export const adminStorage = getStorage();
export const adminDb = getFirestore();

// Función de verificación para debugging
export function verifyAdminSetup() {
  console.log('Firebase Admin Setup:');
  console.log('- Project ID:', requiredEnvVars.projectId);
  console.log('- Client Email:', requiredEnvVars.clientEmail);
  console.log('- Storage Bucket:', requiredEnvVars.storageBucket);
  console.log('- Private Key exists:', !!requiredEnvVars.privateKey);
  console.log('- Apps initialized:', getApps().length);
}
