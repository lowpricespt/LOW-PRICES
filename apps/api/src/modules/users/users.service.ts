import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserResponseDto } from './dto/user-response.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import type { UpdateProfessionalCategoriesDto } from './dto/update-professional-categories.dto';
import { AuditLogService, AuditAction } from '../audit-log/audit-log.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getById(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('Utilizador não encontrado.');
    return UserResponseDto.fromEntity(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.updateProfile(userId, dto);
    if (!user) throw new NotFoundException('Utilizador não encontrado.');
    await this.auditLogService.record({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      metadata: { fields: Object.keys(dto) },
    });
    return UserResponseDto.fromEntity(user);
  }

  async setProfessionalCategories(userId: string, dto: UpdateProfessionalCategoriesDto): Promise<{ categoryIds: string[] }> {
    try {
      await this.usersRepository.setProfessionalCategories(userId, dto.categoryIds);
    } catch (error) {
      if (error instanceof Error && error.message === 'PROFESSIONAL_PROFILE_NOT_FOUND') {
        throw new NotFoundException('Perfil de profissional não encontrado.');
      }
      if (error instanceof Error && error.message === 'INVALID_CATEGORY_ID') {
        throw new BadRequestException('Uma ou mais categorias não existem — confirma a lista em GET /categories.');
      }
      throw error;
    }

    await this.auditLogService.record({
      userId,
      action: AuditAction.PROFILE_UPDATED,
      metadata: { field: 'professionalCategories', categoryIds: dto.categoryIds },
    });

    return { categoryIds: dto.categoryIds };
  }

  async deleteAccount(userId: string): Promise<void> {
    await this.usersRepository.softDelete(userId);
    await this.auditLogService.record({ userId, action: AuditAction.ACCOUNT_DELETED });
  }
}
