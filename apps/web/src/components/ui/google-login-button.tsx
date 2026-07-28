import { env } from '@/config';

export interface GoogleLoginButtonProps {
  /// 'PROFESSIONAL' quando usado no registo de Especialista — o backend
  /// usa isto (via parâmetro OAuth `state`) para criar a conta com a
  /// role certa e, no fim, obrigar à seleção de categorias antes do
  /// dashboard. Omitido/'CLIENT' em qualquer outro sítio.
  role?: 'CLIENT' | 'PROFESSIONAL';
}

export function GoogleLoginButton({ role }: GoogleLoginButtonProps = {}) {
  const href =
    role === 'PROFESSIONAL'
      ? `${env.NEXT_PUBLIC_API_URL}/auth/google?role=PROFESSIONAL`
      : `${env.NEXT_PUBLIC_API_URL}/auth/google`;

  return (
    <a
      href={href}
      className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
    >
      <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.63h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.89c2.27-2.09 3.58-5.17 3.58-8.81z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.96-1.07 7.95-2.9l-3.89-3.02c-1.08.72-2.46 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.94H1.28v3.11C3.26 21.3 7.31 24 12 24z"
        />
        <path fill="#FBBC05" d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.6H1.28a12 12 0 0 0 0 10.8z" />
        <path
          fill="#EA4335"
          d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.28 6.6l4.01 3.11C6.23 6.88 8.88 4.77 12 4.77z"
        />
      </svg>
      Continuar com Google
    </a>
  );
}
