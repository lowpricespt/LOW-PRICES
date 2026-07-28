# Ficheiros desativados — bug do Next.js no Windows

`opengraph-image.tsx.disabled-windows-bug` e `apple-icon.tsx.disabled-windows-bug` foram
retirados de `apps/web/src/app/` porque o `next/dist/compiled/@vercel/og` (usado por baixo
destes ficheiros para gerar imagens dinamicamente) tem um bug conhecido no Windows —
constrói mal o caminho da fonte interna e dá `TypeError: Invalid URL` durante o build.

Confirmado em: https://github.com/vercel/next.js/issues/77164 (afeta várias versões do
Next 15, incluindo a 15.0.3 usada neste projeto). Não acontece em Linux — só foi
desativado por bloquear o `pnpm build` local no Windows.

## Como reativar

1. Copia os dois ficheiros de volta para `apps/web/src/app/` (remove o sufixo
   `.disabled-windows-bug` do nome, ficam `opengraph-image.tsx` e `apple-icon.tsx`).
2. Testa o build dentro do WSL2 ou diretamente no build da Vercel (Linux) — nunca com
   `pnpm build` no Windows, para não voltares a bater neste bug.
3. Alternativa mais robusta a prazo: substituir por ficheiros estáticos reais
   (`apps/web/src/app/opengraph-image.png`, `apps/web/src/app/apple-icon.png`) assim que
   houver os assets finais de marca — isso remove por completo a dependência do
   `next/og` para estas duas imagens, e o bug deixa de ser sequer relevante.
