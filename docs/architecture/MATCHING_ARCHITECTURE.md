# Low Prices — Arquitetura de Matching Automático

## Estado atual (Fase 8c)

`MatchingService` (`apps/api/src/modules/matching/matching.service.ts`) — extraído do `RequestsService`, isolado, único ponto de decisão de "quem é elegível para este pedido".

### Filtros ATIVOS
1. **Categoria/subcategoria:** um pedido numa subcategoria também é visto por profissionais que só cobrem a categoria-mãe (decisão de produto documentada no código — profissionais nem sempre filtram ao nível mais fino).
2. **Conta ativa:** `User.status = ACTIVE`.
3. **Perfil verificado:** `ProfessionalProfile.verificationStatus = APPROVED`.

### Filtros DOCUMENTADOS, ainda não aplicados
| Filtro | Porque não está ativo | Pré-requisito |
|---|---|---|
| Localização/raio | Filtrar em memória (Haversine) não escala além de algumas centenas de profissionais | Migração PostGIS (já prevista na fundação técnica, secção 6) |
| Disponibilidade | Não existe ainda o módulo Agenda | `AvailabilityRule`/`AvailabilityBlock` (ver `CORE_PLATFORM_ARCHITECTURE.md`, secção 2) |
| Documentos aprovados | Falta decisão de produto: exigir TODOS os documentos obrigatórios ou pelo menos um? | Confirmar regra de negócio antes de implementar — implementar a regra errada bloquearia profissionais por engano |

## Porque é um serviço dedicado, não um método do `RequestsService`

O módulo de Serviços (`RequestsService.publish()`) só sabe que precisa de "encontrar quem é elegível" — nunca como essa decisão é tomada. Isto significa que adicionar um filtro novo (ex.: disponibilidade) é uma alteração isolada a `MatchingService`, sem tocar em `RequestsService`, `RequestsController` ou nos DTOs. Baixo acoplamento, alta coesão.

## Próximo passo natural

Quando a Agenda existir, `MatchingService.findEligibleProfessionals()` ganha um parâmetro `requestedDateTime` opcional e uma consulta adicional a `AvailabilityRule`/`AvailabilityBlock` — a assinatura pública do método já está desenhada para aceitar isto sem quebrar os chamadores existentes (parâmetros opcionais no fim).
