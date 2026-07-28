/// Mapas partilhados de estado para ServiceRequest e Quote — usados por
/// RequestCard e pelas páginas de pedidos/propostas (cliente e
/// profissional) para nunca duplicar esta tradução em cada página.

export const SERVICE_REQUEST_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Rascunho',
  PUBLISHED: 'Publicado',
  IN_NEGOTIATION: 'Em negociação',
  SCHEDULED: 'Agendado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  ARCHIVED: 'Arquivado',
};

export const SERVICE_REQUEST_STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'success' | 'destructive' | 'outline'
> = {
  DRAFT: 'outline',
  PUBLISHED: 'default',
  IN_NEGOTIATION: 'secondary',
  SCHEDULED: 'secondary',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  ARCHIVED: 'outline',
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  SENT: 'Enviado',
  ACCEPTED: 'Aceite',
  REJECTED: 'Rejeitado',
  WITHDRAWN: 'Retirado',
};

export const QUOTE_STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success' | 'destructive' | 'outline'> = {
  SENT: 'secondary',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  WITHDRAWN: 'outline',
};

export const URGENCY_LABELS: Record<string, string> = {
  hoje: 'Hoje',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mês',
  'sem-urgencia': 'Sem urgência',
};
