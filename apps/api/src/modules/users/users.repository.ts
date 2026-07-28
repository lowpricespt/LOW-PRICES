import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
  role: 'CLIENT' | 'PROFESSIONAL';
}

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findByGoogleId(googleId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { googleId } });
  }

  linkGoogleId(userId: string, googleId: string): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data: { googleId } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { clientProfile: true, professionalProfile: true },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        googleId: data.googleId,
        role: data.role,
        // O perfil correspondente à role é criado no mesmo pedido —
        // nunca existe um User sem o respetivo perfil.
        ...(data.role === 'CLIENT'
          ? { clientProfile: { create: {} } }
          : { professionalProfile: { create: {} } }),
      },
    });
  }

  async updateProfile(
    id: string,
    data: { name?: string; phone?: string | null; avatarUrl?: string },
  ) {
    const { avatarUrl, ...userData } = data;

    const user = await this.prisma.user.update({ where: { id }, data: userData });

    if (avatarUrl !== undefined) {
      if (user.role === 'CLIENT') {
        await this.prisma.clientProfile.update({ where: { userId: id }, data: { avatarUrl } });
      } else if (user.role === 'PROFESSIONAL') {
        await this.prisma.professionalProfile.update({ where: { userId: id }, data: { avatarUrl } });
      }
    }

    // Reler com os perfis incluídos — garante que a resposta reflete o
    // avatarUrl que acabou de ser gravado, não a foto (potencialmente
    // desatualizada) de antes desta chamada.
    return this.findById(id);
  }

  /// Substitui por completo as categorias do profissional (não faz
  /// merge) — mais simples e previsível para um formulário de seleção
  /// tipo checklist, onde o utilizador vê sempre o estado final que quer.
  async setProfessionalCategories(userId: string, categoryIds: string[]): Promise<void> {
    const profile = await this.prisma.professionalProfile.findUnique({ where: { userId }, select: { id: true } });
    if (!profile) throw new Error('PROFESSIONAL_PROFILE_NOT_FOUND');

    const validCount = await this.prisma.serviceCategory.count({ where: { id: { in: categoryIds } } });
    if (validCount !== categoryIds.length) throw new Error('INVALID_CATEGORY_ID');

    await this.prisma.$transaction([
      this.prisma.professionalCategory.deleteMany({ where: { professionalProfileId: profile.id } }),
      this.prisma.professionalCategory.createMany({
        data: categoryIds.map((categoryId) => ({ professionalProfileId: profile.id, categoryId })),
      }),
    ]);
  }

  softDelete(id: string): Promise<User> {
    // Nunca apagar o registo fisicamente: mantém integridade referencial
    // com pedidos/avaliações passadas e cumpre requisitos de auditoria.
    // O email é anonimizado para libertar a unicidade e cumprir RGPD.
    return this.prisma.user.update({
      where: { id },
      data: {
        status: 'DELETED',
        email: `deleted-${id}@low-prices.invalid`,
        phone: null,
      },
    });
  }
}
