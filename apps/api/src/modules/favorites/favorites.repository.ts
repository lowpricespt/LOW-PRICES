import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Injectable()
export class FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByClientAndProfessional(clientProfileId: string, professionalProfileId: string) {
    return this.prisma.favorite.findUnique({
      where: { clientProfileId_professionalProfileId: { clientProfileId, professionalProfileId } },
    });
  }

  create(clientProfileId: string, professionalProfileId: string) {
    return this.prisma.favorite.create({ data: { clientProfileId, professionalProfileId } });
  }

  async remove(clientProfileId: string, professionalProfileId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({ where: { clientProfileId, professionalProfileId } });
  }

  async findManyByClient(clientProfileId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { clientProfileId },
      orderBy: { createdAt: 'desc' },
    });

    const professionalProfileIds = favorites.map((favorite) => favorite.professionalProfileId);
    const professionals = await this.prisma.professionalProfile.findMany({
      where: { id: { in: professionalProfileIds } },
      select: {
        id: true,
        bio: true,
        avatarUrl: true,
        user: { select: { name: true } },
        categories: { select: { category: { select: { name: true } } } },
      },
    });

    const byId = new Map(professionals.map((professional) => [professional.id, professional]));

    // Mantém a ordem de "favoritado mais recentemente primeiro" mesmo que
    // um profissional entretanto tenha sido removido (ver comentário abaixo).
    return favorites
      .map((favorite) => {
        const professional = byId.get(favorite.professionalProfileId);
        if (!professional) return null; // profissional eliminou a conta entretanto
        return {
          professionalProfileId: professional.id,
          name: professional.user.name,
          avatarUrl: professional.avatarUrl,
          bio: professional.bio,
          categories: professional.categories.map((link) => link.category.name),
          favoritedAt: favorite.createdAt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }

  async professionalExists(professionalProfileId: string): Promise<boolean> {
    const count = await this.prisma.professionalProfile.count({ where: { id: professionalProfileId } });
    return count > 0;
  }
}
