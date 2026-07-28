import { MapPin, MessageSquare } from 'lucide-react';
import { Badge, Card } from '@/components/ui';
import { REQUEST_STATUS_LABELS, REQUEST_STATUS_BADGE_VARIANT, type MockServiceRequest } from '../mock-data';

export function RequestCard({ request }: { request: MockServiceRequest }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{request.category}</p>
          <h3 className="mt-0.5 font-medium">{request.title}</h3>
        </div>
        <Badge variant={REQUEST_STATUS_BADGE_VARIANT[request.status]}>
          {REQUEST_STATUS_LABELS[request.status]}
        </Badge>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5" />
          {request.location}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="size-3.5" />
          {request.quotesCount} orçamento{request.quotesCount === 1 ? '' : 's'}
        </span>
        <span>{new Date(request.createdAt).toLocaleDateString('pt-PT')}</span>
      </div>
    </Card>
  );
}
