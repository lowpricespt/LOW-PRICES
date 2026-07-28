import { z } from 'zod';

/**
 * Schema de validação das variáveis de ambiente do website.
 * Só variáveis prefixadas com NEXT_PUBLIC_ estão disponíveis no browser;
 * qualquer variável sem esse prefixo só pode ser lida em Server Components.
 */
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url({
    message: 'NEXT_PUBLIC_API_URL tem de ser um URL válido (ex.: http://localhost:3000)',
  }),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional().default(''),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const issues = parsed.error.issues.map((issue) => `- ${issue.path.join('.')}: ${issue.message}`);
    throw new Error(
      `Variáveis de ambiente inválidas ou em falta:\n${issues.join('\n')}\n\nVerifica o teu ficheiro .env com base em .env.example`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();
