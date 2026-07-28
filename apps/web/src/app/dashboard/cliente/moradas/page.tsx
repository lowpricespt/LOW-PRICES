'use client';

import { useEffect, useState } from 'react';
import { MapPin, Star, Trash2 } from 'lucide-react';
import { AddressAutocomplete, Button, Card, EmptyState, ErrorState, Input, Skeleton } from '@/components/ui';
import type { ParsedGooglePlace } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import {
  fetchMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  type Address,
} from '@/features/dashboard/services/addresses-api';

const EMPTY_FORM = {
  label: '',
  line1: '',
  line2: '',
  postalCode: '',
  city: '',
  latitude: null as number | null,
  longitude: null as number | null,
};

function AddressForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setField<K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handlePlaceSelected(place: ParsedGooglePlace) {
    setForm((current) => ({
      ...current,
      line1: place.line1 || current.line1,
      postalCode: place.postalCode || current.postalCode,
      city: place.city || current.city,
      latitude: place.latitude,
      longitude: place.longitude,
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!form.label || !form.line1 || !form.postalCode || !form.city) {
      setError('Preenche pelo menos etiqueta, morada, código postal e cidade.');
      return;
    }
    setIsSubmitting(true);
    try {
      await createAddress(form);
      setForm(EMPTY_FORM);
      onCreated();
    } catch {
      setError('Não foi possível guardar esta morada.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <p className="font-medium">Adicionar morada</p>
      <form onSubmit={handleSubmit} className="mt-3 grid gap-3 sm:grid-cols-2">
        <Input placeholder="Etiqueta (Casa, Trabalho...)" value={form.label} onChange={(e) => setField('label', e.target.value)} />
        <Input placeholder="Código postal" value={form.postalCode} onChange={(e) => setField('postalCode', e.target.value)} />
        <AddressAutocomplete
          className="sm:col-span-2"
          placeholder="Morada (rua, nº)"
          value={form.line1}
          onChange={(value) => setField('line1', value)}
          onPlaceSelected={handlePlaceSelected}
        />
        <Input
          className="sm:col-span-2"
          placeholder="Complemento (opcional)"
          value={form.line2}
          onChange={(e) => setField('line2', e.target.value)}
        />
        <Input placeholder="Cidade" value={form.city} onChange={(e) => setField('city', e.target.value)} />
        <Button type="submit" disabled={isSubmitting} className="sm:col-span-2">
          {isSubmitting ? 'A guardar…' : 'Adicionar morada'}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </Card>
  );
}

export default function ClientAddressesPage() {
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [error, setError] = useState(false);

  function load() {
    fetchMyAddresses()
      .then(setAddresses)
      .catch(() => setError(true));
  }

  useEffect(load, []);

  async function handleSetDefault(id: string) {
    await updateAddress(id, { isDefault: true }).catch(() => setError(true));
    load();
  }

  async function handleDelete(id: string) {
    await deleteAddress(id).catch(() => setError(true));
    load();
  }

  return (
    <div>
      <DashboardPageHeader title="Moradas" description="Endereços que usas com frequência nos teus pedidos." />

      <AddressForm onCreated={load} />

      <div className="mt-4">
        {error ? (
          <ErrorState onRetry={load} />
        ) : addresses === null ? (
          <Skeleton className="h-20 w-full rounded-xl" />
        ) : addresses.length === 0 ? (
          <EmptyState icon={MapPin} title="Sem moradas guardadas" description="Adiciona uma morada acima." />
        ) : (
          <div className="space-y-2">
            {addresses.map((address) => (
              <Card key={address.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{address.label}</p>
                    {address.isDefault && <Star className="size-3.5 fill-primary text-primary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {address.line1}
                    {address.line2 ? `, ${address.line2}` : ''} · {address.postalCode} {address.city}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <Button size="sm" variant="outline" onClick={() => handleSetDefault(address.id)}>
                      Tornar principal
                    </Button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(address.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remover morada"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
