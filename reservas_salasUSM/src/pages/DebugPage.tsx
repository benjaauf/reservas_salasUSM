import { buildings } from '../data/mockData';

export function DebugPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2>Información de Debug - Edificios y Salas</h2>
        <p className="text-muted-foreground">Esta página muestra la estructura de datos para debug</p>
      </div>

      {buildings.map((building) => (
        <div key={building.id} className="border rounded-lg p-4 space-y-4">
          <div>
            <h3>{building.name}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">ID del edificio:</span> <code className="bg-muted px-2 py-1 rounded">{building.id}</code>
              </div>
              <div>
                <span className="font-medium">Código:</span> <code className="bg-muted px-2 py-1 rounded">{building.code}</code>
              </div>
              <div className="col-span-2">
                <span className="font-medium">URL del edificio:</span>{' '}
                <code className="bg-muted px-2 py-1 rounded">/#/building/{building.id}</code>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-2">Salas ({building.rooms.length})</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              {building.rooms.map((room) => (
                <div key={room.id} className="border rounded p-2 space-y-1">
                  <div>
                    <span className="font-medium">ID:</span> <code className="bg-muted px-1 py-0.5 rounded text-xs">{room.id}</code>
                  </div>
                  <div>
                    <span className="font-medium">Número:</span> {room.number}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    URL: <code className="bg-muted px-1 py-0.5 rounded">/#/building/{building.id}/room/{room.id}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
