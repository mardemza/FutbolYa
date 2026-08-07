import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'players' })
@Index('UQ_players_team_shirt', ['teamId', 'shirtNumber'], { unique: true })
export class PlayerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'championship_id', type: 'uuid' })
  championshipId!: string;

  @Column({ name: 'team_id', type: 'uuid' })
  teamId!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 80 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 80 })
  lastName!: string;

  @Column({ name: 'shirt_number', type: 'integer' })
  shirtNumber!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
