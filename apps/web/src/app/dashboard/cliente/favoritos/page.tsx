'use client';

import { useEffect, useState } from 'react';
import { Heart, HeartOff } from 'lucide-react';
import { Avatar, Badge, Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import {
  fetchMyFavorites,
  removeFavorite,
  type FavoriteProfessional,
} from '@/features/dashboard/services/favorites-api';

export default function ClientFavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteProfessional[] | null>(null);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  function load() {
    fetchMyFavorites()
      .then(setFavorites)
      .catch(() => setError(true));
  }

  useEffect(load, []);

  async function handleRemove(professionalProfileId: string) {
    setRemovingId(professionalProfileId);
    try {
      await removeFavorite(professionalProfileId);
      setFavorites((current) => current?.filter((item) => item.professionalProfileId !== professionalProfileId) ?? null);
    } catch {
      setError(true);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <DashboardPageHeader title="Favoritos" description="Profissionais que guardaste para o futuro." />

      {error ? (
        <ErrorState onRetry={load} />
      ) : favorites === null ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Ainda não tens favoritos"
          description="Quando receberes um orçamento de um profissional, podes guardá-lo aqui para o encontrares mais rápido da próxima vez."
        />
      ) : (
        <div className="space-y-3">
          {favorites.map((favorite) => (
            <Card key={favorite.professionalProfileId} className="flex items-start justify-between gap-3 p-4">
              <div className="flex items-start gap-3">
                <Avatar src={favorite.avatarUrl} alt={favorite.name} fallback={favorite.name} />
                <div>
                  <p className="font-medium">{favorite.name}</p>
                  {favorite.bio && <p className="mt-0.5 text-sm text-muted-foreground">{favorite.bio}</p>}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {favorite.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(favorite.professionalProfileId)}
                disabled={removingId === favorite.professionalProfileId}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remover dos favoritos"
              >
                <HeartOff className="size-4" />
              </button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
