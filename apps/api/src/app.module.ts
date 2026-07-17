import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ChampionshipController } from './championship/championship.controller';
import { MatchController } from './championship/match.controller';
import { ChampionshipService } from './championship/championship.service';
import { ChampionshipEntity } from './database/entities/championship.entity';
import { GroupEntity } from './database/entities/group.entity';
import { GroupTeamEntity } from './database/entities/group-team.entity';
import { MatchEntity } from './database/entities/match.entity';
import { PlayerEntity } from './database/entities/player.entity';
import { StandingEntity } from './database/entities/standing.entity';
import { TeamEntity } from './database/entities/team.entity';
import { typeOrmOptions } from './database/typeorm.options';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmOptions),
    TypeOrmModule.forFeature([
      ChampionshipEntity,
      TeamEntity,
      PlayerEntity,
      GroupEntity,
      GroupTeamEntity,
      MatchEntity,
      StandingEntity,
    ]),
  ],
  controllers: [AppController, ChampionshipController, MatchController],
  providers: [ChampionshipService],
})
export class AppModule {}
