import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { ChampionshipEntity } from '../database/entities/championship.entity';
import {
  NotificationEntity,
  type NotificationType,
} from '../database/entities/notification.entity';
import type { TeamEntity } from '../database/entities/team.entity';
import type {
  ListNotificationsQueryDto,
  NotificationResponseDto,
  PaginatedNotificationsDto,
} from './notification.dto';
import {
  CreateNotificationInput,
  NOTIFICATION_CATEGORY_BY_TYPE,
  PHASE_LABELS,
} from './notification.types';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async createAndPush(input: CreateNotificationInput): Promise<NotificationEntity> {
    const category = NOTIFICATION_CATEGORY_BY_TYPE[input.type];
    const notification = this.notificationRepository.create({
      recipientId: input.recipientId,
      type: input.type,
      category,
      title: input.title,
      body: input.body,
      championshipId: input.championshipId ?? null,
      entityType: input.entityType ?? null,
      entityId: input.entityId ?? null,
      deepLink: input.deepLink,
      readAt: null,
    });

    const saved = await this.notificationRepository.save(notification);
    const unreadCount = await this.getUnreadCount(input.recipientId);

    try {
      this.notificationsGateway.emitToUser(input.recipientId, {
        notification: this.toDto(saved),
        unreadCount,
      });
    } catch (error) {
      this.logger.error(
        `Failed to emit notification:new for user ${input.recipientId}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    return saved;
  }

  async notifyChampionshipCreated(
    ownerId: string,
    championship: ChampionshipEntity,
  ): Promise<void> {
    await this.createAndPush({
      recipientId: ownerId,
      type: 'championship.created',
      title: 'Nuevo campeonato creado',
      body: `${championship.name} está listo para inscripciones (${championship.season}).`,
      championshipId: championship.id,
      entityType: 'championship',
      entityId: championship.id,
      deepLink: `/championships/${championship.id}`,
    });
  }

  async notifyTeamRegistered(
    ownerId: string,
    championship: ChampionshipEntity,
    team: TeamEntity,
  ): Promise<void> {
    await this.createAndPush({
      recipientId: ownerId,
      type: 'team.registered',
      title: 'Equipo inscripto',
      body: `${team.name} se sumó al campeonato (${championship.registeredTeams}/${championship.maxTeams} cupos).`,
      championshipId: championship.id,
      entityType: 'team',
      entityId: team.id,
      deepLink: `/championships/${championship.id}/teams`,
    });
  }

  async notifyRegistrationClosed(
    ownerId: string,
    championship: ChampionshipEntity,
  ): Promise<void> {
    await this.createAndPush({
      recipientId: ownerId,
      type: 'registration.closed',
      title: 'Inscripción cerrada',
      body: 'Cupo completo: ya podés sortear los grupos.',
      championshipId: championship.id,
      entityType: 'championship',
      entityId: championship.id,
      deepLink: `/championships/${championship.id}/draw`,
    });
  }

  async notifyGroupsDrawn(
    ownerId: string,
    championship: ChampionshipEntity,
  ): Promise<void> {
    await this.createAndPush({
      recipientId: ownerId,
      type: 'groups.drawn',
      title: 'Sorteo realizado',
      body: `Los 8 grupos de ${championship.name} están listos. Generá el fixture cuando quieras.`,
      championshipId: championship.id,
      entityType: 'championship',
      entityId: championship.id,
      deepLink: `/championships/${championship.id}/draw`,
    });
  }

  async notifyFixtureGenerated(
    ownerId: string,
    championship: ChampionshipEntity,
    matchCount: number,
  ): Promise<void> {
    await this.createAndPush({
      recipientId: ownerId,
      type: 'fixture.generated',
      title: 'Fixture generado',
      body: `Se crearon ${matchCount} partidos de fase de grupos para ${championship.name}.`,
      championshipId: championship.id,
      entityType: 'championship',
      entityId: championship.id,
      deepLink: `/championships/${championship.id}/fixture`,
    });
  }

  async notifyMatchResultUpdated(
    ownerId: string,
    params: {
      championshipId: string;
      matchId: string;
      homeName: string;
      awayName: string;
      homeGoals: number;
      awayGoals: number;
      groupLabel: string;
      matchday: number | null;
      wasCorrection: boolean;
    },
  ): Promise<void> {
    const score = `${params.homeGoals} - ${params.awayGoals}`;
    const context =
      params.matchday !== null
        ? `${params.groupLabel}, Fecha ${params.matchday}`
        : params.groupLabel;

    await this.createAndPush({
      recipientId: ownerId,
      type: 'match.result_updated',
      title: params.wasCorrection ? 'Resultado actualizado' : 'Resultado cargado',
      body: `${params.homeName} ${score} ${params.awayName} (${context}).`,
      championshipId: params.championshipId,
      entityType: 'match',
      entityId: params.matchId,
      deepLink: `/championships/${params.championshipId}/fixture`,
    });
  }

  async notifyPhaseChanged(
    ownerId: string,
    championship: ChampionshipEntity,
    previousStatus: string,
  ): Promise<void> {
    if (previousStatus === championship.status) {
      return;
    }

    const label = PHASE_LABELS[championship.status] ?? championship.status;
    await this.createAndPush({
      recipientId: ownerId,
      type: 'championship.phase_changed',
      title: 'Fase del campeonato actualizada',
      body: `${championship.name} pasó a: ${label}.`,
      championshipId: championship.id,
      entityType: 'championship',
      entityId: championship.id,
      deepLink: `/championships/${championship.id}`,
    });
  }

  async listForUser(
    userId: string,
    query: ListNotificationsQueryDto,
  ): Promise<PaginatedNotificationsDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.notificationRepository
      .createQueryBuilder('n')
      .where('n.recipient_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC');

    if (query.category) {
      qb.andWhere('n.category = :category', { category: query.category });
    }
    if (query.championshipId) {
      qb.andWhere('n.championship_id = :championshipId', {
        championshipId: query.championshipId,
      });
    }
    if (query.unreadOnly) {
      qb.andWhere('n.read_at IS NULL');
    }

    const total = await qb.getCount();
    const items = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items: items.map((item) => this.toDto(item)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { recipientId: userId, readAt: IsNull() },
    });
  }

  async markRead(userId: string, notificationId: string): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, recipientId: userId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    if (!notification.readAt) {
      notification.readAt = new Date();
      await this.notificationRepository.save(notification);
    }

    return this.toDto(notification);
  }

  async markAllRead(userId: string, championshipId?: string): Promise<{ updated: number }> {
    const qb = this.notificationRepository
      .createQueryBuilder()
      .update(NotificationEntity)
      .set({ readAt: () => 'NOW()' })
      .where('recipient_id = :userId', { userId })
      .andWhere('read_at IS NULL');

    if (championshipId) {
      qb.andWhere('championship_id = :championshipId', { championshipId });
    }

    const result = await qb.execute();
    return { updated: result.affected ?? 0 };
  }

  private toDto(entity: NotificationEntity): NotificationResponseDto {
    return {
      id: entity.id,
      type: entity.type,
      category: entity.category,
      title: entity.title,
      body: entity.body,
      championshipId: entity.championshipId,
      entityType: entity.entityType,
      entityId: entity.entityId,
      deepLink: entity.deepLink,
      readAt: entity.readAt?.toISOString() ?? null,
      createdAt: entity.createdAt.toISOString(),
      isRead: entity.readAt !== null,
    };
  }
}
