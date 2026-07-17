import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { existsSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { AppModule } from './../src/app.module';
import { ApiErrorFilter } from '../src/shared/api-error.filter';

jest.setTimeout(60000);

describe('Championship Flow (e2e)', () => {
  let app: INestApplication<App>;
  const testDbPath = resolve(__dirname, '../data/test-e2e.sqlite');

  beforeAll(async () => {
    process.env.DATABASE_PATH = testDbPath;
    if (existsSync(testDbPath)) {
      rmSync(testDbPath);
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new ApiErrorFilter());
    await app.init();
  });

  it('should run full championship lifecycle from creation to knockout generation', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect({ status: 'ok' });

    const createResponse = await request(app.getHttpServer())
      .post('/api/v1/championships')
      .send({
        name: 'Copa E2E',
        season: '2026',
        startDate: '2026-08-01',
      })
      .expect(201);

    const championshipId = createResponse.body.id as string;

    for (let i = 1; i <= 32; i += 1) {
      await request(app.getHttpServer())
        .post(`/api/v1/championships/${championshipId}/teams`)
        .send({ name: `Team ${i.toString().padStart(2, '0')}` })
        .expect(201);
    }

    await request(app.getHttpServer())
      .post(`/api/v1/championships/${championshipId}/close-registration`)
      .expect(201);

    const drawResponse = await request(app.getHttpServer())
      .post(`/api/v1/championships/${championshipId}/draw`)
      .send({ seed: 'e2e-seed' })
      .expect(201);

    expect(drawResponse.body).toHaveLength(8);

    const fixtureResponse = await request(app.getHttpServer())
      .post(`/api/v1/championships/${championshipId}/fixtures`)
      .expect(201);

    expect(fixtureResponse.body.createdMatches).toBe(48);

    const matchesResponse = await request(app.getHttpServer())
      .get(`/api/v1/championships/${championshipId}/matches?stageType=group`)
      .expect(200);

    expect(matchesResponse.body).toHaveLength(48);

    for (const match of matchesResponse.body) {
      await request(app.getHttpServer())
        .put(`/api/v1/matches/${match.id}/result`)
        .send({ homeGoals: 1, awayGoals: 0 })
        .expect(200);
    }

    const groupsResponse = await request(app.getHttpServer())
      .get(`/api/v1/championships/${championshipId}/groups`)
      .expect(200);

    const firstGroup = groupsResponse.body[0];
    const standingsResponse = await request(app.getHttpServer())
      .get(
        `/api/v1/championships/${championshipId}/groups/${firstGroup.id}/standings`,
      )
      .expect(200);
    expect(standingsResponse.body).toHaveLength(4);

    const knockoutResponse = await request(app.getHttpServer())
      .post(`/api/v1/championships/${championshipId}/stages/knockout/generate`)
      .expect(201);

    expect(knockoutResponse.body.createdMatches).toBe(8);

    const bracketResponse = await request(app.getHttpServer())
      .get(`/api/v1/championships/${championshipId}/stages/knockout/bracket`)
      .expect(200);

    expect(bracketResponse.body['round-of-16']).toHaveLength(8);
  });

  afterAll(async () => {
    await app.close();
    if (existsSync(testDbPath)) {
      rmSync(testDbPath);
    }
  });
});
