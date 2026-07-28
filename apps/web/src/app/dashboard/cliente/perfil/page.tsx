'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin, Bell, Shield, Heart, History, ChevronRight } from 'lucide-react';
import { Button, Input, Card, AvatarUpload } from '@/components/ui';
import { DashboardPageHeader } from '@/features/dashboard/components/page-header';
import { useAuth } from '@/providers/auth-provider';
import { updateProfileRequest } from '@/features/profile/services/profile-api';

/**
 * Nome, telefone e fotografia (upload real via Cloudflare R2 — ver
 * docs/architecture/UPLOAD_ARCHITECTURE.md) editam-se diretamente aqui.
 * Moradas, Notificações, Segurança, Favoritos e Histórico são todas
 * páginas reais próprias — os cards abaixo só linkam para elas.
 */
export default function ClientProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatarUrl ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function handleSave() {
    setIsSaving(true);
    setSavedMessage(null);
    try {
      await updateProfileRequest({ name, phone: phone || undefined });
      setSavedMessage('Guardado.');
    } catch {
      setSavedMessage('Não foi possível guardar. Tenta novamente.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarUploaded(result: { url: string }) {
    setAvatarUrl(result.url);
    // Grava logo, sem esperar pelo botão "Guardar alterações" — o
    // upload já terminou com sucesso, não faz sentido exigir um passo
    // extra só para confirmar a foto.
    try {
      await updateProfileRequest({ avatarUrl: result.url });
    } catch {
      setSavedMessage('A foto foi enviada, mas não foi possível associá-la ao perfil. Tenta novamente.');
    }
  }

  return (
    <div className="max-w-2xl">
      <DashboardPageHeader title="Perfil" description="Os teus dados pessoais e de contacto." />

      <Card className="p-6">
        <AvatarUpload currentUrl={avatarUrl} folder="avatars" onUploaded={handleAvatarUploaded} />

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="profile-name">
              Nome
            </label>
            <Input id="profile-name" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="profile-email">
              Email
            </label>
            <Input id="profile-email" value={user?.email ?? ''} disabled />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="profile-phone">
              Telefone
            </label>
            <Input
              id="profile-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+351 900 000 000"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'A guardar...' : 'Guardar alterações'}
          </Button>
          {savedMessage ? <span className="text-sm text-muted-foreground">{savedMessage}</span> : null}
        </div>
      </Card>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {[
          { icon: MapPin, label: 'Moradas', href: '/dashboard/cliente/moradas' },
          { icon: Bell, label: 'Notificações', href: '/dashboard/cliente/notificacoes' },
          { icon: Shield, label: 'Segurança e password', href: '/dashboard/cliente/definicoes' },
          { icon: Heart, label: 'Favoritos', href: '/dashboard/cliente/favoritos' },
          { icon: History, label: 'Histórico de pedidos', href: '/dashboard/cliente/historico' },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <Card className="flex items-center justify-between p-4 transition-colors hover:bg-accent">
              <span className="flex items-center gap-3 text-sm font-medium">
                <item.icon className="size-4 text-muted-foreground" />
                {item.label}
              </span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
