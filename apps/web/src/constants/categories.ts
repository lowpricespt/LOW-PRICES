import { Wrench, Zap, PaintRoller, Trees, Sparkles, Truck, Hammer, Laptop, type LucideIcon } from 'lucide-react';

export interface ServiceCategory {
  id: string;
  name: string;
  icon: LucideIcon;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'canalizador', name: 'Canalizador', icon: Wrench },
  { id: 'eletricista', name: 'Eletricista', icon: Zap },
  { id: 'pintor', name: 'Pintor', icon: PaintRoller },
  { id: 'jardinagem', name: 'Jardinagem', icon: Trees },
  { id: 'limpeza', name: 'Limpeza', icon: Sparkles },
  { id: 'mudancas', name: 'Mudanças', icon: Truck },
  { id: 'montagem-moveis', name: 'Montagem de móveis', icon: Hammer },
  { id: 'informatica', name: 'Informática', icon: Laptop },
];
