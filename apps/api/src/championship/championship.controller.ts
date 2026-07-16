import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChampionshipService } from './championship.service';

@ApiTags('championships')
@Controller('championships')
export class ChampionshipController {
  constructor(private readonly championshipService: ChampionshipService) {}

  @Get('status')
  @ApiOperation({ summary: 'Estado de implementación del módulo de campeonatos' })
  @ApiOkResponse({
    schema: {
      example: {
        status: 'pending-implementation',
      },
    },
  })
  getStatus(): { status: string } {
    return this.championshipService.getStatus();
  }
}
