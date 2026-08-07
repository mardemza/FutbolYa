import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1762700000000 implements MigrationInterface {
  name = 'InitialSchema1762700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
        "email" varchar(160) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS "UQ_users_email" ON "users" ("email")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "UQ_users_email"');
    await queryRunner.query('DROP TABLE IF EXISTS "users"');
  }
}
