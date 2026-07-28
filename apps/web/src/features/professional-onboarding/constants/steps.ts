import type { StepperStep } from '@/components/ui';

export const PROFESSIONAL_ONBOARDING_STEPS: StepperStep[] = [
  { id: 'conta', label: 'Conta' },
  { id: 'categorias', label: 'Categorias' },
  { id: 'raio', label: 'Raio' },
  { id: 'localizacao', label: 'Localização' },
  { id: 'foto', label: 'Foto' },
  { id: 'descricao', label: 'Descrição' },
  { id: 'documentacao', label: 'Documentos' },
  { id: 'disponibilidade', label: 'Disponibilidade' },
  { id: 'conclusao', label: 'Conclusão' },
];

export const WEEKDAYS = [
  { id: 'seg', label: 'Seg' },
  { id: 'ter', label: 'Ter' },
  { id: 'qua', label: 'Qua' },
  { id: 'qui', label: 'Qui' },
  { id: 'sex', label: 'Sex' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
] as const;
