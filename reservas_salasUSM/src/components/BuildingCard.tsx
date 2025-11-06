import { Building } from '../types';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Building2, Users } from 'lucide-react';

interface BuildingCardProps {
  building: Building;
  onClick: () => void;
}

export function BuildingCard({ building, onClick }: BuildingCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-utfsm-blue/10 rounded-lg">
            <Building2 className="h-6 w-6 text-utfsm-blue" />
          </div>
          <div>
            <h3 className="font-medium no-underline">{building.name}</h3>
            <p className="text-muted-foreground"></p>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
      </div>
      
      <Button className="w-full mt-4 border-utfsm-blue text-utfsm-blue hover:bg-utfsm-blue hover:text-white" variant="outline">
        Ver salas
      </Button>
    </Card>
  );
}