import { useNavigate } from 'react-router-dom';
import { buildings as initialBuildings } from '../data/mockData';
import { BuildingCard } from '../components/BuildingCard';
import { Building2 } from 'lucide-react';
import { Building } from '../types';

export function BuildingsPage() {
  const navigate = useNavigate();

  const handleBuildingClick = (building: Building) => {
    navigate(`/building/${building.id}`);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {initialBuildings.map((building) => (
          <BuildingCard
            key={building.id}
            building={building}
            onClick={() => handleBuildingClick(building)}
          />
        ))}
      </div>

      {initialBuildings.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-muted-foreground mb-2">No se encontraron edificios</h3>
          <p className="text-sm text-muted-foreground">
            No hay edificios disponibles
          </p>
        </div>
      )}
    </>
  );
}
