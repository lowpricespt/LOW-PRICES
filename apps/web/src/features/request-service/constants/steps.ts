import type { StepperStep } from '@/components/ui';

export const REQUEST_SERVICE_STEPS: StepperStep[] = [
  { id: 'categoria', label: 'Categoria' },
  { id: 'detalhes', label: 'Detalhes' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'localizacao', label: 'Localização' },
  { id: 'urgencia', label: 'Urgência' },
  { id: 'orcamento', label: 'Orçamento' },
  { id: 'resumo', label: 'Resumo' },
  { id: 'publicar', label: 'Publicar' },
];

export const URGENCY_OPTIONS = [
  { id: 'hoje', label: 'Hoje' },
  { id: 'esta-semana', label: 'Esta semana' },
  { id: 'este-mes', label: 'Este mês' },
  { id: 'sem-urgencia', label: 'Sem urgência' },
] as const;

export type UrgencyId = (typeof URGENCY_OPTIONS)[number]['id'];
