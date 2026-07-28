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

  @Get('jobs/:jobId/messages')
  findByJob(@CurrentUser() user: AuthenticatedUser, @Param('jobId') jobId: string) {
    return this.messagesService.findByJob(jobId, { userId: user.userId });
  }

  @Post('jobs/:jobId/messages')
  send(@CurrentUser() user: AuthenticatedUser, @Param('jobId') jobId: string, @Body() dto: SendMessageDto) {
    return this.messagesService.send(jobId, { userId: user.userId }, dto.body);
  }
}
