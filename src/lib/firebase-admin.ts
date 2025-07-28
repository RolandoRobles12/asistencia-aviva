// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

// Función para obtener config de Firebase Functions o variables de entorno
function getConfig() {
  // En Firebase Functions, usar functions.config()
  if (typeof process !== 'undefined' && process.env.FUNCTIONS_EMULATOR) {
    // En emulador local, usar variables de entorno
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    };
  }
  
  // Intentar usar variables de entorno primero
  if (process.env.FIREBASE_PROJECT_ID) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    };
  }
  
  // Fallback a Firebase Functions config (legacy)
  try {
    const functions = require('firebase-functions');
    const config = functions.config();
    if (config.admin) {
      return {
        projectId: config.admin.project_id,
        clientEmail: config.admin.client_email,
        privateKey: config.admin.private_key,
        storageBucket: config.admin.storage_bucket,
      };
    }
  } catch (error) {
    console.log('Firebase functions config not available, using env vars');
  }
  
  // Fallback final a variables de entorno
  return {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  };
}

// Obtener configuración
const requiredEnvVars = getConfig();

// Verificar variables de entorno
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing Firebase Admin config: ${key}`);
  }
}

// Inicializar solo si no existe
if (!getApps().length) {
  try {
    initializeApp({
      credential: cert({
        projectId: requiredEnvVars.projectId!,
        clientEmail: requiredEnvVars.clientEmail!,
        // Reemplazar \\n con saltos de línea reales
        privateKey: requiredEnvVars.privateKey!.replace(/\\n/g, '\n'),
      }),
      storageBucket: requiredEnvVars.storageBucket!,
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
