'use client';

import { useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Button, Skeleton, EmptyState, ErrorState } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { DataListToolbar } from '@/features/dashboard/components/data-list-toolbar';
import { RequestCard } from '@/features/dashboard/components/request-card';
import { MOCK_SERVICE_REQUESTS, REQUEST_STATUS_LABELS, type RequestStatus } from '@/features/dashboard/mock-data';

const PAGE_SIZE = 3;

const FILTER_OPTIONS = [
  { value: 'todos', label: 'Todos os estados' },
  ...Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => ({ value, label })),
];

const SORT_OPTIONS = [
  { value: 'recentes', label: 'Mais recentes' },
  { value: 'antigos', label: 'Mais antigos' },
];

export default function ClientRequestsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [sort, setSort] = useState('recentes');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Estados de loading/erro simulados (não há API ainda) — a UI já está
  // pronta para os casos reais: troca-se isto por `useQuery` e usam-se
  // `isLoading`/`isError` diretamente, sem tocar no resto da página.
  const [isLoading] = useState(false);
  const [simulateError, setSimulateError] = useState(false);

  const filtered = useMemo(() => {
    let result = MOCK_SERVICE_REQUESTS;

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (request) => request.title.toLowerCase().includes(query) || request.category.toLowerCase().includes(query),
      );
    }

    if (filter !== 'todos') {
      result = result.filter((request) => request.status === (filter as RequestStatus));
    }

    result = [...result].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sort === 'recentes' ? -diff : diff;
    });

    return result;
  }, [search, filter, sort]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <div>
      <DashboardPageHeader title="Os meus pedidos" description="Acompanha o estado de tudo o que já pediste." />

      <DataListToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Pesquisar por título ou categoria..."
        filterLabel="Estado"
        filterOptions={FILTER_OPTIONS}
        activeFilter={filter}
        onFilterChange={setFilter}
        sortOptions={SORT_OPTIONS}
        activeSort={sort}
        onSortChange={setSort}
      />

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : simulateError ? (
        <ErrorState onRetry={() => setSimulateError(false)} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum pedido encontrado"
          description="Tenta ajustar a pesquisa ou os filtros."
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

      {/* Afordância só para QA visual nesta fase — remover quando a API real existir. */}
      <button
        type="button"
        onClick={() => setSimulateError((value) => !value)}
        className="mt-8 text-xs text-muted-foreground underline"
      >
        {simulateError ? 'Desativar' : 'Simular'} estado de erro (demo)
      </button>
    </div>
  );
}
