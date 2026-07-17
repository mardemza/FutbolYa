import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type MatchStageType = 'group' | 'knockout';
export type MatchStatus = 'scheduled' | 'played';

@Entity({ name: 'matches' })
@Index('IDX_matches_championship_stage', ['championshipId', 'stageType'])
export class MatchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'championship_id', type: 'varchar' })
  championshipId!: string;

  @Column({ name: 'stage_type', type: 'varchar', length: 20 })
  stageType!: MatchStageType;

  @Column({ name: 'round_name', type: 'varchar', length: 32, nullable: true })
  roundName!: string | null;

  @Column({ name: 'group_id', type: 'varchar', nullable: true })
  groupId!: string | null;

  @Column({ name: 'matchday', type: 'integer', nullable: true })
  matchday!: number | null;

  @Column({ name: 'home_team_id', type: 'varchar' })
  homeTeamId!: string;

  @Column({ name: 'away_team_id', type: 'varchar' })
  awayTeamId!: string;

  @Column({ name: 'home_goals', type: 'integer', nullable: true })
  homeGoals!: number | null;

  @Column({ name: 'away_goals', type: 'integer', nullable: true })
  awayGoals!: number | null;

  @Column({ type: 'varchar', length: 16, default: 'scheduled' })
  status!: MatchStatus;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
