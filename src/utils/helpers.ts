/**
 * Utilitários gerais do Titan Aquatics
 */

import { ParameterRange, TankType, PARAMETER_RANGES } from '../types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================
// FORMATAÇÃO DE DATAS
// ============================================

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '-';
  
  if (format === 'relative') {
    return getRelativeTime(d);
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) return '-';
  
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) return 'agora mesmo';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
  
  return formatDate(date, 'short');
}

export function getDaysDifference(date1: Date, date2: Date = new Date()): number {
  const diffMs = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================
// FORMATAÇÃO DE NÚMEROS
// ============================================

export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// ============================================
// VALIDAÇÃO DE PARÂMETROS DA ÁGUA
// ============================================

export type ParameterStatus = 'ideal' | 'acceptable' | 'warning' | 'critical';

export interface ParameterAnalysis {
  status: ParameterStatus;
  message: string;
  color: string;
  bgColor: string;
}

export function analyzeParameter(
  paramName: string,
  value: number,
  tankType: TankType
): ParameterAnalysis {
  // ADAPTED: Accessing by [paramName][tankType] instead of [tankType][paramName]
  const range = PARAMETER_RANGES[paramName]?.[tankType];
  
  if (!range) {
    return {
      status: 'acceptable',
      message: 'Sem referência',
      color: 'text-slate-400',
      bgColor: 'bg-slate-500/20',
    };
  }
  
  // Critical
  if (range.critical_low !== undefined && value < range.critical_low) {
    return {
      status: 'critical',
      message: `Crítico! Muito abaixo (ideal: ${range.ideal_min}-${range.ideal_max}${range.unit || ''})`,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
    };
  }
  
  if (range.critical_high !== undefined && value > range.critical_high) {
    return {
      status: 'critical',
      message: `Crítico! Muito acima (ideal: ${range.ideal_min}-${range.ideal_max}${range.unit || ''})`,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/20',
    };
  }
  
  // Ideal
  if (range.ideal_min !== undefined && range.ideal_max !== undefined && value >= range.ideal_min && value <= range.ideal_max) {
    return {
      status: 'ideal',
      message: 'Parâmetro ideal ✓',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
    };
  }
  
  // Acceptable (dentro do range, mas não ideal)
  if (value >= range.min && value <= range.max) {
    const isLow = range.ideal_min !== undefined && value < range.ideal_min;
    return {
      status: 'acceptable',
      message: isLow 
        ? `Pode melhorar (ideal: ${range.ideal_min}+${range.unit || ''})`
        : `Pode melhorar (ideal: até ${range.ideal_max}${range.unit || ''})`,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/20',
    };
  }
  
  // Warning (fora do range)
  return {
    status: 'warning',
    message: value < range.min 
      ? `Muito baixo! (mín: ${range.min}${range.unit || ''})`
      : `Muito alto! (máx: ${range.max}${range.unit || ''})`,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
  };
}

export function getOverallHealth(
  parameters: Record<string, number>,
  tankType: TankType
): { score: number; status: string; color: string } {
  const analyses = Object.entries(parameters).map(([name, value]) => 
    analyzeParameter(name, value, tankType)
  );
  
  const criticalCount = analyses.filter(a => a.status === 'critical').length;
  const warningCount = analyses.filter(a => a.status === 'warning').length;
  const idealCount = analyses.filter(a => a.status === 'ideal').length;
  const total = analyses.length;
  
  if (total === 0) return { score: 0, status: 'Sem dados', color: 'text-slate-400' };

  if (criticalCount > 0) {
    return { score: 20, status: 'Crítico', color: 'text-rose-400' };
  }
  
  if (warningCount > 1) {
    return { score: 40, status: 'Atenção', color: 'text-orange-400' };
  }
  
  if (warningCount === 1) {
    return { score: 60, status: 'Regular', color: 'text-amber-400' };
  }
  
  const idealRatio = idealCount / total;
  
  if (idealRatio >= 0.8) {
    return { score: 100, status: 'Excelente', color: 'text-emerald-400' };
  }
  
  if (idealRatio >= 0.5) {
    return { score: 80, status: 'Bom', color: 'text-[#4fb7b3]' };
  }
  
  return { score: 70, status: 'Regular', color: 'text-amber-400' };
}

// ============================================
// CÁLCULOS DE AQUÁRIO
// ============================================

export function calculateVolume(
  type: 'rectangular' | 'cylinder',
  dimensions: { length?: number; width?: number; height?: number; radius?: number }
): number {
  if (type === 'rectangular') {
    const { length = 0, width = 0, height = 0 } = dimensions;
    return (length * width * height) / 1000; // cm³ para litros
  }
  
  const { radius = 0, height = 0 } = dimensions;
  return (Math.PI * Math.pow(radius, 2) * height) / 1000;
}

export function calculateSubstrate(
  length: number,
  width: number,
  depth: number,
  type: 'sand' | 'gravel' | 'soil'
): number {
  const volume = (length * width * depth) / 1000; // litros
  
  const densities = {
    sand: 1.6,   // kg/L
    gravel: 1.5, // kg/L
    soil: 1.0,   // kg/L
  };
  
  return volume * densities[type];
}

export function calculateCO2(ph: number, kh: number): { level: number; status: string; color: string } {
  // Fórmula: CO2 = 3 * KH * 10^(7-pH)
  const co2 = 3 * kh * Math.pow(10, 7 - ph);
  
  if (co2 < 15) {
    return { level: co2, status: 'Baixo (Algas)', color: 'text-amber-400' };
  }
  
  if (co2 >= 15 && co2 <= 30) {
    return { level: co2, status: 'Ideal (Plantas)', color: 'text-emerald-400' };
  }
  
  return { level: co2, status: 'Alto (Perigo Peixes)', color: 'text-rose-400' };
}

export function calculateEnergyCost(
  watts: number,
  hoursPerDay: number,
  costPerKwh: number
): { monthlyKwh: number; monthlyCost: number } {
  const monthlyKwh = (watts * hoursPerDay * 30) / 1000;
  const monthlyCost = monthlyKwh * costPerKwh;
  
  return { monthlyKwh, monthlyCost };
}

// ============================================
// CONVERSÕES
// ============================================

export const conversions = {
  temperature: {
    celsiusToFahrenheit: (c: number) => (c * 9/5) + 32,
    fahrenheitToCelsius: (f: number) => (f - 32) * 5/9,
  },
  volume: {
    litersToGallons: (l: number) => l * 0.264172,
    gallonsToLiters: (g: number) => g * 3.78541,
  },
  length: {
    cmToInches: (cm: number) => cm * 0.393701,
    inchesToCm: (inches: number) => inches * 2.54,
  },
  hardness: {
    dghToPpm: (dgh: number) => dgh * 17.848,
    ppmToDgh: (ppm: number) => ppm / 17.848,
  },
};

// ============================================
// VALIDAÇÕES
// ============================================

export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================
// STRINGS
// ============================================

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================
// ARRAYS
// ============================================

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortByDate<T extends { [key: string]: any }>(
  array: T[],
  dateKey: keyof T,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateKey]).getTime();
    const dateB = new Date(b[dateKey]).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

// ============================================
// LOCAL STORAGE HELPERS
// ============================================

export function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
}

// ============================================
// DEBOUNCE / THROTTLE
// ============================================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ============================================
// CLASS NAMES HELPER (like clsx)
// ============================================

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return twMerge(clsx(classes));
}
