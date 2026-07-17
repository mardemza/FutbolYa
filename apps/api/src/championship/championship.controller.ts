import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreatePlayerDto,
  CreateTeamDto,
  CreateChampionshipDto,
  UpdatePlayerDto,
  UpdateTeamDto,
  UpdateChampionshipDto,
  DrawDto,
} from './championship.dto';
import { ChampionshipService } from './championship.service';

@ApiTags('championships')
@Controller('championships')
export class ChampionshipController {
  constructor(private readonly championshipService: ChampionshipService) {}

  @Post()
  @ApiOperation({ summary: 'Crear campeonato en estado draft' })
  @ApiBody({ type: CreateChampionshipDto })
  @ApiCreatedResponse({ description: 'Campeonato creado' })
  create(@Body() payload: CreateChampionshipDto) {
    return this.championshipService.create(payload);
  }

  @Get(':championshipId')
  @ApiOperation({ summary: 'Obtener detalle de campeonato' })
  @ApiOkResponse({
    description: 'Campeonato encontrado',
  })
  findOne(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
  ) {
    return this.championshipService.findOne(championshipId);
  }

  @Patch(':championshipId')
  @ApiOperation({ summary: 'Editar campeonato en estado draft' })
  @ApiBody({ type: UpdateChampionshipDto })
  @ApiOkResponse({ description: 'Campeonato actualizado' })
  update(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Body() payload: UpdateChampionshipDto,
  ) {
    return this.championshipService.update(championshipId, payload);
  }

  @Post(':championshipId/close-registration')
  @ApiOperation({ summary: 'Cerrar inscripcion cuando hay 32 equipos' })
  @ApiOkResponse({ description: 'Inscripcion cerrada' })
  closeRegistration(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
  ) {
    return this.championshipService.closeRegistration(championshipId);
  }

  @Post(':championshipId/teams')
  @ApiOperation({ summary: 'Alta de equipo en campeonato' })
  @ApiBody({ type: CreateTeamDto })
  @ApiCreatedResponse({ description: 'Equipo creado' })
  createTeam(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Body() payload: CreateTeamDto,
  ) {
    return this.championshipService.createTeam(championshipId, payload);
  }

  @Get(':championshipId/teams')
  @ApiOperation({ summary: 'Listar equipos del campeonato' })
  @ApiOkResponse({ description: 'Listado de equipos' })
  listTeams(@Param('championshipId', new ParseUUIDPipe()) championshipId: string) {
    return this.championshipService.listTeams(championshipId);
  }

  @Patch(':championshipId/teams/:teamId')
  @ApiOperation({ summary: 'Editar equipo del campeonato' })
  @ApiBody({ type: UpdateTeamDto })
  @ApiOkResponse({ description: 'Equipo actualizado' })
  updateTeam(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Param('teamId', new ParseUUIDPipe()) teamId: string,
    @Body() payload: UpdateTeamDto,
  ) {
    return this.championshipService.updateTeam(championshipId, teamId, payload);
  }

  @Delete(':championshipId/teams/:teamId')
  @ApiOperation({ summary: 'Eliminar equipo del campeonato' })
  @ApiNoContentResponse({ description: 'Equipo eliminado' })
  async deleteTeam(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Param('teamId', new ParseUUIDPipe()) teamId: string,
  ): Promise<void> {
    await this.championshipService.deleteTeam(championshipId, teamId);
  }

  @Post(':championshipId/teams/:teamId/players')
  @ApiOperation({ summary: 'Alta de jugador en equipo' })
  @ApiBody({ type: CreatePlayerDto })
  @ApiCreatedResponse({ description: 'Jugador creado' })
  createPlayer(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Param('teamId', new ParseUUIDPipe()) teamId: string,
    @Body() payload: CreatePlayerDto,
  ) {
    return this.championshipService.createPlayer(championshipId, teamId, payload);
  }

  @Get(':championshipId/teams/:teamId/players')
  @ApiOperation({ summary: 'Listar jugadores de un equipo' })
  @ApiOkResponse({ description: 'Listado de jugadores' })
  listPlayers(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Param('teamId', new ParseUUIDPipe()) teamId: string,
  ) {
    return this.championshipService.listPlayers(championshipId, teamId);
  }

  @Patch(':championshipId/teams/:teamId/players/:playerId')
  @ApiOperation({ summary: 'Editar jugador de un equipo' })
  @ApiBody({ type: UpdatePlayerDto })
  @ApiOkResponse({ description: 'Jugador actualizado' })
  updatePlayer(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Param('teamId', new ParseUUIDPipe()) teamId: string,
    @Param('playerId', new ParseUUIDPipe()) playerId: string,
    @Body() payload: UpdatePlayerDto,
  ) {
    return this.championshipService.updatePlayer(
      championshipId,
      teamId,
      playerId,
      payload,
    );
  }

  @Delete(':championshipId/teams/:teamId/players/:playerId')
  @ApiOperation({ summary: 'Eliminar jugador de un equipo' })
  @ApiNoContentResponse({ description: 'Jugador eliminado' })
  async deletePlayer(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Param('teamId', new ParseUUIDPipe()) teamId: string,
    @Param('playerId', new ParseUUIDPipe()) playerId: string,
  ): Promise<void> {
    await this.championshipService.deletePlayer(championshipId, teamId, playerId);
  }

  @Post(':championshipId/draw')
  @ApiOperation({ summary: 'Ejecutar sorteo de grupos con seed opcional' })
  @ApiBody({ type: DrawDto })
  @ApiOkResponse({ description: 'Sorteo generado' })
  draw(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Body() payload: DrawDto,
  ) {
    return this.championshipService.drawGroups(championshipId, payload.seed);
  }

  @Post(':championshipId/fixtures')
  @ApiOperation({ summary: 'Generar fixtures de fase de grupos' })
  @ApiCreatedResponse({ description: 'Fixture generado' })
  generateFixtures(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
  ) {
    return this.championshipService.generateGroupFixtures(championshipId);
  }

  @Get(':championshipId/groups')
  @ApiOperation({ summary: 'Listar grupos con equipos asignados' })
  @ApiOkResponse({ description: 'Grupos del campeonato' })
  groups(@Param('championshipId', new ParseUUIDPipe()) championshipId: string) {
    return this.championshipService.listGroups(championshipId);
  }

  @Get(':championshipId/matches')
  @ApiOperation({ summary: 'Listar partidos por filtros opcionales' })
  @ApiQuery({ name: 'stageType', required: false, enum: ['group', 'knockout'] })
  @ApiQuery({ name: 'matchday', required: false, type: Number })
  @ApiQuery({ name: 'roundName', required: false, type: String })
  @ApiOkResponse({ description: 'Partidos encontrados' })
  matches(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Query('stageType') stageType?: 'group' | 'knockout',
    @Query('matchday') matchday?: string,
    @Query('roundName') roundName?: string,
  ) {
    return this.championshipService.listMatches(championshipId, {
      stageType,
      matchday: matchday ? Number(matchday) : undefined,
      roundName,
    });
  }

  @Get(':championshipId/groups/:groupId/standings')
  @ApiOperation({ summary: 'Obtener tabla de posiciones de un grupo' })
  @ApiOkResponse({ description: 'Tabla de posiciones' })
  standings(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
    @Param('groupId', new ParseUUIDPipe()) groupId: string,
  ) {
    return this.championshipService.getGroupStandings(championshipId, groupId);
  }

  @Post(':championshipId/stages/knockout/generate')
  @ApiOperation({ summary: 'Generar cruces de octavos' })
  @ApiCreatedResponse({ description: 'Cuadro knockout generado' })
  generateKnockout(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
  ) {
    return this.championshipService.generateKnockout(championshipId);
  }

  @Get(':championshipId/stages/knockout/bracket')
  @ApiOperation({ summary: 'Consultar cuadro eliminatorio' })
  @ApiOkResponse({ description: 'Partidos de eliminacion por ronda' })
  bracket(
    @Param('championshipId', new ParseUUIDPipe()) championshipId: string,
  ) {
    return this.championshipService.getKnockoutBracket(championshipId);
  }
}
