import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { NotificationEntity } from '../database/entities/notification.entity';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity]), AuthModule],
  controllers: [NotificationsController],
  providers: [NotificationService, NotificationsGateway],
  exports: [NotificationService],
})
export class NotificationsModule {}
