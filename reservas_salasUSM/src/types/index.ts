export interface Room {
  id: string;
  number: string;
  capacity: number;
  equipment: Equipment[];
  type: RoomType;
  schedule: Schedule;
  isAvailable: boolean;
  nextReservation?: string;
}

export interface Building {
  id: string;
  name: string;
  code: string;
  totalRooms: number;
  rooms: Room[];
}

export interface Equipment {
  id: string;
  name: string;
  icon: string;
  working: boolean;
}

export interface Schedule {
  [key: string]: TimeSlot[]; // Lunes, Martes, etc.
}

export interface SpecificDateReservation {
  date: string; // Formato ISO date string
  subject: string;
  professor: string;
  activityType: 'reunion' | 'control' | 'certamen' | 'ayudantia' | 'otro' | 'evento-inamovible';
}

export interface TimeSlot {
  block: number; // 1-10 (bloques de 70 minutos con intervalos de 15 min desde 08:15)
  status: 'disponible' | 'ocupado' | 'reservado-evento' | 'reservado-especifico' | 'pendiente';
  subject?: string;
  professor?: string;
  group?: string;
  reservationId?: string;
  eventName?: string; // Para bloques reservados para eventos
  eventDate?: string; // Fecha del evento futuro
  specificDateReservations?: SpecificDateReservation[]; // Para reservas por fecha específica
}

export interface Reservation {
  id: string;
  roomId: string;
  day: string;
  block: number;
  subject: string;
  professor: string;
  group: string;
  createdAt: Date;
}

export interface ExceptionRequest {
  id: string;
  roomId: string;
  roomNumber: string;
  buildingCode: string;
  day: string;
  block: number;
  professor: string;
  subject: string;
  conflicts: ConflictDate[];
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface ConflictDate {
  date: string;
  activityType: string;
  professor: string;
  subject: string;
}

export type RoomType = 'Aula' | 'Laboratorio' | 'Auditorio' | 'Sala de Estudio' | 'Sala de Conferencias';