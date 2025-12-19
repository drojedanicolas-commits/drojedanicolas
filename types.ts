
export enum ServiceType {
  TRAUMATOLOGY = 'Consulta Traumatología',
  POSTUROLOGY = 'Estudio de Posturología',
  FOLLOW_UP = 'Control'
}

export type SourceType = 'WhatsApp' | 'Instagram' | 'Email' | 'Web';

export interface Appointment {
  id: string;
  patientName: string;
  date: string;
  time: string;
  service: ServiceType;
  cost: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  source: SourceType;
  isFollowUp: boolean;
}

export interface PriceConfig {
  [key: string]: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: SourceType;
}

export interface Lead {
  id: string;
  name: string;
  message: string;
  source: SourceType;
  timestamp: Date;
}

export interface IntegrationConfig {
  evolutionApiUrl: string;
  evolutionApiKey: string;
  instagramWebhook: string;
  emailService: string;
  status: {
    whatsapp: 'connected' | 'disconnected';
    instagram: 'connected' | 'disconnected';
    email: 'connected' | 'disconnected';
  }
}
