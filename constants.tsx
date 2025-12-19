
import { ServiceType, Appointment, PriceConfig, Lead } from './types';

export const INITIAL_PRICES: PriceConfig = {
  [ServiceType.TRAUMATOLOGY]: 5000,
  [ServiceType.POSTUROLOGY]: 8500,
  [ServiceType.FOLLOW_UP]: 3000,
};

// Función para generar datos de prueba del último año
const generateHistoricData = (): Appointment[] => {
  const data: Appointment[] = [];
  const now = new Date();
  const sources: any[] = ['WhatsApp', 'Instagram', 'Email', 'Web'];
  const services = Object.values(ServiceType);
  const hours = ['09:00', '10:00', '11:00', '15:00', '16:00', '17:00'];

  for (let i = 0; i < 300; i++) {
    const date = new Date();
    date.setMonth(now.getMonth() - Math.floor(Math.random() * 12));
    date.setDate(Math.floor(Math.random() * 28) + 1);
    
    const service = services[Math.floor(Math.random() * services.length)];
    const statusRand = Math.random();
    
    data.push({
      id: `hist-${i}`,
      patientName: `Paciente Histórico ${i}`,
      date: date.toISOString().split('T')[0],
      time: hours[Math.floor(Math.random() * hours.length)],
      service: service as ServiceType,
      cost: INITIAL_PRICES[service as ServiceType],
      status: statusRand > 0.8 ? 'cancelled' : statusRand > 0.2 ? 'completed' : 'confirmed',
      source: sources[Math.floor(Math.random() * sources.length)],
      isFollowUp: service === ServiceType.FOLLOW_UP || Math.random() > 0.7
    });
  }
  return data;
};

export const INITIAL_APPOINTMENTS: Appointment[] = generateHistoricData();

export const MOCK_LEADS: Lead[] = [
  { id: 'l1', name: 'Laura M.', message: 'Hola! Precio de posturología?', source: 'Instagram', timestamp: new Date() },
  { id: 'l2', name: 'Pedro S.', message: 'Tienen turno para mañana?', source: 'WhatsApp', timestamp: new Date() },
];

export const APP_CONFIG = {
  doctorName: "Dr. Carlos Rodríguez",
  specialties: ["Traumatología", "Posturología"],
  workHours: "Lunes a Viernes de 9:00 a 18:00"
};
