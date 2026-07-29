import { Body, Controller, Param, ParseUUIDPipe, Put, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchResultDto } from './championship.dto';
import { ChampionshipService } from './championship.service';

@ApiTags('matches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchController {
  constructor(private readonly championshipService: ChampionshipService) {}

  @Put(':matchId/result')
  @ApiOperation({ summary: 'Registrar/actualizar resultado de partido' })
  @ApiBody({ type: MatchResultDto })
  @ApiOkResponse({ description: 'Resultado actualizado' })
  updateResult(
    @CurrentUser() user: AuthUser,
    @Param('matchId', new ParseUUIDPipe()) matchId: string,
    @Body() payload: MatchResultDto,
  ) {
    return this.championshipService.updateMatchResult(
      matchId,
      payload,
      user.userId,
    );
  }
}
