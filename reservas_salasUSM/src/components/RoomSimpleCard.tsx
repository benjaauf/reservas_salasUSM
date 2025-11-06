import { Room } from '../types';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Users, Monitor, Wifi, Volume2, Projector, Tablet, Wind, CheckCircle, XCircle } from 'lucide-react';

interface RoomSimpleCardProps {
  room: Room;
  onClick: () => void;
  buildingCode: string;
}

export function RoomSimpleCard({ room, onClick, buildingCode }: RoomSimpleCardProps) {
  
  // Extraer el número de sala del room.number (ej: "A-01" -> "01")
  const roomNumber = room.number.split('-')[1] || room.id.split('-')[1];
  
  const iconMap = {
    monitor: Monitor,
    wifi: Wifi,
    audio: Volume2,
    projector: Projector,
    tablet: Tablet,
    climate: Wind,
  };
  
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };
  
  return (
    <Card className="p-3 md:p-4 hover:shadow-lg transition-shadow">
      <div className="space-y-2 md:space-y-3">
        {/* Título con inicial del departamento */}
        <div className="flex items-center justify-between">
          <h4 className="text-sm md:text-base">Sala {buildingCode.charAt(0)}{roomNumber}</h4>
        </div>
        
        {/* Información básica */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{room.capacity} personas</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {room.type}
          </div>
        </div>
        
        {/* Equipamiento siempre visible */}
        <div className="border-t pt-3 space-y-2">
          <h5 className="text-sm font-medium">Equipamiento disponible:</h5>
          <div className="space-y-2">
            {room.equipment.map((eq) => {
              const IconComponent = iconMap[eq.icon as keyof typeof iconMap];
              return (
                <div key={eq.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    {IconComponent && <IconComponent className="h-3 w-3 text-muted-foreground" />}
                    <span>{eq.name}</span>
                  </div>
                  {eq.working ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <XCircle className="h-3 w-3 text-red-600" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Botón para ver detalles completos */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={handleCardClick}
        >
          Ver horario
        </Button>
      </div>
    </Card>
  );
}