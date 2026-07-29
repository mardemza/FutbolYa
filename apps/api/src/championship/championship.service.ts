import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  ChampionshipEntity,
  ChampionshipStatus,
} from '../database/entities/championship.entity';
import { GroupEntity } from '../database/entities/group.entity';
import { GroupTeamEntity } from '../database/entities/group-team.entity';
import { MatchEntity, MatchStageType } from '../database/entities/match.entity';
import { PlayerEntity } from '../database/entities/player.entity';
import { StandingEntity } from '../database/entities/standing.entity';
import { TeamEntity } from '../database/entities/team.entity';
import {
  CreatePlayerDto,
  CreateTeamDto,
  CreateChampionshipDto,
  MatchResultDto,
  UpdatePlayerDto,
  UpdateTeamDto,
  UpdateChampionshipDto,
} from './championship.dto';

@Injectable()
export class ChampionshipService {
  constructor(
    @InjectRepository(ChampionshipEntity)
    private readonly championshipRepository: Repository<ChampionshipEntity>,
    @InjectRepository(TeamEntity)
    private readonly teamRepository: Repository<TeamEntity>,
    @InjectRepository(PlayerEntity)
    private readonly playerRepository: Repository<PlayerEntity>,
    @InjectRepository(GroupEntity)
    private readonly groupRepository: Repository<GroupEntity>,
    @InjectRepository(GroupTeamEntity)
    private readonly groupTeamRepository: Repository<GroupTeamEntity>,
    @InjectRepository(MatchEntity)
    private readonly matchRepository: Repository<MatchEntity>,
    @InjectRepository(StandingEntity)
    private readonly standingRepository: Repository<StandingEntity>,
  ) {}

  async create(
    payload: CreateChampionshipDto,
    ownerId: string,
  ): Promise<ChampionshipEntity> {
    const championship = this.championshipRepository.create({
      name: payload.name,
      season: payload.season,
      startDate: payload.startDate,
      status: 'draft',
      maxTeams: 32,
      registeredTeams: 0,
      ownerId,
    });

    return this.championshipRepository.save(championship);
  }

  async listMine(ownerId: string): Promise<ChampionshipEntity[]> {
    return this.championshipRepository.find({
      where: { ownerId },
      order: { updatedAt: 'DESC' },
    });
  }

  async requireOwned(
    championshipId: string,
    ownerId: string,
  ): Promise<ChampionshipEntity> {
    const championship = await this.findOne(championshipId);
    if (championship.ownerId !== ownerId) {
      throw new ForbiddenException(
        `Championship ${championshipId} does not belong to the authenticated user`,
      );
    }
    return championship;
  }

  async findOne(championshipId: string): Promise<ChampionshipEntity> {
    const championship = await this.championshipRepository.findOne({
      where: { id: championshipId },
    });

    if (!championship) {
      throw new NotFoundException(`Championship ${championshipId} not found`);
    }

    return championship;
  }

  async update(
    championshipId: string,
    payload: UpdateChampionshipDto,
  ): Promise<ChampionshipEntity> {
    const championship = await this.findOne(championshipId);

    if (championship.status !== 'draft') {
      throw new ConflictException(
        `Championship ${championshipId} cannot be updated in status ${championship.status}`,
      );
    }

    championship.name = payload.name ?? championship.name;
    championship.season = payload.season ?? championship.season;
    championship.startDate = payload.startDate ?? championship.startDate;

    return this.championshipRepository.save(championship);
  }

  async closeRegistration(championshipId: string): Promise<ChampionshipEntity> {
    const championship = await this.findOne(championshipId);

    if (championship.status !== 'draft') {
      throw new ConflictException(
        `Championship ${championshipId} cannot close registration in status ${championship.status}`,
      );
    }

    if (championship.registeredTeams !== championship.maxTeams) {
      throw new UnprocessableEntityException({
        message: 'Cannot close registration without full team capacity',
        missingTeams: championship.maxTeams - championship.registeredTeams,
      });
    }

    championship.status = 'registration-closed' as ChampionshipStatus;
    return this.championshipRepository.save(championship);
  }

  async createTeam(
    championshipId: string,
    payload: CreateTeamDto,
  ): Promise<TeamEntity> {
    const championship = await this.findOne(championshipId);
    this.ensureRegistrationOpen(championship);

    if (championship.registeredTeams >= championship.maxTeams) {
      throw new UnprocessableEntityException({
        message: 'Maximum team capacity reached',
        maxTeams: championship.maxTeams,
      });
    }

    const existing = await this.teamRepository.findOne({
      where: { championshipId, name: payload.name },
    });
    if (existing) {
      throw new ConflictException('Team name already exists in this championship');
    }

    const team = this.teamRepository.create({
      championshipId,
      name: payload.name,
      shortName: payload.shortName ?? null,
    });

    const created = await this.teamRepository.save(team);
    championship.registeredTeams += 1;
    await this.championshipRepository.save(championship);
    return created;
  }

  async listTeams(championshipId: string): Promise<TeamEntity[]> {
    await this.findOne(championshipId);
    return this.teamRepository.find({
      where: { championshipId },
      order: { name: 'ASC' },
    });
  }

  async updateTeam(
    championshipId: string,
    teamId: string,
    payload: UpdateTeamDto,
  ): Promise<TeamEntity> {
    const championship = await this.findOne(championshipId);
    this.ensureRegistrationOpen(championship);

    const team = await this.requireTeam(championshipId, teamId);

    if (payload.name && payload.name !== team.name) {
      const existing = await this.teamRepository.findOne({
        where: { championshipId, name: payload.name },
      });
      if (existing) {
        throw new ConflictException('Team name already exists in this championship');
      }
      team.name = payload.name;
    }

    team.shortName = payload.shortName ?? team.shortName;
    return this.teamRepository.save(team);
  }

  async deleteTeam(championshipId: string, teamId: string): Promise<void> {
    const championship = await this.findOne(championshipId);
    this.ensureRegistrationOpen(championship);

    await this.requireTeam(championshipId, teamId);
    await this.playerRepository.delete({ championshipId, teamId });
    await this.teamRepository.delete({ id: teamId, championshipId });

    championship.registeredTeams = Math.max(0, championship.registeredTeams - 1);
    await this.championshipRepository.save(championship);
  }

  async createPlayer(
    championshipId: string,
    teamId: string,
    payload: CreatePlayerDto,
  ): Promise<PlayerEntity> {
    const championship = await this.findOne(championshipId);
    this.ensureRegistrationOpen(championship);
    await this.requireTeam(championshipId, teamId);

    const existing = await this.playerRepository.findOne({
      where: { teamId, shirtNumber: payload.shirtNumber },
    });
    if (existing) {
      throw new ConflictException('Shirt number already exists in this team');
    }

    const player = this.playerRepository.create({
      championshipId,
      teamId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      shirtNumber: payload.shirtNumber,
    });
    return this.playerRepository.save(player);
  }

  async listPlayers(championshipId: string, teamId: string): Promise<PlayerEntity[]> {
    await this.requireTeam(championshipId, teamId);
    return this.playerRepository.find({
      where: { championshipId, teamId },
      order: { shirtNumber: 'ASC' },
    });
  }

  async updatePlayer(
    championshipId: string,
    teamId: string,
    playerId: string,
    payload: UpdatePlayerDto,
  ): Promise<PlayerEntity> {
    const championship = await this.findOne(championshipId);
    this.ensureRegistrationOpen(championship);

    await this.requireTeam(championshipId, teamId);
    const player = await this.playerRepository.findOne({
      where: { id: playerId, championshipId, teamId },
    });
    if (!player) {
      throw new NotFoundException(`Player ${playerId} not found`);
    }

    if (
      payload.shirtNumber !== undefined &&
      payload.shirtNumber !== player.shirtNumber
    ) {
      const existing = await this.playerRepository.findOne({
        where: { teamId, shirtNumber: payload.shirtNumber },
      });
      if (existing) {
        throw new ConflictException('Shirt number already exists in this team');
      }
      player.shirtNumber = payload.shirtNumber;
    }

    player.firstName = payload.firstName ?? player.firstName;
    player.lastName = payload.lastName ?? player.lastName;
    return this.playerRepository.save(player);
  }

  async deletePlayer(
    championshipId: string,
    teamId: string,
    playerId: string,
  ): Promise<void> {
    const championship = await this.findOne(championshipId);
    this.ensureRegistrationOpen(championship);

    const result = await this.playerRepository.delete({
      id: playerId,
      championshipId,
      teamId,
    });
    if (!result.affected) {
      throw new NotFoundException(`Player ${playerId} not found`);
    }
  }

  async drawGroups(championshipId: string, seed?: string) {
    const championship = await this.findOne(championshipId);
    if (championship.status !== 'registration-closed') {
      throw new ConflictException('Draw is only allowed in registration-closed state');
    }

    const existingGroups = await this.groupRepository.count({ where: { championshipId } });
    if (existingGroups > 0) {
      throw new ConflictException('Draw already exists for this championship');
    }

    const teams = await this.listTeams(championshipId);
    if (teams.length !== championship.maxTeams) {
      throw new UnprocessableEntityException({
        message: 'Cannot draw without full team capacity',
        missingTeams: championship.maxTeams - teams.length,
      });
    }

    const rng = this.seededRandom(seed ?? `seed-${championshipId}`);
    const shuffledTeams = [...teams].sort(() => rng() - 0.5);
    const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    const groups = await this.groupRepository.save(
      groupNames.map((name) => this.groupRepository.create({ championshipId, name })),
    );

    const groupTeams: GroupTeamEntity[] = [];
    for (let i = 0; i < shuffledTeams.length; i += 1) {
      const group = groups[i % groups.length];
      groupTeams.push(
        this.groupTeamRepository.create({
          championshipId,
          groupId: group.id,
          teamId: shuffledTeams[i].id,
        }),
      );
    }
    await this.groupTeamRepository.save(groupTeams);

    championship.status = 'drawn';
    await this.championshipRepository.save(championship);

    return this.listGroups(championshipId);
  }

  async generateGroupFixtures(championshipId: string) {
    const championship = await this.findOne(championshipId);
    if (!['drawn', 'in-progress'].includes(championship.status)) {
      throw new ConflictException('Fixture generation requires championship in drawn state');
    }

    const existingFixtures = await this.matchRepository.count({
      where: { championshipId, stageType: 'group' },
    });
    if (existingFixtures > 0) {
      throw new ConflictException('Group fixture already exists');
    }

    const groups = await this.groupRepository.find({ where: { championshipId } });
    if (groups.length === 0) {
      throw new ConflictException('Draw groups before generating fixtures');
    }

    const groupTeams = await this.groupTeamRepository.find({ where: { championshipId } });
    const matches: MatchEntity[] = [];
    const standings: StandingEntity[] = [];

    for (const group of groups) {
      const teamIds = groupTeams
        .filter((item) => item.groupId === group.id)
        .map((item) => item.teamId);

      if (teamIds.length !== 4) {
        throw new UnprocessableEntityException(
          `Group ${group.name} must contain exactly 4 teams`,
        );
      }

      for (const teamId of teamIds) {
        standings.push(
          this.standingRepository.create({
            championshipId,
            groupId: group.id,
            teamId,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
            position: 0,
          }),
        );
      }

      const rounds = [
        [
          [0, 1],
          [2, 3],
        ],
        [
          [0, 2],
          [3, 1],
        ],
        [
          [0, 3],
          [1, 2],
        ],
      ];

      rounds.forEach((roundPairings, roundIndex) => {
        roundPairings.forEach(([homeIndex, awayIndex]) => {
          matches.push(
            this.matchRepository.create({
              championshipId,
              stageType: 'group',
              roundName: 'group-stage',
              groupId: group.id,
              matchday: roundIndex + 1,
              homeTeamId: teamIds[homeIndex],
              awayTeamId: teamIds[awayIndex],
              homeGoals: null,
              awayGoals: null,
              status: 'scheduled',
            }),
          );
        });
      });
    }

    await this.matchRepository.save(matches);
    await this.standingRepository.save(standings);

    championship.status = 'in-progress';
    await this.championshipRepository.save(championship);

    return { createdMatches: matches.length };
  }

  async listGroups(championshipId: string) {
    await this.findOne(championshipId);
    const groups = await this.groupRepository.find({
      where: { championshipId },
      order: { name: 'ASC' },
    });

    const groupTeams = await this.groupTeamRepository.find({ where: { championshipId } });
    const teamIds = groupTeams.map((item) => item.teamId);
    const teams = teamIds.length
      ? await this.teamRepository.find({ where: { id: In(teamIds) } })
      : [];

    const teamById = new Map(teams.map((team) => [team.id, team]));

    return groups.map((group) => ({
      ...group,
      teams: groupTeams
        .filter((item) => item.groupId === group.id)
        .map((item) => teamById.get(item.teamId))
        .filter((team): team is TeamEntity => Boolean(team)),
    }));
  }

  async listMatches(
    championshipId: string,
    filters: {
      stageType?: MatchStageType;
      matchday?: number;
      roundName?: string;
    },
  ): Promise<MatchEntity[]> {
    await this.findOne(championshipId);

    if (filters.matchday !== undefined && (!Number.isFinite(filters.matchday) || filters.matchday < 1)) {
      throw new BadRequestException('matchday must be a positive number');
    }

    const query = this.matchRepository
      .createQueryBuilder('match')
      .where('match.championship_id = :championshipId', { championshipId });

    if (filters.stageType) {
      query.andWhere('match.stage_type = :stageType', { stageType: filters.stageType });
    }
    if (filters.matchday !== undefined) {
      query.andWhere('match.matchday = :matchday', { matchday: filters.matchday });
    }
    if (filters.roundName) {
      query.andWhere('match.round_name = :roundName', { roundName: filters.roundName });
    }

    return query
      .orderBy('match.stage_type', 'ASC')
      .addOrderBy('match.round_name', 'ASC')
      .addOrderBy('match.matchday', 'ASC')
      .addOrderBy('match.created_at', 'ASC')
      .getMany();
  }

  async updateMatchResult(
    matchId: string,
    payload: MatchResultDto,
    ownerId: string,
  ): Promise<MatchEntity> {
    const match = await this.matchRepository.findOne({ where: { id: matchId } });
    if (!match) {
      throw new NotFoundException(`Match ${matchId} not found`);
    }

    await this.requireOwned(match.championshipId, ownerId);

    match.homeGoals = payload.homeGoals;
    match.awayGoals = payload.awayGoals;
    match.status = 'played';

    const updated = await this.matchRepository.save(match);

    if (updated.stageType === 'group' && updated.groupId) {
      await this.recalculateStandings(updated.championshipId, updated.groupId);
    }

    return updated;
  }

  async getGroupStandings(championshipId: string, groupId: string): Promise<StandingEntity[]> {
    await this.requireGroup(championshipId, groupId);
    return this.standingRepository.find({
      where: { championshipId, groupId },
      order: { position: 'ASC' },
    });
  }

  async generateKnockout(championshipId: string) {
    const championship = await this.findOne(championshipId);
    const groupMatches = await this.matchRepository.find({
      where: { championshipId, stageType: 'group' },
    });
    if (groupMatches.length === 0) {
      throw new ConflictException('Generate group fixtures before knockout');
    }

    const pending = groupMatches.some((match) => match.status !== 'played');
    if (pending) {
      throw new UnprocessableEntityException({
        message: 'Cannot generate knockout while group matches are pending',
      });
    }

    const existingKnockout = await this.matchRepository.count({
      where: { championshipId, stageType: 'knockout' },
    });
    if (existingKnockout > 0) {
      throw new ConflictException('Knockout bracket already generated');
    }

    const groups = await this.groupRepository.find({
      where: { championshipId },
      order: { name: 'ASC' },
    });

    const rankingsByGroup = new Map<string, StandingEntity[]>();
    for (const group of groups) {
      await this.recalculateStandings(championshipId, group.id);
      const standings = await this.getGroupStandings(championshipId, group.id);
      if (standings.length < 2) {
        throw new UnprocessableEntityException(
          `Group ${group.name} does not have enough standings data`,
        );
      }
      rankingsByGroup.set(group.name, standings);
    }

    const pairings = [
      ['A', 'B'],
      ['C', 'D'],
      ['E', 'F'],
      ['G', 'H'],
    ];

    const knockoutMatches: MatchEntity[] = [];
    for (const [left, right] of pairings) {
      const leftRankings = rankingsByGroup.get(left);
      const rightRankings = rankingsByGroup.get(right);
      if (!leftRankings || !rightRankings) {
        throw new UnprocessableEntityException('Missing groups for knockout generation');
      }

      knockoutMatches.push(
        this.matchRepository.create({
          championshipId,
          stageType: 'knockout',
          roundName: 'round-of-16',
          groupId: null,
          matchday: null,
          homeTeamId: leftRankings[0].teamId,
          awayTeamId: rightRankings[1].teamId,
          homeGoals: null,
          awayGoals: null,
          status: 'scheduled',
        }),
      );
      knockoutMatches.push(
        this.matchRepository.create({
          championshipId,
          stageType: 'knockout',
          roundName: 'round-of-16',
          groupId: null,
          matchday: null,
          homeTeamId: rightRankings[0].teamId,
          awayTeamId: leftRankings[1].teamId,
          homeGoals: null,
          awayGoals: null,
          status: 'scheduled',
        }),
      );
    }

    const saved = await this.matchRepository.save(knockoutMatches);
    championship.status = 'in-progress';
    await this.championshipRepository.save(championship);

    return { createdMatches: saved.length, round: 'round-of-16' };
  }

  async getKnockoutBracket(championshipId: string) {
    await this.findOne(championshipId);
    const matches = await this.matchRepository.find({
      where: { championshipId, stageType: 'knockout' },
      order: { roundName: 'ASC', createdAt: 'ASC' },
    });

    const grouped: Record<string, MatchEntity[]> = {};
    for (const match of matches) {
      const round = match.roundName ?? 'unknown-round';
      grouped[round] ??= [];
      grouped[round].push(match);
    }

    return grouped;
  }

  private async requireTeam(championshipId: string, teamId: string): Promise<TeamEntity> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId, championshipId },
    });
    if (!team) {
      throw new NotFoundException(`Team ${teamId} not found`);
    }
    return team;
  }

  private async requireGroup(championshipId: string, groupId: string): Promise<GroupEntity> {
    const group = await this.groupRepository.findOne({
      where: { id: groupId, championshipId },
    });
    if (!group) {
      throw new NotFoundException(`Group ${groupId} not found`);
    }
    return group;
  }

  private ensureRegistrationOpen(championship: ChampionshipEntity): void {
    if (championship.status !== 'draft') {
      throw new ConflictException(
        `Operation only allowed while championship is in draft status. Current: ${championship.status}`,
      );
    }
  }

  private seededRandom(seedInput: string): () => number {
    let h = 2166136261;
    for (let i = 0; i < seedInput.length; i += 1) {
      h ^= seedInput.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }

    let state = h >>> 0;
    return () => {
      state += 0x6d2b79f5;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  private async recalculateStandings(
    championshipId: string,
    groupId: string,
  ): Promise<void> {
    const groupTeams = await this.groupTeamRepository.find({
      where: { championshipId, groupId },
    });
    const teams = await this.teamRepository.find({
      where: { id: In(groupTeams.map((item) => item.teamId)) },
    });

    const stats = new Map(
      groupTeams.map((item) => [
        item.teamId,
        {
          teamId: item.teamId,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        },
      ]),
    );

    const matches = await this.matchRepository.find({
      where: {
        championshipId,
        groupId,
        stageType: 'group',
        status: 'played',
      },
    });

    for (const match of matches) {
      if (match.homeGoals === null || match.awayGoals === null) {
        continue;
      }

      const home = stats.get(match.homeTeamId);
      const away = stats.get(match.awayTeamId);
      if (!home || !away) {
        continue;
      }

      home.played += 1;
      away.played += 1;
      home.goalsFor += match.homeGoals;
      home.goalsAgainst += match.awayGoals;
      away.goalsFor += match.awayGoals;
      away.goalsAgainst += match.homeGoals;

      if (match.homeGoals > match.awayGoals) {
        home.won += 1;
        home.points += 3;
        away.lost += 1;
      } else if (match.homeGoals < match.awayGoals) {
        away.won += 1;
        away.points += 3;
        home.lost += 1;
      } else {
        home.drawn += 1;
        away.drawn += 1;
        home.points += 1;
        away.points += 1;
      }
    }

    for (const value of stats.values()) {
      value.goalDifference = value.goalsFor - value.goalsAgainst;
    }

    const teamNames = new Map(teams.map((team) => [team.id, team.name]));
    const sorted = [...stats.values()].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }
      return (teamNames.get(a.teamId) ?? '').localeCompare(teamNames.get(b.teamId) ?? '');
    });

    await this.standingRepository.delete({ championshipId, groupId });
    await this.standingRepository.save(
      sorted.map((item, index) =>
        this.standingRepository.create({
          championshipId,
          groupId,
          teamId: item.teamId,
          played: item.played,
          won: item.won,
          drawn: item.drawn,
          lost: item.lost,
          goalsFor: item.goalsFor,
          goalsAgainst: item.goalsAgainst,
          goalDifference: item.goalDifference,
          points: item.points,
          position: index + 1,
        }),
      ),
    );
  }
}
