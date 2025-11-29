
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Droplets, Wrench, Plane, User, LogOut, Activity, Calendar, FlaskConical, AlertTriangle, CheckCircle, Settings, X, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Interface for Water Parameters
interface WaterParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number; // for the input field
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Mock State for Parameters
  const [parameters, setParameters] = useState<WaterParameter[]>([
    { id: 'temp', name: 'Temperatura', value: 26.5, unit: '°C', min: 24, max: 28, step: 0.5 },
    { id: 'ph', name: 'pH', value: 6.8, unit: '', min: 6.5, max: 7.5, step: 0.1 },
    { id: 'ammonia', name: 'Amônia', value: 0.25, unit: 'ppm', min: 0, max: 0.05, step: 0.05 }, // Intentionally high for demo
    { id: 'nitrate', name: 'Nitrato', value: 10, unit: 'ppm', min: 0, max: 40, step: 5 },
    { id: 'salinity', name: 'Salinidade', value: 1.025, unit: 'sg', min: 1.023, max: 1.026, step: 0.001 },
  ]);

  // Helper to check if a parameter is critical
  const isCritical = (param: WaterParameter) => {
    return param.value < param.min || param.value > param.max;
  };

  // Check global health
  const criticalCount = parameters.filter(isCritical).length;
  const globalStatus = criticalCount > 0 ? 'Crítico' : 'Estável';

  // Handle threshold updates
  const handleThresholdChange = (id: string, field: 'min' | 'max', newValue: string) => {
    setParameters(prev => prev.map(p => 
      p.id === id ? { ...p, [field]: parseFloat(newValue) } : p
    ));
  };

  return (
    <div className="min-h-screen bg-[#31326f] text-white font-sans flex overflow-hidden">
      {/* Sidebar Fixa */}
      <aside className="w-[280px] bg-[#05051a] border-r border-white/5 flex flex-col shrink-0 relative z-20 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
        <div className="p-8">
          <div className="font-heading font-bold text-xl tracking-tighter flex items-center gap-2">
            <span className="text-[#4fb7b3]">●</span> TITAN AQUATICS
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 py-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-[#4fb7b3]/10 border-r-2 border-[#4fb7b3] text-white">
            <LayoutDashboard size={18} className="text-[#4fb7b3]" />
            <span className="text-xs font-bold uppercase tracking-widest">Overview</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <Droplets size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Meu Tanque</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <Wrench size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Ferramentas</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <Plane size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Modo Viagem</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <User size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Conta</span>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="mb-4">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Status do Plano</div>
            <div className="text-[#a8fbd3] font-bold text-xs border border-[#a8fbd3]/20 bg-[#a8fbd3]/5 px-2 py-1 rounded w-fit uppercase">
              Plano Free
            </div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors w-full"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col relative overflow-y-auto">
         {/* Background sutil */}
         <div className="absolute inset-0 bg-gradient-to-br from-[#31326f] via-[#28295c] to-[#1f2048] -z-10" />
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#4fb7b3]/5 rounded-full blur-[100px] pointer-events-none" />

         {/* Header */}
         <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#05051a]/50 backdrop-blur-md sticky top-0 z-10">
            <h1 className="font-heading text-lg font-bold tracking-wide text-white/80">Dashboard</h1>
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <div className="text-xs text-gray-400">Logado como</div>
                  <div className="text-sm font-bold text-[#4fb7b3]">{user?.email}</div>
               </div>
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4fb7b3] to-[#637ab9] flex items-center justify-center font-bold text-black text-xs">
                  {user?.email?.[0].toUpperCase()}
               </div>
            </div>
         </header>

         {/* Content Grid */}
         <div className="p-8 max-w-7xl mx-auto w-full">
            
            {/* Action Bar */}
            <div className="flex justify-between items-end mb-6">
                <div>
                   <h2 className="text-2xl font-heading font-bold">Parâmetros da Água</h2>
                   <p className="text-sm text-gray-400">Última leitura: Hoje, 14:30</p>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest"
                >
                   <Settings size={14} /> Configurar Alertas
                </button>
            </div>

            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
               {/* Global Status Card */}
               <div className={`col-span-1 md:col-span-2 lg:col-span-3 border rounded-2xl p-6 backdrop-blur-sm transition-colors flex items-center justify-between
                  ${globalStatus === 'Crítico' 
                    ? 'bg-red-500/10 border-red-500/30' 
                    : 'bg-[#1a1b3b]/60 border-white/10'}`
               }>
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-xl ${globalStatus === 'Crítico' ? 'bg-red-500/20' : 'bg-[#4fb7b3]/20'}`}>
                        {globalStatus === 'Crítico' ? <AlertTriangle className="text-red-400" /> : <Activity className="text-[#4fb7b3]" />}
                     </div>
                     <div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Diagnóstico Geral</h3>
                        <div className={`text-2xl font-heading font-bold ${globalStatus === 'Crítico' ? 'text-red-400' : 'text-white'}`}>
                            {globalStatus === 'Crítico' ? `${criticalCount} Parâmetros Críticos` : 'Ecossistema Estável'}
                        </div>
                     </div>
                  </div>
                  {globalStatus === 'Crítico' && (
                      <div className="text-right hidden md:block">
                          <p className="text-sm text-red-300">Ação imediata recomendada.</p>
                          <p className="text-xs text-red-400/70">Verifique os cards abaixo.</p>
                      </div>
                  )}
               </div>

               {/* Dynamic Parameter Cards */}
               {parameters.map((param) => {
                  const critical = isCritical(param);
                  return (
                    <div 
                        key={param.id}
                        className={`border rounded-2xl p-6 backdrop-blur-sm transition-all relative overflow-hidden group
                        ${critical 
                            ? 'bg-red-900/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]' 
                            : 'bg-[#1a1b3b]/60 border-white/10 hover:border-[#4fb7b3]/30'}`
                        }
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-3 rounded-xl transition-colors ${critical ? 'bg-red-500/20' : 'bg-white/5 group-hover:bg-[#4fb7b3]/20'}`}>
                                <FlaskConical className={`w-6 h-6 ${critical ? 'text-red-400' : 'text-[#a8fbd3]'}`} />
                            </div>
                            {critical ? (
                                <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono uppercase flex items-center gap-1 animate-pulse">
                                    <AlertTriangle size={10} /> Alerta
                                </span>
                            ) : (
                                <span className="text-[10px] bg-[#4fb7b3]/10 text-[#4fb7b3] px-2 py-0.5 rounded-full font-mono uppercase flex items-center gap-1">
                                    <CheckCircle size={10} /> OK
                                </span>
                            )}
                        </div>
                        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{param.name}</h3>
                        <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-3xl font-heading font-bold">{param.value}</span>
                            <span className="text-sm text-gray-500 font-mono">{param.unit}</span>
                        </div>
                        
                        {/* Range visualizer */}
                        <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 relative overflow-hidden">
                             {/* Simple visual representation of "good range" vs "current value" could be complex, 
                                 using text description for simplicity here */}
                             <div className={`h-full rounded-full ${critical ? 'bg-red-500' : 'bg-[#4fb7b3]'}`} style={{ width: '60%' }}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex justify-between">
                            <span>Meta: {param.min} - {param.max} {param.unit}</span>
                            {critical && <span className="text-red-400 font-bold">Fora da faixa</span>}
                        </p>
                    </div>
                  );
               })}
            </motion.div>

         </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsSettingsOpen(false)}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-[#1a1b3b] border border-white/20 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={() => setIsSettingsOpen(false)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                    
                    <h2 className="text-xl font-heading font-bold mb-1 flex items-center gap-2">
                        <Settings className="text-[#4fb7b3]" /> Configurar Alertas
                    </h2>
                    <p className="text-sm text-gray-400 mb-6">Defina os limites seguros para o seu ecossistema. O Titan alertará se os valores saírem desta faixa.</p>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {parameters.map((param) => (
                            <div key={param.id} className="bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-[#a8fbd3]">{param.name}</span>
                                    <span className="text-xs text-gray-500">{param.unit}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-400">Mínimo</label>
                                        <input 
                                            type="number" 
                                            step={param.step}
                                            value={param.min}
                                            onChange={(e) => handleThresholdChange(param.id, 'min', e.target.value)}
                                            className="w-full bg-[#05051a] border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4fb7b3] outline-none text-white"
                                        />
                                    </div>
                                    <div className="w-4 h-[1px] bg-white/20 mt-4"></div>
                                    <div className="flex-1 space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-gray-400">Máximo</label>
                                        <input 
                                            type="number" 
                                            step={param.step}
                                            value={param.max}
                                            onChange={(e) => handleThresholdChange(param.id, 'max', e.target.value)}
                                            className="w-full bg-[#05051a] border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4fb7b3] outline-none text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
                        <button 
                            onClick={() => setIsSettingsOpen(false)}
                            className="bg-[#4fb7b3] text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
                        >
                            <Save size={16} /> Salvar Configurações
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
