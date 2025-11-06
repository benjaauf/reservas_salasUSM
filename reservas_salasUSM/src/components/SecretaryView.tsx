import { useState } from 'react';
import { ExceptionRequest } from '../types';
import { exceptionRequests as initialRequests } from '../data/mockData';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  BookOpen,
  MessageSquare,
  FileText,
  ChevronDown
} from 'lucide-react';
import { format, parseISO } from 'date-fns@4.1.0';
import { es } from 'date-fns@4.1.0/locale';

export function SecretaryView() {
  const [requests, setRequests] = useState<ExceptionRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<ExceptionRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set());

  const formatActivityType = (type: string) => {
    const types: Record<string, string> = {
      'reunion': 'Reunión',
      'control': 'Control',
      'certamen': 'Certamen',
      'ayudantia': 'Ayudantía',
      'otro': 'Otro',
      'evento-inamovible': 'Evento Inamovible'
    };
    return types[type.toLowerCase()] || type;
  };

  const getBlockTimeLabel = (block: number) => {
    // Bloques de 70 minutos con intervalos de 15 minutos, empezando a las 8:15
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

  const handleAction = (request: ExceptionRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setIsDialogOpen(true);
    setResponseMessage('');
  };

  const handleConfirmAction = () => {
    if (!selectedRequest || !actionType) return;

    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: actionType === 'approve' ? 'approved' : 'rejected' }
          : req
      )
    );

    setIsDialogOpen(false);
    setSelectedRequest(null);
    setActionType(null);
    setResponseMessage('');
  };

  const handleCancelAction = () => {
    setIsDialogOpen(false);
    setSelectedRequest(null);
    setActionType(null);
    setResponseMessage('');
  };

  const toggleRequest = (requestId: string) => {
    setExpandedRequests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Solicitudes pendientes */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-utfsm-gold" />
          <h2 className="text-utfsm-blue">Solicitudes Pendientes</h2>
          {pendingRequests.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {pendingRequests.length}
            </Badge>
          )}
        </div>

        {pendingRequests.length === 0 ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-utfsm-green mx-auto mb-4" />
            <h3 className="text-muted-foreground mb-2">No hay solicitudes pendientes</h3>
            <p className="text-sm text-muted-foreground">
              Todas las solicitudes de excepción han sido procesadas
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => {
              const isExpanded = expandedRequests.has(request.id);
              
              return (
                <Collapsible 
                  key={request.id} 
                  open={isExpanded}
                  onOpenChange={() => toggleRequest(request.id)}
                >
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger className="w-full text-left hover:bg-muted/30 transition-colors">
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          {/* Resumen compacto */}
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Badge className="bg-utfsm-gold/10 text-utfsm-gold border-utfsm-gold/20 flex-shrink-0">
                              Pendiente
                            </Badge>
                            <div className="flex items-center gap-2 text-sm min-w-0 flex-1">
                              <User className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                              <span className="font-medium truncate">{request.professor}</span>
                              <span className="text-muted-foreground hidden sm:inline">•</span>
                              <span className="text-muted-foreground truncate hidden sm:inline">{request.subject}</span>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                              <MapPin className="h-4 w-4" />
                              <span>{request.roomNumber}</span>
                              <span>•</span>
                              <span>{request.day}</span>
                            </div>
                            <Badge variant="outline" className="flex-shrink-0">
                              {request.conflicts.length} {request.conflicts.length === 1 ? 'conflicto' : 'conflictos'}
                            </Badge>
                          </div>
                          <ChevronDown 
                            className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform ${
                              isExpanded ? 'transform rotate-180' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="px-4 pb-4 space-y-4 border-t pt-4">
                        {/* Información detallada */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                            <span className="font-medium">Sala:</span>
                            <span>{request.roomNumber} (Edificio {request.buildingCode})</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                            <span className="font-medium">Día:</span>
                            <span>{request.day}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-utfsm-blue flex-shrink-0" />
                            <span className="font-medium">Bloque:</span>
                            <span>{(request.block * 2) - 1}-{request.block * 2} ({getBlockTimeLabel(request.block)})</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Solicitado el {format(request.createdAt, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}</span>
                          </div>
                        </div>

                        {/* Conflictos detectados */}
                        <Alert className="border-utfsm-red/40 bg-utfsm-red/5">
                          <AlertTriangle className="h-4 w-4 text-utfsm-red" />
                          <AlertTitle className="text-utfsm-red">
                            {request.conflicts.length} {request.conflicts.length === 1 ? 'Conflicto detectado' : 'Conflictos detectados'}
                          </AlertTitle>
                          <AlertDescription className="text-sm space-y-2 mt-3">
                            <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin">
                              {request.conflicts.map((conflict, idx) => (
                                <div key={idx} className="bg-background/80 p-3 rounded border border-utfsm-red/20">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className="font-medium text-utfsm-red">
                                      {format(parseISO(conflict.date), "EEEE, dd 'de' MMMM yyyy", { locale: es })}
                                    </span>
                                    <Badge variant="outline" className="text-xs">
                                      {formatActivityType(conflict.activityType)}
                                    </Badge>
                                  </div>
                                  <div className="text-xs text-muted-foreground space-y-0.5">
                                    <div>Profesor: {conflict.professor}</div>
                                    <div>Asignatura: {conflict.subject}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>

                        {/* Mensaje del profesor */}
                        {request.message && (
                          <div className="bg-muted/30 p-4 rounded-lg border">
                            <div className="flex items-center gap-2 mb-2">
                              <MessageSquare className="h-4 w-4 text-utfsm-blue" />
                              <span className="font-medium text-sm">Mensaje del solicitante:</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {request.message}
                            </p>
                          </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            onClick={() => handleAction(request, 'approve')}
                            className="flex-1 bg-utfsm-green hover:bg-utfsm-green/90"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Aprobar
                          </Button>
                          <Button
                            onClick={() => handleAction(request, 'reject')}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
        )}
      </div>

      {/* Solicitudes procesadas */}
      {processedRequests.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-muted-foreground">Solicitudes Procesadas</h3>
            <Badge variant="outline" className="ml-2">
              {processedRequests.length}
            </Badge>
          </div>

          <div className="space-y-3">
            {processedRequests.map((request) => (
              <Card key={request.id} className="p-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Badge
                      className={
                        request.status === 'approved'
                          ? 'bg-utfsm-green/10 text-utfsm-green border-utfsm-green/20'
                          : 'bg-utfsm-red/10 text-utfsm-red border-utfsm-red/20'
                      }
                    >
                      {request.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                    </Badge>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{request.professor}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{request.subject}</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        Sala {request.roomNumber}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {request.day} Bloque {(request.block * 2) - 1}-{request.block * 2}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(request.createdAt, "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Diálogo de confirmación */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-utfsm-green" />
                  Aprobar Solicitud
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-utfsm-red" />
                  Rechazar Solicitud
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Está a punto de aprobar esta solicitud de excepción. El profesor podrá reservar la sala para todo el semestre.'
                : 'Está a punto de rechazar esta solicitud de excepción. El profesor será notificado de esta decisión.'}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Profesor:</span> {selectedRequest.professor}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Asignatura:</span> {selectedRequest.subject}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Sala:</span> {selectedRequest.roomNumber}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Horario:</span> {selectedRequest.day} - Bloque {(selectedRequest.block * 2) - 1}-{selectedRequest.block * 2}
                </div>
              </div>

              <div>
                <Label htmlFor="responseMessage">
                  Mensaje para el solicitante (opcional)
                </Label>
                <Textarea
                  id="responseMessage"
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'Agregar observaciones o condiciones para la aprobación...'
                      : 'Explicar el motivo del rechazo...'
                  }
                  className="mt-2 min-h-[100px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {responseMessage.length}/500 caracteres
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelAction}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={
                actionType === 'approve'
                  ? 'bg-utfsm-green hover:bg-utfsm-green/90'
                  : 'bg-utfsm-red hover:bg-utfsm-red/90'
              }
            >
              {actionType === 'approve' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
