
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  day: string;
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export enum Section {
  HERO = 'hero',
  LINEUP = 'lineup',
  EXPERIENCE = 'experience',
  TICKETS = 'tickets',
}

export interface Aquarium {
  id: string;
  user_id: string;
  name: string;
  volume: number;
  sump_volume?: number; // Novo campo
  type: string;
  setup_date: string;
  fauna: string;
  equipment: string;
  created_at?: string;
}

export interface AquariumEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'Feira' | 'Encontro' | 'Campeonato' | 'Workshop' | 'Loja';
  image?: string;
  link?: string;
  video_url?: string;
}

export type MaintenanceTaskType = 
  | 'TPA'
  | 'Limpeza Filtro'
  | 'Dosagem'
  | 'Alimentação'
  | 'Teste Água'
  | 'Poda Plantas'
  | 'Limpeza Vidro'
  | 'Troca Carvão'
  | 'Outro';

export type TaskFrequency = 'unica' | 'diaria' | 'semanal' | 'quinzenal' | 'mensal' | 'trimestral';

export interface MaintenanceTask {
  id: string;
  aquarium_id: string;
  type: MaintenanceTaskType;
  title: string;
  description?: string;
  scheduled_date: string;
  frequency: TaskFrequency;
  is_completed: boolean;
  completed_at?: string;
  created_at?: string;
}

export type TankType = 'Doce' | 'Plantado' | 'Marinho' | 'Reef' | 'Jumbo';

export interface WaterTest {
  id: string;
  aquarium_id: string;
  measured_at: string;
  temperature?: number;
  ph?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  salinity?: number;
  alkalinity?: number;
  calcium?: number;
  magnesium?: number;
  phosphate?: number;
  gh?: number;
  kh?: number;
  notes?: string;
  created_at?: string;
}

export interface ParameterRange {
  min: number;
  max: number;
  ideal_min?: number;
  ideal_max?: number;
  unit?: string;
  critical_low?: number;
  critical_high?: number;
}

export const PARAMETER_RANGES: Record<string, Record<TankType, ParameterRange>> = {
  temperature: {
    'Doce': { min: 22, max: 30, ideal_min: 24, ideal_max: 28 },
    'Plantado': { min: 22, max: 28, ideal_min: 24, ideal_max: 26 },
    'Marinho': { min: 24, max: 28, ideal_min: 25, ideal_max: 26 },
    'Reef': { min: 24, max: 28, ideal_min: 25, ideal_max: 26 },
    'Jumbo': { min: 24, max: 30, ideal_min: 26, ideal_max: 29 },
  },
  ph: {
    'Doce': { min: 6.0, max: 8.0, ideal_min: 6.8, ideal_max: 7.4 },
    'Plantado': { min: 6.0, max: 7.5, ideal_min: 6.4, ideal_max: 7.0 },
    'Marinho': { min: 7.8, max: 8.5, ideal_min: 8.1, ideal_max: 8.4 },
    'Reef': { min: 7.8, max: 8.5, ideal_min: 8.1, ideal_max: 8.4 },
    'Jumbo': { min: 6.5, max: 8.0, ideal_min: 7.0, ideal_max: 7.6 },
  },
  ammonia: {
    'Doce': { min: 0, max: 0.02, ideal_min: 0, ideal_max: 0 },
    'Plantado': { min: 0, max: 0.02, ideal_min: 0, ideal_max: 0 },
    'Marinho': { min: 0, max: 0.02, ideal_min: 0, ideal_max: 0 },
    'Reef': { min: 0, max: 0.02, ideal_min: 0, ideal_max: 0 },
    'Jumbo': { min: 0, max: 0.02, ideal_min: 0, ideal_max: 0 },
  },
  nitrite: {
    'Doce': { min: 0, max: 0.05, ideal_min: 0, ideal_max: 0 },
    'Plantado': { min: 0, max: 0.05, ideal_min: 0, ideal_max: 0 },
    'Marinho': { min: 0, max: 0.05, ideal_min: 0, ideal_max: 0 },
    'Reef': { min: 0, max: 0.05, ideal_min: 0, ideal_max: 0 },
    'Jumbo': { min: 0, max: 0.05, ideal_min: 0, ideal_max: 0 },
  },
  nitrate: {
    'Doce': { min: 0, max: 50, ideal_min: 5, ideal_max: 20 },
    'Plantado': { min: 0, max: 30, ideal_min: 10, ideal_max: 20 },
    'Marinho': { min: 0, max: 20, ideal_min: 0, ideal_max: 10 },
    'Reef': { min: 0, max: 10, ideal_min: 0, ideal_max: 5 },
    'Jumbo': { min: 0, max: 100, ideal_min: 10, ideal_max: 40 },
  },
  salinity: {
    'Doce': { min: 0, max: 0 },
    'Plantado': { min: 0, max: 0 },
    'Marinho': { min: 1.020, max: 1.028, ideal_min: 1.023, ideal_max: 1.026 },
    'Reef': { min: 1.023, max: 1.027, ideal_min: 1.025, ideal_max: 1.026 },
    'Jumbo': { min: 0, max: 0 },
  },
  alkalinity: {
    'Doce': { min: 0, max: 0 },
    'Plantado': { min: 3, max: 8, ideal_min: 4, ideal_max: 6 },
    'Marinho': { min: 7, max: 12, ideal_min: 8, ideal_max: 10 },
    'Reef': { min: 7, max: 12, ideal_min: 8, ideal_max: 11 },
    'Jumbo': { min: 0, max: 0 },
  },
  calcium: {
    'Doce': { min: 0, max: 0 },
    'Plantado': { min: 0, max: 0 },
    'Marinho': { min: 350, max: 500, ideal_min: 400, ideal_max: 450 },
    'Reef': { min: 380, max: 500, ideal_min: 420, ideal_max: 460 },
    'Jumbo': { min: 0, max: 0 },
  },
  magnesium: {
    'Doce': { min: 0, max: 0 },
    'Plantado': { min: 0, max: 0 },
    'Marinho': { min: 1200, max: 1400, ideal_min: 1250, ideal_max: 1350 },
    'Reef': { min: 1250, max: 1450, ideal_min: 1300, ideal_max: 1400 },
    'Jumbo': { min: 0, max: 0 },
  },
  phosphate: {
    'Doce': { min: 0, max: 2, ideal_min: 0.1, ideal_max: 1 },
    'Plantado': { min: 0.1, max: 3, ideal_min: 0.5, ideal_max: 2 },
    'Marinho': { min: 0, max: 0.1, ideal_min: 0, ideal_max: 0.03 },
    'Reef': { min: 0, max: 0.05, ideal_min: 0, ideal_max: 0.03 },
    'Jumbo': { min: 0, max: 2, ideal_min: 0.1, ideal_max: 1 },
  },
};
