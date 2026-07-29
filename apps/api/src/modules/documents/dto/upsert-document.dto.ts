import { IsIn, IsString, Length } from 'class-validator';

const DOCUMENT_TYPES = ['IDENTITY', 'PROOF_OF_ACTIVITY', 'CERTIFICATE'] as const;

export class UpsertDocumentDto {
  @IsIn(DOCUMENT_TYPES, { message: 'Tipo de documento inválido.' })
  type!: (typeof DOCUMENT_TYPES)[number];

  /** Key devolvida por POST /storage/upload — nunca a URL final (essa é assinada e expira). */
  @IsString()
  @Length(1, 500)
  key!: string;
}
