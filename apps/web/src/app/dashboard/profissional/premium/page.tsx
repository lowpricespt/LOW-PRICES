'use client';

import { useEffect, useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { apiClient } from '@/services/api';
import {
  fetchMyAreaAccess,
  activateAreaAccessSimulated,
  type AreaAccessStatus,
} from '@/features/dashboard/services/pricing-api';

interface PricingQuote {
  amount: number; // cêntimos
  currency: 'EUR';
  description: string;
}

interface AreaAccessPlans {
  monthly: PricingQuote;
  weekly: PricingQuote;
}

function formatEuros(cents: number): string {
  return (cents / 100).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
}

const BENEFITS = [
  'Acesso a todos os pedidos da tua área e arredores',
  'Sem limite de orçamentos enviados',
  'Destaque nos resultados de pesquisa dos clientes',
  'Estatísticas detalhadas de desempenho',
  'Suporte prioritário',
];

export default function ProfessionalPremiumPage() {
  const [plans, setPlans] = useState<AreaAccessPlans | null>(null);
  const [status, setStatus] = useState<AreaAccessStatus | null>(null);
  const [error, setError] = useState(false);
  const [activatingPlan, setActivatingPlan] = useState<'monthly' | 'weekly' | null>(null);

  function loadStatus() {
    fetchMyAreaAccess()
      .then(setStatus)
      .catch(() => {
        /* silencioso — a página funciona sem o estado atual, só sem o banner */
      });
  }

  useEffect(() => {
    apiClient
      .get<AreaAccessPlans>('/pricing/area-access')
      .then((response) => setPlans(response.data))
      .catch(() => setError(true));
    loadStatus();
  }, []);

  async function handleActivate(plan: 'monthly' | 'weekly') {
    setActivatingPlan(plan);
    try {
      await activateAreaAccessSimulated(plan);
      loadStatus();
    } catch {
      setError(true);
    } finally {
      setActivatingPlan(null);
    }
  }

  return (
    <div>
      <DashboardPageHeader
        title="Plano Premium"
        description="Garante acesso prioritário aos pedidos da tua área e destaca o teu perfil."
      />

      {status?.isActive && (
        <Card className="mb-6 flex items-center justify-between gap-3 border-primary/40 bg-primary/5 p-4">
          <div>
            <Badge className="mb-1">Plano ativo</Badge>
            <p className="text-sm text-muted-foreground">
              {status.subscriptionTier === 'MONTHLY' ? 'Plano Mensal' : 'Plano Semanal'} — expira em{' '}
              {status.areaAccessExpiresAt
                ? new Date(status.areaAccessExpiresAt).toLocaleDateString('pt-PT')
                : '—'}
            </p>
          </div>
        </Card>
      )}

      {error ? (
        <p className="text-sm text-destructive">Não foi possível carregar os planos. Tenta recarregar a página.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Crown className="size-4" />
              Plano Semanal
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">
              {plans ? formatEuros(plans.weekly.amount) : '—'}
              <span className="text-base font-normal text-muted-foreground"> /semana</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Ideal para testar sem compromisso mensal.</p>
            <Button
              className="mt-6 w-full"
              variant="outline"
              disabled={activatingPlan !== null}
              onClick={() => handleActivate('weekly')}
            >
              {activatingPlan === 'weekly' ? 'A ativar…' : 'Ativar (grátis — modo piloto)'}
            </Button>
          </Card>

          <Card className="relative overflow-hidden border-primary p-6">
            <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
              Mais popular
            </span>
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Crown className="size-4" />
              Plano Mensal
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">
              {plans ? formatEuros(plans.monthly.amount) : '—'}
              <span className="text-base font-normal text-muted-foreground"> /mês</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {plans
                ? `Equivale a ${formatEuros(Math.round(plans.monthly.amount / 4))}/semana`
                : 'O valor com melhor custo-benefício.'}
            </p>
            <Button
              className="mt-6 w-full"
              disabled={activatingPlan !== null}
              onClick={() => handleActivate('monthly')}
            >
              {activatingPlan === 'monthly' ? 'A ativar…' : 'Ativar (grátis — modo piloto)'}
            </Button>
          </Card>
        </div>
      )}

      <Card className="mt-6 p-6">
        <h3 className="font-medium">O que está incluído</h3>
        <ul className="mt-4 space-y-2.5">
          {BENEFITS.map((benefit) => (
            <li key={benefit} className="flex items-start gap-2.5 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Os valores apresentados vêm diretamente do servidor (nunca escritos aqui). Os pagamentos reais (Stripe)
        ainda não estão ligados — por isso a ativação é gratuita neste piloto; quando o Stripe existir, o botão
        passa a cobrar sem alterações a esta página.
      </p>
    </div>
  );
}
