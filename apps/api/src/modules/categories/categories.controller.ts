import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CategoriesService } from './categories.service';

// Pública de propósito: a lista de categorias tem de estar disponível
// antes de haver sessão (landing page, wizard de pedido, wizard de
// registo de profissional).
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }
}
