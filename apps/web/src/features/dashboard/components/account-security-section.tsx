'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components/ui';
import { useAuth } from '@/providers/auth-provider';
import {
  changePasswordRequest,
  requestEmailChangeRequest,
} from '@/features/auth/services/auth-api';
import { deleteAccountRequest } from '@/features/profile/services/profile-api';
import type { ApiError } from '@/services/api';

function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await changePasswordRequest(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setSuccess(true);
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível alterar a palavra-passe.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <p className="font-medium">Alterar palavra-passe</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ao confirmar, todas as outras sessões abertas noutros dispositivos são terminadas.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {success && (
          <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">Palavra-passe alterada com sucesso.</p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Palavra-passe atual</label>
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Nova palavra-passe</label>
          <Input
            type="password"
            autoComplete="new-password"
            required
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Mínimo 8 caracteres, com maiúsculas, minúsculas e pelo menos um número.
          </p>
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'A alterar…' : 'Alterar palavra-passe'}
        </Button>
      </form>
    </Card>
  );
}

function ChangeEmailForm() {
  const { user } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);
    try {
      await requestEmailChangeRequest(newEmail, currentPassword);
      setCurrentPassword('');
      setSuccess(true);
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível iniciar a alteração de email.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="p-5">
      <p className="font-medium">Alterar email</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Email atual: <span className="font-medium text-foreground">{user?.email}</span>. Vais receber um link de
        confirmação no novo endereço — o email só muda depois de confirmares.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {error && <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        {success && (
          <p className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
            Enviámos um link de confirmação para o novo email. Verifica a caixa de entrada.
          </p>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-medium">Novo email</label>
          <Input
            type="email"
            autoComplete="email"
            required
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Palavra-passe atual</label>
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'A enviar…' : 'Enviar link de confirmação'}
        </Button>
      </form>
    </Card>
  );
}

function DeleteAccountSection() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setError(null);
    setIsSubmitting(true);
    try {
      await deleteAccountRequest();
      await logout();
      router.push('/');
    } catch (err) {
      setError((err as ApiError).message ?? 'Não foi possível eliminar a conta.');
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="border-destructive/30 p-5">
      <p className="font-medium text-destructive">Eliminar conta</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Esta ação é permanente. O teu histórico de pedidos e avaliações mantém-se para efeitos legais, mas deixas de
        conseguir entrar nesta conta.
      </p>
      {error && <p className="mt-3 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      {!isConfirming ? (
        <Button variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive/10" onClick={() => setIsConfirming(true)}>
          Eliminar a minha conta
        </Button>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium">Tens a certeza?</p>
          <Button variant="destructive" size="sm" disabled={isSubmitting} onClick={handleDelete}>
            {isSubmitting ? 'A eliminar…' : 'Sim, eliminar definitivamente'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsConfirming(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
        </div>
      )}
    </Card>
  );
}

export function AccountSecuritySection() {
  return (
    <div className="space-y-4">
      <ChangePasswordForm />
      <ChangeEmailForm />
      <DeleteAccountSection />
    </div>
  );
}
