'use client';

import { KioskCheckinForm } from '@/components/kiosk-checkin-form';
import { AsistenciaAvivaLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogOut, User as UserIcon, Shield, Loader2, CalendarPlus } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { TimeOffRequestDialog } from '@/components/time-off-request-dialog';

export default function CheckinPage() {
  const router = useRouter();
  const { user, login, logout, isAdmin, loading, interfaceSettings } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch (error) {
      // Error is already handled by toast in auth-context
    } finally {
      setIsLoggingIn(false);
    }
  };

  const UserMenu = () => (
    <div className="flex items-center gap-2">
       {isAdmin && (
        <Button variant="outline" size="sm" onClick={() => router.push('/admin')}>
            <Shield className="mr-2 h-4 w-4" />
            Panel de Admin
        </Button>
       )}
       <Button variant="ghost" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Salir
       </Button>
        <Avatar className="h-9 w-9">
            <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'Avatar'} data-ai-hint="user avatar" />
            <AvatarFallback>
                {user?.displayName?.charAt(0) || <UserIcon />}
            </AvatarFallback>
        </Avatar>
    </div>
  );
  
  const renderContent = () => {
    // Show a loading spinner while the auth state is being determined.
    if (loading) {
      return (
        <div className="flex h-48 w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
      )
    }

    // If a user exists (real or mocked), show the check-in form.
    if (user) {
      return (
        <>
            <KioskCheckinForm notesRequired={interfaceSettings.notesRequired} />
            <Button variant="link" className="mt-6" onClick={() => setIsTimeOffModalOpen(true)}>
                <CalendarPlus className="mr-2 h-4 w-4" />
                Solicitar Días Libres o Incapacidad
            </Button>
        </>
      )
    }

    // If we've finished loading and there's no user, show the login card.
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
            <CardTitle className="text-2xl text-center">Bienvenido a Asistencia Aviva</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
             <p className="text-muted-foreground mb-6">Por favor, inicia sesión para registrar tu check-in.</p>
            <Button onClick={handleLogin} size="lg" disabled={isLoggingIn}>
                {isLoggingIn ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-72.2 72.2C327 113.1 290.5 96 248 96c-88.8 0-160.1 71.1-160.1 160.1s71.4 160.1 160.1 160.1c98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                )}
                {isLoggingIn ? 'Iniciando sesión...' : 'Iniciar Sesión con Google'}
            </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="flex min-h-dvh w-full flex-col items-center bg-background p-4 sm:p-6">
        <header className="flex w-full max-w-2xl items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <AsistenciaAvivaLogo className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Asistencia Aviva
            </h1>
          </div>
          {user && <UserMenu />}
        </header>
        <main className="w-full flex flex-1 flex-col items-center justify-center">
          {renderContent()}
        </main>
      </div>
      {user && (
          <TimeOffRequestDialog
              isOpen={isTimeOffModalOpen}
              onOpenChange={setIsTimeOffModalOpen}
              user={{ name: user.displayName || 'Usuario', avatar: user.photoURL || '' }}
          />
      )}
    </>
  );
}
