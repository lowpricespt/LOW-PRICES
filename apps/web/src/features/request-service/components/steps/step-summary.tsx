'use client';

import { SERVICE_CATEGORIES } from '@/constants/categories';
import { URGENCY_OPTIONS } from '../../constants/steps';
import { useRequestServiceStore } from '../../store/use-request-service-store';

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function StepSummary() {
  const formData = useRequestServiceStore((state) => state.formData);

  const category = SERVICE_CATEGORIES.find((item) => item.id === formData.categoryId);
  const urgency = URGENCY_OPTIONS.find((item) => item.id === formData.urgency);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Confirma o teu pedido
      </h1>
      <p className="mt-2 text-muted-foreground">Revê tudo antes de publicares.</p>

      <div className="mt-6 rounded-xl border border-border p-4">
        <SummaryRow label="Categoria" value={category?.name ?? '—'} />
        <SummaryRow label="Localização" value={formData.location || '—'} />
        <SummaryRow label="Urgência" value={urgency?.label ?? '—'} />
        <SummaryRow label="Orçamento" value={formData.budget ? `${formData.budget} €` : 'Não indicado'} />
        <SummaryRow label="Fotografias" value={`${formData.photoCount}`} />
      </div>

      {formData.description ? (
        <div className="mt-4 rounded-xl bg-secondary p-4 text-sm text-muted-foreground">
          {formData.description}
        </div>
      ) : null}
    </div>
  );
}
