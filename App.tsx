
import React, { useState, useCallback, useEffect } from 'react';
import { Appointment, PriceConfig, ServiceType } from './types';
import { INITIAL_APPOINTMENTS, INITIAL_PRICES, APP_CONFIG } from './constants';
import DoctorDashboard from './components/DoctorDashboard';
import SecretaryChat from './components/SecretaryChat';

const STORAGE_KEY = 'secretaria_medica_db';

const App: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });
  const [prices] = useState<PriceConfig>(INITIAL_PRICES);
  const [activeView, setActiveView] = useState<'doctor' | 'patient'>('patient');

  // Guardar en localStorage cada vez que cambian los turnos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  }, [appointments]);

  const addAppointment = useCallback((newApt: Appointment) => {
    setAppointments(prev => [newApt, ...prev]);
  }, []);

  const updateAppointmentStatus = useCallback((id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-3 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-200">
            R
          </div>
          <div className="hidden sm:block">
            <h1 className="font-black text-slate-800 leading-none text-sm uppercase tracking-tighter">MedStats Pro</h1>
            <span className="text-[10px] text-slate-400 font-bold">{APP_CONFIG.doctorName}</span>
          </div>
        </div>

        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
          <button
            onClick={() => setActiveView('patient')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'patient' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            PACIENTE
          </button>
          <button
            onClick={() => setActiveView('doctor')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeView === 'doctor' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            MÉDICO
          </button>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-1 container mx-auto p-4 sm:p-8">
        {activeView === 'doctor' ? (
          <DoctorDashboard 
            appointments={appointments} 
            prices={prices} 
            onUpdateStatus={updateAppointmentStatus} 
          />
        ) : (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-1000">
            <section className="text-center space-y-4">
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                Tu salud, organizada <br/><span className="text-blue-600">por inteligencia artificial.</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
                Reserva turnos de Traumatología y Posturología conversando con nuestra asistente.
              </p>
            </section>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <SecretaryChat 
                  onAddAppointment={addAppointment} 
                  prices={prices} 
                  appointments={appointments} 
                />
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h4 className="font-black text-slate-800 mb-6 uppercase tracking-widest text-xs">Ubicación</h4>
                  <div className="aspect-video bg-slate-100 rounded-2xl mb-4 flex items-center justify-center text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <p className="text-sm font-bold text-slate-700">Av. Libertador 1234, CABA</p>
                  <p className="text-xs text-slate-400 mt-1">Lunes a Viernes de 9 a 18 hs</p>
                </div>

                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl">
                  <h4 className="font-black mb-4 uppercase tracking-widest text-[10px] text-white/40">Costos Actualizados</h4>
                  <ul className="space-y-4">
                    {Object.entries(prices).map(([service, price]) => (
                      <li key={service} className="flex justify-between items-center">
                        <span className="text-xs font-medium text-white/80">{service}</span>
                        <span className="font-black text-blue-400">${price.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center border-t border-slate-200 mt-12 bg-white">
        <p className="text-xs font-black text-slate-300 uppercase tracking-widest">
          Sistema de Gestión Médica Omnicanal v2.0
        </p>
      </footer>
    </div>
  );
};

export default App;
