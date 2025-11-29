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
} from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import { jsPDF } from 'jspdf';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

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

interface TravelPlan {
  startDate: string;
  endDate: string;
  foodInstructions: string;
  dosingInstructions: string;
  emergencyContact: string;
  emergencyPhone: string;
  notes: string;
}

interface AdminPanelProps {
  isMaster: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ isMaster }) => {
  return (
    <div className="mt-12 space-y-6 border-t border-white/10 pt-8">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold text-white">
          {isMaster ? 'Painel Master' : 'Painel Admin'}
        </h2>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
          <ShieldCheck className="h-3 w-3" />
          Acesso restrito
        </span>
      </div>

      {/* Cards-resumo (placeholders por enquanto) */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Usuários ativos</p>
          <p className="mt-2 text-2xl font-semibold text-white">0</p>
          <p className="mt-1 text-xs text-slate-500">Em breve puxando do Supabase</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Aquários cadastrados</p>
          <p className="mt-2 text-2xl font-semibold text-white">0</p>
          <p className="mt-1 text-xs text-slate-500">Métrica futura</p>
        </div>

        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
          <p className="text-xs text-slate-400">Alertas críticos</p>
          <p className="mt-2 text-2xl font-semibold text-rose-400">0</p>
          <p className="mt-1 text-xs text-slate-500">Integração futura com IA</p>
        </div>
      </div>

      {/* Tabela de admins - depois ligamos no Supabase */}
      <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Usuários administradores</h3>
          <span className="text-xs text-slate-400">
            Gestão via painel do Supabase por enquanto
          </span>
        </div>
        <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-900/40 p-4 text-sm text-slate-400">
          Em breve você vai conseguir:
          <ul className="mt-2 list-disc pl-5 space-y-1">
            <li>Cadastrar e remover admins</li>
            <li>Promover e rebaixar para Master / Admin</li>
            <li>Ver últimos acessos e atividades</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isMaster, setIsMaster] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('admin_users')
        .select('role, is_master')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.warn('Erro ao buscar admin_users:', error.message);
        setIsAdmin(false);
        setIsMaster(false);
        return;
      }

      if (data) {
        setIsAdmin(true);
        setIsMaster(!!data.is_master);
      } else {
        setIsAdmin(false);
        setIsMaster(false);
      }
    };

    checkAdmin();
  }, [user]);

  const [activeView, setActiveView] = useState<'overview' | 'my-tank'>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTravelModalOpen, setIsTravelModalOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Mock State for Parameters
  const [parameters, setParameters] = useState<WaterParameter[]>([
    { id: 'temp', name: 'Temperatura', value: 26.5, unit: '°C', min: 24, max: 28, step: 0.5 },
    { id: 'ph', name: 'pH', value: 6.8, unit: '', min: 6.5, max: 7.5, step: 0.1 },
    { id: 'ammonia', name: 'Amônia', value: 0.25, unit: 'ppm', min: 0, max: 0.05, step: 0.05 }, // Intentionally high for demo
    { id: 'nitrate', name: 'Nitrato', value: 10, unit: 'ppm', min: 0, max: 40, step: 5 },
    { id: 'salinity', name: 'Salinidade', value: 1.025, unit: 'sg', min: 1.023, max: 1.026, step: 0.001 },
  ]);

  const [travelPlan, setTravelPlan] = useState<TravelPlan>({
    startDate: '',
    endDate: '',
    foodInstructions: 'Alimentar 1x ao dia, quantidade pequena (o que consumirem em 2min).',
    dosingInstructions: 'Não dosar fertilizantes durante a viagem.',
    emergencyContact: '',
    emergencyPhone: '',
    notes: 'Se faltar luz por mais de 2h, ligar o nobreak na bomba principal.',
  });

  // Helper to check if a parameter is critical
  const isCritical = (param: WaterParameter) => {
    return param.value < param.min || param.value > param.max;
  };

  // Check global health
  const criticalCount = parameters.filter(isCritical).length;
  const criticalParamsNames = parameters.filter(isCritical).map((p) => p.name).join(', ');
  const globalStatus = criticalCount > 0 ? 'Crítico' : 'Estável';

  // Handle threshold updates
  const handleThresholdChange = (id: string, field: 'min' | 'max', newValue: string) => {
    setParameters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: parseFloat(newValue) } : p)),
    );
  };

  const generateTravelGuide = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(79, 183, 179); // Titan Teal
    doc.text('Guia de Viagem - TitanAquatics', margin, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Período: ${travelPlan.startDate} até ${travelPlan.endDate}`, margin, yPos);
    yPos += 15;

    doc.setDrawColor(200);
    doc.line(margin, yPos, 190, yPos);
    yPos += 15;

    // Instructions
    const addSection = (title: string, content: string) => {
      doc.setFontSize(14);
      doc.setTextColor(0);
      doc.text(title, margin, yPos);
      yPos += 8;
      doc.setFontSize(11);
      doc.setTextColor(80);

      const splitText = doc.splitTextToSize(content || 'Sem instruções.', 170);
      doc.text(splitText, margin, yPos);
      yPos += splitText.length * 6 + 10;
    };

    addSection('Instruções de Alimentação', travelPlan.foodInstructions);
    addSection('Dosagem e Suplementos', travelPlan.dosingInstructions);
    addSection('Observações Gerais', travelPlan.notes);

    yPos += 10;
    doc.setDrawColor(200);
    doc.line(margin, yPos, 190, yPos);
    yPos += 15;

    // Emergency Contact
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Em Caso de Emergência', margin, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Contato: ${travelPlan.emergencyContact}`, margin, yPos);
    yPos += 7;
    doc.text(`Telefone: ${travelPlan.emergencyPhone}`, margin, yPos);

    // Footer
    yPos = 280;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Gerado automaticamente pelo TitanAquatics Dashboard.', margin, yPos);

    doc.save('Guia_Cuidados_Titan.pdf');
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
          <button
            onClick={() => setActiveView('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left border-r-2 ${
              activeView === 'overview'
                ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard
              size={18}
              className={activeView === 'overview' ? 'text-[#4fb7b3]' : ''}
            />
            <span className="text-xs font-bold uppercase tracking-widest">Overview</span>
          </button>

          <button
            onClick={() => setActiveView('my-tank')}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer text-left border-r-2 ${
              activeView === 'my-tank'
                ? 'bg-[#4fb7b3]/10 border-[#4fb7b3] text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Droplets
              size={18}
              className={activeView === 'my-tank' ? 'text-[#4fb7b3]' : ''}
            />
            <span className="text-xs font-bold uppercase tracking-widest">Meu Tanque</span>
          </button>

          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <Wrench size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Ferramentas</span>
          </div>
          <button
            onClick={() => setIsTravelModalOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <Plane size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Modo Viagem</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer">
            <User size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Conta</span>
          </div>
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="mb-4">
            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">
              Status do Plano
            </div>
            <div className="text-[#a8fbd3] font-bold text-xs border border-[#a8fbd3]/20 bg-[#a8fbd3]/5 px-2 py-1 rounded w-fit uppercase">
              Plano Free
            </div>
          </div>
          <button
            onClick={() => setIsLogoutConfirmOpen(true)}
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
          <h1 className="font-heading text-lg font-bold tracking-wide text-white/80">
            {activeView === 'overview' ? 'Dashboard' : 'Detalhes do Tanque'}
          </h1>
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
          {activeView === 'overview' && (
            <>
              {/* Resumo Diário Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-[#1a1b3b]/80 border-l-4 border-[#4fb7b3] rounded-r-xl p-5 mb-8 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-white font-heading font-bold text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#4fb7b3]" /> Resumo Diário
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-sm text-gray-300 flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          globalStatus === 'Crítico' ? 'bg-red-500' : 'bg-[#4fb7b3]'
                        }`}
                      ></span>
                      Status Geral:{' '}
                      <span
                        className={
                          globalStatus === 'Crítico'
                            ? 'text-red-400 font-bold'
                            : 'text-[#a8fbd3] font-bold'
                        }
                      >
                        {globalStatus}
                      </span>
                    </li>
                    <li className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white/20"></span>
                      Próxima Manutenção:{' '}
                      <span className="text-white font-medium">TPA (20%) em 2 dias</span>
                    </li>
                    <li className="text-sm text-gray-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-white/20"></span>
                      Alertas Recentes:
                      <span className="text-white">
                        {criticalCount > 0
                          ? `${criticalParamsNames} fora da faixa.`
                          : 'Nenhum alerta recente.'}
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="text-right hidden md:block opacity-30">
                  <div className="text-3xl font-bold font-heading">
                    {new Date()
                      .toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                      })
                      .toUpperCase()}
                  </div>
                  <div className="text-xs tracking-widest uppercase">Hoje</div>
                </div>
              </motion.div>

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
                {/* Dynamic Parameter Cards */}
                {parameters.map((param) => {
                  const critical = isCritical(param);
                  return (
                    <div
                      key={param.id}
                      className={`border rounded-2xl p-6 backdrop-blur-sm transition-all relative overflow-hidden group
                      ${
                        critical
                          ? 'bg-red-900/10 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                          : 'bg-[#1a1b3b]/60 border-white/10 hover:border-[#4fb7b3]/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`p-3 rounded-xl transition-colors ${
                            critical ? 'bg-red-500/20' : 'bg-white/5 group-hover:bg-[#4fb7b3]/20'
                          }`}
                        >
                          <FlaskConical
                            className={`w-6 h-6 ${
                              critical ? 'text-red-400' : 'text-[#a8fbd3]'
                            }`}
                          />
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
                      <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                        {param.name}
                      </h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-3xl font-heading font-bold">{param.value}</span>
                        <span className="text-sm text-gray-500 font-mono">{param.unit}</span>
                      </div>

                      {/* Range visualizer */}
                      <div className="w-full bg-black/40 h-1.5 rounded-full mt-2 relative overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            critical ? 'bg-red-500' : 'bg-[#4fb7b3]'
                          }`}
                          style={{ width: '60%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 flex justify-between">
                        <span>
                          Meta: {param.min} - {param.max} {param.unit}
                        </span>
                        {critical && <span className="text-red-400 font-bold">Fora da faixa</span>}
                      </p>
                    </div>
                  );
                })}
              </motion.div>
            </>
          )}

          {activeView === 'my-tank' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Tank Profile Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-[#a8fbd3] font-heading font-bold text-lg mb-6">
                    Perfil do Aquário
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Nome</span>
                      <span className="font-bold text-white">Reef Principal</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Volume</span>
                      <span className="font-bold text-white">200 Litros</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Tipo</span>
                      <span className="font-bold text-white">Marinho (LPS/Soft)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-gray-400 text-sm">Data Montagem</span>
                      <span className="font-bold text-white">12/08/2023</span>
                    </div>
                  </div>
                </div>

                {/* Chart Placeholder */}
                <div className="col-span-1 md:col-span-2 bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-white font-heading font-bold text-lg flex items-center gap-2">
                      <BarChart3 className="text-[#4fb7b3]" /> Estabilidade - pH (7 Dias)
                    </h3>
                    <div className="flex gap-2">
                      <button className="text-[10px] bg-[#4fb7b3] text-black px-2 py-1 rounded font-bold">
                        1S
                      </button>
                      <button className="text-[10px] bg-white/10 text-gray-400 px-2 py-1 rounded hover:bg-white/20">
                        1M
                      </button>
                    </div>
                  </div>

                  {/* Fake CSS Chart */}
                  <div className="flex-1 w-full h-40 relative flex items-end justify-between px-2 gap-2 mt-4">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                      <div className="w-full h-px bg-white"></div>
                      <div className="w-full h-px bg-white"></div>
                      <div className="w-full h-px bg-white"></div>
                      <div className="w-full h-px bg-white"></div>
                    </div>

                    {/* Bars representing pH stability */}
                    {[6.8, 6.9, 6.8, 6.9, 7.0, 6.9, 6.8].map((val, i) => {
                      const height = ((val - 6.0) / 2) * 100; // rough scale
                      return (
                        <div
                          key={i}
                          className="relative w-full bg-gradient-to-t from-[#4fb7b3]/20 to-[#4fb7b3] rounded-t-sm group"
                          style={{ height: `${height}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            pH {val}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 mt-2 uppercase font-mono">
                    <span>Seg</span>
                    <span>Ter</span>
                    <span>Qua</span>
                    <span>Qui</span>
                    <span>Sex</span>
                    <span>Sab</span>
                    <span>Dom</span>
                  </div>
                </div>
              </div>

              {/* Historical Logs */}
              <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-white font-heading font-bold text-lg mb-6 flex items-center gap-2">
                  <History className="text-[#4fb7b3]" /> Histórico Recente
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-white/10">
                        <th className="pb-4 pl-4 font-medium">Data</th>
                        <th className="pb-4 font-medium">Parâmetro</th>
                        <th className="pb-4 font-medium">Valor</th>
                        <th className="pb-4 font-medium">Status</th>
                        <th className="pb-4 font-medium">Resp.</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { date: 'Hoje, 14:30', param: 'pH', val: '6.8', status: 'OK', user: 'Você' },
                        {
                          date: 'Hoje, 14:30',
                          param: 'Amônia',
                          val: '0.25 ppm',
                          status: 'Alerta',
                          user: 'Você',
                        },
                        {
                          date: 'Ontem, 09:00',
                          param: 'Temperatura',
                          val: '26.5 °C',
                          status: 'OK',
                          user: 'Você',
                        },
                        {
                          date: '10/05/2025',
                          param: 'TPA',
                          val: '20 Litros',
                          status: 'Manutenção',
                          user: 'Você',
                        },
                        {
                          date: '08/05/2025',
                          param: 'Nitrato',
                          val: '15 ppm',
                          status: 'OK',
                          user: 'Você',
                        },
                      ].map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-4 pl-4 text-gray-300 flex items-center gap-2">
                            <Clock size={14} className="text-[#4fb7b3]" /> {row.date}
                          </td>
                          <td className="py-4 font-bold text-white">{row.param}</td>
                          <td className="py-4 text-gray-300 font-mono">{row.val}</td>
                          <td className="py-4">
                            <span
                              className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${
                                row.status === 'OK'
                                  ? 'bg-[#4fb7b3]/10 text-[#4fb7b3]'
                                  : row.status === 'Alerta'
                                  ? 'bg-red-500/10 text-red-400'
                                  : 'bg-blue-500/10 text-blue-400'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                          <td className="py-4 text-gray-400 text-xs">{row.user}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Maintenance History Table - New Addition */}
              <div className="bg-[#1a1b3b]/60 border border-white/10 rounded-2xl p-6 backdrop-blur-sm mt-6">
                <h3 className="text-white font-heading font-bold text-lg mb-6 flex items-center gap-2">
                  <ClipboardCheck className="text-[#4fb7b3]" /> Histórico de Manutenção
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-gray-400 uppercase tracking-widest border-b border-white/10">
                        <th className="pb-4 pl-4 font-medium">Data</th>
                        <th className="pb-4 font-medium">Tarefa</th>
                        <th className="pb-4 font-medium">Observação</th>
                        <th className="pb-4 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {[
                        { date: '15/05/2025', task: 'Troca Parcial (TPA)', note: '20% - Sifonagem de fundo', status: 'Concluído' },
                        { date: '10/05/2025', task: 'Limpeza do Filtro', note: 'Troca do Perlon', status: 'Concluído' },
                        { date: '01/05/2025', task: 'Poda de Plantas', note: 'Rotalas e Musgo', status: 'Concluído' },
                        { date: '20/04/2025', task: 'Adição de Suplemento', note: 'Ferro e Potássio', status: 'Concluído' },
                      ].map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-4 pl-4 text-gray-300 font-mono">{row.date}</td>
                          <td className="py-4 font-bold text-white">{row.task}</td>
                          <td className="py-4 text-gray-400 text-xs">{row.note}</td>
                          <td className="py-4">
                            <span className="text-[10px] px-2 py-1 rounded-full uppercase font-bold bg-[#4fb7b3]/10 text-[#4fb7b3] flex items-center gap-1 w-fit">
                              <CheckCircle size={10} /> {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* AQUI entra o painel Admin - depois dos blocos overview e my-tank */}
          {isAdmin && <AdminPanel isMaster={isMaster} />}
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
              <p className="text-sm text-gray-400 mb-6">
                Defina os limites seguros para o seu ecossistema. O Titan alertará se os valores
                saírem desta faixa.
              </p>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {parameters.map((param) => (
                  <div key={param.id} className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-[#a8fbd3]">{param.name}</span>
                      <span className="text-xs text-gray-500">{param.unit}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400">
                          Mínimo
                        </label>
                        <input
                          type="number"
                          step={param.step}
                          value={param.min}
                          onChange={(e) =>
                            handleThresholdChange(param.id, 'min', e.target.value)
                          }
                          className="w-full bg-[#05051a] border border-white/10 rounded px-3 py-2 text-sm focus:border-[#4fb7b3] outline-none text-white"
                        />
                      </div>
                      <div className="w-4 h-[1px] bg-white/20 mt-4"></div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] uppercase tracking-widest text-gray-400">
                          Máximo
                        </label>
                        <input
                          type="number"
                          step={param.step}
                          value={param.max}
                          onChange={(e) =>
                            handleThresholdChange(param.id, 'max', e.target.value)
                          }
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

      {/* Travel Mode Modal */}
      <AnimatePresence>
        {isTravelModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsTravelModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1b3b] border border-white/20 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsTravelModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#4fb7b3]/10 rounded-lg">
                  <Plane className="text-[#4fb7b3]" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-bold text-white">Modo Viagem</h2>
                  <p className="text-sm text-gray-400">
                    Gere um guia automático para quem vai cuidar do seu tanque.
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5 mt-6">
                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#4fb7b3]">
                      Partida
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={travelPlan.startDate}
                        onChange={(e) =>
                          setTravelPlan({ ...travelPlan, startDate: e.target.value })
                        }
                        className="w-full bg-[#05051a] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-[#4fb7b3] outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#4fb7b3]">
                      Retorno
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={travelPlan.endDate}
                        onChange={(e) =>
                          setTravelPlan({ ...travelPlan, endDate: e.target.value })
                        }
                        className="w-full bg-[#05051a] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-[#4fb7b3] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#4fb7b3]">
                      Alimentação
                    </label>
                    <textarea
                      value={travelPlan.foodInstructions}
                      onChange={(e) =>
                        setTravelPlan({ ...travelPlan, foodInstructions: e.target.value })
                      }
                      className="w-full bg-[#05051a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#4fb7b3] outline-none h-20 resize-none"
                      placeholder="Ex: Uma pitada de flocos 1x ao dia."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#4fb7b3]">
                      Dosagem / Suplementos
                    </label>
                    <textarea
                      value={travelPlan.dosingInstructions}
                      onChange={(e) =>
                        setTravelPlan({
                          ...travelPlan,
                          dosingInstructions: e.target.value,
                        })
                      }
                      className="w-full bg-[#05051a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#4fb7b3] outline-none h-20 resize-none"
                      placeholder="Ex: 5ml de Prime se fizer TPA de emergência."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#4fb7b3]">
                        Contato de Emergência
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={travelPlan.emergencyContact}
                          onChange={(e) =>
                            setTravelPlan({
                              ...travelPlan,
                              emergencyContact: e.target.value,
                            })
                          }
                          placeholder="Nome"
                          className="w-full bg-[#05051a] border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white text-sm focus:border-[#4fb7b3] outline-none"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-[#4fb7b3]">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={travelPlan.emergencyPhone}
                        onChange={(e) =>
                          setTravelPlan({
                            ...travelPlan,
                            emergencyPhone: e.target.value,
                          })
                        }
                        placeholder="(00) 00000-0000"
                        className="w-full bg-[#05051a] border border-white/10 rounded-lg py-3 px-4 text-white text-sm focus:border-[#4fb7b3] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-[#4fb7b3]">
                      Notas Adicionais
                    </label>
                    <textarea
                      value={travelPlan.notes}
                      onChange={(e) =>
                        setTravelPlan({ ...travelPlan, notes: e.target.value })
                      }
                      className="w-full bg-[#05051a] border border-white/10 rounded-lg p-3 text-white text-sm focus:border-[#4fb7b3] outline-none h-20 resize-none"
                      placeholder="Instruções sobre filtro, luz ou equipamento."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setIsTravelModalOpen(false)}
                  className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={generateTravelGuide}
                  className="bg-[#4fb7b3] text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2 shadow-lg shadow-[#4fb7b3]/20"
                >
                  <Download size={16} /> Baixar Guia PDF
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsLogoutConfirmOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1a1b3b] border border-white/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mx-auto w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <LogOut className="text-red-400" size={24} />
              </div>
              <h3 className="text-lg font-heading font-bold text-white mb-2">
                Encerrar Sessão?
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Tem certeza que deseja sair do TitanAquatics?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    signOut();
                    setIsLogoutConfirmOpen(false);
                  }}
                  className="bg-red-500/80 text-white px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-500 transition-colors shadow-lg shadow-red-500/20"
                >
                  Sair
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