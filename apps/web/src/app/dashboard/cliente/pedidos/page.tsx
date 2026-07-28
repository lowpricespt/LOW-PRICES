'use client';

import { useEffect, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button, Skeleton, EmptyState, ErrorState } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { DataListToolbar } from '@/features/dashboard/components/data-list-toolbar';
import { RequestCard } from '@/features/dashboard/components/request-card';
import { SERVICE_REQUEST_STATUS_LABELS } from '@/features/dashboard/status-maps';
import { fetchMyServiceRequests, type ServiceRequest } from '@/features/request-service/services/requests-api';

// Paginação real (page/pageSize) fica para quando o volume justificar —
// por agora traz uma página grande e filtra/ordena no cliente, mesmo
// padrão simples de UI que já existia, só com dados reais.
const PAGE_SIZE = 3;

const FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos os estados' },
  ...Object.entries(SERVICE_REQUEST_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const SORT_OPTIONS = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'antigos', label: 'Mais antigos' },
];

export default function ClientRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [sort, setSort] = useState('recentes');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    fetchMyServiceRequests({ pageSize: 50 })
      .then((result) => setRequests(result.items))
      .catch(() => setError(true));
  }, []);

  const filtered = useMemo(() => {
    let result = requests ?? [];

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (request) =>
          request.description.toLowerCase().includes(query) || request.category.name.toLowerCase().includes(query),
      );
    }

    if (filter !== 'todos') {
      result = result.filter((request) => request.status === filter);
    }

    result = [...result].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === 'recentes' ? -diff : diff;
    });

    return result;
  }, [requests, search, filter, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      <DashboardPageHeader title="Os meus pedidos" description="Acompanha o estado de tudo o que já pediste." />

      <DataListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar por descrição ou categoria..."
        filterLabel="Estado"
        filterOptions={FILTER_OPTIONS}
        activeFilter={filter}
        onFilterChange={setFilter}
        sortOptions={SORT_OPTIONS}
        activeSort={sort}
        onSortChange={setSort}
      />

      {error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : requests === null ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum pedido encontrado"
          description="Tenta ajustar a pesquisa ou os filtros, ou cria um novo pedido de serviço."
        />
      ) : (
        <>
          <div className="space-y-3">
            {visible.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>

          {hasMore ? (
            <div className="mt-4 flex justify-center">
              <Button variant="outline" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                Carregar mais
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
