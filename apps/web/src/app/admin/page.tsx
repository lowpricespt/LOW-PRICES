'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import {
  fetchProfessionalsForReview,
  updateProfessionalVerification,
  type AdminProfessional,
} from '@/features/admin/services/admin-api';
import type { ApiError } from '@/services/api';
import { cn } from '@/lib/utils';

const STATUS_TABS = [
  { id: 'PENDING', label: 'Pendentes' },
  { id: 'APPROVED', label: 'Aprovados' },
  { id: 'REJECTED', label: 'Rejeitados' },
] as const;

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  IDENTITY: 'Cartão de Cidadão / Passaporte',
  PROOF_OF_ACTIVITY: 'Comprovativo de atividade',
  CERTIFICATE: 'Certificado',
};

function ProfessionalCard({
  professional,
  onReviewed,
}: {
  professional: AdminProfessional;
  onReviewed: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReview(status: 'APPROVED' | 'REJECTED') {
    setError(null);
    setIsSubmitting(true);
    try {
      await updateProfessionalVerification(professional.id, status);
      onReviewed();
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível atualizar o estado.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{professional.user.name}</p>
          <p className="text-sm text-muted-foreground">{professional.user.email}</p>
          {professional.user.phone ? (
            <p className="text-sm text-muted-foreground">{professional.user.phone}</p>
          ) : null}
        </div>
        <Badge variant="secondary">{professional.city ?? 'Sem morada'}</Badge>
      </div>

      {professional.bio ? <p className="mt-3 text-sm text-muted-foreground">{professional.bio}</p> : null}

      {professional.categories.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {professional.categories.map((category) => (
            <Badge key={category.id} variant="outline">
              {category.name}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-destructive">Sem categorias escolhidas.</p>
      )}

      <div className="mt-3 space-y-1.5">
        {professional.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum documento enviado ainda.</p>
        ) : (
          professional.documents.map((document) => (
            <div key={document.id} className="flex items-center justify-between text-sm">
              <span>{DOCUMENT_TYPE_LABELS[document.type] ?? document.type}</span>
              {document.fileUrl ? (
                <a
                  href={document.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-medium text-primary hover:underline"
                >
                  Ver <ExternalLink className="size-3.5" />
                </a>
              ) : (
                <span className="text-muted-foreground">Sem ficheiro</span>
              )}
            </div>
          ))
        )}
      </div>

      {professional.verificationStatus === 'PENDING' && (
        <div className="mt-4 flex items-center gap-2">
          <Button size="sm" disabled={isSubmitting} onClick={() => handleReview('APPROVED')}>
            Aprovar
          </Button>
          <Button size="sm" variant="outline" disabled={isSubmitting} onClick={() => handleReview('REJECTED')}>
            Rejeitar
          </Button>
        </div>
      )}
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
    </Card>
  );
}

export default function AdminProfessionalsPage() {
  const [status, setStatus] = useState<(typeof STATUS_TABS)[number]['id']>('PENDING');
  const [professionals, setProfessionals] = useState<AdminProfessional[] | null>(null);
  const [error, setError] = useState(false);

  function load() {
    setProfessionals(null);
    fetchProfessionalsForReview(status)
      .then(setProfessionals)
      .catch(() => setError(true));
  }

  useEffect(load, [status]);

  return (
    <div>
      <DashboardPageHeader
        title="Verificação de profissionais"
        description="Revê os documentos e aprova ou rejeita contas de profissionais."
      />

      <div className="mt-2 flex gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setStatus(tab.id)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
              status === tab.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {error ? (
          <ErrorState onRetry={load} />
        ) : professionals === null ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : professionals.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Sem contas nesta categoria"
            description="Assim que houver profissionais neste estado, aparecem aqui."
          />
        ) : (
          <div className="space-y-3">
            {professionals.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} onReviewed={load} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
