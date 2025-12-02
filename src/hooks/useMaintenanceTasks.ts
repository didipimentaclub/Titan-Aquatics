/**
 * Hook para gerenciamento de tarefas de manutenção
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { MaintenanceTask, TaskFrequency } from '../types';
import { formatDate, getDaysDifference } from '../utils/helpers';

interface UseMaintenanceTasksOptions {
  aquariumId?: string;
  showCompleted?: boolean;
}

interface UseMaintenanceTasksReturn {
  tasks: MaintenanceTask[];
  loading: boolean;
  error: string | null;
  addTask: (task: Partial<MaintenanceTask>) => Promise<{ success: boolean; error?: string }>;
  updateTask: (id: string, updates: Partial<MaintenanceTask>) => Promise<{ success: boolean; error?: string }>;
  deleteTask: (id: string) => Promise<{ success: boolean; error?: string }>;
  completeTask: (id: string) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
  pendingTasks: MaintenanceTask[];
  completedTasks: MaintenanceTask[];
  overdueTasks: MaintenanceTask[];
  upcomingTasks: MaintenanceTask[];
  todayTasks: MaintenanceTask[];
}

export function useMaintenanceTasks(
  userId: string | undefined,
  options: UseMaintenanceTasksOptions = {}
): UseMaintenanceTasksReturn {
  const { aquariumId, showCompleted = false } = options;
  
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('maintenance_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: true });
      
      if (aquariumId) {
        query = query.eq('aquarium_id', aquariumId);
      }
      
      if (!showCompleted) {
        query = query.eq('is_completed', false);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setTasks(data || []);
    } catch (err: any) {
      console.error('Error fetching maintenance tasks:', err);
      setError(err.message || 'Erro ao carregar tarefas');
    } finally {
      setLoading(false);
    }
  }, [userId, aquariumId, showCompleted]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = async (
    taskData: Partial<MaintenanceTask>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!userId) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    try {
      const payload = {
        ...taskData,
        user_id: userId,
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      
      const { error: insertError } = await supabase
        .from('maintenance_tasks')
        .insert([payload]);
      
      if (insertError) throw insertError;
      
      await fetchTasks();
      return { success: true };
    } catch (err: any) {
      console.error('Error adding maintenance task:', err);
      return { success: false, error: err.message || 'Erro ao salvar tarefa' };
    }
  };

  const updateTask = async (
    id: string,
    updates: Partial<MaintenanceTask>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: updateError } = await supabase
        .from('maintenance_tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      await fetchTasks();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating maintenance task:', err);
      return { success: false, error: err.message || 'Erro ao atualizar tarefa' };
    }
  };

  const deleteTask = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error: deleteError } = await supabase
        .from('maintenance_tasks')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      setTasks(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting maintenance task:', err);
      return { success: false, error: err.message || 'Erro ao excluir tarefa' };
    }
  };

  const completeTask = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const task = tasks.find(t => t.id === id);
    if (!task) {
      return { success: false, error: 'Tarefa não encontrada' };
    }
    
    try {
      const now = new Date().toISOString();
      
      // Marcar como completa
      const { error: updateError } = await supabase
        .from('maintenance_tasks')
        .update({
          is_completed: true,
          completed_at: now,
          last_completed: now,
        })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Se for recorrente, criar próxima ocorrência
      if (task.frequency !== 'unica') {
        const nextDate = calculateNextOccurrence(
          new Date(task.scheduled_date),
          task.frequency
        );
        
        await supabase.from('maintenance_tasks').insert([{
          ...task,
          id: undefined,
          scheduled_date: nextDate.toISOString(),
          is_completed: false,
          completed_at: null,
          created_at: now,
        }]);
      }
      
      await fetchTasks();
      return { success: true };
    } catch (err: any) {
      console.error('Error completing maintenance task:', err);
      return { success: false, error: err.message || 'Erro ao completar tarefa' };
    }
  };

  // Filtros computados
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);
  
  const overdueTasks = pendingTasks.filter(t => {
    const scheduled = new Date(t.scheduled_date);
    return scheduled < today;
  });
  
  const todayTasks = pendingTasks.filter(t => {
    const scheduled = new Date(t.scheduled_date);
    return scheduled >= today && scheduled < tomorrow;
  });
  
  const upcomingTasks = pendingTasks.filter(t => {
    const scheduled = new Date(t.scheduled_date);
    return scheduled >= tomorrow && scheduled < nextWeek;
  });

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    completeTask,
    refresh: fetchTasks,
    pendingTasks,
    completedTasks,
    overdueTasks,
    upcomingTasks,
    todayTasks,
  };
}

/**
 * Calcula próxima ocorrência baseado na frequência
 */
function calculateNextOccurrence(currentDate: Date, frequency: TaskFrequency): Date {
  const next = new Date(currentDate);
  
  switch (frequency) {
    case 'diaria':
      next.setDate(next.getDate() + 1);
      break;
    case 'semanal':
      next.setDate(next.getDate() + 7);
      break;
    case 'quinzenal':
      next.setDate(next.getDate() + 14);
      break;
    case 'mensal':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'trimestral':
      next.setMonth(next.getMonth() + 3);
      break;
    default:
      // 'unica' - não deveria chegar aqui
      break;
  }
  
  return next;
}

/**
 * Hook para estatísticas de manutenção
 */
export function useMaintenanceStats(tasks: MaintenanceTask[]) {
  const getCompletionRate = useCallback((days: number = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const recentTasks = tasks.filter(t => {
      const scheduled = new Date(t.scheduled_date);
      return scheduled >= cutoff;
    });
    
    if (recentTasks.length === 0) return 100;
    
    const completed = recentTasks.filter(t => t.is_completed).length;
    return Math.round((completed / recentTasks.length) * 100);
  }, [tasks]);

  const getCurrentStreak = useCallback(() => {
    // Calcular streak de dias consecutivos com tarefas completas
    const completedDates = new Set<string>();
    
    tasks
      .filter(t => t.is_completed && t.completed_at)
      .forEach(t => {
        const date = new Date(t.completed_at!);
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        completedDates.add(key);
      });
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const key = `${checkDate.getFullYear()}-${checkDate.getMonth()}-${checkDate.getDate()}`;
      
      if (completedDates.has(key)) {
        streak++;
      } else if (i > 0) {
        // Permite que hoje não tenha tarefa ainda
        break;
      }
    }
    
    return streak;
  }, [tasks]);

  return {
    completionRate: getCompletionRate(),
    currentStreak: getCurrentStreak(),
    totalCompleted: tasks.filter(t => t.is_completed).length,
    totalPending: tasks.filter(t => !t.is_completed).length,
  };
}
