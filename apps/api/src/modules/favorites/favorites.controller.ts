import { BadRequestException, Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { RequestsService } from '../requests/requests.service';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/add-favorite.dto';

@Roles('CLIENT')
@Controller('favorites')
export class FavoritesController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly requestsService: RequestsService,
  ) {}

  private async resolveClientId(userId: string): Promise<string> {
    const clientProfileId = await this.requestsService.resolveClientProfileId(userId);
    if (!clientProfileId) throw new BadRequestException('Perfil de cliente não encontrado.');
    return clientProfileId;
  }

  @Get()
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const clientProfileId = await this.resolveClientId(user.userId);
    return this.favoritesService.findMine(clientProfileId);
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  async add(@CurrentUser() user: AuthenticatedUser, @Body() dto: AddFavoriteDto) {
    const clientProfileId = await this.resolveClientId(user.userId);
    await this.favoritesService.add(clientProfileId, dto.professionalProfileId);
  }

  @Delete(':professionalProfileId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: AuthenticatedUser, @Param('professionalProfileId') professionalProfileId: string) {
    const clientProfileId = await this.resolveClientId(user.userId);
    await this.favoritesService.remove(clientProfileId, professionalProfileId);
  }
}
