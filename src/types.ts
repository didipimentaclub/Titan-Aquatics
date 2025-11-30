
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
  type: 'Feira' | 'Encontro' | 'Campeonato' | 'Workshop';
  image?: string;
  link?: string;
}
