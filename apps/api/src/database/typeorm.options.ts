import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ChampionshipSchema1762790000000 } from './migrations/1762790000000-championship-schema';
import { TournamentCoreSchema1762795000000 } from './migrations/1762795000000-tournament-core-schema';
import { AuthOwnershipSchema1762810000000 } from './migrations/1762810000000-auth-ownership-schema';
import { InitialSchema1762700000000 } from './migrations/1762700000000-initial-schema';
import { ChampionshipEntity } from './entities/championship.entity';
import { GroupEntity } from './entities/group.entity';
import { GroupTeamEntity } from './entities/group-team.entity';
import { MatchEntity } from './entities/match.entity';
import { PlayerEntity } from './entities/player.entity';
import { StandingEntity } from './entities/standing.entity';
import { TeamEntity } from './entities/team.entity';
import { UserEntity } from './entities/user.entity';

function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is required (e.g. postgresql://futbolya:futbolya@localhost:5432/futbolya)',
    );
  }
  return url;
}

export const typeOrmOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  url: requireDatabaseUrl(),
  entities: [
    UserEntity,
    ChampionshipEntity,
    TeamEntity,
    PlayerEntity,
    GroupEntity,
    GroupTeamEntity,
    MatchEntity,
    StandingEntity,
  ],
  migrations: [
    InitialSchema1762700000000,
    ChampionshipSchema1762790000000,
    TournamentCoreSchema1762795000000,
    AuthOwnershipSchema1762810000000,
  ],
  migrationsRun: true,
  synchronize: false,
  logging: false,
};
