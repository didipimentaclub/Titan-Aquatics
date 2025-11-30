
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
  MoreVertical,
  Calculator,
  ArrowRightLeft,
  Stethoscope,
  Lock,
  CreditCard,
  Cpu,
  Megaphone,
  Zap,
  ArrowLeft,
  RefreshCcw,
  Scale,
  Image as ImageIcon,
  Youtube,
  PlayCircle
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

// --- Componente AdminPanel ---
interface AdminPanelProps {
  isMaster: boolean;
  events: AquariumEvent[];
  onAddEvent: (event: Partial<AquariumEvent>) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isMaster, events, onAddEvent, onDeleteEvent }) => {
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<Partial<AquariumEvent>>({
    title: '',
    date: '',
    location: '',
    type: 'Feira',
    description: '',
    link: '',
    image: '',
    video_url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleOpenForm = (event?: AquariumEvent) => {
    if (event) {
      setEditingEventId(event.id);
      setNewEvent({ ...event });
    } else {
      setEditingEventId(null);
      setNewEvent({ title: '', date: '', location: '', type: 'Feira', description: '', link: '', image: '', video_url: '' });
    }
    setIsEventFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (editingEventId) {
       await onAddEvent({ ...newEvent, id: editingEventId });
    } else {
       await onAddEvent(newEvent);
    }
    
    setLoading(false);
    setIsEventFormOpen(false);
    setEditingEventId(null);
    setNewEvent({ title: '', date: '', location: '', type: 'Feira', description: '', link: '', image: '', video_url: '' });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-white">
          {isMaster ? 'Painel Master' : 'Painel Admin'}
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <ShieldCheck className="h-3 w-3" />
          Acesso liberado (kbludobarman)
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
          <p className="text-xs text-slate-400">Eventos Ativos</p>
          <p className="mt-2 text-2xl font-semibold text-[#4fb7b3]">{events.length}</p>
        </div>
      </div>

      {/* Gestão de Eventos */}
      <div className="rounded-2xl border border-white/5 bg-white/5 p-6">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Megaphone size={16} className="text-[#4fb7b3]" /> Gestão de Eventos
            </h3>
            <button 
              onClick={() => handleOpenForm()}
              className="text-xs font-bold uppercase tracking-widest bg-[#4fb7b3]/10 text-[#4fb7b3] border border-[#4fb7b3]/20 px-4 py-2 rounded hover:bg-[#4fb7b3] hover:text-black transition-colors"
            >
              Novo Evento
            </button>
         </div>

         {events.length === 0 ? (
           <p className="text-sm text-slate-500 italic text-center py-4">Nenhum evento cadastrado.</p>
         ) : (
           <div className="space-y-3">
             {events.map(evt => (
               <div key={evt.id} className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                 <div className="flex items-center gap-3">
                    {evt.image && <img src={evt.image} alt="" className="w-10 h-10 rounded object-cover" />}
                    <div>
                      <p className="text-sm font-bold text-white">{evt.title}</p>
                      <p className="text-xs text-slate-400">{evt.date} • {evt.location}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => handleOpenForm(evt)}
                      className="p-2 text-slate-500 hover:text-white transition-colors"
                    >
                      <Pencil size={14} />
                    </button>
                    <button 
                      onClick={() => onDeleteEvent(evt.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                 </div>
               </div>
             ))}
           </div>
         )}
      </div>

      {/* Modal Criar/Editar Evento */}
      <AnimatePresence>
        {isEventFormOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <div 
                className="fixed inset-0"
                onClick={() => setIsEventFormOpen(false)}
             />
             <motion.div
               initial={{ scale: 0.95, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.95, opacity: 0 }}
               className="relative bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
             >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-white">{editingEventId ? 'Editar Evento' : 'Novo Evento'}</h3>
                  <button onClick={() => setIsEventFormOpen(false)}><X className="text-slate-400 hover:text-white" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase">Título</label>
                     <input type="text" required className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" 
                       value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                     />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-bold text-[#4fb7b3] uppercase">Data</label>
                        <input type="text" required placeholder="Ex: 15/08/2026" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" 
                          value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-[#4fb7b3] uppercase">Tipo</label>
                        <select className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none"
                          value={newEvent.type} onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                        >
                          <option value="Feira">Feira</option>
                          <option value="Encontro">Encontro</option>
                          <option value="Campeonato">Campeonato</option>
                          <option value="Workshop">Workshop</option>
                        </select>
                     </div>
                   </div>
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase">Local</label>
                     <input type="text" required placeholder="Cidade - Local" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" 
                       value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                     />
                   </div>
                   
                   {/* Seção Imagem */}
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase flex items-center gap-2">
                       <ImageIcon size={14} /> URL Imagem (Capa)
                     </label>
                     <input type="text" placeholder="https://exemplo.com/imagem.jpg" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" 
                       value={newEvent.image || ''} onChange={e => setNewEvent({...newEvent, image: e.target.value})}
                     />
                     {newEvent.image && (
                        <div className="mt-2 relative h-32 w-full rounded-lg overflow-hidden border border-white/10 bg-black/50">
                            <img 
                                src={newEvent.image} 
                                alt="Preview" 
                                className="h-full w-full object-cover" 
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                            <div className="absolute bottom-1 right-1 bg-black/60 px-2 py-1 rounded text-[10px] text-white">Preview</div>
                        </div>
                     )}
                   </div>

                   {/* Seção Vídeo */}
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase flex items-center gap-2">
                       <Youtube size={14} /> Vídeo (YouTube)
                     </label>
                     <div className="flex gap-2 mt-1">
                        <input 
                            type="text" 
                            placeholder="https://www.youtube.com/watch?v=..." 
                            className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm focus:border-[#4fb7b3] outline-none" 
                            value={newEvent.video_url || ''} 
                            onChange={e => setNewEvent({...newEvent, video_url: e.target.value})}
                        />
                        {newEvent.video_url && (
                            <a 
                                href={newEvent.video_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-white/5 border border-white/10 hover:bg-[#4fb7b3] hover:text-black hover:border-[#4fb7b3] text-white p-2 rounded flex items-center justify-center transition-colors w-10 shrink-0"
                                title="Testar link"
                            >
                                <ExternalLink size={16} />
                            </a>
                        )}
                     </div>
                     <p className="text-[10px] text-slate-500 mt-1 ml-1">Recomendado: Link direto do navegador.</p>
                   </div>

                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase">Link Externo</label>
                     <input type="text" placeholder="Site do evento" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 focus:border-[#4fb7b3] outline-none" 
                       value={newEvent.link || ''} onChange={e => setNewEvent({...newEvent, link: e.target.value})}
                     />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-[#4fb7b3] uppercase">Descrição</label>
                     <textarea className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm mt-1 h-20 focus:border-[#4fb7b3] outline-none" 
                       value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                     />
                   </div>
                   <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full py-3 bg-[#4fb7b3] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors mt-4"
                   >
                     {loading ? 'Salvando...' : (editingEventId ? 'Atualizar Evento' : 'Cadastrar Evento')}
                   </button>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
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
  
  // Estado das Ferramentas
  const [activeTool, setActiveTool] = useState<'calc' | 'conv' | 'diag' | null>(null);

  // Estados Calculadora Volume
  const [calcDims, setCalcDims] = useState({ length: 0, width: 0, height: 0 });
  const [calcSumpDims, setCalcSumpDims] = useState({ length: 0, width: 0, height: 0 });
  const [calcHasSump, setCalcHasSump] = useState(false);
  
  // Estados Conversor
  const [convCategory, setConvCategory] = useState<'temp' | 'vol' | 'len'>('temp');
  const [convValue, setConvValue] = useState<string>('');
  
  // Modais
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  // Confirmação de Delete (Aquário)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [aquariumToDelete, setAquariumToDelete] = useState<string | null>(null);

  // Estados CRUD Aquários
  const [myAquariums, setMyAquariums] = useState<Aquarium[]>([]);
  const [isAquariumFormOpen, setIsAquariumFormOpen] = useState(false);
  const [editingAquarium, setEditingAquarium] = useState<Aquarium | null>(null);
  const [isLoadingAquariums, setIsLoadingAquariums] = useState(false);
  const [hasSump, setHasSump] = useState(false);
  
  // Estados Eventos
  const [events, setEvents] = useState<AquariumEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Estado do Formulário de Aquário
  const [aquariumFormData, setAquariumFormData] = useState<Partial<Aquarium>>({
    name: '',
    volume: undefined,
    sump_volume: 0,
    type: 'Doce',
    setup_date: '',
    fauna: '',
    equipment: ''
  });

  // Mock de Parâmetros
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

      // HARDCODE: Garantir acesso admin para o proprietário
      if (user.email === 'kbludobarman@gmail.com') {
        setIsAdmin(true);
        setIsMaster(true);
        return;
      }

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

  // Carregar Dados Iniciais
  useEffect(() => {
    if (user) {
      if (activeView === 'aquariums') fetchAquariums();
      if (activeView === 'events' || activeView === 'admin') fetchEvents();
      if (activeView !== 'tools') setActiveTool(null);
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

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) {
      setEvents(data || []);
    }
    setIsLoadingEvents(false);
  };

  // --- Funções CRUD Aquários ---

  const handleOpenAquariumForm = (aquarium?: Aquarium) => {
    if (aquarium) {
      setEditingAquarium(aquarium);
      const tankHasSump = !!(aquarium.sump_volume && aquarium.sump_volume > 0);
      setHasSump(tankHasSump);
      
      setAquariumFormData({
        name: aquarium.name,
        volume: aquarium.volume,
        sump_volume: aquarium.sump_volume || 0,
        type: aquarium.type,
        setup_date: aquarium.setup_date,
        fauna: aquarium.fauna,
        equipment: aquarium.equipment
      });
    } else {
      setEditingAquarium(null);
      setHasSump(false);
      setAquariumFormData({
        name: '',
        volume: undefined,
        sump_volume: 0,
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

    if (!aquariumFormData.name) return alert('Nome obrigatório.');
    
    // Tratamento robusto para números (converte vírgula para ponto e garante float)
    const rawVolume = String(aquariumFormData.volume).replace(',', '.');
    const volume = parseFloat(rawVolume);
    
    const rawSump = String(aquariumFormData.sump_volume).replace(',', '.');
    const sump = parseFloat(rawSump);

    if (isNaN(volume) || volume <= 0) {
        return alert('Volume inválido. Insira um número positivo.');
    }

    // Sanitização do payload
    const payload = {
      name: aquariumFormData.name,
      volume: volume,
      sump_volume: hasSump && !isNaN(sump) ? sump : 0,
      type: aquariumFormData.type,
      setup_date: aquariumFormData.setup_date,
      fauna: aquariumFormData.fauna,
      equipment: aquariumFormData.equipment,
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
      alert('Erro: ' + error.message);
    } else {
      setIsAquariumFormOpen(false);
      fetchAquariums();
    }
  };

  const confirmDeleteAquarium = (id: string) => {
    setAquariumToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteAquarium = async () => {
    if (!aquariumToDelete) return;
    
    const { error } = await supabase
      .from('aquariums')
      .delete()
      .eq('id', aquariumToDelete);

    if (error) {
      alert('Erro ao excluir: ' + error.message);
    } else {
      fetchAquariums();
    }
    setIsDeleteConfirmOpen(false);
    setAquariumToDelete(null);
  };

  // --- Funções CRUD Eventos (Admin) ---

  const handleSaveEvent = async (event: Partial<AquariumEvent>) => {
    if (!user) return;

    if (event.id) {
       const { error } = await supabase.from('events').update(event).eq('id', event.id);
       if (error) alert('Erro ao atualizar: ' + error.message);
    } else {
       const { error } = await supabase.from('events').insert([event]);
       if (error) alert('Erro ao criar evento: ' + error.message);
    }
    fetchEvents();
  };

  const handleDeleteEvent = async (id: string) => {
    if(!confirm('Excluir evento?')) return;
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) alert('Erro: ' + error.message);
    else fetchEvents();
  };

  // --- Funções Auxiliares ---
  
  const getEmbedUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes('<iframe')) {
      const srcMatch = url.match(/src="([^"]+)"/);
      return srcMatch ? srcMatch[1] : null;
    }
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
       let videoId = '';
       if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
       else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
       return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const generateTravelGuide = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text('Guia do Cuidador - TitanAquatics', 20, 20);
    doc.setFontSize(16);
    doc.text(`Período: ${travelPlan.startDate} até ${travelPlan.endDate}`, 20, 35);
    doc.setFontSize(14);
    doc.text('Instruções:', 20, 50);
    doc.setFontSize(12);
    doc.text(travelPlan.foodInstructions || 'Sem dados.', 20, 60);
    doc.save('Guia_Titan.pdf');
    setIsTravelModalOpen(false);
  };

  // --- Cálculos de Ferramentas ---
  const calculateVolume = () => {
    const displayVol = (calcDims.length * calcDims.width * calcDims.height) / 1000;
    const sumpVol = calcHasSump ? (calcSumpDims.length * calcSumpDims.width * calcSumpDims.height) / 1000 : 0;
    return { display: displayVol, sump: sumpVol, total: displayVol + sumpVol };
  };

  const calculateConversion = () => {
    const val = parseFloat(convValue);
    if (isNaN(val)) return { val1: '-', val2: '-' };

    if (convCategory === 'temp') {
      const f = (val * 9/5) + 32;
      const c = (val - 32) * 5/9;
      return { val1: `${f.toFixed(1)} °F`, val2: `${c.toFixed(1)} °C` };
    }
    if (convCategory === 'vol') {
      const gal = val * 0.264172; // L -> Gal
      const l = val * 3.78541; // Gal -> L
      return { val1: `${gal.toFixed(1)} Gal`, val2: `${l.toFixed(1)} L` };
    }
    if (convCategory === 'len') {
      const inch = val * 0.393701;
      const cm = val * 2.54;
      return { val1: `${inch.toFixed(2)} in`, val2: `${cm.toFixed(1)} cm` };
    }
    return { val1: '-', val2: '-' };
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
            {isMaster ? (
              <>Plano Master <span className="text-[#4fb7b3]">(Unlimited)</span></>
            ) : (
              <>Plano Hobby <span className="text-[#4fb7b3]">(Free)</span></>
            )}
          </div>
          <div className="mt-3 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className={`h-full bg-[#4fb7b3] rounded-full ${isMaster ? 'w-full' : 'w-1/3'}`} />
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
              {/* Daily Summary */}
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

              {/* Water Parameters Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {parameters.map((param) => (
                    <div key={param.id} className="rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 relative overflow-hidden">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{param.name}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tighter text-white">{param.value}</span>
                        <span className="text-sm text-slate-500 font-mono">{param.unit}</span>
                      </div>
                      <div className="mt-4 h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#4fb7b3]" style={{ width: '60%' }} />
                      </div>
                    </div>
                ))}
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
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-white">Gerenciar Aquários</h2>
                  <p className="text-sm text-slate-400">Adicione e controle múltiplos ecossistemas.</p>
                </div>
                <button
                  onClick={() => handleOpenAquariumForm()}
                  className="bg-[#4fb7b3] text-black px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center gap-2 shadow-lg shadow-[#4fb7b3]/20"
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
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5 flex flex-col items-center">
                  <Fish size={48} className="text-[#4fb7b3] mb-4" />
                  <h3 className="text-xl font-heading text-white mb-2">Nenhum aquário encontrado</h3>
                  <button onClick={() => handleOpenAquariumForm()} className="text-[#4fb7b3] border border-[#4fb7b3] px-6 py-2 rounded-lg font-bold uppercase text-xs hover:bg-[#4fb7b3] hover:text-black transition-colors mt-4">
                    Cadastrar agora
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myAquariums.map((tank) => (
                    <div key={tank.id} className="group relative rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-6 backdrop-blur-sm hover:border-[#4fb7b3]/30 transition-all flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-full bg-[#4fb7b3]/10 text-[#4fb7b3]">
                          <Droplets size={24} />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenAquariumForm(tank)}
                            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                            title="Editar"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => confirmDeleteAquarium(tank.id)}
                            className="p-2 hover:bg-rose-500/20 rounded-full text-slate-400 hover:text-rose-400 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1">{tank.name}</h3>
                      <p className="text-sm text-[#4fb7b3] font-medium mb-4 uppercase tracking-wider">{tank.type}</p>
                      
                      <div className="space-y-3 text-sm text-slate-300 flex-1">
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span>Volume Total</span>
                          <span className="font-mono text-white">
                            {tank.sump_volume && tank.sump_volume > 0 
                              ? `${tank.volume + tank.sump_volume} L (${tank.volume} + ${tank.sump_volume})`
                              : `${tank.volume} L`
                            }
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/5">
                          <span>Montagem</span>
                          <span className="font-mono text-white">
                             {tank.setup_date ? new Date(tank.setup_date).toLocaleDateString('pt-BR') : '-'}
                          </span>
                        </div>
                        {tank.fauna && (
                            <div className="py-2 border-b border-white/5">
                                <span className="block text-xs text-[#4fb7b3] font-bold uppercase mb-1 flex items-center gap-1"><Fish size={10} /> Fauna</span>
                                <p className="text-xs text-slate-400 line-clamp-2" title={tank.fauna}>{tank.fauna}</p>
                            </div>
                        )}
                        {tank.equipment && (
                          <div className="py-2">
                             <span className="block text-xs text-[#4fb7b3] font-bold uppercase mb-1 flex items-center gap-1"><Zap size={10} /> Equipamentos</span>
                             <p className="text-xs text-slate-400 line-clamp-2" title={tank.equipment}>{tank.equipment}</p>
                          </div>
                        )}
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
              <div className="bg-gradient-to-r from-[#1a1b3b] to-[#0d0e21] rounded-2xl p-8 border border-white/10 text-center mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                   <CalendarDays size={120} />
                </div>
                <div className="relative z-10">
                    <CalendarDays size={48} className="mx-auto text-[#4fb7b3] mb-4" />
                    <h2 className="text-2xl font-heading font-bold text-white mb-2">Mural de Eventos</h2>
                    <p className="text-slate-400 max-w-xl mx-auto">
                    Fique por dentro das principais feiras, encontros e workshops de aquarismo no Brasil.
                    </p>
                </div>
              </div>

              {isLoadingEvents ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#4fb7b3]" /></div>
              ) : events.length === 0 ? (
                <p className="text-center text-slate-500 py-10">Nenhum evento agendado no momento.</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="group flex flex-col md:flex-row gap-0 rounded-2xl bg-[#1a1b3b]/40 border border-white/5 hover:border-[#4fb7b3]/30 transition-colors overflow-hidden">
                      {/* Date/Image Column */}
                      <div className="flex-shrink-0 w-full md:w-64 bg-white/5 flex flex-col">
                        {/* Video or Image Header */}
                        {event.video_url ? (
                           <div className="relative w-full pt-[56.25%] bg-black">
                               <iframe 
                                 src={getEmbedUrl(event.video_url)!} 
                                 className="absolute inset-0 w-full h-full"
                                 allowFullScreen
                                 title={event.title}
                               />
                           </div>
                        ) : event.image ? (
                           <div className="h-40 w-full">
                              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                           </div>
                        ) : null}

                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                            <span className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest mb-1">{event.type}</span>
                            <span className="text-4xl font-bold text-white leading-none">{event.date.split('/')[0]}</span>
                            <span className="text-xs text-slate-400 mt-1 uppercase">
                                {event.date.split('/').length > 1 ? ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][parseInt(event.date.split('/')[1]) - 1] : ''}
                                {event.date.split('/').length > 2 ? `, ${event.date.split('/')[2]}` : ''}
                            </span>
                        </div>
                      </div>
                      
                      {/* Content Column */}
                      <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <div className="flex justify-between items-start mb-2">
                           <h3 className="text-2xl font-heading font-bold text-white">{event.title}</h3>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                          <MapPin size={14} />
                          {event.location}
                        </div>
                        
                        <p className="text-sm text-slate-300 leading-relaxed mb-6">
                          {event.description}
                        </p>

                        {event.link && (
                            <a 
                              href={event.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="self-start text-xs font-bold text-[#4fb7b3] uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors"
                            >
                                Saiba Mais <ExternalLink size={12} />
                            </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: FERRAMENTAS */}
          {activeView === 'tools' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8 max-w-5xl mx-auto"
            >
              {!activeTool ? (
                <>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-heading font-bold text-white">Ferramentas Úteis</h2>
                    <p className="text-slate-400 text-sm">Utilitários para facilitar o dia a dia do aquarismo.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                      { id: 'calc', name: 'Calculadora de Volume', icon: Calculator, desc: 'Calcule o volume real do seu tanque e sump.' },
                      { id: 'conv', name: 'Conversor de Medidas', icon: ArrowRightLeft, desc: 'Converta Galões para Litros, Fahrenheit para Celsius.' },
                      { id: 'diag', name: 'Diagnóstico IA', icon: Stethoscope, desc: 'Identifique doenças baseado em sintomas visuais.' },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id as any)}
                        className="flex flex-col items-center text-center p-8 rounded-2xl border border-white/10 bg-[#1a1b3b]/60 hover:bg-[#1a1b3b] hover:border-[#4fb7b3]/50 transition-all group"
                      >
                        <div className="p-4 rounded-full bg-white/5 text-white mb-4 group-hover:bg-[#4fb7b3] group-hover:text-black transition-colors">
                          <tool.icon size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">{tool.name}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {tool.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                   <button 
                     onClick={() => setActiveTool(null)}
                     className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-bold mb-4"
                   >
                     <ArrowLeft size={16} /> Voltar
                   </button>
                   
                   {/* CALCULADORA DE VOLUME */}
                   {activeTool === 'calc' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
                           <Calculator size={24} className="text-[#4fb7b3]" /> Calculadora de Volume
                        </h3>
                        
                        <div className="space-y-6">
                           <div className="grid grid-cols-3 gap-4">
                              <div>
                                 <label className="text-xs font-bold text-[#4fb7b3] uppercase">Comprimento (cm)</label>
                                 <input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" 
                                    value={calcDims.length || ''} onChange={e => setCalcDims({...calcDims, length: parseFloat(e.target.value)})}
                                 />
                              </div>
                              <div>
                                 <label className="text-xs font-bold text-[#4fb7b3] uppercase">Largura (cm)</label>
                                 <input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" 
                                    value={calcDims.width || ''} onChange={e => setCalcDims({...calcDims, width: parseFloat(e.target.value)})}
                                 />
                              </div>
                              <div>
                                 <label className="text-xs font-bold text-[#4fb7b3] uppercase">Altura (cm)</label>
                                 <input type="number" className="w-full bg-black/30 border border-white/10 rounded p-3 text-white mt-1" 
                                    value={calcDims.height || ''} onChange={e => setCalcDims({...calcDims, height: parseFloat(e.target.value)})}
                                 />
                              </div>
                           </div>

                           <div className="flex items-center gap-2">
                              <input type="checkbox" id="calcSump" className="w-4 h-4" checked={calcHasSump} onChange={e => setCalcHasSump(e.target.checked)} />
                              <label htmlFor="calcSump" className="text-sm text-white font-bold cursor-pointer">Adicionar Sump?</label>
                           </div>

                           {calcHasSump && (
                              <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                 <div>
                                    <label className="text-xs font-bold text-[#4fb7b3] uppercase">Comp. Sump</label>
                                    <input type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white mt-1 text-sm" 
                                       value={calcSumpDims.length || ''} onChange={e => setCalcSumpDims({...calcSumpDims, length: parseFloat(e.target.value)})}
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-bold text-[#4fb7b3] uppercase">Larg. Sump</label>
                                    <input type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white mt-1 text-sm" 
                                       value={calcSumpDims.width || ''} onChange={e => setCalcSumpDims({...calcSumpDims, width: parseFloat(e.target.value)})}
                                    />
                                 </div>
                                 <div>
                                    <label className="text-xs font-bold text-[#4fb7b3] uppercase">Alt. Sump</label>
                                    <input type="number" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white mt-1 text-sm" 
                                       value={calcSumpDims.height || ''} onChange={e => setCalcSumpDims({...calcSumpDims, height: parseFloat(e.target.value)})}
                                    />
                                 </div>
                              </div>
                           )}
                           
                           <div className="mt-8 pt-6 border-t border-white/10 text-center">
                              <p className="text-sm text-slate-400 uppercase tracking-widest mb-2">Volume Total Estimado</p>
                              <p className="text-5xl font-bold text-white font-heading">
                                 {calculateVolume().total.toFixed(0)} <span className="text-xl text-[#4fb7b3]">Litros</span>
                              </p>
                              {calcHasSump && (
                                 <p className="text-xs text-slate-500 mt-2">
                                    Display: {calculateVolume().display.toFixed(0)}L • Sump: {calculateVolume().sump.toFixed(0)}L
                                 </p>
                              )}
                           </div>
                        </div>
                     </div>
                   )}

                   {/* CONVERSOR */}
                   {activeTool === 'conv' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto">
                        <h3 className="text-xl font-heading font-bold text-white mb-6 flex items-center gap-2">
                           <ArrowRightLeft size={24} className="text-[#4fb7b3]" /> Conversor de Medidas
                        </h3>

                        <div className="flex bg-black/30 p-1 rounded-lg mb-6">
                           <button onClick={() => setConvCategory('temp')} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${convCategory === 'temp' ? 'bg-[#4fb7b3] text-black' : 'text-slate-400 hover:text-white'}`}>Temperatura</button>
                           <button onClick={() => setConvCategory('vol')} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${convCategory === 'vol' ? 'bg-[#4fb7b3] text-black' : 'text-slate-400 hover:text-white'}`}>Volume</button>
                           <button onClick={() => setConvCategory('len')} className={`flex-1 py-2 text-xs font-bold uppercase rounded ${convCategory === 'len' ? 'bg-[#4fb7b3] text-black' : 'text-slate-400 hover:text-white'}`}>Comprimento</button>
                        </div>

                        <div className="space-y-6">
                           <div>
                              <label className="text-xs font-bold text-[#4fb7b3] uppercase">
                                 Valor para Converter ({convCategory === 'temp' ? '°C ou °F' : convCategory === 'vol' ? 'Litros ou Galões' : 'cm ou in'})
                              </label>
                              <input 
                                 type="number" 
                                 className="w-full bg-black/30 border border-white/10 rounded p-4 text-white mt-2 text-xl" 
                                 placeholder="Digite o valor..."
                                 value={convValue}
                                 onChange={e => setConvValue(e.target.value)}
                              />
                           </div>

                           <div className="grid grid-cols-2 gap-4 mt-4">
                              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                                 <p className="text-xs text-slate-400 uppercase mb-1">Resultado A</p>
                                 <p className="text-2xl font-bold text-white">{calculateConversion().val1}</p>
                              </div>
                              <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center">
                                 <p className="text-xs text-slate-400 uppercase mb-1">Resultado B</p>
                                 <p className="text-2xl font-bold text-white">{calculateConversion().val2}</p>
                              </div>
                           </div>
                        </div>
                     </div>
                   )}

                   {/* DIAGNÓSTICO */}
                   {activeTool === 'diag' && (
                     <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto text-center">
                        <Stethoscope size={64} className="text-[#4fb7b3] mx-auto mb-6" />
                        <h3 className="text-2xl font-heading font-bold text-white mb-4">
                           Diagnóstico com IA
                        </h3>
                        <p className="text-slate-300 leading-relaxed mb-8 max-w-md mx-auto">
                           O Titan Copilot pode ajudar a identificar doenças e problemas com algas. 
                           Clique no botão de chat no canto inferior direito e descreva os sintomas ou parâmetros da água.
                        </p>
                        <div className="bg-black/30 p-4 rounded-xl border border-white/5 text-left max-w-sm mx-auto">
                           <p className="text-xs text-[#4fb7b3] uppercase font-bold mb-2">Exemplo de prompt:</p>
                           <p className="text-sm text-slate-400 italic">
                              "Meu peixe palhaço está com pontos brancos nas nadadeiras e respirando rápido. O que pode ser?"
                           </p>
                        </div>
                     </div>
                   )}
                </div>
              )}
            </motion.div>
          )}

          {/* VIEW: CONTA */}
          {activeView === 'account' && (
             <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-heading font-bold text-white mb-6">Configurações da Conta</h2>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#1a1b3b]/60 p-8">
                  <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <User size={20} className="text-[#4fb7b3]"/> Informações Pessoais
                  </h3>
                  <div className="grid gap-6">
                    <div>
                      <label className="text-xs text-slate-500 uppercase tracking-widest mb-1 block">Email</label>
                      <input type="text" value={user?.email} disabled className="w-full bg-black/20 border border-white/10 rounded px-3 py-2 text-slate-300 text-sm" />
                    </div>
                  </div>
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
              <AdminPanel 
                isMaster={isMaster} 
                events={events}
                onAddEvent={handleSaveEvent}
                onDeleteEvent={handleDeleteEvent}
              />
            </motion.div>
          )}

        </div>
      </main>

      {/* MODAL: AQUARIUM FORM */}
      <AnimatePresence>
        {isAquariumFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl custom-scrollbar"
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
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Nome *</label>
                    <input
                      type="text"
                      value={aquariumFormData.name}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, name: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Tipo</label>
                    <select
                      value={aquariumFormData.type}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, type: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                    >
                      <option value="Doce">Água Doce</option>
                      <option value="Marinho">Marinho (Fish Only)</option>
                      <option value="Reef">Reef (Corais)</option>
                      <option value="Plantado">Plantado</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Volume (L)</label>
                    <input
                      type="number"
                      value={aquariumFormData.volume || ''}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, volume: parseFloat(e.target.value) || undefined})}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id="hasSump" checked={hasSump} onChange={e => { setHasSump(e.target.checked); if(!e.target.checked) setAquariumFormData({...aquariumFormData, sump_volume: 0}); }} />
                        <label htmlFor="hasSump" className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest cursor-pointer">Possui Sump?</label>
                      </div>
                      <input 
                        type="number" disabled={!hasSump} placeholder="Volume Sump"
                        className={`w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none ${!hasSump && 'opacity-50'}`}
                        value={hasSump ? (aquariumFormData.sump_volume || '') : ''}
                        onChange={e => setAquariumFormData({...aquariumFormData, sump_volume: parseFloat(e.target.value) || 0})}
                      />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Data de Montagem</label>
                    <input
                      type="date"
                      value={aquariumFormData.setup_date || ''}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, setup_date: e.target.value})}
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Fauna</label>
                    <textarea
                      value={aquariumFormData.fauna || ''}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, fauna: e.target.value})}
                      placeholder="Ex: 5 Neons, 2 Acarás..."
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none h-20"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-[#4fb7b3] uppercase tracking-widest">Equipamentos</label>
                    <textarea
                      value={aquariumFormData.equipment || ''}
                      onChange={(e) => setAquariumFormData({...aquariumFormData, equipment: e.target.value})}
                      placeholder="Ex: Filtro Canister, Termostato 100W..."
                      className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#4fb7b3] outline-none h-20"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button type="button" onClick={() => setIsAquariumFormOpen(false)} className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase hover:bg-white/5">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-[#4fb7b3] rounded-lg text-black font-bold uppercase hover:bg-white">Salvar</button>
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
                   Gere um guia PDF para o cuidador do aquário.
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-xs text-[#4fb7b3] font-bold uppercase">Data Saída</label>
                      <input type="date" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" value={travelPlan.startDate} onChange={(e) => setTravelPlan({...travelPlan, startDate: e.target.value})} />
                   </div>
                   <div className="space-y-1">
                      <label className="text-xs text-[#4fb7b3] font-bold uppercase">Data Volta</label>
                      <input type="date" className="w-full bg-black/30 border border-white/10 rounded p-2 text-white text-sm" value={travelPlan.endDate} onChange={(e) => setTravelPlan({...travelPlan, endDate: e.target.value})} />
                   </div>
                </div>
                <div className="space-y-1">
                   <label className="text-xs text-[#4fb7b3] font-bold uppercase">Instruções Alimentação</label>
                   <textarea className="w-full bg-black/30 border border-white/10 rounded p-3 text-white text-sm h-20 resize-none" value={travelPlan.foodInstructions} onChange={(e) => setTravelPlan({...travelPlan, foodInstructions: e.target.value})} />
                </div>
              </div>

              <div className="p-6 border-t border-white/10 bg-[#0d0e21]">
                 <button onClick={generateTravelGuide} className="w-full py-3 bg-[#4fb7b3] text-black font-bold uppercase tracking-widest text-xs hover:bg-white transition-colors flex items-center justify-center gap-2">
                    <Download size={16} /> Gerar PDF
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: DELETE CONFIRMATION (AQUARIUM) */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1a1b3b] border border-rose-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center"
            >
              <AlertTriangle size={48} className="mx-auto text-rose-500 mb-4" />
              <h3 className="text-xl font-heading font-bold text-white mb-2">Excluir Aquário?</h3>
              <p className="text-slate-400 text-sm mb-6">
                Essa ação removerá permanentemente o aquário e todo o seu histórico. Não pode ser desfeita.
              </p>
              <div className="flex gap-4">
                <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase hover:bg-white/5">Cancelar</button>
                <button onClick={handleDeleteAquarium} className="flex-1 py-3 bg-rose-500 rounded-lg text-white font-bold uppercase hover:bg-rose-600">Excluir</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: LOGOUT CONFIRMATION */}
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
              <div className="flex gap-4 mt-6">
                <button onClick={() => setIsLogoutConfirmOpen(false)} className="flex-1 py-3 border border-white/10 rounded-lg text-slate-300 font-bold uppercase hover:bg-white/5">Cancelar</button>
                <button onClick={() => signOut()} className="flex-1 py-3 bg-rose-500 rounded-lg text-white font-bold uppercase hover:bg-rose-600">Sair</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
