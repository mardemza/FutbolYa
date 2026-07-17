import { Body, Controller, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { MatchResultDto } from './championship.dto';
import { ChampionshipService } from './championship.service';

@ApiTags('matches')
@Controller('matches')
export class MatchController {
  constructor(private readonly championshipService: ChampionshipService) {}

  @Put(':matchId/result')
  @ApiOperation({ summary: 'Registrar/actualizar resultado de partido' })
  @ApiBody({ type: MatchResultDto })
  @ApiOkResponse({ description: 'Resultado actualizado' })
  updateResult(
    @Param('matchId', new ParseUUIDPipe()) matchId: string,
    @Body() payload: MatchResultDto,
  ) {
    return this.championshipService.updateMatchResult(matchId, payload);
  }
}
