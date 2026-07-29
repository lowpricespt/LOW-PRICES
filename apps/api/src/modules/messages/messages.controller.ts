import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';

@Controller()
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations/me')
  findMyConversations(@CurrentUser() user: AuthenticatedUser) {
    return this.messagesService.findMyConversations(user.userId, user.role as 'CLIENT' | 'PROFESSIONAL');
  }

  @Get('quotes/:quoteId/messages')
  findByQuote(@CurrentUser() user: AuthenticatedUser, @Param('quoteId') quoteId: string) {
    return this.messagesService.findByQuote(quoteId, { userId: user.userId });
  }

  @Post('quotes/:quoteId/messages')
  send(@CurrentUser() user: AuthenticatedUser, @Param('quoteId') quoteId: string, @Body() dto: SendMessageDto) {
    return this.messagesService.send(quoteId, { userId: user.userId }, dto.body);
  }
}
