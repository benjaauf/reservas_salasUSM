import { useState } from 'react';
import { Building, Room } from '../types';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { RoomSimpleCard } from './RoomSimpleCard';
import { RoomDetail } from './RoomDetail';
import universityLogo from 'figma:asset/c524cf61cfc13760af5d9cb5c3b03457a6407bae.png';

interface BuildingRoomsProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
  onBuildingUpdate: (building: Building) => void;
}

export function BuildingRooms({ building, isOpen, onClose, onBuildingUpdate }: BuildingRoomsProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isRoomDetailOpen, setIsRoomDetailOpen] = useState(false);

  if (!building || !isOpen) return null;

  const handleRoomClick = (room: Room) => {
    // Buscar la sala actualizada en el building actual
    const updatedRoom = building.rooms.find(r => r.id === room.id) || room;
    setSelectedRoom(updatedRoom);
    setIsRoomDetailOpen(true);
  };

  const handleRoomDetailClose = () => {
    setIsRoomDetailOpen(false);
    setSelectedRoom(null);
  };

  const handleRoomUpdate = (updatedRoom: Room) => {
    const updatedBuilding = {
      ...building,
      rooms: building.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
    };
    onBuildingUpdate(updatedBuilding);
    setSelectedRoom(updatedRoom);
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
              <h1 className="text-utfsm-blue">{building.name}</h1>
              <p className="text-muted-foreground">Código: {building.code} • {building.rooms.length} salas disponibles</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin">
        <div className="container mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {building.rooms.map((room) => (
              <RoomSimpleCard
                key={room.id}
                room={room}
                onClick={() => handleRoomClick(room)}
                buildingCode={building.code}
              />
            ))}
          </div>
        </div>
      </div>
      
      <RoomDetail
        room={selectedRoom}
        isOpen={isRoomDetailOpen}
        onClose={handleRoomDetailClose}
        onRoomUpdate={handleRoomUpdate}
      />
    </div>
  );
}