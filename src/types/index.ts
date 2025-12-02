/**
 * Tipos centralizados do Titan Aquatics
 * Baseados na estrutura real do Supabase
 */

// ============================================
// CORE TYPES - Mapeados do Supabase
// ============================================

export type SubscriptionTier = 'hobby' | 'pro' | 'master';

export type TankType = 'Doce' | 'Marinho' | 'Reef' | 'Jumbo' | 'Plantado';

export type EventType = 'Feira' | 'Encontro' | 'Campeonato' | 'Workshop' | 'Loja';

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

export type TaskFrequency = 
  | 'diaria' 
  | 'semanal' 
  | 'quinzenal' 
  | 'mensal' 
  | 'trimestral'
  | 'unica';

// ============================================
// USER & AUTH
// ============================================

export interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at?: string;
  // Gamificação
  current_streak?: number;
  longest_streak?: number;
  total_points?: number;
  badges?: string[];
}

// ============================================
// AQUARIUMS
// ============================================

export interface Aquarium {
  id: string;
  user_id: string;
  name: string;
  volume: number; // volume_liters no banco
  sump_volume?: number; // sump_volume_liters no banco
  type: TankType; // tank_type no banco
  setup_date?: string;
  fauna?: string;
  equipment?: string;
  photo_url?: string;
  notes?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Payload para criar/atualizar aquário (nomes do banco)
export interface AquariumPayload {
  name: string;
  volume_liters: number;
  sump_volume_liters?: number;
  tank_type: TankType;
  setup_date?: string | null;
  fauna?: string;
  equipment?: string;
  photo_url?: string;
  notes?: string;
  user_id: string;
}

// ============================================
// WATER TESTS - Parâmetros da Água
// ============================================

export interface WaterTest {
  id: string;
  aquarium_id: string;
  user_id: string;
  measured_at: string;
  
  // Parâmetros básicos
  temperature?: number;
  ph?: number;
  ammonia?: number;
  nitrite?: number;
  nitrate?: number;
  
  // Parâmetros avançados (marinho/reef)
  salinity?: number;
  alkalinity?: number; // dKH
  calcium?: number; // ppm
  magnesium?: number; // ppm
  phosphate?: number;
  
  // Água doce avançado
  gh?: number; // General Hardness
  kh?: number; // Carbonate Hardness
  co2?: number; // ppm (calculado ou medido)
  
  notes?: string;
  created_at?: string;
}

// Ranges ideais por tipo de aquário
export interface ParameterRange {
  min: number;
  max: number;
  ideal_min: number;
  ideal_max: number;
  unit: string;
  critical_low?: number;
  critical_high?: number;
}

export const PARAMETER_RANGES: Record<TankType, Record<string, ParameterRange>> = {
  'Doce': {
    temperature: { min: 22, max: 30, ideal_min: 24, ideal_max: 28, unit: '°C' },
    ph: { min: 6.0, max: 8.0, ideal_min: 6.5, ideal_max: 7.5, unit: '' },
    ammonia: { min: 0, max: 0.5, ideal_min: 0, ideal_max: 0.02, unit: 'ppm', critical_high: 0.1 },
    nitrite: { min: 0, max: 1, ideal_min: 0, ideal_max: 0.02, unit: 'ppm', critical_high: 0.5 },
    nitrate: { min: 0, max: 80, ideal_min: 0, ideal_max: 40, unit: 'ppm' },
  },
  'Plantado': {
    temperature: { min: 22, max: 28, ideal_min: 24, ideal_max: 26, unit: '°C' },
    ph: { min: 6.0, max: 7.5, ideal_min: 6.2, ideal_max: 7.0, unit: '' },
    ammonia: { min: 0, max: 0.5, ideal_min: 0, ideal_max: 0.02, unit: 'ppm' },
    nitrite: { min: 0, max: 1, ideal_min: 0, ideal_max: 0.02, unit: 'ppm' },
    nitrate: { min: 5, max: 50, ideal_min: 10, ideal_max: 30, unit: 'ppm' },
    co2: { min: 10, max: 40, ideal_min: 20, ideal_max: 30, unit: 'ppm' },
  },
  'Marinho': {
    temperature: { min: 23, max: 28, ideal_min: 25, ideal_max: 27, unit: '°C' },
    ph: { min: 7.8, max: 8.5, ideal_min: 8.1, ideal_max: 8.4, unit: '' },
    ammonia: { min: 0, max: 0.1, ideal_min: 0, ideal_max: 0.01, unit: 'ppm' },
    nitrite: { min: 0, max: 0.2, ideal_min: 0, ideal_max: 0.01, unit: 'ppm' },
    nitrate: { min: 0, max: 20, ideal_min: 0, ideal_max: 10, unit: 'ppm' },
    salinity: { min: 1.020, max: 1.028, ideal_min: 1.024, ideal_max: 1.026, unit: 'sg' },
  },
  'Reef': {
    temperature: { min: 24, max: 27, ideal_min: 25, ideal_max: 26.5, unit: '°C' },
    ph: { min: 7.9, max: 8.5, ideal_min: 8.1, ideal_max: 8.4, unit: '' },
    ammonia: { min: 0, max: 0.05, ideal_min: 0, ideal_max: 0, unit: 'ppm' },
    nitrite: { min: 0, max: 0.1, ideal_min: 0, ideal_max: 0, unit: 'ppm' },
    nitrate: { min: 0, max: 10, ideal_min: 0, ideal_max: 5, unit: 'ppm' },
    salinity: { min: 1.023, max: 1.027, ideal_min: 1.025, ideal_max: 1.026, unit: 'sg' },
    alkalinity: { min: 7, max: 12, ideal_min: 8, ideal_max: 9.5, unit: 'dKH' },
    calcium: { min: 350, max: 500, ideal_min: 420, ideal_max: 450, unit: 'ppm' },
    magnesium: { min: 1200, max: 1500, ideal_min: 1300, ideal_max: 1400, unit: 'ppm' },
    phosphate: { min: 0, max: 0.1, ideal_min: 0.01, ideal_max: 0.05, unit: 'ppm' },
  },
  'Jumbo': {
    temperature: { min: 24, max: 30, ideal_min: 26, ideal_max: 28, unit: '°C' },
    ph: { min: 6.5, max: 8.0, ideal_min: 7.0, ideal_max: 7.5, unit: '' },
    ammonia: { min: 0, max: 0.5, ideal_min: 0, ideal_max: 0.05, unit: 'ppm' },
    nitrite: { min: 0, max: 1, ideal_min: 0, ideal_max: 0.1, unit: 'ppm' },
    nitrate: { min: 0, max: 100, ideal_min: 0, ideal_max: 50, unit: 'ppm' },
  },
};

// ============================================
// MAINTENANCE TASKS
// ============================================

export interface MaintenanceTask {
  id: string;
  aquarium_id: string;
  user_id: string;
  
  title: string;
  type: MaintenanceTaskType;
  description?: string;
  
  // Agendamento
  frequency: TaskFrequency;
  scheduled_date: string;
  completed_at?: string;
  is_completed: boolean;
  
  // Recorrência
  next_occurrence?: string;
  last_completed?: string;
  
  // Notificações
  reminder_hours_before?: number;
  
  created_at?: string;
  updated_at?: string;
}

// ============================================
// TRAVEL GUIDES (Modo Viagem)
// ============================================

export interface TravelGuide {
  id: string;
  user_id: string;
  aquarium_id?: string;
  
  title: string;
  start_date: string;
  end_date: string;
  
  // Instruções
  feeding_instructions: string;
  dosing_instructions?: string;
  emergency_instructions?: string;
  general_notes?: string;
  
  // Contato de emergência
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // PDF gerado
  pdf_url?: string;
  
  created_at?: string;
}

// ============================================
// EVENTS (Mural de Eventos)
// ============================================

export interface AquariumEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description?: string;
  type: EventType;
  image?: string;
  link?: string;
  video_url?: string;
  
  // Metadados
  created_by?: string;
  is_featured?: boolean;
  
  created_at?: string;
  updated_at?: string;
}

// ============================================
// FAUNA (Banco de Espécies)
// ============================================

export interface FaunaSpecies {
  id: string;
  common_name: string;
  scientific_name: string;
  
  // Classificação
  category: 'fish' | 'invertebrate' | 'coral' | 'plant' | 'other';
  family?: string;
  
  // Requisitos
  tank_type: TankType[];
  min_tank_size: number; // litros
  temperature_min: number;
  temperature_max: number;
  ph_min: number;
  ph_max: number;
  
  // Comportamento
  temperament: 'peaceful' | 'semi-aggressive' | 'aggressive';
  diet: string;
  care_level: 'beginner' | 'intermediate' | 'expert';
  
  // Compatibilidade
  compatible_with?: string[];
  incompatible_with?: string[];
  
  // Info adicional
  max_size?: number; // cm
  lifespan?: string;
  origin?: string;
  description?: string;
  image_url?: string;
  
  created_at?: string;
}

// ============================================
// GAMIFICATION
// ============================================

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'maintenance' | 'testing' | 'community' | 'achievement' | 'special' | 'streak';
  points: number;
  
  // Critérios para ganhar
  criteria: {
    type: 'count' | 'streak' | 'milestone' | 'event';
    target: number;
    metric: string;
  };
}

export interface UserAchievement {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

// Badges pré-definidos
export const AVAILABLE_BADGES: Badge[] = [
  {
    id: 'first_tank',
    name: 'Primeiro Passo',
    description: 'Cadastrou seu primeiro aquário',
    icon: '🐠',
    category: 'achievement',
    points: 10,
    criteria: { type: 'count', target: 1, metric: 'aquariums' },
  },
  {
    id: 'week_streak',
    name: 'Dedicação Semanal',
    description: 'Manteve 7 dias seguidos de registros',
    icon: '🔥',
    category: 'streak',
    points: 50,
    criteria: { type: 'streak', target: 7, metric: 'daily_logs' },
  },
  {
    id: 'month_streak',
    name: 'Mestre da Consistência',
    description: 'Manteve 30 dias seguidos de registros',
    icon: '⭐',
    category: 'streak',
    points: 200,
    criteria: { type: 'streak', target: 30, metric: 'daily_logs' },
  },
  {
    id: 'first_test',
    name: 'Cientista Iniciante',
    description: 'Registrou seu primeiro teste de água',
    icon: '🧪',
    category: 'testing',
    points: 15,
    criteria: { type: 'count', target: 1, metric: 'water_tests' },
  },
  {
    id: 'test_master',
    name: 'Laboratorista',
    description: 'Registrou 50 testes de água',
    icon: '🔬',
    category: 'testing',
    points: 100,
    criteria: { type: 'count', target: 50, metric: 'water_tests' },
  },
  {
    id: 'stable_params',
    name: 'Estabilidade Total',
    description: 'Manteve parâmetros ideais por 30 dias',
    icon: '💎',
    category: 'achievement',
    points: 300,
    criteria: { type: 'milestone', target: 30, metric: 'stable_days' },
  },
  {
    id: 'maintenance_pro',
    name: 'Manutenção em Dia',
    description: 'Completou 20 tarefas de manutenção',
    icon: '🔧',
    category: 'maintenance',
    points: 75,
    criteria: { type: 'count', target: 20, metric: 'completed_tasks' },
  },
  {
    id: 'multi_tank',
    name: 'Aquarista Múltiplo',
    description: 'Gerencia 3+ aquários ativamente',
    icon: '🏆',
    category: 'achievement',
    points: 100,
    criteria: { type: 'count', target: 3, metric: 'active_aquariums' },
  },
];

// ============================================
// UI/CHAT TYPES
// ============================================

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
  timestamp?: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error' | 'loading';
}

// ============================================
// LEGACY TYPES (para compatibilidade)
// ============================================

export interface Artist {
  id: string;
  name: string;
  genre: string;
  image: string;
  day: string;
  description: string;
}

export enum Section {
  HERO = 'hero',
  LINEUP = 'lineup',
  EXPERIENCE = 'experience',
  TICKETS = 'tickets',
}
