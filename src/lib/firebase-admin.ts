// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

// Obtener configuración de Firebase Functions
function getFirebaseConfig() {
  try {
    // Intentar usar Firebase Functions config
    const functions = require('firebase-functions');
    const config = functions.config();
    
    if (config.admin) {
      console.log('Using Firebase Functions config');
      return {
        projectId: config.admin.project_id,
        clientEmail: config.admin.client_email,
        privateKey: config.admin.private_key,
        storageBucket: config.admin.storage_bucket,
      };
    }
  } catch (error) {
    console.log('Firebase functions config not available, trying env vars');
  }
  
  // Fallback a variables de entorno
  console.log('Using environment variables');
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  };
}

// Obtener configuración
const firebaseConfig = getFirebaseConfig();

// Verificar que todas las variables existan
for (const [key, value] of Object.entries(firebaseConfig)) {
  if (!value) {
    throw new Error(`Missing Firebase Admin config: ${key}`);
  }
}

console.log('Firebase Admin config loaded:', {
  projectId: firebaseConfig.projectId,
  clientEmail: firebaseConfig.clientEmail,
  storageBucket: firebaseConfig.storageBucket,
  privateKeyExists: !!firebaseConfig.privateKey,
});

// Inicializar solo si no existe
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: firebaseConfig.projectId!,
        clientEmail: firebaseConfig.clientEmail!,
        // Reemplazar \\n con saltos de línea reales
        privateKey: firebaseConfig.privateKey!.replace(/\\n/g, '\n'),
      }),
      storageBucket: firebaseConfig.storageBucket!,
    });
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    throw error;
  }
}

export const adminStorage = getStorage();
export const adminDb = getFirestore();
