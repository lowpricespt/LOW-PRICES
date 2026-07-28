import { MapPin, MessageSquare } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { SERVICE_REQUEST_STATUS_LABELS, SERVICE_REQUEST_STATUS_VARIANT } from '../status-maps';
import type { ServiceRequest } from '@/features/request-service/services/requests-api';

/// Título derivado da descrição (não existe um campo "title" separado no
/// pedido — mesma lógica de resumo usada em JobsService.toDto no backend).
function deriveTitle(description: string): string {
  return description.length > 80 ? `${description.slice(0, 80)}…` : description;
}

export function RequestCard({
  request,
  children,
}: {
  request: ServiceRequest;
  /// Slot opcional para ações específicas da página (ex: botão "Enviar
  /// orçamento" em Pedidos disponíveis, ou lista de propostas expandida
  /// em Propostas recebidas) — mantém o RequestCard genérico e reutilizável.
  children?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{request.category.name}</p>
          <h3 className="mt-0.5 font-medium">{deriveTitle(request.description)}</h3>
        </div>
        <Badge variant={SERVICE_REQUEST_STATUS_VARIANT[request.status] ?? 'secondary'}>
          {SERVICE_REQUEST_STATUS_LABELS[request.status] ?? request.status}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {request.location}
        </span>
        {request.quotesCount !== undefined && (
          <span className="flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            {request.quotesCount} orçamento{request.quotesCount === 1 ? '' : 's'}
          </span>
        )}
        <span>{new Date(request.createdAt).toLocaleDateString('pt-PT')}</span>
      </div>

      {children}
    </Card>
  );
}
