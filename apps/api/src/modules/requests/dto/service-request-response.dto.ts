import type { ServiceRequest, ServiceCategory, Quote } from '@prisma/client';

type ServiceRequestWithCategory = ServiceRequest & {
  category: ServiceCategory;
  _count?: { quotes: number };
  /// Só preenchido pela query de "pedidos disponíveis" do profissional
  /// (filtrada por `professionalProfileId`) — no máximo um item, porque
  /// um profissional só pode ter um orçamento ativo por pedido.
  quotes?: Quote[];
};

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
  /// Nº total de orçamentos recebidos neste pedido — só calculado quando
  /// o repositório pede `_count` (lista do cliente e lista do profissional).
  quotesCount?: number;
  /// O orçamento que O PRÓPRIO profissional que está a pedir já enviou
  /// para este pedido, se algum — permite à UI mostrar "já enviaste
  /// orçamento" em vez do formulário de enviar orçamento outra vez.
  myQuote?: { id: string; status: string; price: number } | null;

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
      quotesCount: entity._count?.quotes,
      myQuote: entity.quotes?.[0]
        ? { id: entity.quotes[0].id, status: entity.quotes[0].status, price: Number(entity.quotes[0].price) }
        : entity.quotes
          ? null
          : undefined,
    };
  }
}
