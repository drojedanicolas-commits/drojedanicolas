
import React from 'react';
import { Appointment, ServiceType } from '../types';

interface StatsDashboardProps {
  appointments: Appointment[];
}

const StatsDashboard: React.FC<StatsDashboardProps> = ({ appointments }) => {
  // 1. Pacientes totales (completados)
  const totalCompleted = appointments.filter(a => a.status === 'completed').length;
  
  // 2. Tasa de ausentismo
  const totalCancelled = appointments.filter(a => a.status === 'cancelled').length;
  const cancelRate = ((totalCancelled / appointments.length) * 100).toFixed(1);

  // 3. Seguimientos (Pacientes que volvieron)
  const followUps = appointments.filter(a => a.isFollowUp && a.status === 'completed').length;

  // 4. Datos por mes (últimos 12 meses)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    const monthName = date.toLocaleString('es-ES', { month: 'short' });
    const count = appointments.filter(a => {
      const aptDate = new Date(a.date);
      return aptDate.getMonth() === date.getMonth() && aptDate.getFullYear() === date.getFullYear();
    }).length;
    return { monthName, count };
  });

  const maxMonthly = Math.max(...monthlyData.map(d => d.count), 1);

  // 5. Distribución horaria
  const hourCounts: Record<string, number> = {};
  appointments.forEach(a => {
    hourCounts[a.time] = (hourCounts[a.time] || 0) + 1;
  });
  const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* KPIs Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pacientes Totales</p>
          <p className="text-3xl font-black text-slate-800">{totalCompleted}</p>
          <p className="text-[10px] text-green-500 font-bold mt-2">↑ 12% vs año anterior</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Ausentismo</p>
          <p className="text-3xl font-black text-red-500">{cancelRate}%</p>
          <p className="text-[10px] text-slate-400 mt-2">{totalCancelled} turnos perdidos</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Seguimientos</p>
          <p className="text-3xl font-black text-blue-600">{followUps}</p>
          <p className="text-[10px] text-blue-400 font-bold mt-2">Recurrencia positiva</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Ingresos Est.</p>
          <p className="text-3xl font-black text-emerald-600">
            ${appointments.filter(a => a.status === 'completed').reduce((acc, curr) => acc + curr.cost, 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-400 mt-2">Basado en consultas realizadas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras Mensual */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
            Volumen de Pacientes por Mes
          </h4>
          <div className="flex items-end justify-between h-48 gap-2">
            {monthlyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-blue-100 rounded-t-md group-hover:bg-blue-500 transition-all relative"
                  style={{ height: `${(d.count / maxMonthly) * 100}%` }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white px-1 rounded">
                    {d.count}
                  </span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase">{d.monthName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Horarios más frecuentes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            Horarios de Mayor Demanda
          </h4>
          <div className="space-y-4">
            {sortedHours.map(([hour, count], idx) => (
              <div key={hour} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 font-mono">{hour} hs</span>
                  <span className="text-slate-400">{count} turnos</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${idx === 0 ? 'bg-amber-400' : 'bg-slate-300'}`}
                    style={{ width: `${(count / sortedHours[0][1]) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
