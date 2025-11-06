import { useState } from 'react';
import type { Building } from '../types';
import { buildings as initialBuildings } from '../data/mockData';
import { BuildingCard } from '../components/BuildingCard';
import { BuildingRooms } from '../components/BuildingRooms';
import { Building2 } from 'lucide-react';

export function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [isRoomsOpen, setIsRoomsOpen] = useState(false);

  const handleBuildingClick = (building: Building) => {
    const updatedBuilding = buildings.find(b => b.id === building.id) || building;
    setSelectedBuilding(updatedBuilding);
    setIsRoomsOpen(true);
  };

  const handleRoomsClose = () => {
    setIsRoomsOpen(false);
    setSelectedBuilding(null);
  };

  const handleBuildingUpdate = (updatedBuilding: Building) => {
    setBuildings(prevBuildings => 
      prevBuildings.map(b => b.id === updatedBuilding.id ? updatedBuilding : b)
    );
    setSelectedBuilding(updatedBuilding);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {buildings.map((building) => (
          <BuildingCard
            key={building.id}
            building={building}
            onClick={() => handleBuildingClick(building)}
          />
        ))}
      </div>

      {buildings.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-muted-foreground mb-2">No se encontraron edificios</h3>
          <p className="text-sm text-muted-foreground">
            No hay edificios disponibles
          </p>
        </div>
      )}

      <BuildingRooms
        building={selectedBuilding}
        isOpen={isRoomsOpen}
        onClose={handleRoomsClose}
        onBuildingUpdate={handleBuildingUpdate}
      />
    </>
  );
}
