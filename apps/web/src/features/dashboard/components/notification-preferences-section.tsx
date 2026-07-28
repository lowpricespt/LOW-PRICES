'use client';

import { useEffect, useState } from 'react';
import { Card, ErrorState, Skeleton } from '@/components/ui';
import {
  fetchMyNotificationPreferences,
  updateMyNotificationPreferences,
  type NotificationPreferences,
} from '@/features/dashboard/services/notification-preferences-api';

function ToggleRow({
  label,
  description,
  checked,
  disabled,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          checked ? 'bg-primary' : 'bg-input'
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-background shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}

export function NotificationPreferencesSection() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  function load() {
    fetchMyNotificationPreferences()
      .then(setPreferences)
      .catch(() => setError(true));
  }

  useEffect(load, []);

  async function handleEmailToggle(value: boolean) {
    if (!preferences) return;
    setIsSaving(true);
    setPreferences({ ...preferences, emailEnabled: value });
    try {
      await updateMyNotificationPreferences({ emailEnabled: value });
    } catch {
      setPreferences((current) => (current ? { ...current, emailEnabled: !value } : current));
    } finally {
      setIsSaving(false);
    }
  }

  if (error) return <ErrorState onRetry={load} />;
  if (!preferences) return <Skeleton className="h-40 w-full rounded-xl" />;

  return (
    <Card className="divide-y divide-border p-5">
      <ToggleRow
        label="Email"
        description="Novos pedidos, orçamentos, aceites e cancelamentos por email."
        checked={preferences.emailEnabled}
        disabled={isSaving}
        onChange={handleEmailToggle}
      />
      <ToggleRow
        label="Notificações push"
        description="Ainda não disponível — chega numa próxima fase."
        checked={false}
        disabled
      />
      <ToggleRow label="SMS" description="Ainda não disponível — chega numa próxima fase." checked={false} disabled />
    </Card>
  );
}
