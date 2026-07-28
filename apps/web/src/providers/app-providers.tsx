import { ThemeProvider } from './theme-provider';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';

/**
 * Ponto único de composição de providers. O layout raiz importa apenas
 * <AppProviders>; a ordem e a existência de cada provider individual
 * ficam encapsuladas aqui.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
