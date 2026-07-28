import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Ficheiro órfão = existe no bucket mas nenhuma linha da base de dados
 * aponta para o seu `key` (ex.: upload feito mas o formulário nunca foi
 * submetido; substituição de avatar que deixou o antigo por apagar).
 *
 * AINDA NÃO IMPLEMENTADO: a deteção real precisa de comparar a listagem
 * do bucket (`ListObjectsV2`) contra todos os campos que guardam keys
 * (`ClientProfile.avatarUrl`, `ProfessionalProfile.avatarUrl`/`coverUrl`,
 * `Document.fileUrl`, `PortfolioItem.imageUrl`, `ServiceRequest.photoUrls`)
 * — ou, melhor arquitetura, criar uma tabela `FileReference` central que
 * cada upload regista e cada "guardar formulário" confirma, e que este
 * job varre por linhas nunca confirmadas há mais de 24h. Essa tabela
 * ainda não existe no schema — fica documentado aqui para a próxima vez
 * que este ficheiro for tocado, em vez de implementado a meio.
 */
@Injectable()
export class OrphanCleanupService {
  private readonly logger = new Logger(OrphanCleanupService.name);

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupOrphanedFiles(): Promise<void> {
    this.logger.warn(
      'OrphanCleanupService.cleanupOrphanedFiles() ainda não tem lógica real — ver comentário no topo do ficheiro.',
    );
  }
}
