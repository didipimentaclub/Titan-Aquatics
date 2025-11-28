
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Droplets, Wrench, Plane, User, LogOut, Activity, Calendar, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

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
         {/* Background sutil para manter o clima */}
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
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
               {/* Card 1 */}
               <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-[#4fb7b3]/30 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#4fb7b3]/20 transition-colors">
                        <Activity className="w-6 h-6 text-[#4fb7b3]" />
                     </div>
                     <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-mono uppercase">Atenção</span>
                  </div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Status Geral</h3>
                  <div className="text-2xl font-heading font-bold mb-2">Requer Análise</div>
                  <p className="text-sm text-gray-400">Nenhum parâmetro registrado nas últimas 48h.</p>
               </div>

               {/* Card 2 */}
               <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-[#4fb7b3]/30 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#637ab9]/20 transition-colors">
                        <Calendar className="w-6 h-6 text-[#637ab9]" />
                     </div>
                  </div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Rotina</h3>
                  <div className="text-2xl font-heading font-bold mb-2">0 Dias</div>
                  <p className="text-sm text-gray-400">Sequência de manutenção não iniciada.</p>
               </div>

               {/* Card 3 */}
               <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm hover:border-[#4fb7b3]/30 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                     <div className="p-3 bg-white/5 rounded-xl group-hover:bg-[#a8fbd3]/20 transition-colors">
                        <FlaskConical className="w-6 h-6 text-[#a8fbd3]" />
                     </div>
                  </div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Última TPA</h3>
                  <div className="text-2xl font-heading font-bold mb-2">--/--</div>
                  <p className="text-sm text-gray-400">Registre sua primeira troca parcial de água.</p>
               </div>
            </motion.div>

            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="mt-8 p-8 border border-white/10 rounded-2xl bg-black/20 flex flex-col items-center justify-center text-center min-h-[300px]"
            >
               <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-gray-500" />
               </div>
               <h3 className="text-xl font-heading font-bold mb-2">Seu laboratório está vazio</h3>
               <p className="text-gray-400 max-w-md mb-6">Comece adicionando seu primeiro aquário para liberar as ferramentas do Titan Copilot.</p>
               <button className="px-6 py-3 bg-[#4fb7b3] text-black font-bold uppercase tracking-widest hover:bg-white transition-colors text-xs rounded-lg">
                  Adicionar Novo Tanque
               </button>
            </motion.div>
         </div>
      </main>
    </div>
  );
};

export default Dashboard;
