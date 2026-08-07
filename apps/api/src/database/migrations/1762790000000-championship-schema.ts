import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChampionshipSchema1762790000000 implements MigrationInterface {
  name = 'ChampionshipSchema1762790000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "championships" (
        "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "season" varchar(20) NOT NULL,
        "start_date" varchar(10) NOT NULL,
        "status" varchar(30) NOT NULL DEFAULT 'draft',
        "max_teams" integer NOT NULL DEFAULT 32,
        "registered_teams" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "championships"');
  }
}
