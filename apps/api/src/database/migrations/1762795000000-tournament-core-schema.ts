import { MigrationInterface, QueryRunner } from 'typeorm';

export class TournamentCoreSchema1762795000000 implements MigrationInterface {
  name = 'TournamentCoreSchema1762795000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "teams" (
        "id" varchar PRIMARY KEY NOT NULL,
        "championship_id" varchar NOT NULL,
        "name" varchar(80) NOT NULL,
        "short_name" varchar(10),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_teams_championship_name" ON "teams" ("championship_id", "name")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "players" (
        "id" varchar PRIMARY KEY NOT NULL,
        "championship_id" varchar NOT NULL,
        "team_id" varchar NOT NULL,
        "first_name" varchar(80) NOT NULL,
        "last_name" varchar(80) NOT NULL,
        "shirt_number" integer NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_players_team_shirt" ON "players" ("team_id", "shirt_number")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "groups" (
        "id" varchar PRIMARY KEY NOT NULL,
        "championship_id" varchar NOT NULL,
        "name" varchar(16) NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_groups_championship_name" ON "groups" ("championship_id", "name")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "group_teams" (
        "id" varchar PRIMARY KEY NOT NULL,
        "championship_id" varchar NOT NULL,
        "group_id" varchar NOT NULL,
        "team_id" varchar NOT NULL,
        "created_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_group_teams_group_team" ON "group_teams" ("group_id", "team_id")',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_group_teams_championship_team" ON "group_teams" ("championship_id", "team_id")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "matches" (
        "id" varchar PRIMARY KEY NOT NULL,
        "championship_id" varchar NOT NULL,
        "stage_type" varchar(20) NOT NULL,
        "round_name" varchar(32),
        "group_id" varchar,
        "matchday" integer,
        "home_team_id" varchar NOT NULL,
        "away_team_id" varchar NOT NULL,
        "home_goals" integer,
        "away_goals" integer,
        "status" varchar(16) NOT NULL DEFAULT ('scheduled'),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_matches_championship_stage" ON "matches" ("championship_id", "stage_type")',
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "standings" (
        "id" varchar PRIMARY KEY NOT NULL,
        "championship_id" varchar NOT NULL,
        "group_id" varchar NOT NULL,
        "team_id" varchar NOT NULL,
        "played" integer NOT NULL DEFAULT (0),
        "won" integer NOT NULL DEFAULT (0),
        "drawn" integer NOT NULL DEFAULT (0),
        "lost" integer NOT NULL DEFAULT (0),
        "goals_for" integer NOT NULL DEFAULT (0),
        "goals_against" integer NOT NULL DEFAULT (0),
        "goal_difference" integer NOT NULL DEFAULT (0),
        "points" integer NOT NULL DEFAULT (0),
        "position" integer NOT NULL DEFAULT (0),
        "created_at" datetime NOT NULL DEFAULT (datetime('now')),
        "updated_at" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_standings_group_team" ON "standings" ("group_id", "team_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_standings_group_team"');
    await queryRunner.query('DROP TABLE IF EXISTS "standings"');

    await queryRunner.query('DROP INDEX IF EXISTS "IDX_matches_championship_stage"');
    await queryRunner.query('DROP TABLE IF EXISTS "matches"');

    await queryRunner.query('DROP INDEX IF EXISTS "UQ_group_teams_championship_team"');
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_group_teams_group_team"');
    await queryRunner.query('DROP TABLE IF EXISTS "group_teams"');

    await queryRunner.query('DROP INDEX IF EXISTS "UQ_groups_championship_name"');
    await queryRunner.query('DROP TABLE IF EXISTS "groups"');

    await queryRunner.query('DROP INDEX IF EXISTS "UQ_players_team_shirt"');
    await queryRunner.query('DROP TABLE IF EXISTS "players"');

    await queryRunner.query('DROP INDEX IF EXISTS "UQ_teams_championship_name"');
    await queryRunner.query('DROP TABLE IF EXISTS "teams"');
  }
}
