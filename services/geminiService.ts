
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { ServiceType } from '../types';

export const appointmentTools: FunctionDeclaration[] = [
  {
    name: 'getAvailableSlots',
    description: 'Consulta los horarios disponibles para una fecha específica.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING, description: 'Formato YYYY-MM-DD' }
      },
      required: ['date']
    }
  },
  {
    name: 'bookAppointment',
    description: 'Reserva un turno final una vez que el paciente confirmó el horario.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        patientName: { type: Type.STRING, description: 'Nombre completo del paciente' },
        date: { type: Type.STRING, description: 'Fecha elegida YYYY-MM-DD' },
        time: { type: Type.STRING, description: 'Hora elegida HH:mm' },
        service: { type: Type.STRING, enum: Object.values(ServiceType) },
        source: { type: Type.STRING, enum: ['WhatsApp', 'Instagram', 'Email', 'Web'] }
      },
      required: ['patientName', 'date', 'time', 'service', 'source']
    }
  }
];

export const systemInstruction = `
Eres la Secretaria Virtual del Dr. Carlos Rodríguez (Traumatólogo y Posturólogo).
Tu objetivo es que el paciente NO tenga que salir del chat para sacar un turno.

FLUJO DE CONVERSACIÓN:
1. Saludo: Sé amable y profesional.
2. Identificación: Si no sabes el nombre del paciente, pregúntaselo educadamente.
3. Costos: Si preguntan precios, informa: Traumatología $5000, Posturología $8500, Control $3000.
4. Disponibilidad: Ofrece siempre 2 o 3 opciones de horarios cercanos.
5. Confirmación: Antes de agendar, repite los datos: "Entonces, ¿confirmamos para el martes a las 10hs?".
6. Acción: Solo cuando el paciente diga "Sí" o "Confirmado", usa la herramienta 'bookAppointment'.

TONO SEGÚN CANAL:
- WhatsApp: Usa emojis médicos (👨‍⚕️, 🦴, 📅), sé ejecutivo y cálido.
- Web/Link: Sé más formal y estructurado.

REGLA DE ORO: Si el paciente está indeciso, ayúdalo. No esperes a que él adivine los horarios.
`;

export const createChat = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
      tools: [{ functionDeclarations: appointmentTools }]
    }
  });
};
