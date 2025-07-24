'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  superAdminOnly?: boolean;
}

export function AuthGuard({ children, adminOnly = false, superAdminOnly = false }: AuthGuardProps) {
  const { user, isAdmin, isSuperAdmin, loading, isFirebaseConfigured } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Wait until loading is complete before making any decisions
    if (loading) {
      return;
    }

    // If Firebase is not configured (desarrollo local), permitir acceso completo
    if (!isFirebaseConfigured) {
      console.log("Modo desarrollo: AuthGuard permite acceso");
      return;
    }

    // Si Firebase está configurado, realizar verificaciones de autenticación estándar
    if (!user) {
      console.log("Usuario no autenticado, redirigiendo a login");
      setIsRedirecting(true);
      router.push('/');
      return;
    }

    // Verificar permisos específicos
    if (superAdminOnly && !isSuperAdmin) {
      console.log("Acceso denegado: se requiere Super Admin");
      setIsRedirecting(true);
      router.push('/');
      return;
    }

    if (adminOnly && !isAdmin) {
      console.log("Acceso denegado: se requiere Admin");
      setIsRedirecting(true);
      router.push('/');
      return;
    }

    // Si llegamos aquí, el usuario tiene los permisos necesarios
    setIsRedirecting(false);
    console.log("AuthGuard: acceso permitido", { 
      userEmail: user.email, 
      isAdmin, 
      isSuperAdmin, 
      adminOnly, 
      superAdminOnly 
    });

  }, [user, isAdmin, isSuperAdmin, loading, router, adminOnly, superAdminOnly, isFirebaseConfigured]);

  // Mostrar spinner mientras se determina el estado de autenticación
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // En modo desarrollo (Firebase no configurado), permitir acceso
  if (!isFirebaseConfigured) {
    return <>{children}</>;
  }

  // Si el usuario no está logueado o no tiene los permisos requeridos
  if (!user || (superAdminOnly && !isSuperAdmin) || (adminOnly && !isAdmin)) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          {isRedirecting ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Redirigiendo...</p>
            </>
          ) : (
            <>
              <div className="text-center">
                <h2 className="text-lg font-semibold mb-2">Acceso Restringido</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  {!user 
                    ? "Debes iniciar sesión para acceder a esta página"
                    : superAdminOnly 
                      ? "Esta página requiere permisos de Super Administrador"
                      : "Esta página requiere permisos de Administrador"
                  }
                </p>
                <button 
                  onClick={() => router.push('/')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Volver al Inicio
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Si todas las verificaciones pasan, renderizar los children
  return <>{children}</>;
}