import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'standings' })
@Index('UQ_standings_group_team', ['groupId', 'teamId'], { unique: true })
export class StandingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'championship_id', type: 'uuid' })
  championshipId!: string;

  @Column({ name: 'group_id', type: 'uuid' })
  groupId!: string;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @Column({ type: 'integer', default: 0 })
  played!: number;

  @Column({ type: 'integer', default: 0 })
  won!: number;

  @Column({ type: 'integer', default: 0 })
  drawn!: number;

  @Column({ type: 'integer', default: 0 })
  lost!: number;

  @Column({ name: 'goals_for', type: 'integer', default: 0 })
  goalsFor!: number;

  @Column({ name: 'goals_against', type: 'integer', default: 0 })
  goalsAgainst!: number;

  @Column({ name: 'goal_difference', type: 'integer', default: 0 })
  goalDifference!: number;

  @Column({ type: 'integer', default: 0 })
  points!: number;

  @Column({ type: 'integer', default: 0 })
  position!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
