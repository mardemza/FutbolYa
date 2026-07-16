import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ChampionshipController } from './championship/championship.controller';
import { ChampionshipService } from './championship/championship.service';

@Module({
  imports: [],
  controllers: [AppController, ChampionshipController],
  providers: [ChampionshipService],
})
export class AppModule {}
