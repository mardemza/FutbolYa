import { ConflictException, UnprocessableEntityException } from '@nestjs/common';
import { ChampionshipService } from './championship.service';

const createRepositoryMock = () => ({
  create: jest.fn((value) => value),
  save: jest.fn(async (value) => value),
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(async () => 0),
  delete: jest.fn(async () => ({ affected: 1 })),
  createQueryBuilder: jest.fn(),
});

describe('ChampionshipService', () => {
  it('should reject registration close when team capacity is incomplete', async () => {
    const championshipRepository = createRepositoryMock();
    const teamRepository = createRepositoryMock();
    const playerRepository = createRepositoryMock();
    const groupRepository = createRepositoryMock();
    const groupTeamRepository = createRepositoryMock();
    const matchRepository = createRepositoryMock();
    const standingRepository = createRepositoryMock();

    championshipRepository.findOne.mockResolvedValue({
      id: '8f5f1f76-7f84-4ad0-a224-2e98a5af0c12',
      status: 'draft',
      maxTeams: 32,
      registeredTeams: 10,
    });

    const service = new ChampionshipService(
      championshipRepository as never,
      teamRepository as never,
      playerRepository as never,
      groupRepository as never,
      groupTeamRepository as never,
      matchRepository as never,
      standingRepository as never,
    );

    await expect(
      service.closeRegistration('8f5f1f76-7f84-4ad0-a224-2e98a5af0c12'),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });

  it('should increment registered teams when creating a new team', async () => {
    const championshipRepository = createRepositoryMock();
    const teamRepository = createRepositoryMock();
    const playerRepository = createRepositoryMock();
    const groupRepository = createRepositoryMock();
    const groupTeamRepository = createRepositoryMock();
    const matchRepository = createRepositoryMock();
    const standingRepository = createRepositoryMock();

    const championship = {
      id: '65e0d1f3-4e3b-4ca2-8c06-ec1574c89e42',
      status: 'draft',
      maxTeams: 32,
      registeredTeams: 0,
    };

    championshipRepository.findOne.mockResolvedValue(championship);
    teamRepository.findOne.mockResolvedValue(null);
    teamRepository.save.mockImplementation(async (value) => ({
      id: 'b6f9484e-7754-4c71-b4bd-f6f956f3c244',
      ...value,
    }));

    const service = new ChampionshipService(
      championshipRepository as never,
      teamRepository as never,
      playerRepository as never,
      groupRepository as never,
      groupTeamRepository as never,
      matchRepository as never,
      standingRepository as never,
    );

    const created = await service.createTeam(championship.id, {
      name: 'Team 1',
      shortName: 'T1',
    });

    expect(created.name).toBe('Team 1');
    expect(championship.registeredTeams).toBe(1);
    expect(championshipRepository.save).toHaveBeenCalledWith(championship);
  });

  it('should create 48 group matches and 32 standings for a valid draw', async () => {
    const championshipRepository = createRepositoryMock();
    const teamRepository = createRepositoryMock();
    const playerRepository = createRepositoryMock();
    const groupRepository = createRepositoryMock();
    const groupTeamRepository = createRepositoryMock();
    const matchRepository = createRepositoryMock();
    const standingRepository = createRepositoryMock();

    const championshipId = '95ba9bf9-f02c-47ea-8d0d-72dbe791e5e8';
    championshipRepository.findOne.mockResolvedValue({
      id: championshipId,
      status: 'drawn',
      maxTeams: 32,
      registeredTeams: 32,
    });

    groupRepository.find.mockResolvedValue(
      ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((name, index) => ({
        id: `group-${index}`,
        championshipId,
        name,
      })),
    );

    groupTeamRepository.find.mockResolvedValue(
      Array.from({ length: 32 }).map((_, index) => ({
        groupId: `group-${index % 8}`,
        teamId: `team-${index}`,
        championshipId,
      })),
    );

    const service = new ChampionshipService(
      championshipRepository as never,
      teamRepository as never,
      playerRepository as never,
      groupRepository as never,
      groupTeamRepository as never,
      matchRepository as never,
      standingRepository as never,
    );

    const result = await service.generateGroupFixtures(championshipId);

    expect(result.createdMatches).toBe(48);
    expect(matchRepository.save).toHaveBeenCalled();
    expect(standingRepository.save).toHaveBeenCalled();
    const savedMatches = matchRepository.save.mock.calls[0][0];
    const savedStandings = standingRepository.save.mock.calls[0][0];
    expect(savedMatches).toHaveLength(48);
    expect(savedStandings).toHaveLength(32);
  });

  it('should reject fixture generation if it already exists', async () => {
    const championshipRepository = createRepositoryMock();
    const teamRepository = createRepositoryMock();
    const playerRepository = createRepositoryMock();
    const groupRepository = createRepositoryMock();
    const groupTeamRepository = createRepositoryMock();
    const matchRepository = createRepositoryMock();
    const standingRepository = createRepositoryMock();

    const championshipId = '9338be95-e78e-46e5-a664-cb46dbde46d2';
    championshipRepository.findOne.mockResolvedValue({
      id: championshipId,
      status: 'drawn',
      maxTeams: 32,
      registeredTeams: 32,
    });
    matchRepository.count.mockResolvedValue(1);

    const service = new ChampionshipService(
      championshipRepository as never,
      teamRepository as never,
      playerRepository as never,
      groupRepository as never,
      groupTeamRepository as never,
      matchRepository as never,
      standingRepository as never,
    );

    await expect(service.generateGroupFixtures(championshipId)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
