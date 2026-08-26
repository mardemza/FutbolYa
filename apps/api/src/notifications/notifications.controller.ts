import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import {
  ListNotificationsQueryDto,
  MarkAllReadQueryDto,
  type UnreadCountDto,
} from './notification.dto';
import { NotificationService } from './notification.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ListNotificationsQueryDto) {
    return this.notificationService.listForUser(user.userId, query);
  }

  @Get('unread-count')
  async unreadCount(@CurrentUser() user: AuthUser): Promise<UnreadCountDto> {
    const unreadCount = await this.notificationService.getUnreadCount(user.userId);
    return { unreadCount };
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() user: AuthUser, @Query() query: MarkAllReadQueryDto) {
    return this.notificationService.markAllRead(user.userId, query.championshipId);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.markRead(user.userId, id);
  }
}
