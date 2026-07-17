import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'group_teams' })
@Index('UQ_group_teams_group_team', ['groupId', 'teamId'], { unique: true })
@Index('UQ_group_teams_championship_team', ['championshipId', 'teamId'], {
  unique: true,
})
export class GroupTeamEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'championship_id', type: 'varchar' })
  championshipId!: string;

  @Column({ name: 'group_id', type: 'varchar' })
  groupId!: string;

  @Column({ name: 'team_id', type: 'varchar' })
  teamId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'datetime' })
  createdAt!: Date;
}
