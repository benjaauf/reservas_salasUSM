import { useState } from 'react';
import { Room, TimeSlot } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ScheduleGrid } from './ScheduleGrid';
import { ReservationDialog, ReservationData } from './ReservationDialog';
import { ReservationConfirmationDialog } from './ReservationConfirmationDialog';
import { RequestSentDialog } from './RequestSentDialog';
import { toast } from 'sonner';
import { Calendar, Plus, Wifi, Monitor, Search, Volume2, Projector, Tablet, Wind, ArrowLeft } from 'lucide-react';
import universityLogo from '../assets/logo.png';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface RoomDetailProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onRoomUpdate: (room: Room) => void;
}

export function RoomDetail({ room, isOpen, onClose, onRoomUpdate }: RoomDetailProps) {
  const [selectedSlot, setSelectedSlot] = useState<{day: string, slot: TimeSlot} | null>(null);
  const [isReservationDialogOpen, setIsReservationDialogOpen] = useState(false);
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);
  const [isRequestSentDialogOpen, setIsRequestSentDialogOpen] = useState(false);
  const [reservationData, setReservationData] = useState<ReservationData | null>(null);
  const [conflicts, setConflicts] = useState<Array<{ date: string; activityType: string }>>([]);
  
  if (!room || !isOpen) return null;

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
    
    // Detectar si hay conflictos (reserva semestral con bloque que tiene reservas específicas)
    const hasConflicts = data.type === 'semester' && 
                         selectedSlot.slot.status === 'reservado-especifico' &&
                         (selectedSlot.slot.specificDateReservations || []).length > 0;
    
    if (hasConflicts) {
      // Calcular conflictos formateados
      const specificReservations = selectedSlot.slot.specificDateReservations || [];
      const formattedConflicts = specificReservations.map(res => ({
        date: format(parseISO(res.date), 'dd/MM/yyyy', { locale: es }),
        activityType: formatActivityType(res.activityType)
      }));
      setConflicts(formattedConflicts);
      setIsRequestSentDialogOpen(true);
    } else {
      setIsConfirmationDialogOpen(true);
    }
    
    // Actualizar el schedule de la sala
    const updatedSchedule = { ...room.schedule };
    const daySlots = [...(updatedSchedule[selectedSlot.day] || [])];
    const slotIndex = daySlots.findIndex(s => s.block === selectedSlot.slot.block);
    
    if (slotIndex !== -1) {
      if (data.type === 'semester') {
        // Reserva para todo el semestre
        if (hasConflicts) {
          // Si hay conflictos, marcar como pendiente (naranja)
          daySlots[slotIndex] = {
            ...daySlots[slotIndex],
            status: 'pendiente',
            professor: 'Rodrigo Muñoz'
          };
        } else {
          // Sin conflictos, marcar como ocupado (rojo)
          daySlots[slotIndex] = {
            ...daySlots[slotIndex],
            status: 'ocupado',
            professor: 'Rodrigo Muñoz'
          };
        }
      } else {
        // Reserva para fecha específica - mantener o cambiar a reservado-especifico (amarillo)
        const specificReservations = daySlots[slotIndex].specificDateReservations || [];
        daySlots[slotIndex] = {
          ...daySlots[slotIndex],
          status: 'reservado-especifico',
          specificDateReservations: [
            ...specificReservations,
            {
              date: data.date!.toISOString(),
              subject: '',
              professor: 'Rodrigo Muñoz',
              activityType: data.activityType!
            }
          ]
        };
      }
      
      updatedSchedule[selectedSlot.day] = daySlots;
      
      // Actualizar la sala con el nuevo schedule
      const updatedRoom = {
        ...room,
        schedule: updatedSchedule
      };
      
      onRoomUpdate(updatedRoom);
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

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header con fondo degradado */}
      <div className="bg-gradient-to-r from-utfsm-blue/5 to-utfsm-navy/5 border-b">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
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
              {room.equipment.map((eq) => {
                const iconMap = { Wifi, Monitor, Search, Volume2, Projector, Tablet, Wind };
                const IconComponent = iconMap[eq.icon as keyof typeof iconMap];
                return (
                  <Badge 
                    key={eq.id} 
                    variant="outline"
                    className={`text-xs ${
                      eq.working 
                        ? 'border-utfsm-green/40 text-utfsm-green bg-utfsm-green/5' 
                        : 'border-muted-foreground/40 text-muted-foreground bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {IconComponent && <IconComponent className="h-3 w-3" />}
                      <span>{eq.name}</span>
                      {!eq.working && <span className="text-[10px] opacity-75">(No funciona)</span>}
                    </div>
                  </Badge>
                );
              })}
            </div>
            <div className="text-muted-foreground text-sm">Selecciona un bloque disponible (verde) o con reservas específicas (amarillo) en el horario para hacer tu reserva</div>
          </div>
        </div>
      </div>
        
      {/* Contenido principal */}
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {/* Información de reserva seleccionada */}
        <div className="flex-shrink-0 container mx-auto px-4 md:px-6">
          {selectedSlot ? (
            <div className="mb-6">
              <div className="p-4 border rounded-lg bg-utfsm-blue/5">
                <div className="flex items-center gap-2 text-utfsm-blue mb-3">
                  <Calendar className="h-5 w-5" />
                  <span className="font-medium">Bloque seleccionado: {selectedSlot.day} - Bloque {selectedSlot.slot.block * 2 - 1}-{selectedSlot.slot.block * 2}</span>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  Hora: {(() => {
                    // Bloques de 70 minutos con intervalos de 15 minutos, empezando a las 8:15
                    const startMinutes = 495 + (selectedSlot.slot.block - 1) * 85; // 8:15 AM = 495 minutos, cada ciclo = 85 min
                    const endMinutes = startMinutes + 70;
                    
                    const startHour = Math.floor(startMinutes / 60);
                    const startMin = startMinutes % 60;
                    const endHour = Math.floor(endMinutes / 60);
                    const endMin = endMinutes % 60;
                    
                    const formatTime = (h: number, m: number) => 
                      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    
                    return `${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)} (70 minutos)`;
                  })()}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReservationClick} className="flex-1 bg-utfsm-blue hover:bg-utfsm-blue/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Confirmar Reserva
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedSlot(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>Selecciona un bloque disponible (verde) o con reservas específicas (amarillo) en el horario para reservar</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Horario de la sala - área con scroll */}
        <div className="flex-1 min-h-0 container mx-auto px-4 md:px-6">
          <ScheduleGrid 
            schedule={room.schedule} 
            onSlotSelect={handleSlotSelect}
            selectedSlot={selectedSlot}
          />
        </div>
      </div>

      {/* Diálogo de Reserva */}
      <ReservationDialog
        isOpen={isReservationDialogOpen}
        onClose={() => setIsReservationDialogOpen(false)}
        room={room}
        selectedSlot={selectedSlot}
        onConfirm={handleReservationConfirm}
      />

      {/* Diálogo de Confirmación */}
      {reservationData && selectedSlot && (
        <ReservationConfirmationDialog
          isOpen={isConfirmationDialogOpen}
          onClose={handleConfirmationClose}
          roomNumber={room.number}
          day={selectedSlot.day}
          blockNumber={selectedSlot.slot.block}
          reservationData={reservationData}
        />
      )}

      {/* Diálogo de Solicitud Enviada */}
      {reservationData && selectedSlot && (
        <RequestSentDialog
          isOpen={isRequestSentDialogOpen}
          onClose={handleRequestSentClose}
          roomNumber={room.number}
          day={selectedSlot.day}
          blockNumber={selectedSlot.slot.block}
          reservationData={reservationData}
          conflicts={conflicts}
        />
      )}
    </div>
  );
}