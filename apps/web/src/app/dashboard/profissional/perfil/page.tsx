'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { AvatarUpload, Badge, Button, Card, Input, Skeleton } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { useAuth } from '@/providers/auth-provider';
import { useServiceCategories } from '@/hooks/use-service-categories';
import { updateProfileRequest } from '@/features/profile/services/profile-api';
import {
  fetchProfessionalProfile,
  updateProfessionalProfileRequest,
  type ProfessionalProfileDetails,
} from '@/features/profile/services/professional-profile-api';
import { updateProfessionalCategories } from '@/features/professional-onboarding/services/professional-onboarding-api';
import { cn } from '@/lib/utils';

const MIN_RADIUS = 1;
const MAX_RADIUS = 150;

const VERIFICATION_BANNER: Record<
  ProfessionalProfileDetails['verificationStatus'],
  { icon: typeof Clock; variant: 'secondary' | 'success' | 'destructive'; label: string; description: string } | null
> = {
  PENDING: {
    icon: Clock,
    variant: 'secondary',
    label: 'Conta pendente de verificação',
    description:
      'Só depois de a equipa Low Prices aprovar o teu perfil é que começas a aparecer nos pedidos dos clientes.',
  },
  REJECTED: {
    icon: AlertTriangle,
    variant: 'destructive',
    label: 'Conta não aprovada',
    description: 'Contacta o suporte da Low Prices para perceberes o motivo e como corrigir.',
  },
  APPROVED: null,
};

export default function ProfessionalProfilePage() {
  const { user } = useAuth();
  const { categories: allCategories, isLoading: isLoadingCategories } = useServiceCategories();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);

  const [profile, setProfile] = useState<ProfessionalProfileDetails | null>(null);
  const [bio, setBio] = useState('');
  const [radius, setRadius] = useState(String(MIN_RADIUS));
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    fetchProfessionalProfile()
      .then((data) => {
        setProfile(data);
        setBio(data.bio ?? '');
        setRadius(String(data.serviceRadiusKm));
        setSelectedCategoryIds(data.categories.map((category) => category.id));
      })
      .catch(() => setError('Não foi possível carregar o teu perfil.'));
  }

  useEffect(load, []);

  function toggleCategory(categoryId: string) {
    setSelectedCategoryIds((current) =>
      current.includes(categoryId) ? current.filter((id) => id !== categoryId) : [...current, categoryId],
    );
  }

  async function handleAvatarUploaded(result: { url: string }) {
    setAvatarUrl(result.url);
    try {
      await updateProfileRequest({ avatarUrl: result.url });
    } catch {
      setError('A foto foi enviada, mas não foi possível associá-la ao perfil. Tenta novamente.');
    }
  }

  async function handleSave() {
    setError(null);
    setMessage(null);

    const numericRadius = Number(radius);
    if (!Number.isInteger(numericRadius) || numericRadius < MIN_RADIUS || numericRadius > MAX_RADIUS) {
      setError(`O raio de ação tem de ser um número entre ${MIN_RADIUS} e ${MAX_RADIUS} km.`);
      return;
    }
    if (selectedCategoryIds.length === 0) {
      setError('Escolhe pelo menos uma categoria — é o que decide que pedidos vês.');
      return;
    }

    setIsSaving(true);
    try {
      await Promise.all([
        updateProfileRequest({ name, phone: phone || undefined }),
        updateProfessionalProfileRequest({ bio: bio.trim() || undefined, serviceRadiusKm: numericRadius }),
        updateProfessionalCategories(selectedCategoryIds),
      ]);
      setMessage('Guardado.');
      load();
    } catch {
      setError('Não foi possível guardar. Tenta novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  const banner = profile ? VERIFICATION_BANNER[profile.verificationStatus] : null;

  return (
    <div className="max-w-2xl">
      <DashboardPageHeader title="Perfil" description="A tua descrição pública, categorias e documentos." />

      {banner ? (
        <div
          className={cn(
            'mb-4 flex items-start gap-3 rounded-xl border p-4 text-sm',
            banner.variant === 'destructive' ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-secondary/50',
          )}
        >
          <banner.icon className={cn('mt-0.5 size-5 shrink-0', banner.variant === 'destructive' ? 'text-destructive' : 'text-muted-foreground')} />
          <div>
            <p className="font-medium">{banner.label}</p>
            <p className="text-muted-foreground">{banner.description}</p>
          </div>
        </div>
      ) : profile?.verificationStatus === 'APPROVED' ? (
        <Badge variant="success" className="mb-4 flex w-fit items-center gap-1.5 py-1">
          <CheckCircle2 className="size-3.5" /> Conta aprovada
        </Badge>
      ) : null}

      <Card className="p-6">
        <AvatarUpload currentUrl={avatarUrl} folder="avatars" onUploaded={handleAvatarUploaded} />

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="prof-profile-name">
              Nome
            </label>
            <Input id="prof-profile-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="prof-profile-email">
              Email
            </label>
            <Input id="prof-profile-email" value={user?.email ?? ''} disabled />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="prof-profile-phone">
              Telefone
            </label>
            <Input
              id="prof-profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+351 900 000 000"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="prof-profile-bio">
              Descrição pública
            </label>
            <textarea
              id="prof-profile-bio"
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 1000))}
              rows={4}
              maxLength={1000}
              placeholder="Fala da tua experiência, especialidades e o que te diferencia."
              className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="prof-profile-radius">
              Raio de ação (km)
            </label>
            <Input
              id="prof-profile-radius"
              type="number"
              min={MIN_RADIUS}
              max={MAX_RADIUS}
              value={radius}
              onChange={(event) => setRadius(event.target.value)}
              className="max-w-32"
            />
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <p className="font-medium">Categorias</p>
        <p className="mt-1 text-sm text-muted-foreground">Decide que pedidos vês em &quot;Pedidos disponíveis&quot;.</p>

        {isLoadingCategories ? (
          <Skeleton className="mt-4 h-10 w-full rounded-full" />
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            {allCategories.map((category) => {
              const isSelected = selectedCategoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40',
                  )}
                >
                  <category.icon className="size-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <div className="mt-6 flex items-center gap-3">
        <Button onClick={handleSave} disabled={isSaving || profile === null}>
          {isSaving ? 'A guardar...' : 'Guardar alterações'}
        </Button>
        {message ? <span className="text-sm text-muted-foreground">{message}</span> : null}
        {error ? <span className="text-sm text-destructive">{error}</span> : null}
      </div>
    </div>
  );
}
