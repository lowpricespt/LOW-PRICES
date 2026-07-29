import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateProfessionalCategoriesDto } from './dto/update-professional-categories.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getById(user.userId);
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.userId, dto);
  }

  @Roles('PROFESSIONAL')
  @Patch('me/professional/categories')
  updateProfessionalCategories(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfessionalCategoriesDto,
  ) {
    return this.usersService.setProfessionalCategories(user.userId, dto);
  }

  @Roles('PROFESSIONAL')
  @Get('me/professional/profile')
  getProfessionalProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.getProfessionalProfile(user.userId);
  }

  @Roles('PROFESSIONAL')
  @Patch('me/professional/profile')
  updateProfessionalProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateProfessionalProfileDto,
  ) {
    return this.usersService.updateProfessionalProfile(user.userId, dto);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAccount(@CurrentUser() user: AuthenticatedUser) {
    await this.usersService.deleteAccount(user.userId);
  }
}
