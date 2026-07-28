import { Input } from '@/components/ui';

export interface StepAccountProps {
  name: string;
  email: string;
  password: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  error?: string | null;
}

export function StepAccount({
  name,
  email,
  password,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  error,
}: StepAccountProps) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
        Cria a tua conta de profissional
      </h1>
      <p className="mt-2 text-muted-foreground">Vais usá-la para receber e responder a pedidos.</p>

      {error ? (
        <p className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      ) : null}

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="prof-name" className="mb-1.5 block text-sm font-medium">
            Nome
          </label>
          <Input
            id="prof-name"
            placeholder="O teu nome ou o da empresa"
            autoComplete="name"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="prof-email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <Input
            id="prof-email"
            type="email"
            placeholder="tu@exemplo.com"
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="prof-password" className="mb-1.5 block text-sm font-medium">
            Palavra-passe
          </label>
          <Input
            id="prof-password"
            type="password"
            placeholder="Mínimo 8 caracteres, com maiúscula e número"
            autoComplete="new-password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
