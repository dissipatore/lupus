import type { ComponentType } from 'react';
import { Eye, Shield, User, Ghost, Moon } from 'lucide-react';

export interface Role {
  id: string;
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}

export const ROLES: Role[] = [
  {
    id: 'werewolf',
    name: 'Lupo Mannaro',
    description: 'Di notte, sbrana un villico.',
    icon: Moon,
  },
  {
    id: 'villager',
    name: 'Villico',
    description: 'Tenta di scoprire ed eliminare i lupi.',
    icon: User,
  },
  {
    id: 'seer',
    name: 'Veggente',
    description: 'Di notte, può spiare il ruolo di un giocatore.',
    icon: Eye,
  },
  {
    id: 'bodyguard',
    name: 'Guardia del Corpo',
    description: 'Di notte, può proteggere un giocatore.',
    icon: Shield,
  },
];

export const UNASSIGNED_ROLE: Role = {
    id: 'unassigned',
    name: 'Non Assegnato',
    description: 'Assegna un ruolo a questo giocatore.',
    icon: Ghost,
}
