
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  setPersistence,
  browserLocalPersistence,
  signOut,
  User
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// --- Types ---
interface InterfaceSettings {
    theme: string;
    showTimeOffTab: boolean;
    notesRequired: boolean;
}

interface OperationalSettings {
  toleranceMinutes: number;
  lateThresholdMinutes: number;
  defaultGeofenceRadius: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean;
  interfaceSettings: InterfaceSettings;
  setInterfaceSettings: React.Dispatch<React.SetStateAction<InterfaceSettings>>;
  operationalSettings: OperationalSettings;
  setOperationalSettings: React.Dispatch<React.SetStateAction<OperationalSettings>>;
}

// --- Initial State & Mocks ---
const initialInterfaceSettings: InterfaceSettings = {
    theme: 'theme-green',
    showTimeOffTab: true,
    notesRequired: false,
};

const initialOperationalSettings: OperationalSettings = {
  toleranceMinutes: 5,
  lateThresholdMinutes: 20,
  defaultGeofenceRadius: 150,
  maintenanceMode: false,
  maintenanceMessage: "El sistema estará en mantenimiento...",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SUPER_ADMIN_EMAILS = ['rolando.robles@avivacredito.com', 'rolando.9834@gmail.com'];

const mockUser: User = {
  uid: 'mock-super-admin-uid',
  email: 'rolando.robles@avivacredito.com',
  displayName: 'Super Admin (Local)',
  photoURL: 'https://placehold.co/32x32.png',
  emailVerified: true,
  isAnonymous: false,
  providerData: [],
  metadata: {} as any,
  providerId: 'mock',
  tenantId: null,
  refreshToken: '',
  phoneNumber: null,
  delete: async () => {},
  getIdToken: async () => 'mock-token',
  getIdTokenResult: async () => ({
    token: 'mock-token',
    claims: {},
    authTime: '',
    expirationTime: '',
    issuedAtTime: '',
    signInProvider: null,
    signInSecondFactor: null
  }),
  reload: async () => {},
  toJSON: () => ({})
};

// --- Provider Component ---
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authInProgress, setAuthInProgress] = useState(false);
  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>(initialInterfaceSettings);
  const [operationalSettings, setOperationalSettings] = useState<OperationalSettings>(initialOperationalSettings);
  const { toast } = useToast();

  useEffect(() => {
    // If Firebase is not configured, use mock user and skip all Firebase logic.
    if (!isFirebaseConfigured) {
      console.log("Modo desarrollo: usando usuario mock y saltando la conexión a Firebase.");
      setUser(mockUser);
      setIsAdmin(true);
      setIsSuperAdmin(true);
      setLoading(false);
      return;
    }

    // If Firebase is configured, but auth is not initialized, stop.
    if (!auth) {
      console.error("Auth no inicializado, pero Firebase está configurado. Revise la configuración.");
      setLoading(false);
      return;
    }

    // This listener handles all auth state changes.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const userEmail = currentUser?.email;
      const isSuper = userEmail ? SUPER_ADMIN_EMAILS.includes(userEmail) : false;
      const isValidDomain = userEmail ? userEmail.endsWith('@avivacredito.com') : false;

      if (currentUser && !isSuper && !isValidDomain) {
          logout(true); // Sign out user from other domains silently
          toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'Por favor, inicia sesión con una cuenta de @avivacredito.com.' });
          setUser(null);
          setIsAdmin(false);
          setIsSuperAdmin(false);
      } else {
        setUser(currentUser);
        if (userEmail) {
          setIsSuperAdmin(isSuper);
          setIsAdmin(isSuper || isValidDomain); 
        } else {
          setIsAdmin(false);
          setIsSuperAdmin(false);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  const login = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) return;
    if (authInProgress) return;
    setAuthInProgress(true);

    try {
        const result = await signInWithPopup(auth, googleProvider);
        const userEmail = result.user.email;
        const isSuper = userEmail ? SUPER_ADMIN_EMAILS.includes(userEmail) : false;
        const isValidDomain = userEmail ? userEmail.endsWith('@avivacredito.com') : false;

        if (!isSuper && !isValidDomain) {
            await logout(true);
            toast({ variant: 'destructive', title: 'Acceso Denegado', description: 'Solo se permiten cuentas de @avivacredito.com.' });
            return;
        }
        toast({
          title: "Sesión iniciada",
          description: `Bienvenido ${result.user.displayName || result.user.email}`
        });
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      let errorMessage = 'No se pudo iniciar sesión. Intenta de nuevo.';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'El inicio de sesión fue cancelado.';
      }
      toast({ variant: 'destructive', title: 'Error de autenticación', description: errorMessage });
    } finally {
      setAuthInProgress(false);
    }
  };

  const logout = async (silent = false) => {
    if (!isFirebaseConfigured) {
      setUser(null);
      setIsAdmin(false);
      setIsSuperAdmin(false);
      return;
    }
    if (!auth) return;
    try {
      await signOut(auth);
      if (!silent) {
        toast({ title: "Sesión cerrada", description: "Has cerrado sesión correctamente" });
      }
    } catch (error: any) {
      if (!silent) {
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo cerrar la sesión.' });
      }
    }
  };

  const value: AuthContextType = {
    user,
    isAdmin,
    isSuperAdmin,
    loading,
    login,
    logout,
    isFirebaseConfigured,
    interfaceSettings,
    setInterfaceSettings,
    operationalSettings,
    setOperationalSettings
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// --- Hook ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
