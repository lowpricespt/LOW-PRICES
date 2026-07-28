import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Usa a API REST do Resend diretamente por fetch — evita adicionar mais
 * uma dependência npm ao projeto (o histórico de deploy desta app já
 * mostrou como isso pode ser frágil). Resend tem uma API HTTP simples,
 * sem SDK necessário para o que precisamos aqui.
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly configService: ConfigService) {}

  async send(params: SendEmailParams): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const fromAddress = this.configService.get<string>('EMAIL_FROM') ?? 'Low Prices <onboarding@resend.dev>';

    if (!apiKey) {
      this.logger.warn(
        `RESEND_API_KEY não configurada — email para ${params.to} ("${params.subject}") não foi enviado. ` +
          'Configura a variável para ativar o envio real.',
      );
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: fromAddress, to: params.to, subject: params.subject, html: params.html }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Falha ao enviar email via Resend (status ${response.status}): ${body}`);
    }
  }
}
