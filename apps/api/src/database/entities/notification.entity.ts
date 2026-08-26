import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type NotificationCategory = 'championship' | 'team' | 'match' | 'system';

export type NotificationType =
  | 'championship.created'
  | 'team.registered'
  | 'registration.closed'
  | 'groups.drawn'
  | 'fixture.generated'
  | 'match.result_updated'
  | 'championship.phase_changed';

@Entity({ name: 'notifications' })
@Index('IDX_notifications_recipient_created', ['recipientId', 'createdAt'])
@Index('IDX_notifications_recipient_unread', ['recipientId'], {
  where: '"read_at" IS NULL',
})
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'recipient_id', type: 'uuid' })
  recipientId!: string;

  @Column({ type: 'varchar', length: 64 })
  type!: NotificationType;

  @Column({ type: 'varchar', length: 32 })
  category!: NotificationCategory;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ name: 'championship_id', type: 'uuid', nullable: true })
  championshipId!: string | null;

  @Column({ name: 'entity_type', type: 'varchar', length: 32, nullable: true })
  entityType!: string | null;

  @Column({ name: 'entity_id', type: 'uuid', nullable: true })
  entityId!: string | null;

  @Column({ name: 'deep_link', type: 'varchar', length: 512 })
  deepLink!: string;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
