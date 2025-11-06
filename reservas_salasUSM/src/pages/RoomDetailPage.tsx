import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Room, TimeSlot, Building } from '../types';
import { buildings as initialBuildings } from '../data/mockData';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { ReservationDialog, ReservationData } from '../components/ReservationDialog';
import { ReservationConfirmationDialog } from '../components/ReservationConfirmationDialog';
import { RequestSentDialog } from '../components/RequestSentDialog';
import { toast } from 'sonner';
import { Calendar, Plus, Wifi, Monitor, Search, Volume2, Projector, Tablet, Wind, ArrowLeft } from 'lucide-react';
import universityLogo from "../assets/logo.png";
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export function RoomDetailPage() {
  const { buildingId, roomId } = useParams<{ buildingId: string; roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<Room | null>(null);
  const [building, setBuilding] = useState<Building | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{day: string, slot: TimeSlot} | null>(null);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isRequestSentDialogOpen, setIsRequestSentDialogOpen] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [conflicts, setConflicts] = useState<Array<{ date: string; activityType: string }>>([]);

  useEffect(() => {
    const foundBuilding = initialBuildings.find(b => b.id === buildingId);
    if (foundBuilding) {
      setBuilding(foundBuilding);
      const foundRoom = foundBuilding.rooms.find(r => r.id === roomId);
      setRoom(foundRoom || null);
    } else {
      setBuilding(null);
      setRoom(null);
    }
  }, [buildingId, roomId]);

  if (!buildingId || !roomId) {
    return <Navigate to="/" replace />;
  }

  if (!building || !room) {
    return (
      <div className="text-center py-12">
        <h3 className="text-muted-foreground mb-2">Sala no encontrada</h3>
        <Button onClick={() => navigate('/')}>
          Volver a Edificios
        </Button>
      </div>
    );
  }

  const handleSlotSelect = (day: string, slot: TimeSlot) => {
    if (slot.status === 'disponible' || slot.status === 'reservado-especifico') {
      setSelectedSlot({ day, slot });
    }
  };

  const handleReservationClick = () => {
    if (selectedSlot) {
      setIsReservationDialogOpen(true);
    }
  };

  const formatActivityType = (type: string) => {
    const types: Record<string, string> = {
      'reunion': 'Reunión',
      'control': 'Control',
      'certamen': 'Certamen',
      'ayudantia': 'Ayudantía',
      'otro': 'Otro',
      'evento-inamovible': 'Evento Inamovible'
    };
    return types[type] || type;
  };

  const handleReservationConfirm = (data: ReservationData) => {
    if (!selectedSlot || !room) return;
    
    setReservationData(data);
    setIsReservationDialogOpen(false);
    
    const detectedConflicts: Array<{ date: string; activityType: string }> = [];
    
    data.dates.forEach(dateStr => {
      const dayOfWeek = format(parseISO(dateStr), 'EEEE', { locale: es });
      const daySchedule = room.schedule[dayOfWeek as keyof typeof room.schedule];
      
      if (daySchedule) {
        const existingSlot = daySchedule.find(s => s.block === selectedSlot.slot.block);
        
        if (existingSlot && existingSlot.status === 'ocupado') {
          detectedConflicts.push({
            date: dateStr,
            activityType: existingSlot.activityType || 'Desconocido'
          });
        }
      }
    });
    
    setConflicts(detectedConflicts);
    
    if (detectedConflicts.length > 0) {
      setIsRequestSentDialogOpen(true);
    } else {
      const updatedSchedule = { ...room.schedule };
      
      data.dates.forEach(dateStr => {
        const dayOfWeek = format(parseISO(dateStr), 'EEEE', { locale: es });
        const daySchedule = updatedSchedule[dayOfWeek as keyof typeof room.schedule];
        
        if (daySchedule) {
          const slotIndex = daySchedule.findIndex(s => s.block === selectedSlot.slot.block);
          
          if (slotIndex !== -1) {
            daySchedule[slotIndex] = {
              ...daySchedule[slotIndex],
              status: 'reservado-especifico',
              activityType: data.activityType,
              reservedBy: data.professorName,
              course: data.subject
            };
          }
        }
      });
      
      setRoom({ ...room, schedule: updatedSchedule });
      setIsConfirmationDialogOpen(true);
    }
  };

  const handleConfirmationClose = () => {
    setIsConfirmationDialogOpen(false);
    setSelectedSlot(null);
    setReservationData(null);
    toast.success('Reserva realizada exitosamente');
  };

  const handleRequestSentClose = () => {
    setIsRequestSentDialogOpen(false);
    setSelectedSlot(null);
    setReservationData(null);
    setConflicts([]);
    toast.success('Solicitud de excepción enviada');
  };

  const equipmentIcons: Record<string, React.ReactNode> = {
    'Proyector': <Projector className="h-4 w-4" />,
    'Computador': <Monitor className="h-4 w-4" />,
    'Pizarra Digital': <Tablet className="h-4 w-4" />,
    'Sistema de Audio': <Volume2 className="h-4 w-4" />,
    'WiFi': <Wifi className="h-4 w-4" />,
    'Aire Acondicionado': <Wind className="h-4 w-4" />,
    'Cámara': <Search className="h-4 w-4" />
  };

  return (
    <>
      {/* Header con fondo degradado */}
      <div className="bg-gradient-to-r from-utfsm-blue/5 to-utfsm-navy/5 border-b -mt-8 -mx-4 md:-mx-6 mb-6">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/building/${buildingId}`)} className="flex-shrink-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="flex-shrink-0">
              <img 
                src={universityLogo} 
                alt="Universidad Técnica Federico Santa María" 
                className="h-12 w-auto"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-utfsm-blue">Reservar Sala {room.number}</h1>
              <p className="text-muted-foreground">{room.type} • Capacidad: {room.capacity} personas</p>
            </div>
          </div>
          
          {/* Equipamiento */}
          <div className="space-y-2 mb-4">
            <div className="text-sm font-medium">Equipamiento disponible:</div>
            <div className="flex flex-wrap gap-2">
              {room.equipment.map((eq) => (
                <Badge key={eq} variant="outline" className="flex items-center gap-1.5">
                  {equipmentIcons[eq]}
                  {eq}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Horario de disponibilidad */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2>Horario de Disponibilidad</h2>
            <p className="text-sm text-muted-foreground">Selecciona un bloque disponible para realizar una reserva</p>
          </div>
          {selectedSlot && (
            <Button onClick={handleReservationClick} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Reservar
            </Button>
          )}
        </div>

        <ScheduleGrid 
          schedule={room.schedule} 
          onSlotSelect={handleSlotSelect}
          selectedSlot={selectedSlot}
        />

        {/* Leyenda */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span className="text-sm">Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span className="text-sm">Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300"></div>
            <span className="text-sm">Reservado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-purple-100 border border-purple-300"></div>
            <span className="text-sm">Evento Inamovible</span>
          </div>
        </div>
      </div>

      {/* Diálogos */}
      <ReservationDialog
        isOpen={isReservationDialogOpen}
        onClose={() => setIsReservationDialogOpen(false)}
        onConfirm={handleReservationConfirm}
        roomNumber={room.number}
        timeSlot={selectedSlot?.slot.block || ''}
        dayOfWeek={selectedSlot?.day || ''}
      />

      <ReservationConfirmationDialog
        isOpen={isConfirmationDialogOpen}
        onClose={handleConfirmationClose}
        reservationData={reservationData}
        roomNumber={room.number}
        timeSlot={selectedSlot?.slot.block || ''}
        dayOfWeek={selectedSlot?.day || ''}
      />

      <RequestSentDialog
        isOpen={isRequestSentDialogOpen}
        onClose={handleRequestSentClose}
        conflicts={conflicts}
        reservationData={reservationData}
        roomNumber={room.number}
        timeSlot={selectedSlot?.slot.block || ''}
      />
    </>
  );
}
