export interface JobContact {
  name: string;
  email: string;
  phone: string | null;
}

export class JobResponseDto {
  id!: string;
  status!: string;
  serviceRequestId!: string;
  quoteId!: string;
  serviceRequestTitle!: string;
  price!: number;
  scheduledStart!: Date | null;
  scheduledEnd!: Date | null;
  completedAt!: Date | null;
  /// O contacto da outra parte — só preenchido porque, para o Job
  /// existir, um orçamento já foi aceite (ver QuotesService.accept()).
  /// É exatamente o "revelar contacto depois do orçamento aceite" que
  /// substitui o Chat nesta fase do piloto.
  otherParty!: JobContact;
}
