import type { UserRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  role: UserRole;
  sessionId: string;
}
