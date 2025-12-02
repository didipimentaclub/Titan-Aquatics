import { ParameterRange, TankType, PARAMETER_RANGES } from '../types';

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  if (format === 'relative') return getRelativeTime(d);
  if (format === 'long') {
    return d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  return d.toLocaleDateString('pt-BR');
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  return formatDate(date, 'short');
}

export type ParameterStatus = 'ideal' | 'acceptable' | 'warning' | 'critical';

export interface ParameterAnalysis {
  status: ParameterStatus;
  message: string;
  color: string;
  bgColor: string;
}

export function analyzeParameter(paramName: string, value: number, tankType: TankType): ParameterAnalysis {
  const ranges = PARAMETER_RANGES[tankType];
  const range = ranges?.[paramName];

  if (!range) {
    return { status: 'acceptable', message: 'Sem referência', color: 'text-slate-400', bgColor: 'bg-slate-500/20' };
  }

  if (range.critical_low !== undefined && value < range.critical_low) {
    return { status: 'critical', message: `Crítico! Muito abaixo`, color: 'text-rose-400', bgColor: 'bg-rose-500/20' };
  }
  if (range.critical_high !== undefined && value > range.critical_high) {
    return { status: 'critical', message: `Crítico! Muito acima`, color: 'text-rose-400', bgColor: 'bg-rose-500/20' };
  }
  if (value >= range.ideal_min && value <= range.ideal_max) {
    return { status: 'ideal', message: 'Parâmetro ideal ✓', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' };
  }
  if (value >= range.min && value <= range.max) {
    return { status: 'acceptable', message: 'Pode melhorar', color: 'text-amber-400', bgColor: 'bg-amber-500/20' };
  }
  return { status: 'warning', message: value < range.min ? 'Muito baixo!' : 'Muito alto!', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
}

export function getOverallHealth(parameters: Record<string, number>, tankType: TankType): { score: number; status: string; color: string } {
  const analyses = Object.entries(parameters).map(([name, value]) => analyzeParameter(name, value, tankType));
  const criticalCount = analyses.filter(a => a.status === 'critical').length;
  const warningCount = analyses.filter(a => a.status === 'warning').length;
  const idealCount = analyses.filter(a => a.status === 'ideal').length;

  if (criticalCount > 0) return { score: 20, status: 'Crítico', color: 'text-rose-400' };
  if (warningCount > 1) return { score: 40, status: 'Atenção', color: 'text-orange-400' };
  if (warningCount === 1) return { score: 60, status: 'Regular', color: 'text-amber-400' };
  if (idealCount / analyses.length >= 0.8) return { score: 100, status: 'Excelente', color: 'text-emerald-400' };
  return { score: 80, status: 'Bom', color: 'text-[#4fb7b3]' };
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
