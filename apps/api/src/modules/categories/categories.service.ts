import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

/**
 * Categorias base da Low Prices. Antes deste módulo não existia NENHUMA
 * linha em ServiceCategory na base de dados — e o Website enviava
 * categoryId como slug hardcoded (ex.: "canalizador"), que o backend
 * sempre rejeitou por não ser um UUID válido (@IsUUID() em
 * CreateServiceRequestDto). Ou seja: nenhum cliente conseguia criar um
 * pedido. Este seed automático + o endpoint GET /categories fecham o
 * ciclo — o Website passa a pedir os IDs reais em vez de os inventar.
 *
 * Os slugs abaixo têm de continuar iguais aos usados em
 * apps/web/src/constants/categories.ts (é a chave que liga o ícone/nome
 * local ao registo real da BD) — mudar um sem mudar o outro volta a
 * partir tudo.
 */
const DEFAULT_CATEGORIES = [
  { slug: 'canalizador', name: 'Canalizador' },
  { slug: 'eletricista', name: 'Eletricista' },
  { slug: 'pintor', name: 'Pintor' },
  { slug: 'jardinagem', name: 'Jardinagem' },
  { slug: 'limpeza', name: 'Limpeza' },
  { slug: 'mudancas', name: 'Mudanças' },
  { slug: 'montagem-moveis', name: 'Montagem de móveis' },
  { slug: 'informatica', name: 'Informática' },
] as const;

@Injectable()
export class CategoriesService implements OnModuleInit {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.prisma.serviceCategory.count();
      if (count > 0) return;

      this.logger.warn('Nenhuma ServiceCategory encontrada — a semear as categorias base automaticamente.');
      for (const category of DEFAULT_CATEGORIES) {
        await this.prisma.serviceCategory.upsert({
          where: { slug: category.slug },
          update: {},
          create: category,
        });
      }
      this.logger.log(`Categorias base criadas: ${DEFAULT_CATEGORIES.length}.`);
    } catch (error) {
      // Nunca impedir o arranque da app por causa do seed — regista e segue.
      this.logger.error(`Falha ao semear categorias: ${error instanceof Error ? error.message : error}`);
    }
  }

  findAll() {
    return this.prisma.serviceCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, icon: true, parentId: true },
    });
  }
}
