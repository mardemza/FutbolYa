import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type ChampionshipStatus =
  | 'draft'
  | 'registration-closed'
  | 'drawn'
  | 'in-progress'
  | 'finished';

@Entity({ name: 'championships' })
export class ChampionshipEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 20 })
  season!: string;

  @Column({ name: 'start_date', type: 'varchar', length: 10 })
  startDate!: string;

  @Column({ type: 'varchar', length: 30, default: 'draft' })
  status!: ChampionshipStatus;

  @Column({ name: 'max_teams', type: 'integer', default: 32 })
  maxTeams!: number;

  @Column({ name: 'registered_teams', type: 'integer', default: 0 })
  registeredTeams!: number;

  @Column({ name: 'owner_id', type: 'varchar', nullable: true })
  ownerId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
