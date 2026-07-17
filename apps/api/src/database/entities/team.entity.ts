import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'teams' })
@Index('UQ_teams_championship_name', ['championshipId', 'name'], { unique: true })
export class TeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'championship_id', type: 'varchar' })
  championshipId!: string;

  @Column({ type: 'varchar', length: 80 })
  name!: string;

  @Column({ name: 'short_name', type: 'varchar', length: 10, nullable: true })
  shortName!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
  updatedAt!: Date;
}
