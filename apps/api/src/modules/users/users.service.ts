import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UserResponseDto } from './dto/user-response.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
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

  async deleteAccount(userId: string): Promise<void> {
    await this.usersRepository.softDelete(userId);
    await this.auditLogService.record({ userId, action: AuditAction.ACCOUNT_DELETED });
  }
}
