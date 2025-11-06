import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { AlertCircle, Calendar, Clock, MapPin, User, Mail, MessageSquare } from 'lucide-react';
import { ReservationData } from './ReservationDialog';
import { format } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';

interface RequestSentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomNumber: string;
  day: string;
  blockNumber: number;
  reservationData: ReservationData;
  conflicts: Array<{ date: string; activityType: string }>;
}

export function RequestSentDialog({
  isOpen,
  onClose,
  roomNumber,
  day,
  blockNumber,
  reservationData,
  conflicts
}: RequestSentDialogProps) {
  const getBlockTimeLabel = (block: number) => {
    const startMinutes = 495 + (block - 1) * 85;
    const endMinutes = startMinutes + 70;
    
    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    
    const formatTime = (h: number, m: number) => 
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    return `${formatTime(startHour, startMin)} - ${formatTime(endHour, endMin)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-utfsm-gold">
            <AlertCircle className="h-6 w-6" />
            Solicitud de Excepción Enviada
          </DialogTitle>
          <DialogDescription>
            Tu solicitud ha sido registrada y será revisada por el departamento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Mensaje informativo */}
          <div className="bg-utfsm-gold/10 border border-utfsm-gold/20 p-4 rounded-lg">
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-utfsm-gold flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-utfsm-gold">
                  Solicitud pendiente de aprobación
                </p>
                <p className="text-sm text-muted-foreground">
                  Se contactará con el profesor <strong>Rodrigo Muñoz</strong> cuando haya una solución respecto a los conflictos detectados.
                </p>
              </div>
            </div>
          </div>

          {/* Detalles de la solicitud */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <h4 className="font-medium text-utfsm-blue mb-3">Detalles de la Solicitud</h4>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                <span className="font-medium">Sala:</span>
                <span>{roomNumber}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                <span className="font-medium">Solicitante:</span>
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
                <span>Todo el semestre</span>
              </div>
            </div>
          </div>

          {/* Conflictos detectados */}
          <div className="bg-utfsm-gold/5 border border-utfsm-gold/20 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-utfsm-gold text-sm mb-2">
              Conflictos Detectados ({conflicts.length})
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
              {conflicts.map((conflict, idx) => (
                <div key={idx} className="text-xs bg-background/50 p-2 rounded border border-utfsm-gold/20">
                  <span className="font-medium">Tope Día {conflict.date}</span> - <span className="italic">{conflict.activityType}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mensaje adicional de la solicitud (si existe) */}
          {reservationData.exceptionMessage && (
            <div className="bg-muted/50 border border-border p-4 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-utfsm-blue flex-shrink-0 mt-0.5" />
                <h4 className="font-medium text-utfsm-blue text-sm">
                  Información Adicional
                </h4>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap pl-6">
                {reservationData.exceptionMessage}
              </p>
            </div>
          )}

          {/* Botón de cierre */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onClose}
              className="flex-1 bg-utfsm-blue hover:bg-utfsm-blue/90"
            >
              Entendido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
