import type {
  NotificationCategory,
  NotificationType,
} from '../database/entities/notification.entity';

export const NOTIFICATION_CATEGORY_BY_TYPE: Record<NotificationType, NotificationCategory> = {
  'championship.created': 'championship',
  'team.registered': 'team',
  'registration.closed': 'championship',
  'groups.drawn': 'championship',
  'fixture.generated': 'match',
  'match.result_updated': 'match',
  'championship.phase_changed': 'championship',
};

export const PHASE_LABELS: Record<string, string> = {
  draft: 'Inscripción abierta',
  'registration-closed': 'Inscripción cerrada',
  drawn: 'Sorteado',
  'in-progress': 'En curso',
  finished: 'Finalizado',
};

export type CreateNotificationInput = {
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  championshipId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  deepLink: string;
};

export type NotificationNewEvent = {
  notification: {
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
  unreadCount: number;
};
