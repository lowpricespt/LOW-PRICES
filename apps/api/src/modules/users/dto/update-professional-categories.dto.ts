import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsUUID } from 'class-validator';

export class UpdateProfessionalCategoriesDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'Escolhe pelo menos uma categoria.' })
  @ArrayMaxSize(10, { message: 'Escolhe no máximo 10 categorias.' })
  @ArrayUnique()
  @IsUUID(undefined, { each: true, message: 'Cada categoria tem de ser um ID válido — usa GET /categories.' })
  categoryIds!: string[];
}
