import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Building, Room } from '../types';
import { buildings as initialBuildings } from '../data/mockData';
import { RoomSimpleCard } from '../components/RoomSimpleCard';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import universityLogo from "../assets/logo.png";

export function BuildingDetailPage() {
  const { buildingId } = useParams<{ buildingId: string }>();
  const navigate = useNavigate();
  const [building, setBuilding] = useState<Building | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const foundBuilding = initialBuildings.find(b => b.id === buildingId);
    setBuilding(foundBuilding || null);
    setIsLoading(false);
  }, [buildingId]);

  if (!buildingId) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <h3 className="text-muted-foreground mb-2">Cargando...</h3>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="text-center py-12">
        <h3 className="text-muted-foreground mb-2">Edificio no encontrado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Building ID: {buildingId}
        </p>
        <Button onClick={() => navigate('/')}>
          Volver a Edificios
        </Button>
      </div>
    );
  }

  const handleRoomClick = (room: Room) => {
    navigate(`/building/${buildingId}/room/${room.id}`);
  };

  return (
    <>
      {/* Header con fondo degradado */}
      <div className="bg-gradient-to-r from-utfsm-blue/5 to-utfsm-navy/5 border-b -mt-8 -mx-4 md:-mx-6 mb-6">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex-shrink-0">
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
    </>
  );
}
