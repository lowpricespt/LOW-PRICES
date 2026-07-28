import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { AdminService } from './admin.service';
import { UpdateVerificationDto } from './dto/update-verification.dto';

// Todas as rotas deste controller exigem role ADMIN — não há forma de
// criar uma conta ADMIN via registo público (ver RegisterDto, que só
// aceita CLIENT/PROFESSIONAL), por isso a primeira conta admin tem de
// ser promovida diretamente na base de dados (UPDATE "User" SET role =
// 'ADMIN' WHERE email = '...'), uma única vez.
@Controller('admin')
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('professionals')
  async listProfessionals(@Query('status') status?: 'PENDING' | 'APPROVED' | 'REJECTED') {
    return this.adminService.listProfessionalsForReview(status ?? 'PENDING');
  }

  @Patch('professionals/:id/verification')
  async updateVerification(
    @Param('id') id: string,
    @Body() dto: UpdateVerificationDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.adminService.updateVerification(id, dto, user.userId);
  }
}
