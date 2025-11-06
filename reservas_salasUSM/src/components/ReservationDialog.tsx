import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CalendarIcon, Clock, MapPin, User, BookOpen, AlertTriangle, MessageSquare } from 'lucide-react';
import { Room, TimeSlot } from '../types';
import { format, getDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReservationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  selectedSlot: { day: string; slot: TimeSlot } | null;
  onConfirm: (reservationData: ReservationData) => void;
}

export interface ReservationData {
  type: 'semester' | 'specific';
  date?: Date;
  activityType?: 'reunion' | 'control' | 'certamen' | 'ayudantia' | 'otro' | 'evento-inamovible';
  exceptionMessage?: string;
}

export function ReservationDialog({ 
  isOpen, 
  onClose, 
  room, 
  selectedSlot, 
  onConfirm 
}: ReservationDialogProps) {
  const [reservationType, setReservationType] = useState<'semester' | 'specific'>('semester');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activityType, setActivityType] = useState<'reunion' | 'control' | 'certamen' | 'ayudantia' | 'otro' | 'evento-inamovible'>('otro');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [exceptionMessage, setExceptionMessage] = useState('');

  // Mapeo de día de la semana (0=Domingo, 1=Lunes, etc.) a nombre del día
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  // Detectar si el bloque tiene reservas específicas
  const hasSpecificReservations = selectedSlot?.slot.status === 'reservado-especifico';
  
  // Obtener las reservas específicas del bloque
  const specificReservations = selectedSlot?.slot.specificDateReservations || [];

  // Función para formatear el tipo de actividad
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

  // Calcular los topes para reserva de semestre completo
  const semesterConflicts = useMemo(() => {
    if (!hasSpecificReservations || reservationType !== 'semester') return [];
    return specificReservations.map(res => ({
      date: format(parseISO(res.date), 'dd/MM/yyyy', { locale: es }),
      activityType: formatActivityType(res.activityType)
    }));
  }, [hasSpecificReservations, reservationType, specificReservations]);

  // Función para verificar si una fecha específica está reservada
  const isSpecificDateReserved = (date: Date): boolean => {
    if (!hasSpecificReservations) return false;
    
    const dateStr = date.toISOString().split('T')[0];
    return specificReservations.some(res => res.date.startsWith(dateStr));
  };

  // Obtener el día de la semana objetivo (0-6) del bloque seleccionado
  const targetDayOfWeek = useMemo(() => {
    if (!selectedSlot) return -1;
    return dayNames.indexOf(selectedSlot.day);
  }, [selectedSlot]);

  // Calcular fechas reservadas y disponibles para los modifiers
  const calendarModifiers = useMemo(() => {
    if (!room || !selectedSlot) return {};

    if (hasSpecificReservations) {
      // Para bloques con reservas específicas, solo mostrar si la fecha específica está reservada o disponible
      return {
        specificReserved: (date: Date) => {
          const dayOfWeek = getDay(date);
          return dayOfWeek === targetDayOfWeek && isSpecificDateReserved(date);
        },
        specificAvailable: (date: Date) => {
          const dayOfWeek = getDay(date);
          return dayOfWeek === targetDayOfWeek && !isSpecificDateReserved(date);
        },
        wrongDay: (date: Date) => {
          const dayOfWeek = getDay(date);
          return dayOfWeek !== targetDayOfWeek;
        }
      };
    }

    // Para bloques regulares
    return {
      occupied: (date: Date) => {
        const dayOfWeek = getDay(date);
        const dayName = dayNames[dayOfWeek];
        const schedule = room.schedule[dayName];
        if (!schedule) return false;
        const slot = schedule.find(s => s.block === selectedSlot.slot.block);
        return dayOfWeek === targetDayOfWeek && (slot ? slot.status === 'ocupado' : false);
      },
      available: (date: Date) => {
        const dayOfWeek = getDay(date);
        const dayName = dayNames[dayOfWeek];
        const schedule = room.schedule[dayName];
        if (!schedule) return false;
        const slot = schedule.find(s => s.block === selectedSlot.slot.block);
        return dayOfWeek === targetDayOfWeek && (slot ? slot.status === 'disponible' : false);
      },
      wrongDay: (date: Date) => {
        const dayOfWeek = getDay(date);
        return dayOfWeek !== targetDayOfWeek;
      }
    };
  }, [room, selectedSlot, hasSpecificReservations, specificReservations, targetDayOfWeek]);

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
  


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (reservationType === 'specific' && !selectedDate) {
      return;
    }

    const reservationData: ReservationData = {
      type: reservationType,
      date: reservationType === 'specific' ? selectedDate : undefined,
      activityType: reservationType === 'specific' ? activityType : undefined,
      exceptionMessage: exceptionMessage.trim() || undefined
    };

    onConfirm(reservationData);
    handleClose();
  };

  const handleClose = () => {
    setReservationType('semester');
    setSelectedDate(undefined);
    setActivityType('otro');
    setIsCalendarOpen(false);
    setExceptionMessage('');
    onClose();
  };

  if (!selectedSlot || !room) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-utfsm-blue" />
            Reservar Sala
          </DialogTitle>
          <DialogDescription>
            Seleccione el tipo de reserva para la sala {room.number} el {selectedSlot.day}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la reserva */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-utfsm-blue" />
              <span className="font-medium">Sala:</span>
              <span>{room.number}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-utfsm-blue" />
              <span className="font-medium">Día:</span>
              <span>{selectedSlot.day}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-utfsm-blue" />
              <span className="font-medium">Horario:</span>
              <span>Bloque {(selectedSlot.slot.block * 2) - 1}-{selectedSlot.slot.block * 2}: {getBlockTimeLabel(selectedSlot.slot.block)} (70 min)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de reserva */}
            <div>
              <Label>Tipo de reserva *</Label>
              <div className="mt-2 space-y-2">
                <label 
                  htmlFor="semester"
                  className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <input
                    type="radio"
                    id="semester"
                    name="reservationType"
                    value="semester"
                    checked={reservationType === 'semester'}
                    onChange={() => setReservationType('semester')}
                    className="mt-1.5 h-4 w-4 border-gray-300 text-utfsm-blue focus:ring-utfsm-blue"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Todo el semestre</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Para actividades regulares que se realizan durante todo el semestre académico
                    </p>
                  </div>
                </label>
                <label 
                  htmlFor="specific"
                  className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <input
                    type="radio"
                    id="specific"
                    name="reservationType"
                    value="specific"
                    checked={reservationType === 'specific'}
                    onChange={() => setReservationType('specific')}
                    className="mt-1.5 h-4 w-4 border-gray-300 text-utfsm-blue focus:ring-utfsm-blue"
                  />
                  <div className="flex-1">
                    <div className="font-medium">Fecha específica</div>
                    <p className="text-sm text-gray-600 mt-1">
                      Para eventos puntuales o actividades de un solo día
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Advertencia de topes para semestre completo */}
            {reservationType === 'semester' && hasSpecificReservations && semesterConflicts.length > 0 && (
              <>
                <Alert className="border-utfsm-gold/40 bg-utfsm-gold/10">
                  <AlertTriangle className="h-4 w-4 text-utfsm-gold" />
                  <AlertTitle className="text-utfsm-gold">Topes detectados</AlertTitle>
                  <AlertDescription className="text-sm space-y-1 mt-2">
                    <p className="mb-2">Esta reserva tiene los siguientes topes por fechas específicas:</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                      {semesterConflicts.map((conflict, idx) => (
                        <div key={idx} className="text-xs bg-background/50 p-2 rounded border border-utfsm-gold/20">
                          <span className="font-medium">Tope Día {conflict.date}</span> por <span className="italic">{conflict.activityType}</span>
                        </div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>

                {/* Campo de mensaje para la solicitud de excepción */}
                <div className="bg-muted/30 p-4 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-utfsm-blue" />
                    <Label htmlFor="exceptionMessage" className="mb-0">Mensaje para la solicitud de excepción (opcional)</Label>
                  </div>
                  <Textarea
                    id="exceptionMessage"
                    value={exceptionMessage}
                    onChange={(e) => setExceptionMessage(e.target.value)}
                    placeholder="Agrega información relevante sobre tu solicitud (ej. motivo especial, alternativas consideradas, etc.)"
                    className="mt-2 min-h-[100px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {exceptionMessage.length}/500 caracteres
                  </p>
                </div>
              </>
            )}

            {/* Selector de fecha específica */}
            {reservationType === 'specific' && (
              <>
                <div>
                  <Label>Fecha *</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-2"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                          format(selectedDate, "PPP", { locale: es })
                        ) : (
                          "Seleccionar fecha"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setIsCalendarOpen(false);
                          }}
                          disabled={(date) => {
                            // Deshabilitar fechas pasadas
                            if (date < new Date()) return true;
                            
                            // Deshabilitar días que no corresponden al día de la semana del bloque
                            const dayOfWeek = getDay(date);
                            if (dayOfWeek !== targetDayOfWeek) return true;
                            
                            // Si es bloque con reservas específicas, deshabilitar fechas ya reservadas
                            if (hasSpecificReservations) {
                              return isSpecificDateReserved(date);
                            }
                            
                            return false;
                          }}
                          modifiers={calendarModifiers}
                          modifiersClassNames={hasSpecificReservations ? {
                            specificReserved: 'bg-utfsm-red/20 text-utfsm-red hover:bg-utfsm-red/30 hover:text-utfsm-red font-medium',
                            specificAvailable: 'bg-utfsm-blue/20 text-utfsm-blue hover:bg-utfsm-blue/30 hover:text-utfsm-blue font-medium',
                            wrongDay: 'opacity-30 pointer-events-none'
                          } : {
                            occupied: 'bg-utfsm-red/20 text-utfsm-red hover:bg-utfsm-red/30 hover:text-utfsm-red font-medium',
                            available: 'bg-utfsm-blue/20 text-utfsm-blue hover:bg-utfsm-blue/30 hover:text-utfsm-blue font-medium',
                            wrongDay: 'opacity-30 pointer-events-none'
                          }}
                          weekStartsOn={1}
                          initialFocus
                        />
                        <div className="border-t p-3 space-y-2">
                          <div className="text-xs font-medium text-muted-foreground mb-2">
                            Solo puedes seleccionar {selectedSlot.day}s - Bloque {selectedSlot.slot.block}:
                          </div>
                          {hasSpecificReservations ? (
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-utfsm-blue/20 border border-utfsm-blue/40"></div>
                                <span className="text-xs text-muted-foreground">Disponible</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-utfsm-red/20 border border-utfsm-red/40"></div>
                                <span className="text-xs text-muted-foreground">Ya reservado</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3 flex-wrap">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-utfsm-blue/20 border border-utfsm-blue/40"></div>
                                <span className="text-xs text-muted-foreground">Disponible</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-utfsm-red/20 border border-utfsm-red/40"></div>
                                <span className="text-xs text-muted-foreground">Ocupado</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Tipo de actividad */}
                <div>
                  <Label htmlFor="activityType">Tipo de actividad *</Label>
                  <Select value={activityType} onValueChange={(value) => setActivityType(value as any)}>
                    <SelectTrigger id="activityType" className="mt-2">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reunion">Reunión</SelectItem>
                      <SelectItem value="control">Control</SelectItem>
                      <SelectItem value="certamen">Certamen</SelectItem>
                      <SelectItem value="ayudantia">Ayudantía</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="evento-inamovible">Evento inamovible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Botones de acción */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className={`flex-1 ${
                  reservationType === 'semester' && hasSpecificReservations && semesterConflicts.length > 0
                    ? 'bg-utfsm-gold hover:bg-utfsm-gold/90'
                    : 'bg-utfsm-blue hover:bg-utfsm-blue/90'
                }`}
                disabled={reservationType === 'specific' && !selectedDate}
              >
                {reservationType === 'semester' && hasSpecificReservations && semesterConflicts.length > 0
                  ? 'Enviar solicitud de excepción'
                  : 'Confirmar Reserva'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}