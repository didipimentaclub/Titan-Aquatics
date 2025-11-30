
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Droplets,
  Wrench,
  Plane,
  User,
  LogOut,
  Activity,
  Calendar,
  FlaskConical,
  AlertTriangle,
  CheckCircle,
  Settings,
  X,
  Save,
  Download,
  BarChart3,
  History,
  Clock,
  ClipboardList,
  ShieldCheck,
  ClipboardCheck,
  Menu,
  Pencil,
  Loader2,
  Plus,
  Trash2,
  Fish,
  CalendarDays,
  MapPin,
  ExternalLink,
  Search,
  Thermometer,
  MoreVertical
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { jsPDF } from 'jspdf';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { Aquarium, AquariumEvent } from '../types';

// --- Interfaces Auxiliares ---

interface WaterParameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
}

interface TravelPlan {
  startDate: string;
  endDate: string;
  foodInstructions: string;
  dosingInstructions: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

// --- Dados Mockados para Eventos ---
const MOCK_EVENTS: AquariumEvent[] = [
  {
    id: '1',
    title: 'Reef Day Brasil 2026',
    date: '15 e 16 de Agosto, 2026',
    location: 'Expo Center Norte, São Paulo - SP',
    type: 'Feira',
    description: 'A maior feira de aquarismo da América Latina. Expositores nacionais e internacionais, palestras e muito networking.',
    link: '#'
  },
  {
    id: '2',
    title: 'Encontro de Aquaristas RJ',
    date: '10 de Outubro, 2025',
    location: 'Rio de Janeiro - RJ',
    type: 'Encontro',
    description: 'Encontro informal para troca de mudas, peixes e experiências sobre plantados e jumbos.',
    link: '#'
  },
  {
    id: '3',
    title: 'Workshop de Aquapaisagismo',
    date: '22 de Novembro, 2025',
    location: 'Curitiba - PR',
    type: 'Workshop',
    description: 'Aprenda técnicas de hardscape e plantio com mestres do aquapaisagismo brasileiro.',
    link: '#'
  }
];

// --- Componente AdminPanel ---
interface AdminPanelProps {
  isMaster: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isMaster }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-white">
          {isMaster ? 'Painel Master' : 'Painel Admin'}
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <ShieldCheck className="h-3 w-3" />
          Acesso restrito
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Usuários ativos</p>
          <p className="mt-2 text-2xl font-semibold text-white">142</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Aquários cadastrados</p>
          <p className="mt-2 text-2xl font-semibold text-white">305</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Alertas críticos (24h)</p>
          <p className="mt-2 text-2xl font-semibold text-rose-400">12</p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
         <h3 className="text-sm font-semibold text-white mb-4">Gestão de Eventos</h3>
         <div className="text-sm text-slate-400 border border-dashed border-slate-700 p-4 rounded-xl text-center">
            Módulo de cadastro de eventos em desenvolvimento.
            <br/>
            Por enquanto, os eventos são gerenciados via código.
         </div>
      </div>
    </div>
  );
};

// --- Componente Principal Dashboard ---

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  // Estados de Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);

  // Estados de Interface
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'aquariums' | 'events' | 'tools' | 'account' | 'admin'>('overview');
  
  // Modais
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Estados CRUD Aquários
  const [myAquariums, setMyAquariums] = useState<Aquarium[]>([]);
  const [isAquariumFormOpen, setIsAquariumFormOpen] = useState(false);
  const [editingAquarium, setEditingAquarium] = useState<Aquarium | null>(null);
  const [isLoadingAquariums, setIsLoadingAquariums] = useState(false);
  
  // Estado do Formulário de Aquário
  const [aquariumFormData, setAquariumFormData] = useState<Partial<Aquarium>>({
    name: '',
    volume: undefined,
    type: 'Doce',
    setup_date: '',
    fauna: '',
    equipment: ''
  });

  // Mock de Parâmetros (Mantido do anterior para a Overview)
  const [parameters, setParameters] = useState<WaterParameter[]>([
    { id: 'temp', name: 'Temperatura', value: 26.5, unit: '°C', min: 24, max: 28, step: 0.5 },
    { id: 'ph', name: 'pH', value: 6.8, unit: '', min: 6.5, max: 7.5, step: 0.1 },
    { id: 'ammonia', name: 'Amônia', value: 0.25, unit: 'ppm', min: 0, max: 0.05, step: 0.05 },
    { id: 'nitrate', name: 'Nitrato', value: 10, unit: 'ppm', min: 0, max: 40, step: 5 },
  ]);

  // Estado do Modo Viagem
  const [travelPlan, setTravelPlan] = useState<TravelPlan>({
    startDate: '',
    endDate: '',
    foodInstructions: '',
    dosingInstructions: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
  });

  // --- Efeitos ---

  // Checar Admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_master')
        .eq('user_id', user.id)
        .single();

      if (!error && data) {
        setIsAdmin(true);
        setIsMaster(!!data.is_master);
      }
    };
    checkAdmin();
  }, [user]);

  // Carregar Aquários
  useEffect(() => {
    if (user && activeView === 'aquariums') {
      fetchAquariums();
    }
  }, [user, activeView]);

  const fetchAquariums = async () => {
    setIsLoadingAquariums(true);
    const { data, error } = await supabase
      .from('aquariums')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Erro ao buscar aquários:', error);
    } else {
      setMyAquariums(data || []);
    }
    setIsLoadingAquariums(false);
  };

  // --- Funções CRUD Aquários ---

  const handleOpenAquariumForm = (aquarium?: Aquarium) => {
    if (aquarium) {
      setEditingAquarium(aquarium);
      setAquariumFormData(aquarium);
    } else {
      setEditingAquarium(null);
      setAquariumFormData({
        name: '',
        volume: undefined,
        type: 'Doce',
        setup_date: '',
        fauna: '',
        equipment: ''
      });
    }
    setIsAquariumFormOpen(true);
  };

  const handleSaveAquarium = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validação básica
    if (!aquariumFormData.name) {
      alert('O nome do aquário é obrigatório.');
      return;
    }

    const payload = {
      ...aquariumFormData,
      user_id: user.id
    };

    let error;
    if (editingAquarium) {
      const { error: updateError } = await supabase
        .from('aquariums')
        .update(payload)
        .eq('id', editingAquarium.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('aquariums')
        .insert([payload]);
      error = insertError;
    }

    if (error) {
      alert('Erro ao salvar aquário: ' + error.message);
    } else {
      setIsAquariumFormOpen(false);
      fetchAquariums();
    }
  };

  const handleDeleteAquarium = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este aquário? Essa ação não pode ser desfeita.')) return;
    
    const { error } = await supabase
      .from('aquariums')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchAquariums();
    }
  };

  // --- Funções Auxiliares ---
  
  const generateTravelGuide = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Guia do Cuidador - TitanAquatics', 20, 20);
    
    doc.setFontSize(16);
    doc.text(`Período: ${travelPlan.startDate} até ${travelPlan.endDate}`, 20, 35);
    
    doc.setFontSize(14);
    doc.text('Alimentação:', 20, 50);
    doc.setFontSize(12);
    doc.text(travelPlan.foodInstructions || 'Sem instruções.', 20, 60);
    
    doc.setFontSize(14);
    doc.text('Suplementos/Dosagem:', 20, 80);
    doc.setFontSize(12);
    doc.text(travelPlan.dosingInstructions || 'Sem instruções.', 20, 90);
    
    doc.setFontSize(14);
    doc.text('Emergência:', 20, 110);
    doc.setFontSize(12);
    doc.text(`Contato: ${travelPlan.emergencyContact}`, 20, 120);
    doc.text(`Telefone: ${travelPlan.emergencyPhone}`, 20, 130);
    
    doc.setFontSize(14);
    doc.text('Notas:', 20, 150);
    doc.setFontSize(12);
    doc.text(travelPlan.notes || 'Nenhuma nota adicional.', 20, 160);
    
    doc.save('Guia_Cuidador_Titan.pdf');
    setIsTravelModalOpen(false);
  };

  const getViewTitle = () => {
    switch (activeView) {
      case 'overview': return 'Visão Geral';
      case 'aquariums': return 'Meus Aquários';
      case 'events': return 'Mural de Eventos';
      case 'tools': return 'Ferramentas';
      case 'account': return 'Minha Conta';
      case 'admin': return isMaster ? 'Painel Master' : 'Administração';
      default: return 'Dashboard';
    }
  };

  const renderNavItems = () => (
    <>
      <div className="space-y-2">
        <button
          onClick={() => { setActiveView('overview'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left border-r-2 ${
            activeView === 'overview'
              ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <LayoutDashboard size={18} className={activeView === 'overview' ? 'text-[#4fb7b3]' : ''} />
          <span className="text-xs font-bold uppercase tracking-widest">Visão Geral</span>
        </button>

        <button
          onClick={() => { setActiveView('aquariums'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left border-r-2 ${
            activeView === 'aquariums'
              ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Fish size={18} className={activeView === 'aquariums' ? 'text-[#4fb7b3]' : ''} />
          <span className="text-xs font-bold uppercase tracking-widest">Meus Aquários</span>
        </button>

        <button
          onClick={() => { setActiveView('events'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left border-r-2 ${
            activeView === 'events'
              ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CalendarDays size={18} className={activeView === 'events' ? 'text-[#4fb7b3]' : ''} />
          <span className="text-xs font-bold uppercase tracking-widest">Eventos</span>
        </button>

        <button
          onClick={() => { setActiveView('tools'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left border-r-2 ${
            activeView === 'tools'
              ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Wrench size={18} className={activeView === 'tools' ? 'text-[#4fb7b3]' : ''} />
          <span className="text-xs font-bold uppercase tracking-widest">Ferramentas</span>
        </button>

        <button
          onClick={() => { setIsTravelModalOpen(true); setIsSidebarOpen(false); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left border-r-2 border-transparent"
        >
          <Plane size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Modo Viagem</span>
        </button>

        <button
          onClick={() => { setActiveView('account'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left border-r-2 ${
            activeView === 'account'
              ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white'
              : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User size={18} className={activeView === 'account' ? 'text-[#4fb7b3]' : ''} />
          <span className="text-xs font-bold uppercase tracking-widest">Conta</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => { setActiveView('admin'); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left border-r-2 ${
              activeView === 'admin'
                ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings size={18} className={activeView === 'admin' ? 'text-[#4fb7b3]' : ''} />
            <span className="text-xs font-bold uppercase tracking-widest">Admin</span>
          </button>
        )}
      </div>

      <div className="mt-auto p-6 border-t border-white/5 space-y-4">
        <div className="rounded-xl bg-gradient-to-br from-[#1a1b3b] to-[#0d0e21] p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-[#4fb7b3]/20">
              <Activity size={16} className="text-[#4fb7b3]" />
            </div>
            <span className="text-xs font-bold text-white">Status do Plano</span>
          </div>
          <div className="text-xs text-slate-400">
            Plano Hobby <span className="text-[#4fb7b3]">(Free)</span>
          </div>
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#4fb7b3] w-1/3 rounded-full" />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-500">
            <span>1/1 Aquário</span>
            <span>Upgrade</span>
          </div>
        </div>

        <button
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="w-full flex items-center gap-2 text-rose-400 hover:text-rose-300 transition-colors text-xs font-bold uppercase tracking-widest px-2"
        >
          <LogOut size={16} />
          <span>Sair</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#05051a] text-white font-sans selection:bg-[#4fb7b3] selection:text-black overflow-hidden flex">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-[280px] flex-col bg-[#05051a] border-r border-white/5 shadow-[0_0_40px_rgba(0,0,0,0.6)] h-screen fixed left-0 top-0 z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center gap-3 text-xl font-heading font-bold tracking-tighter text-white">
            <span className="text-[#4fb7b3]">●</span> TITAN
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col py-4 overflow-y-auto custom-scrollbar">
          {renderNavItems()}
        </nav>
      </aside>

      {/* Drawer Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex md:hidden"
          >
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
              className="relative z-50 flex h-full w-[280px] flex-col bg-[#05051a] border-r border-white/10"
            >
              <div className="p-8 pb-4">
                 <div className="flex items-center gap-3 text-xl font-heading font-bold tracking-tighter text-white">
                  <span className="text-[#4fb7b3]">●</span> TITAN
                </div>
              </div>
              <nav className="flex-1 flex flex-col py-4 overflow-y-auto">
                {renderNavItems()}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden md:ml-[280px] w-full">
        {/* Header */}
        <header className="h-20 border-b border-white/5 bg-[#05051a]/80 backdrop-blur-md flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button 
              type="button"
              className="inline-flex items-center justify-center rounded-lg bg-white/5 p-2 text-slate-100 hover:bg-white/10 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-lg md:text-xl font-heading font-bold text-white tracking-wide">
              {getViewTitle()}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-300 tracking-wider">SYSTEM ONLINE</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white uppercase tracking-wider">Aquarista</p>
                <p className="text-[10px] text-slate-400 font-mono">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#4fb7b3] to-[#31326f] p-[2px]">
                <div className="w-full h-full rounded-full bg-[#05051a] flex items-center justify-center">
                  <User size={18} className="text-[#4fb7b3]" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Views */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          
          {/* VIEW: OVERVIEW */}
          {activeView === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 max-w-7xl mx-auto"
            >
              {/* Daily Summary Card */}
              <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                   <ClipboardList size={100} />
                </div>
                <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-[#4fb7b3]">●</span> Resumo Diário
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5" />
                    <div>
                      <span className="block font-bold text-white text-sm">Status Geral: Estável</span>
                      <span className="text-xs text-slate-400">Todos os parâmetros vitais estão dentro da faixa ideal.</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <span className="block font-bold text-white text-sm">Próxima Manutenção</span>
                      <span className="text-xs text-slate-400">Troca Parcial de Água (TPA) agendada para daqui a 2 dias.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Water Parameters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {parameters.map((param) => {
                   const isAlert = param.value < param.min || param.value > param.max;
                   return (
                    <div 
                      key={param.id} 
                      className={`rounded-2xl border p-6 relative overflow-hidden transition-colors ${
                        isAlert 
                          ? 'bg-rose-500/10 border-rose-500/30' 
                          : 'bg-[#1a1b3b]/60 border-white/10 hover:border-[#4fb7b3]/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{param.name}</span>
                        {isAlert && <AlertTriangle size={16} className="text-rose-400 animate-pulse" />}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-bold tracking-tighter ${isAlert ? 'text-rose-400' : 'text-white'}`}>
                          {param.value}
                        </span>
                        <span className="text-sm text-slate-500 font-mono">{param.unit}</span>
                      </div>
                      <div className="mt-4 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${isAlert ? 'bg-rose-500' : 'bg-[#4fb7b3]'}`} 
                          style={{ width: `${((param.value - (param.min * 0.8)) / ((param.max * 1.2) - (param.min * 0.8))) * 100}%` }} 
                        />
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>Min: {param.min}</span>
                        <span>Max: {param.max}</span>
                      </div>
                    </div>
                   );
                })}
              </div>
            </motion.div>
          )}

          {/* VIEW: MEUS AQUÁRIOS (CRUD) */}
          {activeView === 'aquariums' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-7xl mx-auto"
            >
              <div className="flex justify-end">
                <button
                  onClick={() => handleOpenAquariumForm()}
                  className="bg-[#4fb7b3] text-black px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Adicionar Aquário
                </button>
              </div>

              {isLoadingAquariums ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 text-[#4fb7b3] animate-spin" />
                </div>
              ) : myAquariums.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
                  <Fish size={48} className="mx-auto text-slate-600 mb-4" />
                  <h3 className="text-xl font-heading text-white mb-2">Nenhum aquário encontrado</h3>
                  <p className="text-slate-400 text-sm mb-6">Comece adicionando seu primeiro ecossistema.</p>
                  <button
                    onClick={() => handleOpenAquariumForm()}
                    className="text-[#4fb7b3] hover:text-white underline text-sm"
                  >
                    Cadastrar agora
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAquariums.map((tank) => (
                    <div key={tank.id} className="group relative rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 backdrop-blur-sm hover:border-[#4fb7b3]/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-full bg-[#4fb7b3]/10 text-[#4fb7b3]">
                          <Droplets size={24} />
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleOpenAquariumForm(tank)}
                            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteAquarium(tank.id)}
                            className="p-2 hover:bg-rose-500/20 rounded-full text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1">{tank.name}</h3>
                      <p className="text-sm text-[#4fb7b3] font-medium mb-4">{tank.type}</p>
                      
                      <div className="space-y-3 text-sm text-slate-300">
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span>Volume</span>
                          <span className="font-mono text-white">{tank.volume} L</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span>Montagem</span>
                          <span className="font-mono text-white">
                             {tank.setup_date ? new Date(tank.setup_date).toLocaleDateString('pt-BR') : '-'}
                          </span>
                        </div>
                        <div className="pt-2">
                           <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Fauna Principal</span>
                           <p className="line-clamp-2 text-xs">{tank.fauna || 'Não informado'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: MURAL DE EVENTOS */}
          {activeView === 'events' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-5xl mx-auto"
            >
              <div className="bg-gradient-to-r from-[#1a1b3b] to-[#0d0e21] rounded-2xl p-8 border border-white/10 text-center mb-8">
                <CalendarDays size={48} className="mx-auto text-[#4fb7b3] mb-4" />
                <h2 className="text-2xl font-heading font-bold text-white mb-2">Mural de Eventos</h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                  Fique por dentro das principais feiras, encontros e workshops de aquarismo no Brasil.
                </p>
              </div>

              <div className="space-y-4">
                {MOCK_EVENTS.map((event) => (
                  <div key={event.id} className="flex flex-col md:flex-row gap-6 p-6 rounded-2xl bg-[#1a1b3b]/40 border border-white/5 hover:border-[#4fb7b3]/30 transition-colors">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center bg-white/5 rounded-xl w-full md:w-32 h-32 text-center p-4">
                      <span className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest mb-1">{event.type}</span>
                      <span className="text-3xl font-bold text-white">{event.date.split(' ')[0]}</span>
                      <span className="text-xs text-slate-400 uppercase">{event.date.split(' ').slice(1).join(' ')}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                        <MapPin size={14} />
                        {event.location}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed mb-4">
                        {event.description}
                      </p>
                      <button className="text-xs font-bold uppercase tracking-widest text-[#4fb7b3] hover:text-white flex items-center gap-2">
                        Saiba mais <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VIEW: FERRAMENTAS (Placeholder) */}
          {activeView === 'tools' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-4xl mx-auto text-center py-20"
            >
              <Wrench size={64} className="mx-auto text-[#4fb7b3]/50 mb-6" />
              <h2 className="text-3xl font-heading font-bold text-white">Ferramentas em Breve</h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                Estamos desenvolvendo calculadoras de dosagem, diagnósticos de doenças com IA e planejadores de hardscape.
              </p>
            </motion.div>
          )}

          {/* VIEW: CONTA (Placeholder) */}
          {activeView === 'account' && (
             <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-heading font-bold text-white mb-8">Minha Conta</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6">
                  <h3 className="text-[#4fb7b3] font-heading text-sm mb-4">Perfil</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Email</p>
                      <p className="text-white font-mono">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">ID do Usuário</p>
                      <p className="text-slate-400 font-mono text-xs">{user?.id}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6">
                  <h3 className="text-[#4fb7b3] font-heading text-sm mb-4">Assinatura</h3>
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-white font-bold">Plano Hobby</span>
                     <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">ATIVO</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Você está no plano gratuito. Faça upgrade para desbloquear o Copilot Avançado e Aquários Ilimitados.
                  </p>
                  <button className="mt-6 w-full py-3 border border-[#4fb7b3] text-[#4fb7b3] font-bold uppercase tracking-widest text-xs hover:bg-[#4fb7b3] hover:text-black transition-colors">
                    Gerenciar Assinatura
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW: ADMIN */}
          {activeView === 'admin' && isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto"
            >
              <AdminPanel isMaster={isMaster} />
            </motion.div>
          )}

        </div>
      </main>

      {/* MODAL: AQUARIUM FORM (CRUD) */}
      <AnimatePresence>
        {isAquariumFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-[#1a1b3b] p-6 border-b border-white/10 flex justify-between items-center z-10">
                <h2 className="text-xl font-heading font-bold text-white">
                  {editingAquarium ? 'Editar Aquário' : 'Novo Aquário'}
                </h2>
                <button onClick={() => setIsAquariumFormOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSaveAquarium} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Nome do Aquário *</label>
                    <input
                      type="text"
                      value={aquariumFormData.name}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, name: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors"
                      placeholder="Ex: Reef da Sala"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Tipo</label>
                    <select
                      value={aquariumFormData.type}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, type: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors appearance-none"
                    >
                      <option value="Doce">Água Doce</option>
                      <option value="Marinho">Marinho (Fish Only)</option>
                      <option value="Reef">Reef (Corais)</option>
                      <option value="Plantado">Plantado</option>
                      <option value="Ciclídeos">Ciclídeos</option>
                      <option value="Jumbo">Jumbo / Predadores</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Volume (Litros)</label>
                    <input
                      type="number"
                      value={aquariumFormData.volume || ''}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, volume: parseFloat(e.target.value)})}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors"
                      placeholder="Ex: 200"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Data de Montagem</label>
                    <input
                      type="date"
                      value={aquariumFormData.setup_date}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, setup_date: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Fauna Principal</label>
                  <textarea
                    value={aquariumFormData.fauna}
                    onChange={(e) => setAquariumFormData({...aquariumFormData, fauna: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors h-24 resize-none"
                    placeholder="Liste os principais peixes e invertebrados..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Equipamentos</label>
                  <textarea
                    value={aquariumFormData.equipment}
                    onChange={(e) => setAquariumFormData({...aquariumFormData, equipment: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors h-24 resize-none"
                    placeholder="Filtro, iluminação, skimmer, etc..."
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAquariumFormOpen(false)}
                    className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#4fb7b3] rounded-lg text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors"
                  >
                    Salvar Aquário
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: MODO VIAGEM */}
      <AnimatePresence>
        {isTravelModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-[#1a1b3b] to-[#0d0e21]">
                <div className="flex items-center gap-3">
                  <Plane className="text-[#4fb7b3]" />
                  <h2 className="text-xl font-heading font-bold text-white">Modo Viagem</h2>
                </div>
                <button onClick={() => setIsTravelModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <p className="text-sm text-slate-300 mb-4">
                   Preencha as instruções para gerar um guia PDF completo para quem vai cuidar do seu aquário.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs text-[#4fb7b3] font-bold uppercase">Data Saída</label>
                      <input 
                        type="date" 
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm"
                        value={travelPlan.startDate}
                        onChange={(e) => setTravelPlan({...travelPlan, startDate: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs text-[#4fb7b3] font-bold uppercase">Data Volta</label>
                      <input 
                        type="date" 
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm"
                        value={travelPlan.endDate}
                        onChange={(e) => setTravelPlan({...travelPlan, endDate: e.target.value})}
                      />
                   </div>
                </div>

                <div className="space-y-1">
                   <label className="text-xs text-[#4fb7b3] font-bold uppercase">Alimentação</label>
                   <textarea 
                     className="w-full bg-black/30 border border-white/10 rounded p-3 text-white text-sm h-20 resize-none"
                     placeholder="Ex: 1 pinch de flocos pela manhã..."
                     value={travelPlan.foodInstructions}
                     onChange={(e) => setTravelPlan({...travelPlan, foodInstructions: e.target.value})}
                   />
                </div>

                <div className="space-y-1">
                   <label className="text-xs text-[#4fb7b3] font-bold uppercase">Dosagem / Suplementos</label>
                   <textarea 
                     className="w-full bg-black/30 border border-white/10 rounded p-3 text-white text-sm h-20 resize-none"
                     placeholder="Ex: 5ml de Prime se repor água..."
                     value={travelPlan.dosingInstructions}
                     onChange={(e) => setTravelPlan({...travelPlan, dosingInstructions: e.target.value})}
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs text-[#4fb7b3] font-bold uppercase">Contato Emergência</label>
                      <input 
                        type="text" 
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm"
                        placeholder="Nome"
                        value={travelPlan.emergencyContact}
                        onChange={(e) => setTravelPlan({...travelPlan, emergencyContact: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs text-[#4fb7b3] font-bold uppercase">Telefone</label>
                      <input 
                        type="tel" 
                        className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm"
                        placeholder="(XX) XXXXX-XXXX"
                        value={travelPlan.emergencyPhone}
                        onChange={(e) => setTravelPlan({...travelPlan, emergencyPhone: e.target.value})}
                      />
                   </div>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-[#0d0e21]">
                 <button 
                   onClick={generateTravelGuide}
                   className="w-full py-3 bg-[#4fb7b3] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center justify-center gap-2"
                 >
                    <Download size={16} />
                    Gerar Guia PDF
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CONFIRMAÇÃO LOGOUT */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center"
            >
              <LogOut size={48} className="mx-auto text-rose-400 mb-4" />
              <h3 className="text-xl font-heading font-bold text-white mb-2">Sair do Titan?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Tem certeza que deseja encerrar sua sessão?
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase tracking-widest text-xs hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => signOut()}
                  className="flex-1 py-3 bg-rose-500 rounded-lg text-white font-bold uppercase tracking-widest text-xs hover:bg-rose-600 transition-colors"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
