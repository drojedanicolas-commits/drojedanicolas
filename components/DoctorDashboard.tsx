
import React, { useState } from 'react';
import { Appointment, PriceConfig, SourceType, Lead } from '../types';
import { MOCK_LEADS } from '../constants';
import StatsDashboard from './StatsDashboard';

interface DoctorDashboardProps {
  appointments: Appointment[];
  prices: PriceConfig;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
}

const SourceBadge: React.FC<{ source: SourceType }> = ({ source }) => {
  const colors = {
    WhatsApp: 'bg-green-100 text-green-700 border-green-200',
    Instagram: 'bg-pink-100 text-pink-700 border-pink-200',
    Email: 'bg-red-100 text-red-700 border-red-200',
    Web: 'bg-blue-100 text-blue-700 border-blue-200'
  };
  
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${colors[source]} font-bold`}>
      {source}
    </span>
  );
};

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ appointments, prices, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'agenda' | 'stats' | 'config' | 'integracion'>('agenda');
  const [n8nConfig, setN8nConfig] = useState({ isSyncing: false });

  const n8nBlueprint = `{
  "nodes": [
    { "type": "n8n-nodes-base.webhook", "name": "WhatsApp Input" },
    { "type": "n8n-nodes-base.googleGemini", "name": "AI Secretary" },
    { "type": "n8n-nodes-base.httpRequest", "name": "Update Dashboard" },
    { "type": "n8n-nodes-base.evolutionApi", "name": "Send WhatsApp" }
  ],
  "connections": { "Logic": "Flow sequence" }
}`;

  return (
    <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Panel Administrativo</h2>
            <span className="bg-orange-500 text-[10px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Easypanel Edition</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Gestión con infraestructura simplificada en Hostinger</p>
        </div>

        <button 
          onClick={() => {
            setN8nConfig({ isSyncing: true });
            setTimeout(() => setN8nConfig({ isSyncing: false }), 1500);
          }}
          disabled={n8nConfig.isSyncing}
          className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
        >
          <svg className={`w-4 h-4 ${n8nConfig.isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          {n8nConfig.isSyncing ? 'Sincronizando...' : 'Refrescar Canales'}
        </button>
      </header>

      <nav className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl w-fit overflow-x-auto max-w-full">
        {(['agenda', 'stats', 'integracion', 'config'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'agenda' ? '📅 Agenda' : tab === 'stats' ? '📊 Estadísticas' : tab === 'integracion' ? '🔗 Integración' : '⚙️ Configuración'}
          </button>
        ))}
      </nav>

      {activeTab === 'agenda' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <section className="lg:col-span-3 space-y-4">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Turnos de Hoy</h3>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
                   En línea
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Paciente</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Servicio</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Horario</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {appointments.slice(0, 10).map((apt) => (
                      <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 text-sm">{apt.patientName}</span>
                            <SourceBadge source={apt.source} />
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">{apt.service}</td>
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-400">{apt.time}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => onUpdateStatus(apt.id, 'completed')} className="text-green-600 bg-green-50 p-2 rounded-lg hover:bg-green-600 hover:text-white transition-all">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="bg-slate-900 rounded-3xl p-6 text-white h-fit">
            <h3 className="font-bold text-sm mb-6">WhatsApp Leads</h3>
            <div className="space-y-4">
              {MOCK_LEADS.map(lead => (
                <div key={lead.id} className="p-3 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[11px] font-bold">{lead.name}</p>
                  <p className="text-[10px] text-white/40 italic mt-1">"{lead.message}"</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-[8px] uppercase font-black text-green-400">Pendiente</span>
                    <button className="text-[10px] bg-white/10 px-2 py-1 rounded-md hover:bg-white/20">Responder</button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}

      {activeTab === 'integracion' && (
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
            <h3 className="text-lg font-black text-slate-800 mb-2">Diagrama de Conexión Exacto</h3>
            <p className="text-sm text-slate-500 mb-8">Sigue este flujo en n8n para conectar tu WhatsApp con este panel.</p>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8">
              <div className="w-full md:w-32 p-4 bg-green-50 border border-green-200 rounded-2xl text-center">
                <p className="text-[10px] font-black text-green-700 uppercase">Paso 1</p>
                <p className="text-xs font-bold text-green-800">WhatsApp (Evolution)</p>
              </div>
              <svg className="hidden md:block w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2"/></svg>
              <div className="w-full md:w-32 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-center">
                <p className="text-[10px] font-black text-blue-700 uppercase">Paso 2</p>
                <p className="text-xs font-bold text-blue-800">Cerebro (n8n)</p>
              </div>
              <svg className="hidden md:block w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2"/></svg>
              <div className="w-full md:w-32 p-4 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                <p className="text-[10px] font-black text-purple-700 uppercase">Paso 3</p>
                <p className="text-xs font-bold text-purple-800">IA (Gemini)</p>
              </div>
              <svg className="hidden md:block w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeWidth="2"/></svg>
              <div className="w-full md:w-32 p-4 bg-orange-50 border border-orange-200 rounded-2xl text-center">
                <p className="text-[10px] font-black text-orange-700 uppercase">Paso 4</p>
                <p className="text-xs font-bold text-orange-800">Panel Médico (Aquí)</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h4 className="font-bold text-slate-800">1. Desplegar esta App en Easypanel</h4>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-xs text-slate-600 mb-2">Para que esta app viva en tu Hostinger:</p>
                <ol className="text-xs text-slate-500 list-decimal ml-4 space-y-1">
                  <li>En Easypanel, crea un nuevo <strong>Project</strong>.</li>
                  <li>Elige <strong>Static Site</strong>.</li>
                  <li>Sube los archivos generados (o pega el código en la configuración).</li>
                  <li>Easypanel te dará la URL (ej: <code>panel.tumedico.com</code>).</li>
                </ol>
              </div>

              <h4 className="font-bold text-slate-800 mt-6">2. Blueprint para n8n</h4>
              <p className="text-xs text-slate-500">Copia este JSON y pégalo en el lienzo de n8n para importar la lógica básica:</p>
              <textarea 
                readOnly
                className="w-full h-32 bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-[10px] mt-2 outline-none"
                value={n8nBlueprint}
              />
              <button 
                onClick={() => navigator.clipboard.writeText(n8nBlueprint)}
                className="text-[10px] font-black uppercase text-blue-600 hover:underline"
              >
                Copiar al portapapeles
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'stats' && <StatsDashboard appointments={appointments} />}

      {activeTab === 'config' && (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200">
          <h3 className="font-black text-slate-800 mb-6">Ajustes del Consultorio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase">Nombre del Doctor</span>
                <input type="text" defaultValue="Dr. Carlos Rodríguez" className="mt-1 block w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" />
              </label>
              <label className="block">
                <span className="text-[10px] font-black text-slate-400 uppercase">Especialidad</span>
                <input type="text" defaultValue="Traumatología y Posturología" className="mt-1 block w-full bg-slate-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500" />
              </label>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="text-[10px] font-black text-blue-700 uppercase mb-2">Precios de Servicios</h4>
                {Object.entries(prices).map(([name, price]) => (
                  <div key={name} className="flex justify-between items-center py-1">
                    <span className="text-xs font-bold text-slate-600">{name}</span>
                    <span className="text-xs font-black text-blue-600">${price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
