import { Building, Room, Equipment, Schedule, TimeSlot, SpecificDateReservation } from '../types';

const equipmentList: Equipment[] = [
  { id: '1', name: 'Proyector', icon: 'Projector', working: true },
  { id: '2', name: 'Computadora', icon: 'Monitor', working: true },
  { id: '3', name: 'Audio', icon: 'Volume2', working: true },
  { id: '4', name: 'Pizarra Digital', icon: 'Tablet', working: true },
  { id: '5', name: 'Red WiFi', icon: 'Wifi', working: true },
];

const subjects = [
  'Matemáticas I', 'Física I', 'Química General', 'Programación I', 'Cálculo I',
  'Álgebra Lineal', 'Estadística', 'Base de Datos', 'Estructuras de Datos',
  'Análisis Matemático', 'Mecánica', 'Termodinámica', 'Electromagnetismo',
  'Ingeniería de Software', 'Redes de Computadores', 'Inteligencia Artificial'
];

const professors = [
  'Dr. García', 'Ing. López', 'Dra. Martínez', 'Prof. Rodríguez', 'Dr. Fernández',
  'Ing. Sánchez', 'Dra. Morales', 'Prof. Herrera', 'Dr. Castillo', 'Ing. Vargas'
];

const groups = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2'];

const events = [
  { name: 'Conferencia IA', date: '15/11/2025' },
  { name: 'Simposio Ingeniería', date: '20/11/2025' },
  { name: 'Taller Robótica', date: '25/11/2025' },
  { name: 'Seminario Innovación', date: '02/12/2025' },
  { name: 'Charla Tecnología', date: '08/12/2025' },
];

const activityTypes: ('reunion' | 'control' | 'certamen' | 'ayudantia' | 'otro' | 'evento-inamovible')[] = [
  'reunion', 'control', 'certamen', 'ayudantia', 'otro', 'evento-inamovible'
];

// Generar fechas específicas para reservas que coincidan con el día de la semana
const generateSpecificDates = (count: number, dayOfWeek: number): SpecificDateReservation[] => {
  const reservations: SpecificDateReservation[] = [];
  const baseDate = new Date(2025, 9, 15); // 15 de octubre de 2025 (es miércoles)
  
  // Encontrar el próximo día que coincida con dayOfWeek
  const currentDay = baseDate.getDay();
  let daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
  if (daysUntilTarget === 0) daysUntilTarget = 7; // Si es el mismo día, ir a la próxima semana
  
  const firstMatchingDate = new Date(baseDate);
  firstMatchingDate.setDate(baseDate.getDate() + daysUntilTarget);
  
  // Generar 'count' fechas, cada una en una semana diferente
  for (let i = 0; i < count; i++) {
    const date = new Date(firstMatchingDate);
    date.setDate(firstMatchingDate.getDate() + (i * 7)); // Añadir semanas
    
    reservations.push({
      date: date.toISOString(),
      subject: subjects[Math.floor(Math.random() * subjects.length)],
      professor: professors[Math.floor(Math.random() * professors.length)],
      activityType: activityTypes[Math.floor(Math.random() * activityTypes.length)]
    });
  }
  
  return reservations;
};

const generateSchedule = (): Schedule => {
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const dayToNumber: Record<string, number> = {
    'Domingo': 0,
    'Lunes': 1,
    'Martes': 2,
    'Miércoles': 3,
    'Jueves': 4,
    'Viernes': 5,
    'Sábado': 6
  };
  const schedule: Schedule = {};
  
  days.forEach(day => {
    const daySlots: TimeSlot[] = [];
    const dayOfWeek = dayToNumber[day];
    
    // Generar exactamente 10 bloques de 70 minutos cada uno (desde 08:15)
    // Bloque 1: 08:15-09:25, Bloque 2: 09:40-10:50, etc.
    // Con intervalos de 15 minutos entre cada bloque
    
    for (let block = 1; block <= 10; block++) {
      // Fin de semana tiene menos ocupación
      const isWeekend = day === 'Sábado' || day === 'Domingo';
      const occupancyRate = isWeekend ? 0.1 : 0.25;
      const eventRate = isWeekend ? 0.15 : 0.3;
      const specificReservationRate = isWeekend ? 0.05 : 0.2; // 20% en semana, 5% fin de semana
      
      const random = Math.random();
      
      if (random < specificReservationRate) {
        // Crear un bloque con reservas por fecha específica
        const numReservations = 2 + Math.floor(Math.random() * 4); // 2-5 reservas
        const slot: TimeSlot = {
          block,
          status: 'reservado-especifico',
          specificDateReservations: generateSpecificDates(numReservations, dayOfWeek)
        };
        daySlots.push(slot);
      } else if (random < eventRate + specificReservationRate) {
        // Crear un bloque reservado para evento (ahora como reserva específica)
        const event = events[Math.floor(Math.random() * events.length)];
        
        // Generar una fecha que coincida con el día de la semana
        const baseDate = new Date(2025, 9, 15); // 15 de octubre de 2025
        const currentDay = baseDate.getDay();
        let daysUntilTarget = (dayOfWeek - currentDay + 7) % 7;
        if (daysUntilTarget === 0) daysUntilTarget = 7;
        
        const eventDate = new Date(baseDate);
        eventDate.setDate(baseDate.getDate() + daysUntilTarget + Math.floor(Math.random() * 8) * 7); // 1-8 semanas adelante
        
        const slot: TimeSlot = {
          block,
          status: 'reservado-especifico',
          specificDateReservations: [{
            date: eventDate.toISOString(),
            subject: event.name,
            professor: 'Departamento',
            activityType: 'evento-inamovible'
          }]
        };
        daySlots.push(slot);
      } else if (random < occupancyRate + eventRate + specificReservationRate) {
        // Crear un bloque ocupado
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const professor = professors[Math.floor(Math.random() * professors.length)];
        const group = groups[Math.floor(Math.random() * groups.length)];
        
        const slot: TimeSlot = {
          block,
          status: 'ocupado',
          subject,
          professor,
          group
        };
        daySlots.push(slot);
      } else {
        // Crear un bloque disponible
        const slot: TimeSlot = {
          block,
          status: 'disponible'
        };
        daySlots.push(slot);
      }
    }
    
    schedule[day] = daySlots;
  });
  
  return schedule;
};

const generateRooms = (buildingCode: string): Room[] => {
  const rooms: Room[] = [];
  
  for (let i = 1; i <= 10; i++) {
    const roomNumber = `${buildingCode}-${i.toString().padStart(2, '0')}`;
    const capacity = [20, 30, 40, 50, 80, 100, 120][Math.floor(Math.random() * 7)];
    const roomTypes = ['Aula', 'Laboratorio', 'Auditorio', 'Sala de Estudio', 'Sala de Conferencias'];
    const type = roomTypes[Math.floor(Math.random() * roomTypes.length)] as any;
    
    // Asegurar que todas las salas tengan proyector (algunas funcionando, otras no)
    const projectorWorking = Math.random() > 0.3; // 70% de probabilidad de que funcione
    const projector: Equipment = {
      id: `projector-${buildingCode}-${i}`,
      name: 'Proyector',
      icon: 'Projector',
      working: projectorWorking
    };
    
    // Seleccionar equipamiento adicional aleatorio (excluyendo proyector porque ya lo agregamos)
    const otherEquipment = equipmentList.filter(eq => eq.name !== 'Proyector');
    const shuffledEquipment = [...otherEquipment].sort(() => 0.5 - Math.random());
    const additionalEquipment = shuffledEquipment.slice(0, 2 + Math.floor(Math.random() * 3));
    
    // Combinar proyector obligatorio con equipamiento adicional
    const equipment = [projector, ...additionalEquipment];
    
    // Generar horario
    const schedule = generateSchedule();
    
    // Determinar disponibilidad basada en el horario actual
    // Para simplificar, asumimos que es lunes a las 10:00 (bloque 2: 09:40-10:50)
    const currentDay = 'Lunes';
    const currentBlock = 2; // Bloque 2: 09:40-10:50
    const currentSlot = schedule[currentDay]?.find(slot => slot.block === currentBlock);
    const isAvailable = currentSlot?.status === 'disponible';
    
    // Si no está disponible, buscar el próximo bloque libre
    let nextReservation: string | undefined;
    if (!isAvailable) {
      // Buscar en el día actual primero
      const todaySlots = schedule[currentDay] || [];
      const nextFreeSlot = todaySlots.find(slot => slot.block > currentBlock && slot.status === 'disponible');
      
      if (nextFreeSlot) {
        // Calcular tiempo: cada bloque empieza en: 08:15 + (bloque-1) * 85 minutos (70 min clase + 15 min intervalo)
        const startMinutes = 495 + (nextFreeSlot.block - 1) * 85; // 8:15 AM = 495 minutos
        const startHour = Math.floor(startMinutes / 60);
        const startMin = startMinutes % 60;
        nextReservation = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
      } else {
        nextReservation = '08:15 (mañana)';
      }
    }
    
    rooms.push({
      id: `${buildingCode}-${i}`,
      number: roomNumber,
      capacity,
      equipment,
      type,
      schedule,
      isAvailable,
      nextReservation,
    });
  }
  
  return rooms;
};

const createBuilding = (id: string, name: string, code: string): Building => {
  const rooms = generateRooms(code);
  
  // Configuraciones especiales por edificio
  if (code === 'M') {
    // M-02 debe tener una reserva de fecha específica en bloque 1 del día Lunes
    const m02 = rooms.find(r => r.number === 'M-02');
    if (m02) {
      const lunesSlots = m02.schedule['Lunes'];
      const bloque1Index = lunesSlots.findIndex(slot => slot.block === 1);
      
      if (bloque1Index !== -1) {
        // Crear una fecha específica para un lunes (día 1 de la semana)
        const baseDate = new Date(2025, 9, 20); // 20 de octubre de 2025 (es lunes)
        
        lunesSlots[bloque1Index] = {
          block: 1,
          status: 'reservado-especifico',
          specificDateReservations: [
            {
              date: baseDate.toISOString(),
              subject: 'Taller de Programación Avanzada',
              professor: 'Dr. García',
              activityType: 'ayudantia'
            },
            {
              date: new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              subject: 'Sesión de Consultas',
              professor: 'Dr. García',
              activityType: 'otro'
            },
            {
              date: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              subject: 'Laboratorio de Electrónica',
              professor: 'Ing. López',
              activityType: 'reunion'
            }
          ]
        };
      }
    }
  }
  
  if (code === 'C') {
    // Una sala del edificio C debe tener capacidad 60 y bloque 2 (3-4) del jueves disponible
    const c05 = rooms.find(r => r.number === 'C-05');
    if (c05) {
      // Cambiar capacidad a 60
      c05.capacity = 60;
      
      // Asegurar que el bloque 2 del jueves esté disponible
      const juevesSlots = c05.schedule['Jueves'];
      const bloque2Index = juevesSlots.findIndex(slot => slot.block === 2);
      
      if (bloque2Index !== -1) {
        juevesSlots[bloque2Index] = {
          block: 2,
          status: 'disponible'
        };
      }
    }
  }
  
  return {
    id,
    name,
    code,
    totalRooms: 10,
    rooms,
  };
};

export const buildings: Building[] = [
  createBuilding('1', 'Edificio M', 'M'),
  createBuilding('2', 'Edificio R', 'R'),
  createBuilding('3', 'Edificio C', 'C'),
  createBuilding('4', 'Edificio B', 'B'),
  createBuilding('5', 'Edificio F', 'F'),
  createBuilding('6', 'Edificio E', 'E'),
  createBuilding('7', 'Edificio D', 'D'),
  createBuilding('8', 'Edificio A', 'A'),
  createBuilding('9', 'Edificio U', 'U'),
];

// Solicitudes de excepción para la secretaría
export const exceptionRequests: import('../types').ExceptionRequest[] = [
  {
    id: 'req-001',
    roomId: 'M-02',
    roomNumber: 'M-02',
    buildingCode: 'M',
    day: 'Lunes',
    block: 1,
    professor: 'Dra. Martínez',
    subject: 'Cálculo Avanzado',
    conflicts: [
      {
        date: '2025-10-20',
        activityType: 'Control',
        professor: 'Dr. García',
        subject: 'Taller de Programación Avanzada'
      },
      {
        date: '2025-11-03',
        activityType: 'Certamen',
        professor: 'Dr. García',
        subject: 'Taller de Programación Avanzada'
      }
    ],
    message: 'Esta asignatura es fundamental para el primer semestre y no hay otros horarios disponibles que no generen conflictos con otras materias del plan de estudios. Los estudiantes necesitan este bloque específico para poder asistir a todas sus clases obligatorias.',
    status: 'pending',
    createdAt: new Date('2025-11-05T10:30:00')
  },
  {
    id: 'req-002',
    roomId: 'C-05',
    roomNumber: 'C-05',
    buildingCode: 'C',
    day: 'Jueves',
    block: 2,
    professor: 'Prof. Rodríguez',
    subject: 'Física Cuántica',
    conflicts: [
      {
        date: '2025-11-13',
        activityType: 'Evento Inamovible',
        professor: 'Varios',
        subject: 'Conferencia de Física Moderna'
      }
    ],
    message: 'El curso tiene 45 estudiantes y necesitamos una sala con capacidad adecuada. Esta es la única sala disponible en este horario que puede acomodar a todos los alumnos.',
    status: 'pending',
    createdAt: new Date('2025-11-05T14:15:00')
  },
  {
    id: 'req-003',
    roomId: 'R-03',
    roomNumber: 'R-03',
    buildingCode: 'R',
    day: 'Martes',
    block: 3,
    professor: 'Ing. López',
    subject: 'Estructuras de Datos',
    conflicts: [
      {
        date: '2025-10-28',
        activityType: 'Ayudantía',
        professor: 'Dr. Fernández',
        subject: 'Algoritmos'
      },
      {
        date: '2025-11-11',
        activityType: 'Control',
        professor: 'Dr. Fernández',
        subject: 'Algoritmos'
      },
      {
        date: '2025-11-25',
        activityType: 'Certamen',
        professor: 'Dr. Fernández',
        subject: 'Algoritmos'
      }
    ],
    status: 'pending',
    createdAt: new Date('2025-11-06T09:00:00')
  },
  {
    id: 'req-004',
    roomId: 'B-01',
    roomNumber: 'B-01',
    buildingCode: 'B',
    day: 'Miércoles',
    block: 4,
    professor: 'Dra. Morales',
    subject: 'Termodinámica',
    conflicts: [
      {
        date: '2025-11-19',
        activityType: 'Reunión',
        professor: 'Prof. Herrera',
        subject: 'Mecánica de Fluidos'
      }
    ],
    message: 'Necesitamos realizar experimentos prácticos que requieren el equipo específico de esta sala. No hay alternativas disponibles con el mismo equipamiento.',
    status: 'pending',
    createdAt: new Date('2025-11-06T11:45:00')
  }
];