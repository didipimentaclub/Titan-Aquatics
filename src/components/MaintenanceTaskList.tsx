/**
 * Componente de lista de tarefas de manutenção
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Plus,
  Droplets,
  Filter,
  Utensils,
  FlaskConical,
  Scissors,
  Sparkles,
  RotateCcw,
  MoreHorizontal,
  X,
  Calendar
} from 'lucide-react';
import { MaintenanceTask, MaintenanceTaskType, TaskFrequency, Aquarium } from '../types';
import { formatDate, cn } from '../utils/helpers';

// ============================================
// TASK ITEM
// ============================================

interface TaskItemProps {
  task: MaintenanceTask;
  aquarium?: Aquarium;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

const TASK_ICONS: Record<MaintenanceTaskType, React.ReactNode> = {
  'TPA': <Droplets size={16} />,
  'Limpeza Filtro': <Filter size={16} />,
  'Dosagem': <FlaskConical size={16} />,
  'Alimentação': <Utensils size={16} />,
  'Teste Água': <FlaskConical size={16} />,
  'Poda Plantas': <Scissors size={16} />,
  'Limpeza Vidro': <Sparkles size={16} />,
  'Troca Carvão': <RotateCcw size={16} />,
  'Outro': <MoreHorizontal size={16} />,
};

const TaskItem: React.FC<TaskItemProps> = ({ task, aquarium, onComplete, onDelete }) => {
  const isOverdue = !task.is_completed && new Date(task.scheduled_date) < new Date();
  const isToday = new Date(task.scheduled_date).toDateString() === new Date().toDateString();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl border transition-all",
        task.is_completed
          ? "bg-white/5 border-white/5 opacity-60"
          : isOverdue
            ? "bg-rose-500/10 border-rose-500/30"
            : isToday
              ? "bg-[#4fb7b3]/10 border-[#4fb7b3]/30"
              : "bg-white/5 border-white/10 hover:border-white/20"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={() => onComplete(task.id)}
        className={cn(
          "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
          task.is_completed
            ? "bg-emerald-500 border-emerald-500"
            : isOverdue
              ? "border-rose-400 hover:bg-rose-500/20"
              : "border-white/30 hover:border-[#4fb7b3]"
        )}
      >
        {task.is_completed && <CheckCircle size={14} className="text-white" />}
      </button>

      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 p-2 rounded-lg",
        task.is_completed
          ? "bg-white/10 text-slate-400"
          : isOverdue
            ? "bg-rose-500/20 text-rose-400"
            : "bg-[#4fb7b3]/20 text-[#4fb7b3]"
      )}>
        {TASK_ICONS[task.type] || TASK_ICONS['Outro']}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={cn(
            "font-bold truncate",
            task.is_completed ? "line-through text-slate-400" : "text-white"
          )}>
            {task.title}
          </h4>
          <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-slate-400">
            {task.type}
          </span>
        </div>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          {aquarium && (
            <span className="flex items-center gap-1">
              <Droplets size={10} />
              {aquarium.name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {formatDate(task.scheduled_date)}
          </span>
          {task.frequency !== 'unica' && (
            <span className="text-[#4fb7b3]">↻ {task.frequency}</span>
          )}
        </div>
      </div>

      {/* Status Badge */}
      {!task.is_completed && (
        <div className={cn(
          "flex-shrink-0 px-2 py-1 rounded text-xs font-bold uppercase",
          isOverdue
            ? "bg-rose-500/20 text-rose-400"
            : isToday
              ? "bg-[#4fb7b3]/20 text-[#4fb7b3]"
              : "bg-white/10 text-slate-400"
        )}>
          {isOverdue ? 'Atrasada' : isToday ? 'Hoje' : 'Agendada'}
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={() => onDelete(task.id)}
        className="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-rose-500/20 rounded-lg transition-all text-slate-400 hover:text-rose-400"
      >
        <Trash2 size={16} />
      </button>
    </motion.div>
  );
};

// ============================================
// TASK LIST
// ============================================

interface MaintenanceTaskListProps {
  tasks: MaintenanceTask[];
  aquariums: Aquarium[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onAddClick: () => void;
  showCompleted?: boolean;
}

const MaintenanceTaskList: React.FC<MaintenanceTaskListProps> = ({
  tasks,
  aquariums,
  onComplete,
  onDelete,
  onAddClick,
  showCompleted = false,
}) => {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'today' | 'upcoming'>('all');

  const getAquarium = (id: string) => aquariums.find(a => a.id === id);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const filteredTasks = tasks.filter(task => {
    if (!showCompleted && task.is_completed) return false;
    
    const scheduled = new Date(task.scheduled_date);
    
    switch (filter) {
      case 'overdue':
        return !task.is_completed && scheduled < today;
      case 'today':
        return !task.is_completed && scheduled >= today && scheduled < tomorrow;
      case 'upcoming':
        return !task.is_completed && scheduled >= tomorrow;
      default:
        return true;
    }
  });

  const overdueCount = tasks.filter(t => !t.is_completed && new Date(t.scheduled_date) < today).length;
  const todayCount = tasks.filter(t => !t.is_completed && new Date(t.scheduled_date) >= today && new Date(t.scheduled_date) < tomorrow).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-white">Tarefas de Manutenção</h3>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded text-xs font-bold">
              <AlertTriangle size={12} />
              {overdueCount} atrasada{overdueCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <button
          onClick={onAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-[#4fb7b3] text-black rounded-lg font-bold text-xs uppercase hover:bg-white transition-colors"
        >
          <Plus size={16} />
          Nova Tarefa
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'overdue', label: `Atrasadas (${overdueCount})`, color: overdueCount > 0 ? 'text-rose-400' : '' },
          { key: 'today', label: `Hoje (${todayCount})`, color: todayCount > 0 ? 'text-[#4fb7b3]' : '' },
          { key: 'upcoming', label: 'Próximas' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key as any)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all",
              filter === f.key
                ? "bg-white text-black"
                : `bg-white/5 text-white hover:bg-white/10 ${f.color || ''}`
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-2">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 border border-dashed border-white/10 rounded-xl"
            >
              <CheckCircle size={48} className="mx-auto text-emerald-400 mb-4" />
              <h4 className="text-lg font-bold text-white mb-2">Tudo em dia!</h4>
              <p className="text-slate-400 text-sm">
                {filter === 'all' 
                  ? 'Nenhuma tarefa pendente.'
                  : 'Nenhuma tarefa nesta categoria.'}
              </p>
              <button
                onClick={onAddClick}
                className="mt-4 text-[#4fb7b3] hover:text-white transition-colors text-sm font-bold"
              >
                + Adicionar nova tarefa
              </button>
            </motion.div>
          ) : (
            filteredTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                aquarium={getAquarium(task.aquarium_id)}
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// ============================================
// NEW TASK FORM MODAL
// ============================================

interface NewTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: Partial<MaintenanceTask>) => Promise<{ success: boolean; error?: string }>;
  aquariums: Aquarium[];
}

const TASK_TYPES: MaintenanceTaskType[] = [
  'TPA',
  'Limpeza Filtro',
  'Dosagem',
  'Alimentação',
  'Teste Água',
  'Poda Plantas',
  'Limpeza Vidro',
  'Troca Carvão',
  'Outro',
];

const FREQUENCIES: { value: TaskFrequency; label: string }[] = [
  { value: 'unica', label: 'Única vez' },
  { value: 'diaria', label: 'Diária' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'quinzenal', label: 'Quinzenal' },
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
];

const NewTaskForm: React.FC<NewTaskFormProps> = ({ isOpen, onClose, onSubmit, aquariums }) => {
  const [formData, setFormData] = useState<Partial<MaintenanceTask>>({
    type: 'TPA',
    frequency: 'semanal',
    scheduled_date: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.aquarium_id) {
      setError('Selecione um aquário');
      return;
    }
    
    if (!formData.title?.trim()) {
      setError('Digite um título');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    const result = await onSubmit(formData);
    
    if (result.success) {
      onClose();
      setFormData({
        type: 'TPA',
        frequency: 'semanal',
        scheduled_date: new Date().toISOString().slice(0, 10),
      });
    } else {
      setError(result.error || 'Erro ao criar tarefa');
    }
    
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={onClose} />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-[#1a1b3b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-heading font-bold text-white">Nova Tarefa</h2>
              <button onClick={onClose}>
                <X size={20} className="text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4fb7b3] uppercase">Aquário</label>
                  <select
                    value={formData.aquarium_id || ''}
                    onChange={e => setFormData(prev => ({ ...prev, aquarium_id: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white"
                    required
                  >
                    <option value="">Selecione...</option>
                    {aquariums.map(aq => (
                      <option key={aq.id} value={aq.id}>{aq.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4fb7b3] uppercase">Tipo</label>
                  <select
                    value={formData.type || 'TPA'}
                    onChange={e => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as MaintenanceTaskType,
                      title: prev.title || e.target.value
                    }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white"
                  >
                    {TASK_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4fb7b3] uppercase">Título</label>
                <input
                  type="text"
                  value={formData.title || ''}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: TPA semanal de 20%"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4fb7b3] uppercase">Data</label>
                  <input
                    type="date"
                    value={formData.scheduled_date || ''}
                    onChange={e => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#4fb7b3] uppercase">Frequência</label>
                  <select
                    value={formData.frequency || 'semanal'}
                    onChange={e => setFormData(prev => ({ ...prev, frequency: e.target.value as TaskFrequency }))}
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white"
                  >
                    {FREQUENCIES.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#4fb7b3] uppercase">Descrição (opcional)</label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detalhes da tarefa..."
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white h-20 resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg text-rose-200 text-sm">
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 border border-white/10 rounded-lg text-slate-300 font-bold uppercase hover:bg-white/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-[#4fb7b3] rounded-lg text-black font-bold uppercase hover:bg-white disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : 'Criar Tarefa'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { MaintenanceTaskList, NewTaskForm, TaskItem };
export default MaintenanceTaskList;
