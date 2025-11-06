import { Schedule, TimeSlot } from '../types';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface ScheduleGridProps {
  schedule: Schedule;
  onSlotSelect?: (day: string, slot: TimeSlot) => void;
  selectedSlot?: {day: string, slot: TimeSlot} | null;
}

export function ScheduleGrid({ schedule, onSlotSelect, selectedSlot }: ScheduleGridProps) {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const daysShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  
  // Crear 10 bloques de 70 minutos con intervalos de 15 minutos
  // Bloques 1-4: antes del almuerzo
  // Bloque 5 en adelante: después del almuerzo (inicia a las 14:40)
  const timeBlocks = Array.from({ length: 10 }, (_, i) => {
    const block = i + 1;
    let startMinutes;
    
    if (block <= 4) {
      // Bloques 1-4: normales con intervalo de 15 min
      startMinutes = 495 + i * 85; // 8:15 AM = 495 minutos
    } else {
      // Bloque 5+: después de pausa de almuerzo (14:40 = 880 minutos)
      startMinutes = 880 + (i - 4) * 85;
    }
    
    return { block, startMinutes };
  });
  
  const getTimeLabel = (startMinutes: number) => {
    const endMinutes = startMinutes + 70; // Bloque de 70 minutos
    
    const startHour = Math.floor(startMinutes / 60);
    const startMin = startMinutes % 60;
    const endHour = Math.floor(endMinutes / 60);
    const endMin = endMinutes % 60;
    
    const formatTime = (h: number, m: number) => 
      `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    
    return `${formatTime(startHour, startMin)}-${formatTime(endHour, endMin)}`;
  };
  
  // Función para obtener el estado de un bloque específico
  const getBlockStatus = (day: string, blockNumber: number) => {
    const slot = schedule[day]?.find(s => s.block === blockNumber);
    return slot || null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponible':
        return 'bg-utfsm-green/10 text-utfsm-green border-utfsm-green/20';
      case 'ocupado':
        return 'bg-utfsm-red/10 text-utfsm-red border-utfsm-red/20';
      case 'reservado-especifico':
        return 'bg-utfsm-gold/10 text-utfsm-gold border-utfsm-gold/20';
      case 'pendiente':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="p-4 h-full flex flex-col">
      <h4 className="mb-4 flex-shrink-0">Horario Semanal </h4>
      
      <div className="flex-1 overflow-auto scrollbar-thin">
        <div className="min-w-[800px] md:min-w-[1000px]">
          {/* Header con días */}
          <div className="grid grid-cols-8 gap-2 mb-2 sticky top-0 bg-background z-10">
            <div className="p-3 text-xs md:text-sm font-medium text-center bg-muted/80 rounded">Hora</div>
            {days.map((day, index) => (
              <div key={day} className="p-3 text-xs md:text-sm font-medium text-center bg-muted rounded">
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{daysShort[index]}</span>
              </div>
            ))}
          </div>
          
          {/* Filas con bloques individuales */}
          <div className="space-y-2">
            {timeBlocks.map((timeBlock) => {
              return (
                <div key={timeBlock.block} className="grid grid-cols-8 gap-2">
                  <div className="p-2 md:p-3 text-xs text-center bg-muted/50 rounded flex flex-col min-h-[60px] justify-center">
                    <span className="font-medium">Bloque {(timeBlock.block * 2) - 1}-{timeBlock.block * 2}</span>
                    <span className="text-muted-foreground text-[10px] md:text-xs mt-1">{getTimeLabel(timeBlock.startMinutes)}</span>
                  </div>
                  
                  {days.map((day) => {
                    const blockData = getBlockStatus(day, timeBlock.block);
                    if (!blockData) return <div key={`${day}-${timeBlock.block}`} className="p-1" />;
                    
                    const isSelected = selectedSlot?.day === day && selectedSlot?.slot.block === timeBlock.block;
                    const isClickable = (blockData.status === 'disponible' || blockData.status === 'reservado-especifico') && onSlotSelect && blockData.status !== 'pendiente';
                    
                    const handleClick = () => {
                      if (isClickable) {
                        onSlotSelect(day, blockData);
                      }
                    };
                    
                    return (
                      <div key={`${day}-${timeBlock.block}`} className="p-1">
                        <div
                          className={`p-2 rounded text-xs border min-h-[60px] flex flex-col justify-center transition-all ${
                            getStatusColor(blockData.status)
                          } ${
                            isSelected ? 'ring-2 ring-utfsm-blue shadow-md' : ''
                          } ${
                            isClickable ? 'cursor-pointer hover:opacity-80 hover:shadow-sm' : ''
                          }`}
                          title={
                            blockData.status === 'ocupado' 
                              ? 'Reservado por Rodrigo Muñoz'
                              : blockData.status === 'pendiente'
                              ? 'Solicitud de reserva pendiente de aprobación'
                              : blockData.status === 'reservado-especifico'
                              ? `Reservas específicas (${blockData.specificDateReservations?.length || 0}) - Click para ver más detalles y reservar otras fechas`
                              : 'Disponible - Click para reservar'
                          }
                          onClick={handleClick}
                        >
                          {blockData.status === 'ocupado' && (
                            <div className="font-medium truncate text-center text-[11px]">Reservado</div>
                          )}
                          {blockData.status === 'pendiente' && (
                            <>
                              <div className="font-medium truncate text-center text-[11px]">Pendiente</div>
                              <div className="text-[10px] opacity-75 truncate text-center mt-1">En revisión</div>
                            </>
                          )}
                          {blockData.status === 'disponible' && (
                            <div className="text-center text-[11px]">
                              {isSelected ? 'Seleccionado' : 'Disponible'}
                            </div>
                          )}
                          {blockData.status === 'reservado-especifico' && (
                            <>
                              <div className="font-medium truncate text-center text-[11px]">No disponible</div>
                              <div className="text-[10px] opacity-75 truncate text-center mt-1">todo el semestre</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-utfsm-green/10 border border-utfsm-green/20 rounded"></div>
          <span className="text-sm">Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-utfsm-gold/10 border border-utfsm-gold/20 rounded"></div>
          <span className="text-sm">Reservas específicas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-500/10 border border-orange-500/20 rounded"></div>
          <span className="text-sm">Pendiente aprobación</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-utfsm-red/10 border border-utfsm-red/20 rounded"></div>
          <span className="text-sm">Ocupado</span>
        </div>
      </div>
    </Card>
  );
}
