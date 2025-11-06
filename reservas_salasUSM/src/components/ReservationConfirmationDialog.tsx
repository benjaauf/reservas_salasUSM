import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { CheckCircle, Calendar, Clock, MapPin, User } from 'lucide-react';
import { ReservationData } from './ReservationDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  day: string;
  blockNumber: number;
  reservationData: ReservationData;
}

export function ReservationConfirmationDialog({
  isOpen,
  onClose,
  roomNumber,
  day,
  blockNumber,
  reservationData
}: ReservationConfirmationDialogProps) {
  const getBlockTimeLabel = (block: number) => {
    // Bloques de 70 minutos con intervalos de 15 minutos, empezando a las 8:15
    const startMinutes = 495 + (block - 1) * 85; // 8:15 AM = 495 minutos, cada ciclo = 85 min
    const endMinutes = startMinutes + 70;
    
    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    
    const formatTime = (h: number, m: number) => 
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    return `${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}`;
  };

  const getReservationId = () => {
    return `RES-${Date.now().toString().slice(-6)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-utfsm-green">
            <CheckCircle className="h-5 w-5" />
            ¡Reserva Confirmada!
          </DialogTitle>
          <DialogDescription>
            Su reserva para la sala {roomNumber} ha sido registrada exitosamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ícono de éxito */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-utfsm-green/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-utfsm-green" />
            </div>
          </div>

          {/* ID de reserva */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">ID de Reserva</p>
            <p className="font-mono text-lg font-medium">{getReservationId()}</p>
          </div>

          {/* Detalles de la reserva */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-utfsm-blue mb-3">Detalles de la Reserva</h4>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                <span className="font-medium">Sala:</span>
                <span>{roomNumber}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                <span className="font-medium">Reservado por:</span>
                <span>Rodrigo Muñoz</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                <span className="font-medium">Día:</span>
                <span>{day}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                <span className="font-medium">Horario:</span>
                <span>Bloque {blockNumber * 2 - 1}-{blockNumber * 2} | {getBlockTimeLabel(blockNumber)} (70 minutos)</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                <span className="font-medium">Período:</span>
                <span>
                  {reservationData.type === 'semester' 
                    ? 'Todo el semestre' 
                    : `Fecha específica: ${format(reservationData.date!, 'PPP', { locale: es })}`
                  }
                </span>
              </div>

              {reservationData.type === 'specific' && reservationData.activityType && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-4 h-4 bg-utfsm-gold rounded-sm flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">T</span>
                  <span className="font-medium">Tipo de actividad:</span>
                  <span className="capitalize">
                    {reservationData.activityType === 'evento-inamovible' 
                      ? 'Evento inamovible'
                      : reservationData.activityType === 'ayudantia'
                      ? 'Ayudantía'
                      : reservationData.activityType
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje informativo */}
          <div className="bg-utfsm-blue/5 p-4 rounded-lg border-l-4 border-utfsm-blue">
            <p className="text-sm text-utfsm-blue">
              <strong>Importante:</strong> Tu reserva ha sido registrada exitosamente. 
              {reservationData.type === 'semester' 
                ? ' La sala está reservada para este horario durante todo el semestre.' 
                : ` La sala está reservada para la fecha seleccionada: ${format(reservationData.date!, 'PPP', { locale: es })}.`
              }
            </p>
          </div>

          {/* Botón de cerrar */}
          <div className="flex justify-center pt-2">
            <Button 
              onClick={onClose}
              className="bg-utfsm-blue hover:bg-utfsm-blue/90"
            >
              Entendido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}