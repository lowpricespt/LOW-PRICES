import type { ClientProfile, ProfessionalProfile, User } from '@prisma/client';

type UserWithProfiles = User & {
  clientProfile?: ClientProfile | null;
  professionalProfile?: ProfessionalProfile | null;
};

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;
  phone!: string | null;
  role!: string;
  status!: string;
  avatarUrl!: string | null;
  createdAt!: Date;

  static fromEntity(user: UserWithProfiles): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      avatarUrl: user.clientProfile?.avatarUrl ?? user.professionalProfile?.avatarUrl ?? null,
      createdAt: user.createdAt,
    };
  }
}
