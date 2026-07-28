import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaService } from '../../infra/prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  // Health check "raso": nunca falha, só confirma que o processo Node está
  // vivo. Usado por load balancers que só querem saber se o processo
  // responde (arranque rápido, sem depender da BD).
  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'low-prices-api',
      timestamp: new Date().toISOString(),
    };
  }

  // Health check "profundo": confirma ligação real à base de dados.
  // Usado por monitorização externa (uptime checks) para detetar quebras
  // de ligação à BD que o health check raso não apanha.
  @Public()
  @Get('deep')
  async checkDeep() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'low-prices-api',
        database: 'up',
        timestamp: new Date().toISOString(),
      };
    } catch {
      throw new HttpException(
        {
          status: 'error',
          service: 'low-prices-api',
          database: 'down',
          timestamp: new Date().toISOString(),
        },
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
