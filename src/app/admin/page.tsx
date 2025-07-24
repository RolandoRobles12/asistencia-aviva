'use client';

import * as React from 'react';
import {
  CalendarIcon,
  PlusCircle,
  Search,
  Trophy,
  Settings,
  Building2,
  ListChecks,
  CalendarDays,
  Send,
  Database,
  KeyRound,
  Shield,
  FileText,
  Palette,
  Wrench,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Loader2,
  Upload,
  Download,
  Info,
  Users,
  UserCheck,
  FileBarChart,
  Trash2,
  Edit,
  UserPlus,
  GitBranch,
  Save,
  Play,
  Eye,
  ChevronsUpDown,
  Copy,
  Plus,
  Camera,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  UserCog,
  MapPin,
  ArrowUp,
  ArrowDown,
  Bell,
  Plug,
} from 'lucide-react';
import type { DateRange } from "react-day-picker"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
import { CheckinsByStateChart, CheckinsByCityChart, type ChartData } from '@/components/charts';
import { kiosks as allKiosksData } from '@/lib/kiosks';
import { cn } from "@/lib/utils";
import { format, parse, parseISO, differenceInMinutes, differenceInHours, addDays } from "date-fns";
import { es } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { generateAutomatedReport } from '@/ai/flows/automated-report';
import { analyzeRule } from '@/ai/flows/analyze-rule';
import { type AnalyzeRuleOutput } from '@/lib/schemas/analysis';
import { useToast } from '@/hooks/use-toast';
import type { Kiosk, Checkin, TimeOffRequest } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getTimeOffRequests, updateTimeOffStatus, updateTimeOffComments, sendTestSlackMessage } from '../actions';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { timeOffRequests as mockTimeOffRequests } from '@/lib/time-off';

const mockCheckins: Checkin[] = [
  { id: 'CHK001', user: { name: 'Ana Pérez', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k001', type: 'Entrada', date: '2024-07-22 08:58', punctuality: 'A tiempo', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK002', user: { name: 'Juan García', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k002', type: 'Entrada', date: '2024-07-22 09:15', punctuality: 'Retrasado', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK003', user: { name: 'Ana Pérez', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k001', type: 'Comida', date: '2024-07-22 14:05', punctuality: 'A tiempo', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK004', user: { name: 'Carlos López', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k004', type: 'Entrada', date: '2024-07-22 08:50', punctuality: 'Anticipado', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK005', user: { name: 'Juan García', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k002', type: 'Salida', date: '2024-07-22 18:05', punctuality: 'A tiempo', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK006', user: { name: 'Pedro Sánchez', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k005', type: 'Entrada', date: '2024-07-22 09:05', punctuality: 'A tiempo', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK007', user: { name: 'Sofía Hernández', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k006', type: 'Entrada', date: '2024-07-22 08:45', punctuality: 'Anticipado', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK008', user: { name: 'Carlos López', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k004', type: 'Salida', date: '2024-07-22 17:50', punctuality: 'Anticipado', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK009', user: { name: 'Ana Pérez', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k001', type: 'Salida', date: '2024-07-22 18:02', punctuality: 'A tiempo', location: 'Inválida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK010', user: { name: 'Diego Ramírez', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k003', type: 'Entrada', date: '2024-07-23 09:20', punctuality: 'Retrasado', location: 'Inválida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK011', user: { name: 'Sofía Hernández', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k006', type: 'Comida', date: '2024-07-22 13:30', punctuality: 'A tiempo', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK012', user: { name: 'Pedro Sánchez', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k005', type: 'Salida', date: '2024-07-22 18:30', punctuality: 'Retrasado', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK013', user: { name: 'Ana Pérez', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k002', type: 'Entrada', date: '2024-07-23 08:55', punctuality: 'A tiempo', location: 'Válida', photo: 'https://placehold.co/400x400.png' },
  { id: 'CHK014', user: { name: 'Juan García', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k002', type: 'Entrada', date: '2024-07-23 09:30', punctuality: 'Retrasado', location: 'Válida' },
  { id: 'CHK015', user: { name: 'Juan García', avatar: 'https://placehold.co/32x32.png' }, kioskId: 'k002', type: 'Entrada', date: '2024-07-24 09:25', punctuality: 'Retrasado', location: 'Válida' },
];

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    team: string;
    status: 'Activo' | 'Inactivo';
    avatar: string;
    slackId?: string;
};

type Permission = {
    name: string;
    description: string;
    icon: React.ElementType;
};

type Role = {
    name: string;
    description: string;
    permissions: Permission[];
};

type Team = {
    id: string;
    name: string;
    memberCount: number;
    members: string[]; // array of user IDs
};

const allPermissions: Permission[] = [
    { name: "manage_all", description: "Administrar todo", icon: Shield },
    { name: "view_reports", description: "Ver Reportes", icon: FileBarChart },
    { name: "manage_users", description: "Gestionar Usuarios", icon: Users },
    { name: "manage_kiosks", description: "Gestionar Kioscos", icon: Building2 },
    { name: "approve_time_off", description: "Aprobar Días Libres", icon: UserCheck },
    { name: "manage_teams", description: "Gestionar Equipos", icon: Users },
    { name: "perform_checkin", description: "Realizar Check-in", icon: CheckCircle2 },
];


const initialRoles: Role[] = [
    {
        name: "Super Admin",
        description: "Acceso total a todas las funciones y configuraciones del sistema.",
        permissions: [allPermissions.find(p => p.name === 'manage_all')!]
    },
    {
        name: "Admin",
        description: "Acceso a funciones administrativas principales.",
        permissions: [
            allPermissions.find(p => p.name === 'view_reports')!,
            allPermissions.find(p => p.name === 'manage_users')!,
            allPermissions.find(p => p.name === 'manage_kiosks')!,
            allPermissions.find(p => p.name === 'approve_time_off')!,
        ]
    },
    {
        name: "Supervisor",
        description: "Puede ver reportes y gestionar equipos asignados.",
        permissions: [
            allPermissions.find(p => p.name === 'view_reports')!,
            allPermissions.find(p => p.name === 'manage_teams')!,
        ]
    },
    {
        name: "Promotor",
        description: "Rol base para personal de campo. Solo puede registrar check-ins.",
        permissions: [
            allPermissions.find(p => p.name === 'perform_checkin')!,
        ]
    }
];

const initialTeams: Team[] = [
    { id: 'team01', name: 'Promotores CDMX', memberCount: 3, members: ['user03', 'user04', 'user07']},
    { id: 'team02', name: 'Promotores Jalisco', memberCount: 2, members: ['user05', 'user06']},
    { id: 'team03', name: 'Supervisores Zona Norte', memberCount: 1, members: ['user03'] },
];

const initialUsers: User[] = [
  { id: 'user01', name: 'Rolando Robles', email: 'rolando.robles@avivacredito.com', role: 'Super Admin', team: 'N/A', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png', slackId: 'U012AB3CD' },
  { id: 'user02', name: 'Ana Pérez', email: 'ana.perez@example.com', role: 'Admin', team: 'N/A', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png', slackId: 'U045EF6GH'},
  { id: 'user03', name: 'Juan García', email: 'juan.garcia@example.com', role: 'Supervisor', team: 'Promotores CDMX', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user04', name: 'Carlos López', email: 'carlos.lopez@example.com', role: 'Promotor', team: 'Promotores CDMX', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png', slackId: 'U078IJ9KL'},
  { id: 'user05', name: 'Sofía Hernández', email: 'sofia.hernandez@example.com', role: 'Promotor', team: 'Promotores Jalisco', status: 'Inactivo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user06', name: 'Pedro Sánchez', email: 'pedro.sanchez@example.com', role: 'Promotor', team: 'Promotores Jalisco', status: 'Inactivo' as const, avatar: 'https://placehold.co/32x32.png'},
  { id: 'user07', name: 'Diego Ramírez', email: 'diego.ramirez@example.com', role: 'Promotor', team: 'Promotores CDMX', status: 'Activo' as const, avatar: 'https://placehold.co/32x32.png', slackId: 'U0AB123CD'},
];


type GeographicStat = {
  state: string;
  total: number;
  onTime: number;
  late: number;
  validLocation: number;
  invalidLocation: number;
  punctualityPercentage: number;
  validLocationPercentage: number;
  weeklyTrend: 'up' | 'down' | 'same';
};

type UserKioskRankingStat = {
  user: Checkin['user'];
  kiosk?: Kiosk;
  totalCheckins: number;
  onTimePercentage: number;
};

// Types for Advanced Stats
type UserPerformance = {
    user: Checkin['user'];
    totalCheckins: number;
    punctuality: number; // as percentage
    incidents: number;
    hoursWorked: number;
};

type KioskPerformance = {
    kiosk: Kiosk;
    totalCheckins: number;
    punctuality: number; // as percentage
    incidents: number;
};

type Holiday = {
    id: string;
    date: Date;
    name: string;
    type: 'official' | 'regional' | 'corporate';
}

const getMexicanHolidays2025 = (): Holiday[] => {
    const year = 2025;
    return [
        { id: 'H01', date: new Date(year, 0, 1), name: 'Año Nuevo', type: 'official' },
        { id: 'H02', date: new Date(year, 1, 3), name: 'Día de la Constitución', type: 'official' },
        { id: 'H03', date: new Date(year, 2, 17), name: 'Natalicio de Benito Juárez', type: 'official' },
        { id: 'H04', date: new Date(year, 4, 1), name: 'Día del Trabajo', type: 'official' },
        { id: 'H05', date: new Date(year, 8, 16), name: 'Día de la Independencia', type: 'official' },
        { id: 'H06', date: new Date(year, 10, 17), name: 'Revolución Mexicana', type: 'official' },
        { id: 'H07', date: new Date(year, 11, 25), name: 'Navidad', type: 'official' },
    ];
};

type ScheduledReport = {
    id: string;
    name: string;
    frequency: 'Diario' | 'Semanal' | 'Mensual';
    time: string; // "HH:mm"
    recipients: string;
    filters: {
        kioskType: string;
        checkinType: string;
        user: string;
    };
    active: boolean;
};

const initialScheduledReports: ScheduledReport[] = [
    {
        id: 'SR001',
        name: 'Reporte diario Walmart',
        frequency: 'Diario',
        time: '11:30',
        recipients: 'walmart-contact@example.com, supervisor@example.com',
        filters: { kioskType: 'Bodega Aurrera', checkinType: 'Entrada', user: 'all' },
        active: true,
    },
    {
        id: 'SR002',
        name: 'Reporte semanal de incidencias',
        frequency: 'Semanal',
        time: '09:00',
        recipients: 'admin@example.com',
        filters: { kioskType: 'all', checkinType: 'all', user: 'all' },
        active: true,
    }
];

// Types for Integrations
type Integration = {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  type: 'apikey' | 'bot_token';
  status: 'conectado' | 'desconectado';
  token: string | null;
};

const initialIntegrations: Integration[] = [
    {
        id: 'humand',
        name: 'Humand',
        description: 'Sincroniza usuarios y actividad con la plataforma Humand.',
        logoUrl: 'https://placehold.co/24x24.png',
        type: 'apikey',
        status: 'desconectado',
        token: null,
    },
    {
        id: 'slack',
        name: 'Slack',
        description: 'Envía notificaciones de incidencias a canales de Slack.',
        logoUrl: 'https://placehold.co/24x24.png',
        type: 'bot_token',
        status: 'desconectado',
        token: null,
    },
];


// Helper to get kiosk by ID
const getKioskById = (id: string, currentKiosks: Kiosk[]): Kiosk | undefined => currentKiosks.find(k => k.id === id);


function StatCard({ title, value, children }: { title: string; value: number | string, children?: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium uppercase">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {children}
      </CardContent>
    </Card>
  );
}

function KpiCard({ title, value, description, icon: Icon, progress }: { title: string; value: string; description: string; icon: React.ElementType, progress?: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <div className="p-2 bg-accent/20 rounded-md">
            <Icon className="h-5 w-5 text-accent" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {progress !== undefined && <Progress value={progress} className="h-2" />}
      </CardContent>
    </Card>
  )
}

const formatPercentage = (value: number, total: number) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

const getPerformanceColor = (value: number) => {
    if (value >= 90) return "bg-green-500";
    if (value >= 70) return "bg-yellow-500";
    return "bg-red-500";
};

function ConfigModule({ icon, title, description, children }: { icon: React.ReactNode, title: string, description: string, children: React.ReactNode }) {
    return (
        <AccordionItem value={title}>
            <AccordionTrigger>
                <div className="flex items-center gap-4">
                    {icon}
                    <div>
                        <h4 className="text-base font-semibold text-left">{title}</h4>
                         <p className="text-sm text-muted-foreground text-left mt-1">{description}</p>
                    </div>
                </div>
            </AccordionTrigger>
            <AccordionContent>
                <div className="pl-12 pt-4 border-l-2 ml-5">
                    {children}
                </div>
            </AccordionContent>
        </AccordionItem>
    )
}

function TimeOffStatusBadge({ status }: { status: TimeOffRequest['status'] }) {
    const variants: Record<TimeOffRequest['status'], { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode, className: string }> = {
      Pendiente: { variant: 'outline', icon: <Clock className="h-3 w-3" />, className: 'bg-amber-100 text-amber-800 border-amber-200' },
      Aprobado: { variant: 'secondary', icon: <CheckCircle2 className="h-3 w-3" />, className: 'bg-green-100 text-green-800 border-green-200' },
      Rechazado: { variant: 'destructive', icon: <XCircle className="h-3 w-3" />, className: 'bg-red-100 text-red-800 border-red-200' },
    };

    const currentVariant = variants[status];

    return (
        <Badge variant={currentVariant.variant} className={cn("gap-1.5", currentVariant.className)}>
            {currentVariant.icon}
            {status}
        </Badge>
    );
}

const NewKioskDialog = ({ onAddKiosk }: { onAddKiosk: (kiosk: Kiosk) => void }) => {
    const [name, setName] = React.useState('');
    const [city, setCity] = React.useState('');
    const [state, setState] = React.useState('');
    const [type, setType] = React.useState<'Bodega Aurrera' | 'Kiosco Aviva Tu Compra'>('Bodega Aurrera');
    const [latitude, setLatitude] = React.useState('');
    const [longitude, setLongitude] = React.useState('');
    const [radius, setRadius] = React.useState('');
    const [active, setActive] = React.useState(true);
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newKiosk: Kiosk = {
            id: `k${Date.now()}`, // Simple unique ID for now
            name,
            city,
            state,
            type,
            latitude: parseFloat(latitude) || 0,
            longitude: parseFloat(longitude) || 0,
            radiusOverride: radius ? parseInt(radius) : null,
            active,
        };
        onAddKiosk(newKiosk);
        setIsOpen(false);
        // Reset form
        setName('');
        setCity('');
        setState('');
        setType('Bodega Aurrera');
        setLatitude('');
        setLongitude('');
        setRadius('');
        setActive(true);
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Añadir Kiosco
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Kiosco</DialogTitle>
                    <DialogDescription>
                        Completa los detalles para registrar una nueva ubicación.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Nombre</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="city" className="text-right">Ciudad</Label>
                            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="state" className="text-right">Estado</Label>
                            <Input id="state" value={state} onChange={(e) => setState(e.target.value)} className="col-span-3" required />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="type" className="text-right">Tipo</Label>
                            <Select onValueChange={(v: Kiosk['type']) => setType(v)} defaultValue={type}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Selecciona un tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bodega Aurrera">Bodega Aurrera</SelectItem>
                                    <SelectItem value="Kiosco Aviva Tu Compra">Kiosco Aviva Tu Compra</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                             <Label className="text-right">Coords (Lat, Lng)</Label>
                            <div className="col-span-3 grid grid-cols-2 gap-2">
                                <Input id="latitude" type="number" placeholder="Latitud" value={latitude} onChange={e => setLatitude(e.target.value)} required />
                                <Input id="longitude" type="number" placeholder="Longitud" value={longitude} onChange={e => setLongitude(e.target.value)} required />
                            </div>
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="radius" className="text-right">Radio (m)</Label>
                            <Input id="radius" type="number" placeholder="Default" value={radius} onChange={e => setRadius(e.target.value)} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Estado</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Switch id="active" checked={active} onCheckedChange={setActive} />
                                <Label htmlFor="active">{active ? 'Activo' : 'Inactivo'}</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit">Guardar Kiosco</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}    

const CommentsDialog = ({ request, isOpen, onOpenChange, onSave }: { request: TimeOffRequest | null, isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onSave: (requestId: string, comments: string) => void }) => {
    const [comments, setComments] = React.useState('');

    React.useEffect(() => {
        if (request) {
            setComments(request.comments || '');
        }
    }, [request]);

    if (!request) return null;

    const handleSave = () => {
        onSave(request.id, comments);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Comentarios para la solicitud de {request.user.name}</DialogTitle>
                    <DialogDescription>
                        Revisa o añade comentarios a esta solicitud de día libre.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        placeholder="Añade tus comentarios aquí..."
                        rows={5}
                    />
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Guardar Comentarios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const EditRoleDialog = ({ role, onSave, onOpenChange, ...props }: { role: Omit<Role, 'permissions'> & { permissions: string[] } | null, onSave: (role: Role) => void, onOpenChange: (isOpen: boolean) => void, isOpen: boolean }) => {
    const [name, setName] = React.useState('');
    const [description, setDescription] = React.useState('');
    const [permissions, setPermissions] = React.useState<string[]>([]);
    const isNewRole = !role?.name;

    React.useEffect(() => {
        if (props.isOpen && role) {
            setName(role.name || '');
            setDescription(role.description || '');
            setPermissions(role.permissions || []);
        }
    }, [role, props.isOpen]);


    if (!props.isOpen) return null;

    const handlePermissionChange = (permissionName: string, checked: boolean) => {
        setPermissions(prev =>
            checked ? [...prev, permissionName] : prev.filter(p => p !== permissionName)
        );
    };
    
    const handleSave = () => {
        const newPermissions = allPermissions.filter(p => permissions.includes(p.name));
        onSave({ name, description, permissions: newPermissions });
        onOpenChange(false);
    };

    return (
        <Dialog open={props.isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isNewRole ? 'Añadir Nuevo Rol' : `Editar Rol: ${role.name}`}</DialogTitle>
                    <DialogDescription>{isNewRole ? 'Define los detalles y permisos para el nuevo rol.' : 'Modifica los detalles y permisos del rol.'}</DialogDescription>
                </DialogHeader>
                 <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role-name" className="text-right">Nombre</Label>
                        <Input id="role-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="role-desc" className="text-right pt-2">Descripción</Label>
                        <Textarea id="role-desc" value={description} onChange={e => setDescription(e.target.value)} className="col-span-3" />
                    </div>
                    <div>
                        <Label className="text-base font-medium">Permisos</Label>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {allPermissions.map(permission => (
                                <div key={permission.name} className="flex items-start gap-3">
                                    <Checkbox
                                        id={`perm-${permission.name}`}
                                        checked={permissions.includes(permission.name)}
                                        onCheckedChange={(checked) => handlePermissionChange(permission.name, !!checked)}
                                        disabled={permission.name === 'manage_all'}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <label
                                            htmlFor={`perm-${permission.name}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {permission.description}
                                        </label>
                                        <p className="text-xs text-muted-foreground">{permission.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter>
                     <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const EditUserDialog = ({ user, isOpen, onOpenChange, onSave }: { user: User | null, isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onSave: (userId: string, newDetails: Partial<User>) => void }) => {
    const [slackId, setSlackId] = React.useState('');

    React.useEffect(() => {
        if (user) {
            setSlackId(user.slackId || '');
        }
    }, [user]);

    if (!user) return null;

    const handleSave = () => {
        onSave(user.id, { slackId });
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar Usuario: {user.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="slackId">ID de Usuario de Slack</Label>
                        <Input 
                            id="slackId" 
                            value={slackId} 
                            onChange={e => setSlackId(e.target.value)} 
                            placeholder="Ej: U012AB3CD"
                        />
                         <p className="text-xs text-muted-foreground">
                            Este ID se usa para enviar notificaciones directas desde las reglas.
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave}>Guardar Cambios</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Types for Rule Builder
type RuleCondition = { id: number; field: string; operator: string; value: string; };
type RuleAction = { id: number; type: string; value: string; };
type Rule = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'scheduled';
  conditions: RuleCondition[];
  actions: RuleAction[];
};

const initialRuleSet: Rule[] = [
    {
        id: 1,
        name: 'Regla de Retardo Leve',
        description: 'Define la política para llegadas con un pequeño retraso.',
        status: 'active',
        conditions: [
            { id: 1, field: 'checkinType', operator: 'is', value: 'Entrada' },
            { id: 2, field: 'delayMinutes', operator: 'greater_than', value: '5' },
        ],
        actions: [
            { id: 1, type: 'setPunctuality', value: 'late_minor' },
        ],
    },
];

const RuleBuilder = ({ usersWithSlack }: { usersWithSlack: User[] }) => {
    const { toast } = useToast();
    const [rules, setRules] = React.useState<Rule[]>(initialRuleSet);
    const [activeTab, setActiveTab] = React.useState('global');
    const [specificTargetType, setSpecificTargetType] = React.useState('kiosk');

    // State for analysis dialog
    const [isAnalysisRunning, setIsAnalysisRunning] = React.useState(false);
    const [analysisResult, setAnalysisResult] = React.useState<AnalyzeRuleOutput | null>(null);
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = React.useState(false);


    const handleUpdateRule = (ruleId: number, field: keyof Rule, value: any) => {
        setRules(prev => prev.map(r => r.id === ruleId ? { ...r, [field]: value } : r));
    };
    
    const handleUpdateCondition = (ruleId: number, condId: number, field: keyof RuleCondition, value: any) => {
        setRules(prev => prev.map(r => {
            if (r.id === ruleId) {
                const newConditions = r.conditions.map(c => c.id === condId ? { ...c, [field]: value } : c);
                return { ...r, conditions: newConditions };
            }
            return r;
        }));
    };

    const handleUpdateAction = (ruleId: number, actionId: number, field: keyof RuleAction, value: any) => {
        setRules(prev => prev.map(r => {
            if (r.id === ruleId) {
                const newActions = r.actions.map(a => a.id === actionId ? { ...a, [field]: value } : a);
                return { ...r, actions: newActions };
            }
            return r;
        }));
    };

    const handleAddCondition = (ruleId: number) => {
        setRules(prev => prev.map(r => r.id === ruleId ? { ...r, conditions: [...r.conditions, { id: Date.now(), field: 'time', operator: 'is', value: '' }] } : r));
    };

    const handleRemoveCondition = (ruleId: number, condId: number) => {
        setRules(prev => prev.map(r => r.id === ruleId ? { ...r, conditions: r.conditions.filter(c => c.id !== condId) } : r));
    };
    
    const handleAddAction = (ruleId: number) => {
        setRules(prev => prev.map(r => r.id === ruleId ? { ...r, actions: [...r.actions, { id: Date.now(), type: 'notify', value: '' }] } : r));
    };

    const handleRemoveAction = (ruleId: number, actionId: number) => {
        setRules(prev => prev.map(r => r.id === ruleId ? { ...r, actions: r.actions.filter(a => a.id !== actionId) } : r));
    };

    const handleAddRule = () => {
        const newRule: Rule = {
            id: Date.now(),
            name: 'Nueva Regla',
            description: 'Descripción de la nueva regla...',
            status: 'draft',
            conditions: [],
            actions: [],
        };
        setRules(prev => [...prev, newRule]);
    };
    
    const handleRemoveRule = (ruleId: number) => {
        setRules(prev => prev.filter(r => r.id !== ruleId));
        toast({ title: "Regla Eliminada", description: "La regla ha sido eliminada del conjunto." });
    };

    const handleAnalysis = async (rule: Rule, type: 'impact' | 'simulation') => {
        setIsAnalysisRunning(true);
        setAnalysisResult(null);
        setIsAnalysisModalOpen(true);
        try {
            const result = await analyzeRule({ 
                rule, 
                analysisType: type,
                allCheckins: mockCheckins.map(c => ({...c, date: c.date.replace(' ', 'T')})), // For impact analysis
            });
            setAnalysisResult(result);
        } catch (error) {
            console.error("Error analyzing rule:", error);
            toast({ variant: 'destructive', title: 'Error de Análisis', description: 'No se pudo completar el análisis de la regla.' });
            setIsAnalysisModalOpen(false); // Close modal on error
        } finally {
            setIsAnalysisRunning(false);
        }
    };


    const renderConditionValueField = (ruleId: number, cond: RuleCondition) => {
      const commonProps = {
        className: "flex-1",
        value: cond.value,
        onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => {
          const value = typeof e === 'string' ? e : e.target.value;
          handleUpdateCondition(ruleId, cond.id, 'value', value);
        },
      };
    
      if (cond.field === 'checkinType') {
        return (
          <Select value={commonProps.value} onValueChange={commonProps.onChange}>
            <SelectTrigger className={commonProps.className}><SelectValue placeholder="Valor..."/></SelectTrigger>
            <SelectContent>
              <SelectItem value="Entrada">Entrada</SelectItem>
              <SelectItem value="Comida">Comida</SelectItem>
              <SelectItem value="Salida">Salida</SelectItem>
            </SelectContent>
          </Select>
        );
      }
    
      return <Input placeholder="Valor..." {...commonProps} />;
    };

    const renderActionValueField = (ruleId: number, action: RuleAction) => {
        const commonProps = {
            className: "flex-1",
            value: action.value,
            onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => {
                const value = typeof e === 'string' ? e : e.target.value;
                handleUpdateAction(ruleId, action.id, 'value', value);
            },
        };

        switch (action.type) {
            case 'setPunctuality':
                return (
                    <Select value={commonProps.value} onValueChange={commonProps.onChange}>
                        <SelectTrigger className={commonProps.className}><SelectValue placeholder="Estado..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="on_time">A tiempo</SelectItem>
                            <SelectItem value="late_minor">Retraso Leve</SelectItem>
                            <SelectItem value="late_major">Retraso Grave</SelectItem>
                            <SelectItem value="early">Anticipado</SelectItem>
                        </SelectContent>
                    </Select>
                );
            case 'notify':
                 return (
                    <Select value={action.value} onValueChange={(v) => handleUpdateAction(ruleId, action.id, 'value', v)}>
                        <SelectTrigger className={commonProps.className}><SelectValue placeholder="Destino..." /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">Usuario</SelectItem>
                            <SelectItem value="slack">Slack</SelectItem>
                        </SelectContent>
                    </Select>
                );
            case 'notifySlack':
                return (
                    <Select value={action.value} onValueChange={(v) => handleUpdateAction(ruleId, action.id, 'value', v)}>
                        <SelectTrigger className={commonProps.className}><SelectValue placeholder="Usuario de Slack..." /></SelectTrigger>
                        <SelectContent>
                            {usersWithSlack.map(u => (
                                <SelectItem key={u.id} value={u.slackId!}>{u.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );
            case 'requireComment':
                return null; // This action doesn't need a value field.
            case 'addMinutes':
            default:
                return <Input type="number" placeholder="Valor..." {...commonProps} />;
        }
    };

    const renderActionFields = (ruleId: number, action: RuleAction) => {
        const handleTypeChange = (newType: string) => {
            handleUpdateAction(ruleId, action.id, 'type', newType);
            handleUpdateAction(ruleId, action.id, 'value', ''); // Reset value on type change
        };
        
        return (
            <>
                <Select value={action.type} onValueChange={handleTypeChange}>
                    <SelectTrigger className="flex-1"><SelectValue placeholder="Acción..."/></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="setPunctuality">Asignar estado de puntualidad</SelectItem>
                        <SelectItem value="addMinutes">Sumar minutos de retraso</SelectItem>
                        <SelectItem value="requireComment">Exigir comentario</SelectItem>
                        <SelectItem value="notify">Notificar a</SelectItem>
                        <SelectItem value="notifySlack">Notificar a Slack</SelectItem>
                    </SelectContent>
                </Select>
                {renderActionValueField(ruleId, action)}
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleRemoveAction(ruleId, action.id)}><X className="h-4 w-4"/></Button>
            </>
        );
    }


    return (
        <>
            <div className="space-y-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="flex items-center justify-between border-b">
                        <TabsList className="bg-transparent p-0 border-none">
                            <TabsTrigger value="global" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none border-transparent data-[state=active]:border-primary -mb-px">
                                <GitBranch className="mr-2 h-4 w-4" /> Global
                            </TabsTrigger>
                            <TabsTrigger value="kioskType" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none border-transparent data-[state=active]:border-primary -mb-px">
                                Por Tipo de Kiosco
                            </TabsTrigger>
                            <TabsTrigger value="specific" className="data-[state=active]:shadow-none data-[state=active]:border-b-2 rounded-none border-transparent data-[state=active]:border-primary -mb-px">
                                Por Kiosco/Usuario
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2 pb-2">
                            <Button size="sm" onClick={handleAddRule}><PlusCircle className="mr-2 h-4 w-4" />Añadir Conjunto de Reglas</Button>
                        </div>
                    </div>
                    <TabsContent value="global" className="mt-4">
                        <Card>
                             <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Conjunto de Reglas: Globales</CardTitle>
                                        <CardDescription>
                                            Estas reglas se aplican a todos los check-ins si no hay una regla más específica.
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" onClick={() => toast({title: "Guardado", description: "Los cambios a las reglas han sido guardados."})}><Save className="mr-2 h-4 w-4"/> Guardar Cambios</Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {rules.map((rule) => (
                                    <Card key={rule.id} className="bg-muted/30 overflow-hidden">
                                        <CardHeader className="flex flex-row items-start gap-4 p-4 bg-background/50">
                                            <div className='flex-grow space-y-1'>
                                                <Input 
                                                    className="text-base font-semibold border-0 focus-visible:ring-0 p-0 h-auto bg-transparent w-full" 
                                                    placeholder="Nombre de la regla..." 
                                                    value={rule.name} 
                                                    onChange={(e) => handleUpdateRule(rule.id, 'name', e.target.value)} 
                                                />
                                                <Textarea
                                                    className="text-sm text-muted-foreground border-0 focus-visible:ring-0 p-0 h-auto bg-transparent w-full resize-none"
                                                    placeholder="Descripción de la regla..." 
                                                    value={rule.description} 
                                                    onChange={(e) => handleUpdateRule(rule.id, 'description', e.target.value)}
                                                    rows={1}
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                                                <div className="flex items-center gap-2">
                                                    <Label htmlFor={`status-${rule.id}`} className='text-xs'>Estado</Label>
                                                    <Select value={rule.status} onValueChange={(value) => handleUpdateRule(rule.id, 'status', value)}>
                                                        <SelectTrigger id={`status-${rule.id}`} className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="active">Activo</SelectItem>
                                                            <SelectItem value="draft">Borrador</SelectItem>
                                                            <SelectItem value="scheduled">Programado</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className='h-8 w-8'><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem onSelect={() => handleAnalysis(rule, 'simulation')}>
                                                            <Play className="mr-2 h-4 w-4"/>Simular
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={() => handleAnalysis(rule, 'impact')}>
                                                            <Eye className="mr-2 h-4 w-4"/>Ver Impacto
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem><Copy className="mr-2 h-4 w-4"/>Duplicar</DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveRule(rule.id)}><Trash2 className="mr-2 h-4 w-4"/>Eliminar</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <Separator/>
                                        <CardContent className="p-4 grid grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Si... (Condiciones)</h4>
                                                <div className="p-3 border rounded-md space-y-3 bg-background min-h-[100px]">
                                                    {rule.conditions.map((cond) => (
                                                        <div key={cond.id} className="flex gap-2 items-center">
                                                            <Select value={cond.field} onValueChange={(v) => handleUpdateCondition(rule.id, cond.id, 'field', v)}>
                                                                <SelectTrigger className="flex-1"><SelectValue placeholder="Campo..."/></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="checkinType">Tipo de Check-in</SelectItem>
                                                                    <SelectItem value="time">Hora del día</SelectItem>
                                                                    <SelectItem value="distance">Distancia GPS</SelectItem>
                                                                    <SelectItem value="hasPhoto">Foto Adjunta</SelectItem>
                                                                    <SelectItem value="delayMinutes">Minutos de Retraso</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Select value={cond.operator} onValueChange={(v) => handleUpdateCondition(rule.id, cond.id, 'operator', v)}>
                                                                <SelectTrigger className="w-24"><SelectValue placeholder="Op..."/></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="is">es</SelectItem>
                                                                    <SelectItem value="isNot">no es</SelectItem>
                                                                    <SelectItem value="greater_than">{'>'}</SelectItem>
                                                                    <SelectItem value="less_than">{'<'}</SelectItem>
                                                                    <SelectItem value="equal_to">{'='}</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            {renderConditionValueField(rule.id, cond)}
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => handleRemoveCondition(rule.id, cond.id)}><X className="h-4 w-4"/></Button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddCondition(rule.id)}><Plus className="mr-2 h-4 w-4"/> Añadir condición (Y)</Button>
                                            </div>
                                            <div className="space-y-3">
                                                <h4 className="font-medium">Entonces... (Acciones)</h4>
                                                <div className="p-3 border rounded-md space-y-3 bg-background min-h-[100px]">
                                                    {rule.actions.map((action) => (
                                                        <div key={action.id} className="flex gap-2 items-center">
                                                            {renderActionFields(rule.id, action)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <Button variant="outline" size="sm" className="w-full" onClick={() => handleAddAction(rule.id)}><Plus className="mr-2 h-4 w-4"/>Añadir acción</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {rules.length > 0 ? (
                                     <Button variant="secondary" className="w-full border-dashed border-2" onClick={handleAddRule}><PlusCircle className="mr-2 h-4 w-4"/> Añadir Nueva Regla al Conjunto</Button>
                                ) : (
                                     <div className="text-center py-10 text-muted-foreground">
                                        <p>No hay reglas en este conjunto.</p>
                                        <Button variant="link" onClick={handleAddRule}>Añadir la primera regla</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="kioskType" className="mt-4">
                        <Card>
                             <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Conjunto de Reglas: Por Tipo de Kiosco</CardTitle>
                                        <CardDescription>
                                            Estas reglas se aplican a un tipo de kiosco específico y sobreescriben las globales.
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" onClick={() => toast({title: "Guardado", description: "Los cambios a las reglas han sido guardados."})}><Save className="mr-2 h-4 w-4"/> Guardar Cambios</Button>
                                    </div>
                                </div>
                                 <div className="pt-4">
                                    <Label htmlFor="kiosk-type-select">Aplicar a Tipo de Kiosco</Label>
                                    <Select>
                                        <SelectTrigger id="kiosk-type-select" className="mt-2">
                                            <SelectValue placeholder="Seleccionar tipo de kiosco..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Bodega Aurrera">Bodega Aurrera</SelectItem>
                                            <SelectItem value="Kiosco Aviva Tu Compra">Kiosco Aviva Tu Compra</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardHeader>
                             <CardContent className="space-y-4">
                               <div className="text-center py-10 text-muted-foreground">
                                    <p>No hay reglas en este conjunto.</p>
                                    <Button variant="link" onClick={() => {}}>Añadir la primera regla</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="specific" className="mt-4">
                        <Card>
                             <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>Conjunto de Reglas: Específicas</CardTitle>
                                        <CardDescription>Reglas que se aplican a un kiosco o usuario particular. Tienen la máxima prioridad.</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button size="sm" onClick={() => toast({title: "Guardado", description: "Los cambios a las reglas han sido guardados."})}><Save className="mr-2 h-4 w-4"/> Guardar Cambios</Button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <Label htmlFor="specific-type-select">Aplicar a</Label>
                                        <Select value={specificTargetType} onValueChange={setSpecificTargetType}>
                                            <SelectTrigger id="specific-type-select" className="mt-2">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="kiosk">Kiosco Específico</SelectItem>
                                                <SelectItem value="user">Usuario Específico</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="specific-target-select">
                                            {specificTargetType === 'kiosk' ? 'Seleccionar Kiosco' : 'Seleccionar Usuario'}
                                        </Label>
                                        <Select>
                                            <SelectTrigger id="specific-target-select" className="mt-2">
                                                <SelectValue placeholder="Seleccionar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {specificTargetType === 'kiosk' ? (
                                                    allKiosksData.map(kiosk => <SelectItem key={kiosk.id} value={kiosk.id}>{kiosk.name}</SelectItem>)
                                                ) : (
                                                    initialUsers.map(user => <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>)
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                               <div className="text-center py-10 text-muted-foreground">
                                    <p>No hay reglas en este conjunto.</p>
                                    <Button variant="link" onClick={() => {}}>Añadir la primera regla</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
            
            <Dialog open={isAnalysisModalOpen} onOpenChange={setIsAnalysisModalOpen}>
                <DialogContent className="sm:max-w-xl">
                     <DialogHeader>
                        <DialogTitle>{analysisResult?.title || "Analizando..."}</DialogTitle>
                     </DialogHeader>
                     <div className="py-4">
                        {isAnalysisRunning ? (
                            <div className='flex flex-col items-center justify-center gap-4 h-40'>
                                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                 <p className='text-muted-foreground'>La IA está analizando la regla, por favor espera...</p>
                            </div>
                        ) : analysisResult ? (
                            <div className="space-y-4">
                                {analysisResult.affectedCount !== undefined && (
                                     <Alert>
                                        <Lightbulb className="h-4 w-4" />
                                        <AlertTitle>Resultado del Impacto</AlertTitle>
                                        <AlertDescription>
                                            La regla afectaría a <strong>{analysisResult.affectedCount}</strong> de {mockCheckins.length} registros.
                                        </AlertDescription>
                                    </Alert>
                                )}
                                <div className='prose prose-sm max-w-none dark:prose-invert' dangerouslySetInnerHTML={{ __html: analysisResult.report.replace(/\n/g, '<br />') }} />
                            </div>
                        ) : (
                             <p>No se pudo obtener un resultado del análisis.</p>
                        )}
                     </div>
                     <DialogFooter>
                        <DialogClose asChild>
                           <Button type="button" variant="outline">Cerrar</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

const AddHolidayDialog = ({ onAdd }: { onAdd: (holiday: Omit<Holiday, 'id'>) => void }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [date, setDate] = React.useState<Date | undefined>();
    const [type, setType] = React.useState<Holiday['type']>('regional');

    const handleAdd = () => {
        if (name && date) {
            onAdd({ name, date, type });
            setIsOpen(false);
            setName('');
            setDate(undefined);
            setType('regional');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4"/>Añadir Feriado</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Día Feriado</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="holiday-name">Nombre del Feriado</Label>
                        <Input id="holiday-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Aniversario de la Ciudad" />
                    </div>
                     <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select value={type} onValueChange={(v: Holiday['type']) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="regional">Regional</SelectItem>
                                <SelectItem value="corporate">Corporativo</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                    <div className="space-y-2">
                        <Label>Fecha</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP", { locale: es }) : <span>Elige una fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleAdd} disabled={!name || !date}>Añadir Feriado</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ScheduledReportDialog = ({ report, onSave, onOpenChange, allUsers }: { report: ScheduledReport | null, onSave: (report: ScheduledReport) => void, onOpenChange: (isOpen: boolean) => void, allUsers: User[] }) => {
    const { toast } = useToast();
    const [name, setName] = React.useState('');
    const [frequency, setFrequency] = React.useState<ScheduledReport['frequency']>('Diario');
    const [time, setTime] = React.useState('09:00');
    const [recipients, setRecipients] = React.useState('');
    const [kioskType, setKioskType] = React.useState('all');
    const [checkinType, setCheckinType] = React.useState('all');
    const [userId, setUserId] = React.useState('all');
    const [editableEmail, setEditableEmail] = React.useState({ subject: '', body: '' });

    React.useEffect(() => {
        const generatePreviewEmail = async () => {
             // Simulate generating email content when dialog opens
            try {
                // For scheduled reports, we don't pass a date range to get the dynamic template.
                const result = await generateAutomatedReport({
                    targetKioskType: report?.filters?.kioskType || 'all',
                    targetCheckinType: report?.filters?.checkinType || 'all',
                    targetUserId: report?.filters?.user === 'all' ? undefined : report?.filters.user,
                    allCheckins: mockCheckins,
                    allKiosks: allKiosksData,
                    allUsers: allUsers.map(u => ({id: u.id, name: u.name}))
                });
                
                // Replace the dynamic date part with a placeholder for the UI
                const subjectWithToken = result.email.subject.replace(/del\s(.*?)$/, '[Fecha del Reporte]');

                // Replace dynamic parts in the body with tokens
                const bodyWithTokens = result.email.body
                    .replace(/correspondiente al día (.*?)\.\n/, 'correspondiente al día [Fecha del Reporte].\n')
                    .replace(/Total de registros: (\d+)/, 'Total de registros: [Número de Registros]');
                
                setEditableEmail({ subject: subjectWithToken, body: bodyWithTokens });

            } catch {
                // Fallback email content on error
                 setEditableEmail({ subject: `Reporte para ${name}`, body: 'No se pudo generar una vista previa.' });
            }
        };

        if (report) {
            setName(report.name);
            setFrequency(report.frequency);
            setTime(report.time);
            setRecipients(report.recipients);
            setKioskType(report.filters?.kioskType || 'all');
            setCheckinType(report.filters?.checkinType || 'all');
            setUserId(report.filters?.user || 'all');
            generatePreviewEmail();
        }
    }, [report, name, allUsers]);

    const handleSave = () => {
        if (!report) return;
        const newReport: ScheduledReport = {
            id: report?.id || `SR${Date.now()}`,
            name,
            frequency,
            time,
            recipients,
            filters: {
                kioskType,
                checkinType,
                user: userId,
            },
            active: report?.active ?? true,
        };
        onSave(newReport);
        onOpenChange(false);
    };
    
    const isOpen = !!report;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{report?.id ? 'Editar Reporte Programado' : 'Nuevo Reporte Programado'}</DialogTitle>
                    <DialogDescription>
                        Configura los detalles para la generación y envío automático de este reporte.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                     <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="report-name">Nombre del Reporte</Label>
                            <Input id="report-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Reporte Diario de Incidencias" />
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="report-frequency">Frecuencia</Label>
                                <Select value={frequency} onValueChange={(v: ScheduledReport['frequency']) => setFrequency(v)}>
                                    <SelectTrigger id="report-frequency"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Diario">Diario</SelectItem>
                                        <SelectItem value="Semanal">Semanal</SelectItem>
                                        <SelectItem value="Mensual">Mensual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="report-time">Hora de Envío</Label>
                                <Input id="report-time" type="time" value={time} onChange={e => setTime(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <h4 className="font-medium text-base">Filtros y Contenido del Reporte</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Tipo de Kiosco</Label>
                            <Select value={kioskType} onValueChange={setKioskType}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos los Tipos</SelectItem>
                                <SelectItem value="Bodega Aurrera">Bodega Aurrera</SelectItem>
                                <SelectItem value="Kiosco Aviva Tu Compra">Kiosco Aviva Tu Compra</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de Registro</Label>
                             <Select value={checkinType} onValueChange={setCheckinType}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos los Tipos</SelectItem>
                                <SelectItem value="Entrada">Entrada</SelectItem>
                                <SelectItem value="Comida">Comida</SelectItem>
                                <SelectItem value="Salida">Salida</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 col-span-full">
                            <Label>Usuario</Label>
                             <Select value={userId} onValueChange={setUserId}>
                              <SelectTrigger><SelectValue/></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos los Usuarios</SelectItem>
                                {allUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                     </div>
                     <Separator />
                    <h4 className="font-medium text-base">Correo Electrónico</h4>
                    <div className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="email-recipients">Destinatarios del correo</Label>
                            <Input 
                              id="email-recipients"
                              value={recipients}
                              onChange={(e) => setRecipients(e.target.value)}
                              placeholder="email1@example.com, email2@example.com"
                            />
                             <p className="text-xs text-muted-foreground">Separa los correos con comas.</p>
                          </div>
                         <div className="space-y-2">
                            <Label htmlFor="email-subject">Asunto del correo</Label>
                            <Input 
                              id="email-subject"
                              value={editableEmail.subject}
                              onChange={(e) => setEditableEmail(prev => ({ ...prev, subject: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email-body">Cuerpo del correo</Label>
                            <Textarea 
                              id="email-body"
                              value={editableEmail.body}
                              onChange={(e) => setEditableEmail(prev => ({ ...prev, body: e.target.value }))}
                              rows={8}
                            />
                             <Button size="sm" variant="outline" onClick={() => toast({ title: "Correo Enviado (Simulado)", description: "La funcionalidad de envío real no está implementada." })}>
                                <Send className="mr-2 h-4 w-4"/> Enviar Correo de Prueba
                            </Button>
                          </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSave}>Guardar Reporte Programado</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AddIntegrationDialog = ({ onAdd, onOpenChange }: { onAdd: (integration: Omit<Integration, 'id' | 'status' | 'logoUrl' | 'description'>) => void, onOpenChange: (isOpen: boolean) => void }) => {
    const [name, setName] = React.useState('');
    const [type, setType] = React.useState<Integration['type']>('apikey');
    const [token, setToken] = React.useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({ name, type, token });
        onOpenChange(false);
    };
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Añadir Nueva Integración</DialogTitle>
                <DialogDescription>
                    Configura una nueva API Key o Bot Token para conectar un servicio externo.
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd}>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="integration-name">Nombre del Servicio</Label>
                        <Input id="integration-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Google Maps" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="integration-type">Tipo de Credencial</Label>
                        <Select value={type} onValueChange={(v: Integration['type']) => setType(v)}>
                            <SelectTrigger id="integration-type">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="apikey">API Key</SelectItem>
                                <SelectItem value="bot_token">Bot Token</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="integration-token">Credencial</Label>
                        <Input id="integration-token" type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="••••••••••••••••••••" required />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" type="button">Cancelar</Button>
                    </DialogClose>
                    <Button type="submit">Añadir y Conectar</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
};

const AddTeamDialog = ({ users, onSave, onOpenChange, isOpen }: { users: User[], isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onSave: (team: Omit<Team, 'id' | 'memberCount'>) => void }) => {
    const [name, setName] = React.useState('');
    const [selectedMembers, setSelectedMembers] = React.useState<string[]>([]);
    
    React.useEffect(() => {
        if (isOpen) {
            setName('');
            setSelectedMembers([]);
        }
    }, [isOpen]);

    const handleSave = () => {
        if (name) {
            onSave({ name, members: selectedMembers });
            onOpenChange(false);
        }
    };

    const handleMemberToggle = (userId: string) => {
        setSelectedMembers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Nuevo Equipo</DialogTitle>
                    <DialogDescription>
                        Define el nombre del equipo y selecciona sus miembros.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="team-name">Nombre del Equipo</Label>
                        <Input id="team-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Promotores CDMX" />
                    </div>
                    <div className="space-y-2">
                        <Label>Miembros</Label>
                        <ScrollArea className="h-64 rounded-md border p-2">
                             {users.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={user.avatar} data-ai-hint="user avatar" />
                                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-muted-foreground">{user.role}</p>
                                        </div>
                                    </div>
                                    <Checkbox
                                        checked={selectedMembers.includes(user.id)}
                                        onCheckedChange={() => handleMemberToggle(user.id)}
                                    />
                                </div>
                            ))}
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={!name}>Guardar Equipo</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const SlackTestDialog = ({ usersWithSlack, onSend, onOpenChange, isOpen, botToken }: { usersWithSlack: User[], isOpen: boolean, onOpenChange: (isOpen: boolean) => void, onSend: (userId: string) => void, botToken: string | null }) => {
    const [selectedUserId, setSelectedUserId] = React.useState<string>('');
    const [isSending, setIsSending] = React.useState(false);
    const { toast } = useToast();

    React.useEffect(() => {
        if (isOpen) {
            setSelectedUserId('');
        }
    }, [isOpen]);

    const handleSend = async () => {
        if (!selectedUserId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Por favor, selecciona un usuario para enviar el mensaje.' });
            return;
        }
        setIsSending(true);
        try {
            await onSend(selectedUserId);
        } finally {
            setIsSending(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Probar Integración de Slack</DialogTitle>
                    <DialogDescription>
                        Selecciona un usuario para enviarle un mensaje de prueba directo.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="slack-test-user">Enviar a</Label>
                        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                            <SelectTrigger id="slack-test-user">
                                <SelectValue placeholder="Selecciona un usuario..." />
                            </SelectTrigger>
                            <SelectContent>
                                {usersWithSlack.map(user => (
                                    <SelectItem key={user.id} value={user.slackId!}>{user.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            El mensaje de prueba será enviado al usuario seleccionado usando el Bot Token que has configurado.
                        </AlertDescription>
                    </Alert>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <Button onClick={handleSend} disabled={!selectedUserId || isSending}>
                        {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        {isSending ? 'Enviando...' : 'Enviar Mensaje de Prueba'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function AdminDashboard() {
  const { user, isSuperAdmin, loading, interfaceSettings, setInterfaceSettings, operationalSettings, setOperationalSettings } = useAuth();
  const { toast } = useToast();
  // Filters for Check-ins tab
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>({});
  const [checkinSearchTerm, setCheckinSearchTerm] = React.useState('');
  const [checkinSelectedType, setCheckinSelectedType] = React.useState<string>('all');
  const [kiosks, setKiosks] = React.useState(allKiosksData);
  const [roles, setRoles] = React.useState<Role[]>(initialRoles);
  const [teams, setTeams] = React.useState<Team[]>(initialTeams);
  const [users, setUsers] = React.useState<User[]>(initialUsers);
  const [timeOffRequests, setTimeOffRequests] = React.useState<TimeOffRequest[]>([]);
  const [isTimeOffLoading, setIsTimeOffLoading] = React.useState(true);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = React.useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = React.useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = React.useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = React.useState(false);
  const [selectedRequest, setSelectedRequest] = React.useState<TimeOffRequest | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<(Omit<Role, 'permissions'> & { permissions: string[] }) | null>(null);
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [deletingRole, setDeletingRole] = React.useState<Role | null>(null);

  const importFileRef = React.useRef<HTMLInputElement>(null);
  
  // Filters for Stats tab
  const [statsDateRange, setStatsDateRange] = React.useState<DateRange | undefined>(undefined);
  const [statsName, setStatsName] = React.useState('');
  const [statsState, setStatsState] = React.useState('all');
  const [statsCity, setStatsCity] = React.useState('all');
  const [statsKioskType, setStatsKioskType] = React.useState<'all' | Kiosk['type']>('all');
  const [statsCheckinType, setStatsCheckinType] = React.useState('all');

  // State for Reports tab
  const [isGeneratingReport, setIsGeneratingReport] = React.useState(false);
  const [reportResult, setReportResult] = React.useState<Awaited<ReturnType<typeof generateAutomatedReport>> | null>(null);
  const [editableEmail, setEditableEmail] = React.useState({ subject: '', body: '' });
  const [reportDateRange, setReportDateRange] = React.useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: addDays(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0), 0)
  });
  const [reportKioskType, setReportKioskType] = React.useState('all');
  const [reportCheckinType, setReportCheckinType] = React.useState('all');
  const [reportUserId, setReportUserId] = React.useState('all');
  
  // State for Geographic Analysis Table
  type GeoSortKey = 'state' | 'total' | 'punctualityPercentage' | 'validLocationPercentage';
  const [geoSortKey, setGeoSortKey] = React.useState<GeoSortKey>('total');
  const [geoSortDir, setGeoSortDir] = React.useState<'asc' | 'desc'>('desc');

  // State for Holidays
  const [holidays, setHolidays] = React.useState<Holiday[]>(getMexicanHolidays2025());

  // State for Scheduled Reports
  const [scheduledReports, setScheduledReports] = React.useState<ScheduledReport[]>(initialScheduledReports);
  const [editingReport, setEditingReport] = React.useState<ScheduledReport | null>(null);
  
  // State for Integrations
  const [integrations, setIntegrations] = React.useState<Integration[]>(initialIntegrations);
  const [integrationTokens, setIntegrationTokens] = React.useState<Record<string, string>>({});
  const [isAddIntegrationOpen, setIsAddIntegrationOpen] = React.useState(false);
  const [isSlackTestOpen, setIsSlackTestOpen] = React.useState(false);
  
  // State for Audit Logs
  const [logLevel, setLogLevel] = React.useState('info');

  const fetchAndSetTimeOffRequests = React.useCallback(async () => {
    setIsTimeOffLoading(true);
    try {
        const requests = await getTimeOffRequests();
        setTimeOffRequests(requests);
    } catch (error) {
        console.error("Error fetching time off requests:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudieron cargar las solicitudes de días libres.' });
        setTimeOffRequests(mockTimeOffRequests); // Fallback to mock data on error
    } finally {
        setIsTimeOffLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchAndSetTimeOffRequests();
  }, [fetchAndSetTimeOffRequests]);

  const handleFilterChange = (filterName: string, value: string) => {
    setActiveFilters((prev) => {
      if (!value || value === 'all') {
        const newFilters = { ...prev };
        delete newFilters[filterName];
        return newFilters;
      }
      return { ...prev, [filterName]: value };
    });
  };

  const removeFilter = (filterName: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterName];
      return newFilters;
    });
    if (filterName === 'type') setCheckinSelectedType('all');
  };

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    setReportResult(null);
    try {
        const result = await generateAutomatedReport({
            targetKioskType: reportKioskType,
            targetCheckinType: reportCheckinType,
            targetUserId: reportUserId === 'all' ? undefined : reportUserId,
            dateRange: reportDateRange?.from && reportDateRange?.to ? {
              from: format(reportDateRange.from, 'yyyy-MM-dd'),
              to: format(reportDateRange.to, 'yyyy-MM-dd')
            } : undefined,
            allCheckins: mockCheckins,
            allKiosks: kiosks,
            allUsers: users.map(u => ({id: u.id, name: u.name}))
        });
        setReportResult(result);
        setEditableEmail(result.email);
        toast({
            title: "Reporte Generado",
            description: "La vista previa del correo está lista.",
        });
    } catch (error) {
        console.error("Error generating report:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "No se pudo generar el reporte.",
        });
    } finally {
        setIsGeneratingReport(false);
    }
  };

  const handleExportCSV = () => {
    const headers = ["id", "name", "latitude", "longitude", "city", "state", "type", "active", "radiusOverride"];
    const csvContent = [
        headers.join(','),
        ...kiosks.map(k => headers.map(header => k[header as keyof Kiosk]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `kiosks-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    toast({ title: "Exportación iniciada", description: "La descarga del archivo CSV ha comenzado." });
  };

  const handleImportClick = () => {
    importFileRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "Archivo seleccionado",
        description: `Se ha seleccionado el archivo: ${file.name}. La lógica de importación se puede implementar aquí.`,
      });
      // Reset file input
      if(importFileRef.current) importFileRef.current.value = "";
    }
  };

  const handleAddKiosk = (newKiosk: Kiosk) => {
    setKiosks(prevKiosks => [...prevKiosks, newKiosk]);
    toast({
        title: "Kiosco Añadido",
        description: `El kiosco "${newKiosk.name}" ha sido añadido a la lista.`,
    });
  };

  const handleTimeOffStatusChange = async (requestId: string, newStatus: 'Aprobado' | 'Rechazado') => {
    const result = await updateTimeOffStatus({ requestId, status: newStatus });
    if (result.success) {
      toast({ title: "Solicitud Actualizada", description: result.message });
      fetchAndSetTimeOffRequests();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };

  const handleOpenCommentsModal = (request: TimeOffRequest) => {
    setSelectedRequest(request);
    setIsCommentsModalOpen(true);
  };

  const handleSaveComment = async (requestId: string, comments: string) => {
    const result = await updateTimeOffComments({ requestId, comments });
    if (result.success) {
      toast({ title: "Comentarios Guardados", description: "Los comentarios para la solicitud han sido actualizados." });
      fetchAndSetTimeOffRequests();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  };
  
    const handleDeleteRole = (roleNameToDelete: string) => {
        setRoles(currentRoles => currentRoles.filter(role => role.name !== roleNameToDelete));
        toast({
            title: "Rol Eliminado",
            description: `El rol "${roleNameToDelete}" ha sido eliminado.`,
        });
        setDeletingRole(null);
    };
    
    const handleOpenEditRoleModal = (role: Role) => {
        setSelectedRole({
            ...role,
            permissions: role.permissions.map(p => p.name)
        });
        setIsEditRoleModalOpen(true);
    };

    const handleSaveRole = (roleToSave: Role) => {
        setRoles(currentRoles => {
            const isExisting = currentRoles.some(r => r.name === roleToSave.name && selectedRole && r.name !== selectedRole.name);
            if (isExisting && selectedRole?.name !== roleToSave.name) {
                toast({ variant: 'destructive', title: "Error", description: `El rol "${roleToSave.name}" ya existe.` });
                return currentRoles;
            }

            const isNew = selectedRole && !initialRoles.some(r => r.name === selectedRole.name);
            if (isNew) {
                toast({ title: "Rol Añadido", description: `El rol "${roleToSave.name}" ha sido añadido.` });
                return [...currentRoles, roleToSave];
            } else {
                 toast({ title: "Rol Actualizado", description: `El rol "${roleToSave.name}" ha sido guardado.` });
                return currentRoles.map(role => (role.name === selectedRole?.name ? roleToSave : role));
            }
        });
    };

    const handleOpenAddRoleModal = () => {
        setSelectedRole({ name: '', description: '', permissions: [] });
        setIsEditRoleModalOpen(true);
    };
  
    const handleOpenEditUserModal = (user: User) => {
        setSelectedUser(user);
        setIsEditUserModalOpen(true);
    };

    const handleSaveUser = (userId: string, newDetails: Partial<User>) => {
        setUsers(currentUsers => currentUsers.map(user => {
            if (user.id === userId) {
                return { ...user, ...newDetails };
            }
            return user;
        }));
        toast({
            title: "Usuario Actualizado",
            description: "Los detalles del usuario han sido guardados.",
        });
    };

  const handleGeoSort = (key: GeoSortKey) => {
    if (geoSortKey === key) {
        setGeoSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
        setGeoSortKey(key);
        setGeoSortDir('desc');
    }
  };

    const handleAddHoliday = (holiday: Omit<Holiday, 'id'>) => {
        setHolidays(prev => [...prev, { ...holiday, id: `H${Date.now()}` }].sort((a, b) => a.date.getTime() - b.date.getTime()));
        toast({ title: 'Feriado Añadido', description: `Se ha añadido "${holiday.name}" al calendario.` });
    };

    const handleDeleteHoliday = (holidayId: string) => {
        setHolidays(prev => prev.filter(h => h.id !== holidayId));
        toast({ title: 'Feriado Eliminado', description: 'El día feriado ha sido eliminado de la lista.' });
    };

    const handleSaveScheduledReport = (report: ScheduledReport) => {
        setScheduledReports(prev => {
            const existing = prev.find(r => r.id === report.id);
            if (existing) {
                return prev.map(r => r.id === report.id ? report : r);
            }
            return [...prev, report];
        });
        toast({ title: 'Reporte Guardado', description: `El reporte "${report.name}" ha sido guardado.` });
    };

    const handleToggleScheduledReport = (reportId: string, active: boolean) => {
        setScheduledReports(prev => prev.map(r => r.id === reportId ? { ...r, active } : r));
    };
    
    const handleAddScheduledReport = () => {
        setEditingReport({
            id: '',
            name: 'Nuevo Reporte Programado',
            frequency: 'Diario',
            time: '09:00',
            recipients: '',
            filters: {
                kioskType: 'all',
                checkinType: 'all',
                user: 'all',
            },
            active: true,
        });
    };
    
    const handleIntegrationTokenChange = (id: string, value: string) => {
        setIntegrationTokens(prev => ({ ...prev, [id]: value }));
    };

    const handleToggleIntegration = (id: string) => {
        setIntegrations(prev => prev.map(integ => {
            if (integ.id === id) {
                if (integ.status === 'conectado') {
                    // Disconnect
                    toast({title: `Desconectado de ${integ.name}`});
                    return {...integ, status: 'desconectado', token: null};
                } else {
                    // Connect
                    const token = integrationTokens[id] || integ.token;
                    if (token) {
                        toast({title: `Conectado a ${integ.name}`});
                        return {...integ, status: 'conectado', token: token};
                    } else {
                         toast({variant: 'destructive', title: `Error en ${integ.name}`, description: 'La credencial no puede estar vacía.'});
                         return integ;
                    }
                }
            }
            return integ;
        }));
    };

    const handleAddIntegration = (newIntegration: Omit<Integration, 'id' | 'status' | 'logoUrl' | 'description'>) => {
        const newId = newIntegration.name.toLowerCase().replace(/\s/g, '');
        setIntegrations(prev => [
            ...prev,
            {
                id: newId,
                name: newIntegration.name,
                description: `Integración personalizada para ${newIntegration.name}.`,
                logoUrl: 'https://placehold.co/24x24.png',
                type: newIntegration.type,
                status: 'conectado',
                token: newIntegration.token,
            },
        ]);
        setIntegrationTokens((prev) => ({...prev, [newId]: newIntegration.token || ''}));
        toast({title: 'Integración Añadida', description: `Se ha conectado a ${newIntegration.name}.`})
    };

    const handleSaveTeam = (newTeamData: Omit<Team, 'id' | 'memberCount'>) => {
        const newTeam: Team = {
            id: `team${Date.now()}`,
            name: newTeamData.name,
            members: newTeamData.members,
            memberCount: newTeamData.members.length,
        };
        setTeams(prev => [...prev, newTeam]);
        toast({ title: 'Equipo Añadido', description: `El equipo "${newTeam.name}" ha sido creado.` });
    };

    const handleSendTestSlack = async (slackUserId: string) => {
        const slackIntegration = integrations.find(i => i.id === 'slack');
        const botToken = integrationTokens['slack'] || slackIntegration?.token;

        if (!botToken) {
            toast({ variant: 'destructive', title: 'Error', description: 'No se ha configurado el Bot Token de Slack.' });
            return;
        }

        const result = await sendTestSlackMessage({ botToken, userId: slackUserId });

        if (result.success) {
            toast({ title: 'Mensaje Enviado', description: result.message });
            setIsSlackTestOpen(false);
        } else {
            toast({ variant: 'destructive', title: 'Error al Enviar', description: result.message });
        }
    };

    const handleExportLogs = () => {
        const logEntries = [
            `[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] INFO: Log export requested by user ${user?.email}. Log level: ${logLevel.toUpperCase()}.`,
            ...mockCheckins.slice(0, 5).map(c => `[${format(parseISO(c.date.replace(' ', 'T')), 'yyyy-MM-dd HH:mm:ss')}] INFO: Check-in record ${c.id} created for user '${c.user.name}'.`),
            ...timeOffRequests.slice(0,2).map(r => `[${format(parseISO(r.startDate), 'yyyy-MM-dd HH:mm:ss')}] WARN: Time-off request ${r.id} for '${r.user.name}' is still in status '${r.status}'.`),
            `[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] DEBUG: UI component 'AdminDashboard' rendered.`,
        ];

        const logContent = logEntries.join('\n');
        const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'audit-log.log';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast({ title: "Logs Exportados", description: "La descarga del archivo de auditoría ha comenzado." });
    };

  const displayedFilters = React.useMemo(() => {
    const filters = [];
    if (activeFilters.type) filters.push({key: 'type', value: activeFilters.type});
    if (activeFilters.status) filters.push({key: 'status', value: activeFilters.status});
    return filters;
  }, [activeFilters]);

  const checkinsWithKioskInfo = React.useMemo(() => mockCheckins.map(checkin => {
    const checkinDate = new Date(checkin.date.replace(' ', 'T'));
    return {
      ...checkin,
      date: format(checkinDate, "yyyy-MM-dd'T'HH:mm:ss"), // Ensure ISO format for parsing
      kiosk: getKioskById(checkin.kioskId, kiosks),
    }
  }), [kiosks]);
  
  const filteredCheckinsForTable = React.useMemo(() => {
    return checkinsWithKioskInfo.filter(c => {
        const typeMatch = checkinSelectedType === 'all' || c.type === checkinSelectedType;
        const searchTermMatch = checkinSearchTerm === '' || c.user.name.toLowerCase().includes(checkinSearchTerm.toLowerCase()) || c.kiosk?.name.toLowerCase().includes(checkinSearchTerm.toLowerCase());
        return typeMatch && searchTermMatch;
    });
  }, [checkinsWithKioskInfo, checkinSelectedType, checkinSearchTerm]);

  const filteredCheckinsForStats = React.useMemo(() => {
    return checkinsWithKioskInfo.filter(c => {
      if (!c.kiosk) return false;
      const checkinDate = parseISO(c.date);

      let dateMatch = true;
      if (statsDateRange?.from) {
        dateMatch = checkinDate >= statsDateRange.from;
      }
      if (statsDateRange?.to) {
        dateMatch = dateMatch && checkinDate <= statsDateRange.to;
      }

      const nameMatch = statsName === '' || c.user.name.toLowerCase().includes(statsName.toLowerCase());
      const stateMatch = statsState === 'all' || c.kiosk.state === statsState;
      const cityMatch = statsCity === 'all' || c.kiosk.city === statsCity;
      const kioskTypeMatch = statsKioskType === 'all' || c.kiosk.type === statsKioskType;
      const checkinTypeMatch = statsCheckinType === 'all' || c.type === statsCheckinType;
      
      return dateMatch && nameMatch && stateMatch && cityMatch && kioskTypeMatch && checkinTypeMatch;
    });
  }, [checkinsWithKioskInfo, statsDateRange, statsName, statsState, statsCity, statsKioskType, statsCheckinType]);
  
  const summaryData = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return {
      total: filteredCheckinsForStats.length,
      today: filteredCheckinsForStats.filter(c => c.date.startsWith(todayStr)).length,
      onTime: filteredCheckinsForStats.filter(c => c.punctuality === 'A tiempo' || c.punctuality === 'Anticipado').length,
      late: filteredCheckinsForStats.filter(c => c.punctuality === 'Retrasado').length,
      validLocation: filteredCheckinsForStats.filter(c => c.location === 'Válida').length,
      invalidLocation: filteredCheckinsForStats.filter(c => c.location === 'Inválida').length,
      entradas: filteredCheckinsForStats.filter(c => c.type === 'Entrada').length,
      comidas: filteredCheckinsForStats.filter(c => c.type === 'Comida').length,
      salidas: filteredCheckinsForStats.filter(c => c.type === 'Salida').length,
    }
  }, [filteredCheckinsForStats]);

  const stateData: ChartData[] = React.useMemo(() => {
    const counts = filteredCheckinsForStats.reduce((acc, checkin) => {
      const state = checkin.kiosk?.state;
      if (state) {
        acc[state] = (acc[state] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredCheckinsForStats]);

  const cityData: ChartData[] = React.useMemo(() => {
    const counts = filteredCheckinsForStats
      .filter(c => statsState === 'all' || c.kiosk?.state === statsState)
      .reduce((acc, checkin) => {
        const city = checkin.kiosk?.city;
        if (city) {
          acc[city] = (acc[city] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredCheckinsForStats, statsState]);

  const geographicAnalysisData: GeographicStat[] = React.useMemo(() => {
    const statsByState = filteredCheckinsForStats.reduce((acc, checkin) => {
      const state = checkin.kiosk?.state;
      if (!state) return acc;
  
      if (!acc[state]) {
        acc[state] = { state, total: 0, onTime: 0, late: 0, validLocation: 0, invalidLocation: 0, punctualityPercentage: 0, validLocationPercentage: 0, weeklyTrend: 'same' };
      }
  
      acc[state].total++;
      if (checkin.punctuality === 'A tiempo' || checkin.punctuality === 'Anticipado') {
        acc[state].onTime++;
      } else if (checkin.punctuality === 'Retrasado') {
        acc[state].late++;
      }
  
      if (checkin.location === 'Válida') {
        acc[state].validLocation++;
      } else {
        acc[state].invalidLocation++;
      }
  
      return acc;
    }, {} as Record<string, GeographicStat>);
    
    // Calculate percentages and add mock trend data
    Object.values(statsByState).forEach(stat => {
        stat.punctualityPercentage = formatPercentage(stat.onTime, stat.total);
        stat.validLocationPercentage = formatPercentage(stat.validLocation, stat.total);
        const rand = Math.random();
        stat.weeklyTrend = rand > 0.66 ? 'up' : rand > 0.33 ? 'down' : 'same';
    });
  
    // Sorting logic
    return Object.values(statsByState).sort((a, b) => {
      const valA = a[geoSortKey];
      const valB = b[geoSortKey];

      if (typeof valA === 'string' && typeof valB === 'string') {
        return geoSortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        return geoSortDir === 'asc' ? valA - valB : valB - valA;
      }
      return 0;
    });
  }, [filteredCheckinsForStats, geoSortKey, geoSortDir]);

  const { userPerformance, kioskPerformance } = React.useMemo(() => {
      const userStats: { [key: string]: { total: number; onTime: number; incidents: number; entries: Date[]; exits: Date[] } } = {};
      const kioskStats: { [key: string]: { total: number; onTime: number; incidents: number } } = {};

      filteredCheckinsForStats.forEach(checkin => {
          const userName = checkin.user.name;
          const kioskId = checkin.kioskId;

          // User Stats
          if (!userStats[userName]) {
              userStats[userName] = { total: 0, onTime: 0, incidents: 0, entries: [], exits: [] };
          }
          userStats[userName].total++;
          if (checkin.punctuality !== 'Retrasado') userStats[userName].onTime++;
          if (checkin.location === 'Inválida' || checkin.punctuality === 'Retrasado') userStats[userName].incidents++;
          if (checkin.type === 'Entrada') userStats[userName].entries.push(parseISO(checkin.date));
          if (checkin.type === 'Salida') userStats[userName].exits.push(parseISO(checkin.date));

          // Kiosk Stats
          const kiosk = getKioskById(kioskId, kiosks);
          if (kiosk) {
              if (!kioskStats[kioskId]) {
                  kioskStats[kioskId] = { total: 0, onTime: 0, incidents: 0 };
              }
              kioskStats[kioskId].total++;
              if (checkin.punctuality !== 'Retrasado') kioskStats[kioskId].onTime++;
              if (checkin.location === 'Inválida' || checkin.punctuality === 'Retrasado') kioskStats[kioskId].incidents++;
          }
      });
      
      const userPerformance: UserPerformance[] = Object.entries(userStats).map(([name, stats]) => {
          const userObject = users.find(u => u.name === name);
          const userAvatar = userObject ? userObject.avatar : 'https://placehold.co/32x32.png';
          let hoursWorked = 0;
          if (stats.entries.length > 0 && stats.exits.length > 0) {
            const entry = stats.entries.sort((a,b) => a.getTime() - b.getTime())[0];
            const exit = stats.exits.sort((a,b) => b.getTime() - a.getTime())[0];
            if(entry && exit) hoursWorked = differenceInHours(exit, entry);
          }
          return {
              user: { name, avatar: userAvatar },
              totalCheckins: stats.total,
              punctuality: stats.total > 0 ? (stats.onTime / stats.total) * 100 : 0,
              incidents: stats.incidents,
              hoursWorked: hoursWorked > 0 ? hoursWorked : 0
          };
      });

      const kioskPerformance: KioskPerformance[] = Object.entries(kioskStats).map(([kioskId, stats]) => ({
          kiosk: getKioskById(kioskId, kiosks)!,
          totalCheckins: stats.total,
          punctuality: stats.total > 0 ? (stats.onTime / stats.total) * 100 : 0,
          incidents: stats.incidents
      }));
      
      return { userPerformance, kioskPerformance };
  }, [filteredCheckinsForStats, kiosks, users]);


  const allStates = [...new Set(kiosks.map(k => k.state))];
  const allCities = statsState === 'all'
    ? [...new Set(kiosks.map(k => k.city))]
    : [...new Set(kiosks.filter(k => k.state === statsState).map(k => k.city))];
  const kioskTypes = [...new Set(kiosks.map(k => k.type))];
  const usersWithSlack = users.filter(u => u.slackId);

  return (
    <>
      <Tabs defaultValue="check-ins">
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="check-ins">Check-ins</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
            {interfaceSettings.showTimeOffTab && <TabsTrigger value="time-off">Días Libres</TabsTrigger>}
            <TabsTrigger value="locations">Ubicaciones</TabsTrigger>
            <TabsTrigger value="stats">Estadísticas</TabsTrigger>
            {isSuperAdmin && <TabsTrigger value="users">Usuarios</TabsTrigger>}
            {isSuperAdmin && (
              <TabsTrigger value="config">
                Configuración
              </TabsTrigger>
            )}
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" variant="outline" className="h-7 gap-1">
              <Download className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Exportar
              </span>
            </Button>
          </div>
        </div>
        <TabsContent value="check-ins">
          <Card>
            <CardHeader>
              <CardTitle>Check-ins</CardTitle>
              <CardDescription>
                Administra y revisa los registros de asistencia del personal de
                campo.
              </CardDescription>
              <div className="flex items-center gap-4 pt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    type="search"
                    placeholder="Buscar por nombre, kiosco..."
                    className="pl-8"
                    value={checkinSearchTerm}
                    onChange={(e) => setCheckinSearchTerm(e.target.value)}
                  />
                </div>
                <Select
                  value={checkinSelectedType}
                  onValueChange={(value) => {
                    setCheckinSelectedType(value);
                    handleFilterChange('type', value === 'all' ? '' : value);
                  }}
                >
                  <SelectTrigger id="select-type" className="w-[180px]">
                    <SelectValue placeholder="Tipo de Check-in" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los Tipos</SelectItem>
                    <SelectItem value="Entrada">Entrada</SelectItem>
                    <SelectItem value="Comida">Comida</SelectItem>
                    <SelectItem value="Salida">Salida</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger id="select-status" className="w-[180px]">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="punctual">A tiempo</SelectItem>
                    <SelectItem value="late">Retrasado</SelectItem>
                    <SelectItem value="early">Anticipado</SelectItem>
                    <SelectItem value="invalid_location">Ubicación Inválida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {displayedFilters.length > 0 && (
                <div className="flex items-center gap-2 pt-4">
                  <span className="text-sm text-muted-foreground">Activos:</span>
                  {displayedFilters.map(({ key, value }) => (
                    <Badge key={key} variant="secondary" className="gap-1 pl-2 capitalize">
                      {value}
                      <button onClick={() => removeFilter(key)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[64px] sm:table-cell">
                      Evidencia
                    </TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Kiosco</TableHead>
                    <TableHead className="hidden md:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCheckinsForTable.map((checkin) => (
                    <TableRow key={checkin.id}>
                      <TableCell className="hidden sm:table-cell">
                        {checkin.photo ? (
                          <Image
                            alt="Evidencia de check-in"
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={checkin.photo}
                            width="64"
                            data-ai-hint="evidence photo"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-muted-foreground">
                              <Camera className="h-6 w-6" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                          <div className="font-medium">{checkin.user.name}</div>
                      </TableCell>
                      <TableCell>{getKioskById(checkin.kioskId, kiosks)?.name || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {checkin.type}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(parseISO(checkin.date), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              checkin.punctuality === 'A tiempo' || checkin.punctuality === 'Anticipado'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {checkin.punctuality}
                          </Badge>
                          <Badge
                            variant={
                              checkin.location === 'Válida'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {checkin.location}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                            <DropdownMenuItem>Ver Foto</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Invalidar Registro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>1-{filteredCheckinsForTable.length}</strong> de <strong>{filteredCheckinsForTable.length}</strong> registros
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Generación de Reportes</CardTitle>
              <CardDescription>Genera y previsualiza reportes personalizados con base en los filtros seleccionados.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded-lg">
                <div className="space-y-2 lg:col-span-3">
                    <Label>Rango de Fechas</Label>
                    <Popover>
                          <PopoverTrigger asChild>
                          <Button
                              id="report-date"
                              variant={"outline"}
                              className={cn(
                              "w-full justify-start text-left font-normal",
                              !reportDateRange && "text-muted-foreground"
                              )}
                          >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {reportDateRange?.from ? (
                                reportDateRange.to ? (
                                  <>
                                    {format(reportDateRange.from, "dd/MM/yy", { locale: es })} -{" "}
                                    {format(reportDateRange.to, "dd/MM/yy", { locale: es })}
                                  </>
                                ) : (
                                  format(reportDateRange.from, "dd/MM/yy", { locale: es })
                                )
                              ) : (
                                <span>Elige un rango</span>
                              )}
                          </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={reportDateRange?.from}
                              selected={reportDateRange}
                              onSelect={setReportDateRange}
                              numberOfMonths={2}
                              locale={es}
                          />
                          </PopoverContent>
                      </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Kiosco</Label>
                  <Select value={reportKioskType} onValueChange={setReportKioskType}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Tipos</SelectItem>
                      <SelectItem value="Bodega Aurrera">Bodega Aurrera</SelectItem>
                      <SelectItem value="Kiosco Aviva Tu Compra">Kiosco Aviva Tu Compra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Registro</Label>
                  <Select value={reportCheckinType} onValueChange={setReportCheckinType}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Tipos</SelectItem>
                      <SelectItem value="Entrada">Entrada</SelectItem>
                      <SelectItem value="Comida">Comida</SelectItem>
                      <SelectItem value="Salida">Salida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Usuario</Label>
                  <Select value={reportUserId} onValueChange={setReportUserId}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los Usuarios</SelectItem>
                      {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleGenerateReport} disabled={isGeneratingReport}>
                {isGeneratingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGeneratingReport ? 'Generando...' : 'Generar Reporte'}
              </Button>

              {reportResult && (
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle>Vista Previa del Correo</CardTitle>
                    <CardDescription>
                        Reporte generado con los filtros: {reportResult.summary.filterSummary}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <Label htmlFor="email-subject-manual">Asunto</Label>
                        <Input 
                          id="email-subject-manual"
                          value={editableEmail.subject}
                          onChange={(e) => setEditableEmail(prev => ({ ...prev, subject: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="email-body-manual">Cuerpo del Correo</Label>
                        <Textarea 
                          id="email-body-manual"
                          value={editableEmail.body}
                          onChange={(e) => setEditableEmail(prev => ({ ...prev, body: e.target.value }))}
                          rows={8}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Datos Adjuntos (CSV)</Label>
                        <Textarea readOnly className="text-xs font-mono h-48" value={reportResult.attachmentData} />
                      </div>
                  </CardContent>
                  <CardFooter>
                      <Button onClick={() => toast({ title: "Correo Enviado (Simulado)", description: "La funcionalidad de envío real no está implementada." })}>
                          <Send className="mr-2 h-4 w-4"/> Enviar Correo
                      </Button>
                  </CardFooter>
                </Card>
              )}
          </CardContent>
          </Card>
        </TabsContent>
        {interfaceSettings.showTimeOffTab && (<TabsContent value="time-off">
          <Card>
            <CardHeader>
              <CardTitle>Días Libres</CardTitle>
              <CardDescription>Administra las solicitudes de días libres e incapacidades del personal.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Personal</TableHead>
                    <TableHead>Motivo</TableHead>
                    <TableHead className="hidden md:table-cell">Periodo Solicitado</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>
                      <span className="sr-only">Acciones</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTimeOffLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      </TableCell>
                    </TableRow>
                  ) : timeOffRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        No hay solicitudes de días libres.
                      </TableCell>
                    </TableRow>
                  ) : (
                    timeOffRequests.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={request.user.avatar} alt="Avatar" data-ai-hint="user avatar" />
                                <AvatarFallback>{request.user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="font-medium">{request.user.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{request.type}</div>
                            <div className="text-sm text-muted-foreground">{request.reason}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(parseISO(request.startDate), "dd LLL, y", { locale: es })} - {format(parseISO(request.endDate), "dd LLL, y", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <TimeOffStatusBadge status={request.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleTimeOffStatusChange(request.id, 'Aprobado')}>
                                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                  Aprobar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleTimeOffStatusChange(request.id, 'Rechazado')}>
                                  <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                  Rechazar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleOpenCommentsModal(request)}>
                                  <MessageSquare className="mr-2 h-4 w-4" />
                                  Ver/Añadir Comentarios
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {request.comments && (
                          <TableRow className="bg-muted/50 hover:bg-muted/50">
                              <TableCell colSpan={5} className="py-2 px-5">
                                  <div className="flex items-start gap-3">
                                    <MessageSquare className="h-4 w-4 mt-1 text-muted-foreground flex-shrink-0" />
                                    <div className='flex-grow'>
                                        <p className="text-sm text-foreground">{request.comments}</p>
                                        <p className="text-xs text-muted-foreground">Comentario del administrador</p>
                                    </div>
                                  </div>
                              </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Mostrando <strong>{timeOffRequests.length}</strong> de <strong>{timeOffRequests.length}</strong> solicitudes.
              </div>
            </CardFooter>
          </Card>
        </TabsContent>)}
        <TabsContent value="locations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Ubicaciones y Geocercas</CardTitle>
                <CardDescription>
                  Administra la lista maestra de kioscos y sus parámetros.
                </CardDescription>
              </div>
              <div className='flex gap-2'>
                  <Button variant="outline" size="sm" onClick={handleExportCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      Exportar CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleImportClick}>
                      <Upload className="mr-2 h-4 w-4" />
                      Importar CSV
                  </Button>
                  <input
                      type="file"
                      ref={importFileRef}
                      className="hidden"
                      accept=".csv"
                      onChange={handleFileImport}
                  />
                  <NewKioskDialog onAddKiosk={handleAddKiosk} />
              </div>
            </CardHeader>
            <CardContent className='space-y-6'>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>¿Cómo importar ubicaciones?</AlertTitle>
                <AlertDescription>
                  Para añadir o actualizar kioscos masivamente, sube un archivo CSV con las siguientes columnas. El orden y el nombre de las columnas debe ser exacto.
                  <code className="block w-full text-left my-2 relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                    id,name,latitude,longitude,city,state,type,active,radiusOverride
                  </code>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                      <li><strong>id:</strong> Identificador único para el kiosco. Es obligatorio tanto para kioscos nuevos como para actualizaciones.</li>
                      <li><strong>type:</strong> Debe ser "Bodega Aurrera" o "Kiosco Aviva Tu Compra".</li>
                      <li><strong>active:</strong> "true" o "false".</li>
                      <li><strong>radiusOverride:</strong> Un número (ej. 200) o dejar en blanco para usar el radio por defecto.</li>
                  </ul>
                </AlertDescription>
              </Alert>
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del Kiosco</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Coordenadas (Lat, Lng)</TableHead>
                      <TableHead className='text-center'>Radio (m)</TableHead>
                      <TableHead className='text-center'>Estado</TableHead>
                      <TableHead>
                        <span className="sr-only">Acciones</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kiosks.map((kiosk) => (
                      <TableRow key={kiosk.id}>
                        <TableCell className="font-medium">{kiosk.name}</TableCell>
                        <TableCell>
                          <div className="font-medium">{kiosk.city}</div>
                          <div className="text-sm text-muted-foreground">{kiosk.state}</div>
                        </TableCell>
                        <TableCell>{kiosk.type}</TableCell>
                        <TableCell className='font-mono text-xs'>
                          {kiosk.latitude.toFixed(4)}, {kiosk.longitude.toFixed(4)}
                        </TableCell>
                        <TableCell className='text-center'>
                          {kiosk.radiusOverride ?? 'Default'}
                        </TableCell>
                        <TableCell className='text-center'>
                          <Badge variant={kiosk.active ? 'secondary' : 'outline'} className={cn(kiosk.active ? 'text-green-700 bg-green-50' : 'text-muted-foreground')}>
                              {kiosk.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-right'>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                  <DropdownMenuItem>Editar</DropdownMenuItem>
                                  <DropdownMenuItem>Ver en Mapa</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className='text-destructive'>Desactivar</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="space-y-6">
          <Card>
            <CardHeader>
                <CardTitle>Filtros de Estadísticas</CardTitle>
                <CardDescription>Usa estos filtros para analizar los datos de toda la pestaña.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2 lg:col-span-2">
                      <Label htmlFor="stats-date">Rango de Fechas</Label>
                      <Popover>
                          <PopoverTrigger asChild>
                          <Button
                              id="stats-date"
                              variant={"outline"}
                              className={cn(
                              "w-full justify-start text-left font-normal",
                              !statsDateRange && "text-muted-foreground"
                              )}
                          >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {statsDateRange?.from ? (
                                statsDateRange.to ? (
                                  <>
                                    {format(statsDateRange.from, "dd/MM/yy", { locale: es })} -{" "}
                                    {format(statsDateRange.to, "dd/MM/yy", { locale: es })}
                                  </>
                                ) : (
                                  format(statsDateRange.from, "dd/MM/yy", { locale: es })
                                )
                              ) : (
                                <span>Elige un rango</span>
                              )}
                          </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                              initialFocus
                              mode="range"
                              defaultMonth={statsDateRange?.from}
                              selected={statsDateRange}
                              onSelect={setStatsDateRange}
                              numberOfMonths={2}
                              locale={es}
                          />
                          </PopoverContent>
                      </Popover>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="stats-name">Nombre</Label>
                      <Input id="stats-name" placeholder="Buscar por nombre" value={statsName} onChange={e => setStatsName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stats-checkin-type">Tipo de Registro</Label>
                    <Select value={statsCheckinType} onValueChange={setStatsCheckinType}>
                        <SelectTrigger id="stats-checkin-type">
                            <SelectValue placeholder="Filtrar por Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los Tipos</SelectItem>
                            <SelectItem value="Entrada">Entrada</SelectItem>
                            <SelectItem value="Comida">Comida</SelectItem>
                            <SelectItem value="Salida">Salida</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="stats-state">Estado</Label>
                      <Select value={statsState} onValueChange={(value) => {setStatsState(value); setStatsCity('all');}}>
                          <SelectTrigger id="stats-state">
                              <SelectValue placeholder="Todos los estados" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">Todos los Estados</SelectItem>
                              {allStates.map(state => (
                                  <SelectItem key={state} value={state}>{state}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="stats-city">Ciudad</Label>
                      <Select value={statsCity} onValueChange={setStatsCity} disabled={statsState === 'all'}>
                          <SelectTrigger id="stats-city">
                              <SelectValue placeholder="Todas las ciudades" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">Todas las Ciudades</SelectItem>
                              {allCities.map(city => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="stats-kiosk-type">Tipo de Kiosco</Label>
                      <Select value={statsKioskType} onValueChange={(value) => setStatsKioskType(value as any)}>
                          <SelectTrigger id="stats-kiosk-type">
                              <SelectValue placeholder="Todos los tipos" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="all">Todos los Tipos</SelectItem>
                              {kioskTypes.map(type => (
                                  <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>
                
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
              {/* KPI Section */}
              <div>
                  <h2 className="text-xl font-semibold mb-4">Indicadores Operativos Clave (KPIs)</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <KpiCard
                          title="Cumplimiento de Jornada"
                          value={`${summaryData.onTime > 0 ? ((summaryData.onTime / summaryData.total) * 100).toFixed(1) : 0}%`}
                          description="Porcentaje de check-ins a tiempo o anticipados"
                          icon={CheckCircle2}
                          progress={summaryData.total > 0 ? (summaryData.onTime / summaryData.total) * 100 : 0}
                      />
                      <KpiCard
                          title="Precisión de Ubicación"
                          value={`${summaryData.total > 0 ? ((summaryData.validLocation / summaryData.total) * 100).toFixed(1) : 0}%`}
                          description="Porcentaje de registros con geolocalización válida"
                          icon={MapPin}
                          progress={summaryData.total > 0 ? (summaryData.validLocation / summaryData.total) * 100 : 0}
                      />
                      <KpiCard
                          title="Total de Incidencias"
                          value={`${summaryData.late + summaryData.invalidLocation}`}
                          description="Suma de retrasos y ubicaciones inválidas"
                          icon={AlertTriangle}
                      />
                      <KpiCard
                          title="Horas Trabajadas (Promedio)"
                          value="8.2h"
                          description="Promedio de horas por jornada laboral"
                          icon={Clock}
                      />
                  </div>
              </div>

              {/* Rankings Section */}
              <div>
                  <h2 className="text-xl font-semibold mb-4">Rankings de Desempeño</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2"><Trophy className="text-yellow-500" /> Desempeño de Usuarios</CardTitle>
                              <CardDescription>Clasificación de personal por puntualidad e incidencias.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <Tabs defaultValue="top">
                                  <TabsList className="grid w-full grid-cols-2">
                                      <TabsTrigger value="top"><TrendingUp className="mr-2 h-4 w-4"/>Top 5 Cumplidos</TabsTrigger>
                                      <TabsTrigger value="bottom"><TrendingDown className="mr-2 h-4 w-4"/>Top 5 con Incidencias</TabsTrigger>
                                  </TabsList>
                                  <TabsContent value="top" className="mt-4">
                                      <Table>
                                          <TableHeader>
                                              <TableRow>
                                                  <TableHead>Usuario</TableHead>
                                                  <TableHead className="text-right">Puntualidad</TableHead>
                                              </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                              {userPerformance.sort((a,b) => b.punctuality - a.punctuality).slice(0,5).map(u => (
                                              <TableRow key={u.user.name}>
                                                  <TableCell>{u.user.name}</TableCell>
                                                  <TableCell className="text-right text-green-600 font-medium">{u.punctuality.toFixed(1)}%</TableCell>
                                              </TableRow>
                                              ))}
                                          </TableBody>
                                      </Table>
                                  </TabsContent>
                                  <TabsContent value="bottom" className="mt-4">
                                      <Table>
                                          <TableHeader>
                                              <TableRow>
                                                  <TableHead>Usuario</TableHead>
                                                  <TableHead className="text-right">Incidencias</TableHead>
                                              </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                              {userPerformance.sort((a,b) => b.incidents - a.incidents).slice(0,5).map(u => (
                                              <TableRow key={u.user.name}>
                                                  <TableCell>{u.user.name}</TableCell>
                                                  <TableCell className="text-right text-red-600 font-medium">{u.incidents}</TableCell>
                                              </TableRow>
                                              ))}
                                          </TableBody>
                                      </Table>
                                  </TabsContent>
                              </Tabs>
                          </CardContent>
                      </Card>
                      <Card>
                          <CardHeader>
                              <CardTitle className="flex items-center gap-2"><Building2 /> Desempeño de Kioscos</CardTitle>
                              <CardDescription>Clasificación de kioscos por actividad e incidencias.</CardDescription>
                          </CardHeader>
                          <CardContent>
                              <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Kiosco</TableHead>
                                          <TableHead className="text-center">Registros</TableHead>
                                          <TableHead className="text-right">Puntualidad</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {kioskPerformance.sort((a,b) => b.punctuality - a.punctuality).slice(0,5).map(k => (
                                          <TableRow key={k.kiosk.id}>
                                              <TableCell>{k.kiosk.name}</TableCell>
                                              <TableCell className="text-center">{k.totalCheckins}</TableCell>
                                              <TableCell className={cn("text-right font-medium", k.punctuality >= 90 ? 'text-green-600' : 'text-amber-600')}>{k.punctuality.toFixed(1)}%</TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          </CardContent>
                      </Card>
                  </div>
              </div>

              {/* Incidents Table */}
              <div>
                  <h2 className="text-xl font-semibold mb-4">Alertas e Incidencias</h2>
                  <Card>
                      <CardHeader>
                          <CardTitle>Registros que Requieren Atención</CardTitle>
                          <CardDescription>Lista de los check-ins con retrasos significativos, ubicaciones inválidas o fuera de horario.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Usuario</TableHead>
                                      <TableHead>Kiosco</TableHead>
                                      <TableHead>Fecha</TableHead>
                                      <TableHead>Incidencia</TableHead>
                                      <TableHead className="text-right">Acciones</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {filteredCheckinsForStats.filter(c => c.punctuality === 'Retrasado' || c.location === 'Inválida').slice(0, 5).map(c => (
                                      <TableRow key={c.id} className="bg-red-50/50 hover:bg-red-100/60 dark:bg-red-900/10">
                                          <TableCell>{c.user.name}</TableCell>
                                          <TableCell>{c.kiosk?.name}</TableCell>
                                          <TableCell>{format(parseISO(c.date), "dd/MM/yy HH:mm")}</TableCell>
                                          <TableCell>
                                              <Badge variant="destructive">{c.punctuality === 'Retrasado' ? `Retraso` : `Ubic. Inválida`}</Badge>
                                          </TableCell>
                                          <TableCell className="text-right">
                                              <Button variant="ghost" size="sm">Ver Detalle</Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                                  {filteredCheckinsForStats.filter(c => c.punctuality === 'Retrasado' || c.location === 'Inválida').length === 0 && (
                                      <TableRow>
                                          <TableCell colSpan={5} className="text-center text-muted-foreground">No hay incidencias en el periodo seleccionado.</TableCell>
                                      </TableRow>
                                  )}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              </div>

              {/* Geographic & Distribution Charts */}
              <div>
                  <h2 className="text-xl font-semibold mb-4">Análisis de Distribución Geográfica</h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                      <Card className="col-span-full lg:col-span-4">
                          <CardHeader>
                              <CardTitle>Check-ins por Estado</CardTitle>
                          </CardHeader>
                          <CardContent className="pl-2">
                              <CheckinsByStateChart data={stateData} />
                          </CardContent>
                      </Card>
                      <Card className="col-span-full lg:col-span-3">
                          <CardHeader>
                              <CardTitle>Check-ins por Ciudad</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <CheckinsByCityChart data={cityData} />
                          </CardContent>
                      </Card>
                  </div>
                  <Card className="mt-6">
                      <CardHeader>
                          <CardTitle>Ranking de Rendimiento por Estado</CardTitle>
                          <CardDescription>
                              Compara el rendimiento operativo entre diferentes regiones. Haz clic en las cabeceras para ordenar.
                          </CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>
                                        <Button variant="ghost" onClick={() => handleGeoSort('state')}>
                                          Estado
                                          {geoSortKey === 'state' && (geoSortDir === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                        </Button>
                                      </TableHead>
                                      <TableHead className="text-center">
                                        <Button variant="ghost" onClick={() => handleGeoSort('total')}>
                                          Total Registros
                                          {geoSortKey === 'total' && (geoSortDir === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                        </Button>
                                      </TableHead>
                                      <TableHead>
                                        <Button variant="ghost" onClick={() => handleGeoSort('punctualityPercentage')}>
                                          % Puntualidad
                                          {geoSortKey === 'punctualityPercentage' && (geoSortDir === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                        </Button>
                                      </TableHead>
                                      <TableHead>
                                        <Button variant="ghost" onClick={() => handleGeoSort('validLocationPercentage')}>
                                          % Ubic. Válida
                                          {geoSortKey === 'validLocationPercentage' && (geoSortDir === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />)}
                                        </Button>
                                      </TableHead>
                                      <TableHead className="text-center">Tendencia Semanal</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {geographicAnalysisData.map((stat) => (
                                      <TableRow key={stat.state}>
                                          <TableCell className="font-medium">{stat.state}</TableCell>
                                          <TableCell className="text-center font-semibold">{stat.total}</TableCell>
                                          <TableCell>
                                              <div className="flex items-center gap-2">
                                                  <span className="font-medium w-12 text-right">{stat.punctualityPercentage.toFixed(1)}%</span>
                                                  <Progress value={stat.punctualityPercentage} className="h-2 flex-1" indicatorClassName={getPerformanceColor(stat.punctualityPercentage)} />
                                              </div>
                                          </TableCell>
                                          <TableCell>
                                            <div className="flex items-center gap-2">
                                                  <span className="font-medium w-12 text-right">{stat.validLocationPercentage.toFixed(1)}%</span>
                                                  <Progress value={stat.validLocationPercentage} className="h-2 flex-1" indicatorClassName={getPerformanceColor(stat.validLocationPercentage)} />
                                              </div>
                                          </TableCell>
                                          <TableCell className="text-center">
                                              {stat.weeklyTrend === 'up' && <TrendingUp className="h-5 w-5 mx-auto text-green-500" />}
                                              {stat.weeklyTrend === 'down' && <TrendingDown className="h-5 w-5 mx-auto text-red-500" />}
                                          </TableCell>
                                      </TableRow>
                                  ))}
                                  {geographicAnalysisData.length === 0 && (
                                      <TableRow>
                                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                                              No hay datos para el análisis geográfico con los filtros actuales.
                                          </TableCell>
                                      </TableRow>
                                  )}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
              </div>
          </div>
        </TabsContent>
        {isSuperAdmin && (
          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                      <CardTitle>Gestión de Usuarios</CardTitle>
                      <CardDescription>
                          Administra los usuarios del sistema, asigna roles y equipos.
                      </CardDescription>
                  </div>
                  <Button size="sm">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invitar Usuario
                  </Button>
              </CardHeader>
              <CardContent>
                  <Table>
                      <TableHeader>
                          <TableRow>
                              <TableHead>Usuario</TableHead>
                              <TableHead>Rol</TableHead>
                              <TableHead>Equipo</TableHead>
                              <TableHead>Slack ID</TableHead>
                              <TableHead>Estado</TableHead>
                              <TableHead className="text-right">
                                  <span className="sr-only">Acciones</span>
                              </TableHead>
                          </TableRow>
                      </TableHeader>
                      <TableBody>
                          {users.map(user => (
                              <TableRow key={user.id}>
                                  <TableCell>
                                      <div className="flex items-center gap-3">
                                          <Avatar className="h-9 w-9">
                                              <AvatarImage src={user.avatar} alt="Avatar" data-ai-hint="user avatar" />
                                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                              <div className="font-medium">{user.name}</div>
                                              <div className="text-sm text-muted-foreground">{user.email}</div>
                                          </div>
                                      </div>
                                  </TableCell>
                                  <TableCell>{user.role}</TableCell>
                                  <TableCell>{user.team}</TableCell>
                                  <TableCell>
                                      {user.slackId ? (
                                          <Badge variant="outline">{user.slackId}</Badge>
                                      ) : (
                                          <span className="text-xs text-muted-foreground">No asignado</span>
                                      )}
                                  </TableCell>
                                  <TableCell>
                                      <Badge variant={user.status === 'Activo' ? 'secondary' : 'outline'} className={cn(user.status === 'Activo' ? 'text-green-700 bg-green-50' : 'text-muted-foreground')}>
                                          {user.status}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                      <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                          <Button size="icon" variant="ghost">
                                              <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                              <DropdownMenuItem onClick={() => handleOpenEditUserModal(user)}>Editar Usuario</DropdownMenuItem>
                                              <DropdownMenuItem>Reenviar Invitación</DropdownMenuItem>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem className="text-destructive">Desactivar Usuario</DropdownMenuItem>
                                          </DropdownMenuContent>
                                      </DropdownMenu>
                                  </TableCell>
                              </TableRow>
                          ))}
                      </TableBody>
                  </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {isSuperAdmin && (
          <TabsContent value="config">
            <Card>
              <CardHeader>
                  <div className="flex items-start justify-between">
                      <div>
                          <CardTitle>Configuración del Sistema</CardTitle>
                          <CardDescription>
                              Ajustes avanzados para la operación de Asistencia Aviva. Solo para Super Admins.
                          </CardDescription>
                      </div>
                      <Button onClick={() => toast({ title: "Cambios Publicados", description: "Las configuraciones del sistema han sido guardadas." })}>Publicar Cambios</Button>
                  </div>
              </CardHeader>
              <CardContent>
                <Accordion type="multiple" className="w-full" defaultValue={['Organización & Roles', 'Motor de Reglas de Operación', 'Integraciones & API Keys', 'Personalización de Interfaz']}>
                  <ConfigModule
                      icon={<Settings className="h-6 w-6 text-primary"/>}
                      title="General del Sistema"
                      description="Parámetros globales para puntualidad y geocercas."
                  >
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                              <div className="space-y-2">
                                  <Label htmlFor="tolerance-margin">Margen de Tolerancia (minutos)</Label>
                                  <Input 
                                    id="tolerance-margin" 
                                    type="number" 
                                    value={operationalSettings.toleranceMinutes}
                                    onChange={(e) => setOperationalSettings(prev => ({...prev, toleranceMinutes: Number(e.target.value)}))}
                                  />
                                  <p className="text-xs text-muted-foreground">Minutos después de la hora de entrada que se considera "A Tiempo".</p>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="late-threshold">Umbral de Retraso Grave (minutos)</Label>
                                  <Input 
                                    id="late-threshold" 
                                    type="number" 
                                    value={operationalSettings.lateThresholdMinutes} 
                                    onChange={(e) => setOperationalSettings(prev => ({...prev, lateThresholdMinutes: Number(e.target.value)}))}
                                  />
                                  <p className="text-xs text-muted-foreground">A partir de cuántos minutos un retraso se marca como "Grave".</p>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="geofence-radius">Radio de Geocerca por Defecto (metros)</Label>
                                  <Input 
                                    id="geofence-radius" 
                                    type="number" 
                                    value={operationalSettings.defaultGeofenceRadius} 
                                    onChange={(e) => setOperationalSettings(prev => ({...prev, defaultGeofenceRadius: Number(e.target.value)}))}
                                  />
                                  <p className="text-xs text-muted-foreground">Radio para kioscos sin un valor específico.</p>
                              </div>
                          </div>
                          <Separator />
                          <div className="space-y-4">
                              <div className="flex items-center space-x-2">
                                  <Switch 
                                    id="maintenance-mode" 
                                    checked={operationalSettings.maintenanceMode}
                                    onCheckedChange={(checked) => setOperationalSettings(prev => ({...prev, maintenanceMode: checked}))}
                                  />
                                  <Label htmlFor="maintenance-mode">Activar Modo Mantenimiento</Label>
                              </div>
                              <div className="space-y-2">
                                  <Label htmlFor="maintenance-message">Mensaje de Mantenimiento</Label>
                                  <Textarea 
                                    id="maintenance-message" 
                                    value={operationalSettings.maintenanceMessage}
                                    onChange={(e) => setOperationalSettings(prev => ({...prev, maintenanceMessage: e.target.value}))} 
                                  />
                              </div>
                          </div>
                      </div>
                  </ConfigModule>
                  <ConfigModule
                      icon={<Building2 className="h-6 w-6 text-primary"/>}
                      title="Organización & Roles"
                      description="Gestiona roles, permisos y la estructura de equipos."
                  >
                      <div className="space-y-8">
                          <div>
                              <div className="flex justify-between items-center mb-4">
                                  <div>
                                      <h5 className="font-semibold">Roles y Permisos</h5>
                                      <p className="text-sm text-muted-foreground">Define qué puede hacer cada tipo de usuario en el sistema.</p>
                                  </div>
                                  <Button variant="outline" onClick={handleOpenAddRoleModal}><PlusCircle className="mr-2 h-4 w-4" />Añadir Rol</Button>
                              </div>
                              <Card>
                                  <Table>
                                      <TableHeader>
                                          <TableRow>
                                              <TableHead>Rol</TableHead>
                                              <TableHead>Permisos</TableHead>
                                              <TableHead className="text-right">Acciones</TableHead>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          {roles.map(role => (
                                              <TableRow key={role.name}>
                                                  <TableCell>
                                                      <div className="font-medium">{role.name}</div>
                                                      <div className="text-xs text-muted-foreground">{role.description}</div>
                                                  </TableCell>
                                                  <TableCell>
                                                      <div className="flex flex-wrap gap-2 max-w-md">
                                                          <TooltipProvider>
                                                              {role.permissions.map(perm => (
                                                                  <Tooltip key={perm.name}>
                                                                      <TooltipTrigger asChild>
                                                                          <Badge variant="secondary" className="gap-1.5 cursor-default">
                                                                              <perm.icon className="h-3 w-3" />
                                                                          </Badge>
                                                                      </TooltipTrigger>
                                                                      <TooltipContent>
                                                                          <p>{perm.description}</p>
                                                                      </TooltipContent>
                                                                  </Tooltip>
                                                              ))}
                                                          </TooltipProvider>
                                                      </div>
                                                  </TableCell>
                                                  <TableCell className="text-right">
                                                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={role.name === 'Super Admin'} onClick={() => handleOpenEditRoleModal(role)}>
                                                          <Edit className="h-4 w-4" />
                                                      </Button>
                                                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={role.name === 'Super Admin'} onClick={() => setDeletingRole(role)}>
                                                          <Trash2 className="h-4 w-4" />
                                                      </Button>
                                                  </TableCell>
                                              </TableRow>
                                          ))}
                                      </TableBody>
                                  </Table>
                              </Card>
                          </div>

                          <div>
                              <div className="flex justify-between items-center mb-4">
                                  <div>
                                      <h5 className="font-semibold">Equipos</h5>
                                      <p className="text-sm text-muted-foreground">Agrupa usuarios en equipos para supervisión y reportes.</p>
                                  </div>
                                  <Button variant="outline" onClick={() => setIsAddTeamModalOpen(true)}><PlusCircle className="mr-2 h-4 w-4" />Añadir Equipo</Button>
                              </div>
                              <Card>
                                  <Table>
                                      <TableHeader>
                                          <TableRow>
                                              <TableHead>Nombre del Equipo</TableHead>
                                              <TableHead className="text-center">Miembros</TableHead>
                                              <TableHead className="text-right">Acciones</TableHead>
                                          </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                          {teams.map(team => (
                                              <TableRow key={team.id}>
                                                  <TableCell className="font-medium">{team.name}</TableCell>
                                                  <TableCell className="text-center">{team.memberCount}</TableCell>
                                                  <TableCell className="text-right">
                                                      <Button variant="outline" size="sm" className="mr-2">Ver Miembros</Button>
                                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                                          <Edit className="h-4 w-4" />
                                                      </Button>
                                                  </TableCell>
                                              </TableRow>
                                          ))}
                                      </TableBody>
                                  </Table>
                              </Card>
                          </div>
                      </div>
                  </ConfigModule>
                  <ConfigModule
                      icon={<ListChecks className="h-6 w-6 text-primary"/>}
                      title="Motor de Reglas de Operación"
                      description="Define, encadena y ajusta políticas de retardos, faltas y bloqueos."
                  >
                      <RuleBuilder usersWithSlack={usersWithSlack} />
                  </ConfigModule>
                  <ConfigModule
                      icon={<CalendarDays className="h-6 w-6 text-primary"/>}
                      title="Calendarios y Feriados"
                      description="Administra el calendario corporativo y los feriados regionales."
                  >
                      <Card>
                          <CardHeader className="flex-row items-center justify-between">
                              <div>
                                  <CardTitle className="text-base">Lista de Días Feriados</CardTitle>
                                  <CardDescription className="text-xs">Estos días no contarán para el registro de asistencia.</CardDescription>
                              </div>
                              <AddHolidayDialog onAdd={handleAddHoliday} />
                          </CardHeader>
                          <CardContent>
                              <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Fecha</TableHead>
                                          <TableHead>Nombre</TableHead>
                                          <TableHead>Tipo</TableHead>
                                          <TableHead className="text-right">Acción</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {holidays.length > 0 ? holidays.map(holiday => (
                                          <TableRow key={holiday.id}>
                                              <TableCell className="font-medium">{format(holiday.date, 'PPP', { locale: es })}</TableCell>
                                              <TableCell>{holiday.name}</TableCell>
                                              <TableCell>
                                                  <Badge variant={holiday.type === 'official' ? 'secondary' : 'outline'} className="capitalize">{holiday.type}</Badge>
                                              </TableCell>
                                              <TableCell className="text-right">
                                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteHoliday(holiday.id)} disabled={holiday.type === 'official'}>
                                                      <Trash2 className="h-4 w-4" />
                                                  </Button>
                                              </TableCell>
                                          </TableRow>
                                      )) : (
                                          <TableRow>
                                              <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                  No hay días feriados configurados.
                                              </TableCell>
                                          </TableRow>
                                      )}
                                  </TableBody>
                              </Table>
                          </CardContent>
                      </Card>
                  </ConfigModule>
                  <ConfigModule
                      icon={<Send className="h-6 w-6 text-primary"/>}
                      title="Reportes Automáticos"
                      description="Configura el envío automático de reportes por correo electrónico."
                  >
                      <Card>
                          <CardHeader className="flex-row items-center justify-between">
                              <div>
                                  <CardTitle className="text-base">Reportes Programados</CardTitle>
                                  <CardDescription className="text-xs">Gestiona los reportes que se envían automatically.</CardDescription>
                              </div>
                              <Button variant="outline" size="sm" onClick={handleAddScheduledReport}>
                                  <PlusCircle className="mr-2 h-4 w-4"/>Añadir Reporte
                              </Button>
                          </CardHeader>
                          <CardContent>
                              <Table>
                                  <TableHeader>
                                      <TableRow>
                                          <TableHead>Nombre</TableHead>
                                          <TableHead>Frecuencia</TableHead>
                                          <TableHead>Hora</TableHead>
                                          <TableHead>Estado</TableHead>
                                          <TableHead className="text-right">Acciones</TableHead>
                                      </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                      {scheduledReports.map(report => (
                                          <TableRow key={report.id}>
                                              <TableCell className="font-medium">{report.name}</TableCell>
                                              <TableCell>{report.frequency}</TableCell>
                                              <TableCell>{report.time}</TableCell>
                                              <TableCell>
                                                  <Switch checked={report.active} onCheckedChange={(checked) => handleToggleScheduledReport(report.id, checked)} />
                                              </TableCell>
                                              <TableCell className="text-right">
                                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingReport(report)}>
                                                      <Edit className="h-4 w-4" />
                                                  </Button>
                                              </TableCell>
                                          </TableRow>
                                      ))}
                                  </TableBody>
                              </Table>
                          </CardContent>
                      </Card>
                  </ConfigModule>
                  <ConfigModule
                      icon={<Database className="h-6 w-6 text-primary"/>}
                      title="Gestión de Datos"
                      description="Define políticas de retención, archivado, backups y reseteo."
                  >
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label>Política de Retención de Datos (días)</Label>
                              <Input type="number" defaultValue="365" />
                          </div>
                          <Button>Realizar Backup Manual</Button>
                          <Button variant="destructive">Solicitar Reseteo de Datos</Button>
                      </div>
                  </ConfigModule>
                  <ConfigModule
                      icon={<KeyRound className="h-6 w-6 text-primary"/>}
                      title="Integraciones & API Keys"
                      description="Gestiona API keys, SSO, webhooks y sincronizaciones externas."
                  >
                      <div className="space-y-6">
                          <div className="flex justify-end">
                              <Dialog open={isAddIntegrationOpen} onOpenChange={setIsAddIntegrationOpen}>
                                  <DialogTrigger asChild>
                                      <Button variant="outline"><PlusCircle className="mr-2 h-4 w-4" />Añadir Integración</Button>
                                  </DialogTrigger>
                                  <AddIntegrationDialog onAdd={handleAddIntegration} onOpenChange={setIsAddIntegrationOpen}/>
                              </Dialog>
                          </div>
                          {integrations.map((integration) => (
                              <Card key={integration.id}>
                                  <CardHeader>
                                      <div className="flex items-center gap-4">
                                          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted">
                                              <Image src={integration.logoUrl} width={24} height={24} alt={`${integration.name} Logo`} data-ai-hint={`${integration.name} logo`}/>
                                          </div>
                                          <div>
                                              <CardTitle className="text-lg">{integration.name}</CardTitle>
                                              <CardDescription>{integration.description}</CardDescription>
                                          </div>
                                      </div>
                                  </CardHeader>
                                  <CardContent>
                                      <div className="space-y-2">
                                          <Label htmlFor={`${integration.id}-token`}>
                                              {integration.type === 'apikey' ? 'API Key' : 'Bot Token'}
                                          </Label>
                                          <Input 
                                              id={`${integration.id}-token`}
                                              type="password" 
                                              placeholder="••••••••••••••••••••"
                                              value={integrationTokens[integration.id] || integration.token || ''}
                                              onChange={(e) => handleIntegrationTokenChange(integration.id, e.target.value)}
                                              disabled={integration.status === 'conectado'}
                                          />
                                      </div>
                                  </CardContent>
                                  <CardFooter className="justify-between items-center">
                                      <div className="flex items-center gap-4">
                                          <Badge variant={integration.status === 'conectado' ? 'secondary' : 'outline'} className={cn(integration.status === 'conectado' ? 'text-green-700 bg-green-50' : 'text-muted-foreground')}>
                                              <Plug className="mr-1.5 h-3 w-3" />
                                              {integration.status === 'conectado' ? 'Conectado' : 'Desconectado'}
                                          </Badge>
                                          {integration.id === 'slack' && (
                                              <Button 
                                                  variant="outline" 
                                                  size="sm" 
                                                  disabled={integration.status !== 'conectado'}
                                                  onClick={() => setIsSlackTestOpen(true)}
                                              >
                                                  <Send className="mr-2 h-4 w-4"/>
                                                  Probar
                                              </Button>
                                          )}
                                      </div>
                                      <Button onClick={() => handleToggleIntegration(integration.id)}>
                                          {integration.status === 'conectado' ? 'Desconectar' : 'Conectar'}
                                      </Button>
                                  </CardFooter>
                              </Card>
                          ))}
                      </div>
                  </ConfigModule>
                  <ConfigModule
                      icon={<FileText className="h-6 w-6 text-primary"/>}
                      title="Auditoría & Logs"
                      description="Define niveles de logging y gestiona el acceso a las trazas."
                  >
                      <div className="space-y-4">
                        <div className="space-y-2">
                              <Label htmlFor="log-level">Nivel de Logging</Label>
                              <Select value={logLevel} onValueChange={(value) => {
                                  setLogLevel(value);
                                  toast({ title: "Nivel de Logging Actualizado", description: `El nivel se ha establecido a ${value.toUpperCase()}.` });
                              }}>
                                  <SelectTrigger id="log-level">
                                      <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                      <SelectItem value="debug">Debug</SelectItem>
                                      <SelectItem value="info">Info</SelectItem>
                                      <SelectItem value="warn">Warning</SelectItem>
                                      <SelectItem value="error">Error</SelectItem>
                                  </SelectContent>
                              </Select>
                          </div>
                          <Button variant="outline" onClick={handleExportLogs}>
                              <Download className="mr-2 h-4 w-4"/>
                              Exportar Logs Completos
                          </Button>
                          <div className='space-y-2'>
                              <h4 className='font-semibold text-sm'>Herramientas Avanzadas</h4>
                              <div className='flex gap-2'>
                                <Button variant="outline" size="sm" onClick={() => toast({title: "Completado", description: "Se han reconstruido los índices de búsqueda."})}>Reconstruir Índices de Búsqueda</Button>
                                <Button variant="outline" size="sm" onClick={() => toast({title: "Completado", description: "El script de mantenimiento se ha ejecutado."})}>Ejecutar Script de Mantenimiento</Button>
                              </div>
                          </div>
                      </div>
                  </ConfigModule>
                  <ConfigModule
                      icon={<Palette className="h-6 w-6 text-primary"/>}
                      title="Personalización de Interfaz"
                      description="Habilita/deshabilita módulos, campos y personaliza etiquetas."
                  >
                      <div className="space-y-6">
                          <div className="flex items-center justify-between p-4 border rounded-md">
                              <div>
                                  <Label htmlFor="time-off-tab" className="font-medium">Habilitar Pestaña 'Días Libres'</Label>
                                  <p className="text-xs text-muted-foreground">Muestra u oculta la pestaña de gestión de vacaciones y permisos.</p>
                              </div>
                              <Switch 
                                  id="time-off-tab" 
                                  checked={interfaceSettings.showTimeOffTab}
                                  onCheckedChange={(checked) => setInterfaceSettings(prev => ({ ...prev, showTimeOffTab: checked }))}
                              />
                          </div>
                          <div className="flex items-center justify-between p-4 border rounded-md">
                              <div>
                                  <Label htmlFor="notes-required" className="font-medium">Hacer 'Notas' obligatorio en Check-in</Label>
                                  <p className="text-xs text-muted-foreground">Requiere que el personal de campo siempre añada un comentario.</p>
                              </div>
                              <Switch 
                                  id="notes-required" 
                                  checked={interfaceSettings.notesRequired}
                                  onCheckedChange={(checked) => setInterfaceSettings(prev => ({ ...prev, notesRequired: checked }))}
                              />
                          </div>
                          <Separator />
                          <div>
                              <h4 className="font-medium mb-2">Tema de Color</h4>
                              <RadioGroup 
                                  value={interfaceSettings.theme}
                                  onValueChange={(value) => setInterfaceSettings(prev => ({ ...prev, theme: value }))} 
                                  className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                              >
                                  <Label htmlFor="theme-green" className="block relative rounded-lg border p-2 cursor-pointer has-[:checked]:border-primary">
                                      <RadioGroupItem value="theme-green" id="theme-green" className="sr-only"/>
                                      <div className="flex items-center gap-4">
                                          <div className="h-6 w-6 rounded-full bg-[#23cd7d]"></div>
                                          <span>Verde Aviva</span>
                                      </div>
                                  </Label>
                                  <Label htmlFor="theme-blue" className="block relative rounded-lg border p-2 cursor-pointer has-[:checked]:border-primary">
                                      <RadioGroupItem value="theme-blue" id="theme-blue" className="sr-only"/>
                                      <div className="flex items-center gap-4">
                                          <div className="h-6 w-6 rounded-full bg-[#3B82F6]"></div>
                                          <span>Azul (Default)</span>
                                      </div>
                                  </Label>
                                  <Label htmlFor="theme-indigo" className="block relative rounded-lg border p-2 cursor-pointer has-[:checked]:border-primary">
                                      <RadioGroupItem value="theme-indigo" id="theme-indigo" className="sr-only"/>
                                      <div className="flex items-center gap-4">
                                          <div className="h-6 w-6 rounded-full bg-[#4F46E5]"></div>
                                          <span>Indigo Profundo</span>
                                      </div>
                                  </Label>
                              </RadioGroup>
                          </div>
                      </div>
                  </ConfigModule>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      <CommentsDialog
        isOpen={isCommentsModalOpen}
        onOpenChange={setIsCommentsModalOpen}
        request={selectedRequest}
        onSave={handleSaveComment}
      />
      <EditRoleDialog
        isOpen={isEditRoleModalOpen}
        onOpenChange={setIsEditRoleModalOpen}
        role={selectedRole}
        onSave={handleSaveRole}
      />
      <EditUserDialog
        isOpen={isEditUserModalOpen}
        onOpenChange={setIsEditUserModalOpen}
        user={selectedUser}
        onSave={handleSaveUser}
      />
      <AddTeamDialog
        isOpen={isAddTeamModalOpen}
        onOpenChange={setIsAddTeamModalOpen}
        users={users}
        onSave={handleSaveTeam}
      />
      <ScheduledReportDialog
        report={editingReport}
        onOpenChange={(isOpen) => !isOpen && setEditingReport(null)}
        onSave={handleSaveScheduledReport}
        allUsers={users}
      />
      <SlackTestDialog
        isOpen={isSlackTestOpen}
        onOpenChange={setIsSlackTestOpen}
        usersWithSlack={usersWithSlack}
        onSend={handleSendTestSlack}
        botToken={integrations.find(i => i.id === 'slack')?.token || null}
      />
      <AlertDialog open={!!deletingRole} onOpenChange={() => setDeletingRole(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                    Esta acción no se puede deshacer. Esto eliminará permanentemente el rol de <strong>{deletingRole?.name}</strong> y desasignará a todos los usuarios de este rol.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => deletingRole && handleDeleteRole(deletingRole.name)}>Eliminar Rol</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
