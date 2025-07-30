// env-check.js - Ejecutar en tu terminal para verificar variables
// Crea este archivo en la raíz de tu proyecto y ejecuta: node env-check.js

console.log('=== VERIFICACIÓN DE VARIABLES DE ENTORNO ===\n');

const requiredEnvVars = {
  // Variables del Cliente (Frontend)
  'NEXT_PUBLIC_FIREBASE_API_KEY': process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET': process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID': process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  'NEXT_PUBLIC_FIREBASE_APP_ID': process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  
  // Variables del Servidor (Admin SDK)
  'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID,
  'FIREBASE_CLIENT_EMAIL': process.env.FIREBASE_CLIENT_EMAIL,
  'FIREBASE_PRIVATE_KEY': process.env.FIREBASE_PRIVATE_KEY,
  'FIREBASE_STORAGE_BUCKET': process.env.FIREBASE_STORAGE_BUCKET,
};

let allConfigured = true;

for (const [key, value] of Object.entries(requiredEnvVars)) {
  const isConfigured = !!value;
  const status = isConfigured ? '✅' : '❌';
  const displayValue = key.includes('PRIVATE_KEY') 
    ? (value ? `${value.substring(0, 20)}...` : 'NO CONFIGURADA')
    : (value || 'NO CONFIGURADA');
  
  console.log(`${status} ${key}: ${displayValue}`);
  
  if (!isConfigured) {
    allConfigured = false;
  }
}

console.log('\n=== RESUMEN ===');
if (allConfigured) {
  console.log('✅ Todas las variables están configuradas correctamente');
} else {
  console.log('❌ Faltan variables de entorno. Configúralas en:');
  console.log('   - Firebase Console > Project Settings > Service Accounts');
  console.log('   - Tu platafo
