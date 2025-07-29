// lib/firebase-admin.ts
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { getFirestore } from 'firebase-admin/firestore';

// Variables de entorno simplificadas
const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "asistencia-aviva-qlimi",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "github-action-1025697070@asistencia-aviva-qlimi.iam.gserviceaccount.com",
  privateKey: process.env.FIREBASE_PRIVATE_KEY,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "asistencia-aviva-qlimi.appspot.com",
};

console.log('Firebase Admin config check:', {
  projectId: firebaseAdminConfig.projectId,
  clientEmail: firebaseAdminConfig.clientEmail,
  storageBucket: firebaseAdminConfig.storageBucket,
  privateKeyExists: !!firebaseAdminConfig.privateKey,
  privateKeyLength: firebaseAdminConfig.privateKey?.length || 0,
});

// Verificar private key
let isAdminConfigured = true;

if (!firebaseAdminConfig.privateKey) {
  console.warn(
    'FIREBASE_PRIVATE_KEY is missing. Firebase Admin SDK will not be initialised.'
  );
  isAdminConfigured = false;
}

// Inicializar sólo si se cuenta con la llave y aún no existe una app
if (isAdminConfigured && !getApps().length) {
  try {
    console.log('Initializing Firebase Admin...');
    
    initializeApp({
      credential: cert({
        projectId: firebaseAdminConfig.projectId,
        clientEmail: firebaseAdminConfig.clientEmail,
        privateKey: firebaseAdminConfig.privateKey.replace(/\\n/g, '\n'),
        privateKey: firebaseAdminConfig.privateKey!.replace(/\\n/g, '\n'),
      }),
      storageBucket: firebaseAdminConfig.storageBucket,
    });
    

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin:', error);
    isAdminConfigured = false;
  }
} else if (isAdminConfigured) {
  console.log('Firebase Admin already initialized');
}

export const adminStorage = isAdminConfigured ? getStorage() : null;
export const adminDb = isAdminConfigured ? getFirestore() : null;
export { isAdminConfigured };
