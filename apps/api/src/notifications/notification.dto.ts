import { IsBoolean, IsIn, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type {
  NotificationCategory,
  NotificationType,
} from '../database/entities/notification.entity';

export class ListNotificationsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['championship', 'team', 'match', 'system'])
  category?: NotificationCategory;

  @IsOptional()
  @IsUUID()
  championshipId?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  unreadOnly?: boolean;
}

export class MarkAllReadQueryDto {
  @IsOptional()
  @IsUUID()
  championshipId?: string;
}

export type NotificationResponseDto = {
  id: string;
  type: NotificationType;
  category: NotificationCategory;
  title: string;
  body: string;
  championshipId: string | null;
  entityType: string | null;
  entityId: string | null;
  deepLink: string;
  readAt: string | null;
  createdAt: string;
  isRead: boolean;
};

export type PaginatedNotificationsDto = {
  items: NotificationResponseDto[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UnreadCountDto = {
  unreadCount: number;
};
