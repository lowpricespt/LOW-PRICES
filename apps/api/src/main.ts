import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  // O website corre em domínio próprio e usa o cookie httpOnly do refresh
  // token, por isso credentials:true é obrigatório; a lista se origens
  // deve ser restringida ao domínio real em produção via env var.
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3001', 'http://localhost:3000'],
    credentials: true,
  });

  // Valida (e rejeita) automaticamente qualquer campo não esperado no
  // corpo do pedido — reduz a superfície de ataque de mass assignment.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Low Prices API a correr em http://localhost:${port}`);
}
bootstrap();
