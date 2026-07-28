import type { ServiceRequest, ServiceCategory } from '@prisma/client';

type ServiceRequestWithCategory = ServiceRequest & { category: ServiceCategory };

const LOCKED_LOCATION_MESSAGE = 'Localização exata disponível após aderires a um plano de acesso à área.';

export class ServiceRequestResponseDto {
  id!: string;
  status!: string;
  category!: { id: string; name: string; slug: string };
  description!: string;
  photoUrls!: string[];
  location!: string;
  latitude!: number | null;
  longitude!: number | null;
  urgency!: string;
  budget!: number | null;
  publishedAt!: Date | null;
  createdAt!: Date;
  isLocationUnlocked!: boolean;

  /**
   * @param unlocked Passa `true` quando quem pede é o próprio cliente
   *   dono do pedido, ou um profissional com `hasAreaAccess` ativo.
   *   Qualquer outro caso (profissional sem plano) recebe a localização
   *   ocultada.
   */
  static fromEntity(entity: ServiceRequestWithCategory, unlocked: boolean): ServiceRequestResponseDto {
    return {
      id: entity.id,
      status: entity.status,
      category: { id: entity.category.id, name: entity.category.name, slug: entity.category.slug },
      description: entity.description,
      photoUrls: entity.photoUrls,
      location: unlocked ? entity.location : LOCKED_LOCATION_MESSAGE,
      latitude: unlocked ? entity.latitude : null,
      longitude: unlocked ? entity.longitude : null,
      urgency: entity.urgency,
      budget: entity.budget ? Number(entity.budget) : null,
      publishedAt: entity.publishedAt,
      createdAt: entity.createdAt,
      isLocationUnlocked: unlocked,
    };
  }
}
