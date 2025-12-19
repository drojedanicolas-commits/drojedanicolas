
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Appointment, ServiceType, SourceType } from '../types';
import { createChat } from '../services/geminiService';

interface SecretaryChatProps {
  onAddAppointment: (apt: Appointment) => void;
  prices: Record<string, number>;
  appointments: Appointment[];
}

const SecretaryChat: React.FC<SecretaryChatProps> = ({ onAddAppointment, prices, appointments }) => {
  const [selectedSource, setSelectedSource] = useState<SourceType>('WhatsApp');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: '¡Hola! 👨‍⚕️ Soy la asistente del Dr. Rodríguez. ¿En qué puedo ayudarte hoy? ¿Buscabas un turno para Traumatología o Posturología?', 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = createChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input, timestamp: new Date(), source: selectedSource };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const prompt = `[Canal: ${selectedSource}] El paciente dice: ${input}`;
      const response = await chatRef.current.sendMessage({ message: prompt });
      
      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          if (call.name === 'bookAppointment') {
            const args = call.args as any;
            const newApt: Appointment = {
              id: Math.random().toString(36).substr(2, 9),
              patientName: args.patientName,
              date: args.date,
              time: args.time,
              service: args.service as ServiceType,
              cost: prices[args.service] || 5000,
              status: 'confirmed',
              source: args.source || selectedSource,
              isFollowUp: args.service === ServiceType.FOLLOW_UP
            };
            onAddAppointment(newApt);
            const toolResponse = await chatRef.current.sendMessage({ message: `SISTEMA: Turno agendado con éxito. Confirma al paciente.` });
            setMessages(prev => [...prev, { role: 'assistant', content: toolResponse.text, timestamp: new Date() }]);
          } else if (call.name === 'getAvailableSlots') {
            const toolResponse = await chatRef.current.sendMessage({ message: `SISTEMA: Informa que hay cupos libres a las 09:00, 11:30 y 16:00 para esa fecha.` });
            setMessages(prev => [...prev, { role: 'assistant', content: toolResponse.text, timestamp: new Date() }]);
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text, timestamp: new Date() }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Lo siento, tuve un problema de conexión. ¿Podrías repetir eso?", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-100 rounded-[2.5rem] shadow-2xl border-8 border-white overflow-hidden max-w-md mx-auto relative">
      {/* Barra de Estado tipo Celular */}
      <div className="bg-white px-8 py-2 flex justify-between items-center border-b border-slate-100">
        <span className="text-[10px] font-black text-slate-800">9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
          <div className="w-3 h-3 bg-slate-800 rounded-full opacity-20"></div>
        </div>
      </div>

      {/* Header Estilo WhatsApp */}
      <div className={`p-4 text-white flex items-center justify-between ${
        selectedSource === 'WhatsApp' ? 'bg-[#075e54]' : 'bg-blue-600'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">DR</div>
          <div>
            <h3 className="font-bold text-sm">Asistente Dr. Rodríguez</h3>
            <p className="text-[9px] opacity-70">En línea ahora</p>
          </div>
        </div>
        <select 
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value as SourceType)}
          className="bg-black/20 text-[9px] font-bold px-2 py-1 rounded-lg outline-none border-none"
        >
          <option value="WhatsApp">Modo WhatsApp</option>
          <option value="Web">Modo Link Web</option>
        </select>
      </div>

      {/* Mensajes */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5] pattern-dots">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs shadow-sm ${
              m.role === 'user' 
                ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' 
                : 'bg-white text-slate-800 rounded-tl-none'
            }`}>
              <p className="leading-tight">{m.content}</p>
              <p className="text-[8px] text-slate-400 text-right mt-1 uppercase font-bold">
                {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[9px] font-bold text-slate-500 w-fit animate-pulse">
            Escribiendo...
          </div>
        )}
      </div>

      {/* Entrada de Texto */}
      <form onSubmit={handleSend} className="p-3 bg-[#f0f0f0] flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-white rounded-full px-4 py-2 text-xs border-none outline-none shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-[#075e54] text-white p-2 rounded-full hover:scale-105 transition-all disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
        </button>
      </form>
    </div>
  );
};

export default SecretaryChat;
