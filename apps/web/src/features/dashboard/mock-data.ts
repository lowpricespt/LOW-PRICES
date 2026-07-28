export type RequestStatus = 'aberto' | 'em_negociacao' | 'agendado' | 'concluido' | 'cancelado';

export interface MockServiceRequest {
  id: string;
  title: string;
  category: string;
  status: RequestStatus;
  location: string;
  createdAt: string; // ISO
  quotesCount: number;
}

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  aberto: 'Aberto',
  em_negociacao: 'Em negociação',
  agendado: 'Agendado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const REQUEST_STATUS_BADGE_VARIANT: Record<RequestStatus, 'default' | 'secondary' | 'success' | 'destructive'> = {
  aberto: 'default',
  em_negociacao: 'secondary',
  agendado: 'secondary',
  concluido: 'success',
  cancelado: 'destructive',
};

/**
 * Dados fictícios só para demonstrar os padrões de UI desta fase. Quando
 * o endpoint GET /requests existir, esta constante é substituída por
 * `useQuery(['requests', filters], () => fetchRequests(filters))` — a
 * página que a consome não muda de estrutura, só a origem dos dados.
 */
export const MOCK_SERVICE_REQUESTS: MockServiceRequest[] = [
  { id: '1', title: 'Reparação de canalização na cozinha', category: 'Canalizador', status: 'em_negociacao', location: 'Vila Nova de Gaia', createdAt: '2026-07-20T10:00:00Z', quotesCount: 3 },
  { id: '2', title: 'Instalação de tomadas extra', category: 'Eletricista', status: 'aberto', location: 'Porto', createdAt: '2026-07-22T14:30:00Z', quotesCount: 0 },
  { id: '3', title: 'Pintura de sala e quarto', category: 'Pintor', status: 'agendado', location: 'Matosinhos', createdAt: '2026-07-15T09:00:00Z', quotesCount: 5 },
  { id: '4', title: 'Limpeza pós-obra', category: 'Limpeza', status: 'concluido', location: 'Porto', createdAt: '2026-06-30T08:00:00Z', quotesCount: 4 },
  { id: '5', title: 'Montagem de roupeiro', category: 'Montagem de móveis', status: 'cancelado', location: 'Gondomar', createdAt: '2026-06-10T11:00:00Z', quotesCount: 1 },
];
