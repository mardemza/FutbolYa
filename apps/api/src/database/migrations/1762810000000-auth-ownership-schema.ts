import { MigrationInterface, QueryRunner } from 'typeorm';

export class AuthOwnershipSchema1762810000000 implements MigrationInterface {
  name = 'AuthOwnershipSchema1762810000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "display_name" varchar(120)',
    );
    await queryRunner.query(
      'ALTER TABLE "championships" ADD COLUMN IF NOT EXISTS "owner_id" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_championships_owner_id" ON "championships" ("owner_id")',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_championships_owner_id"');
    await queryRunner.query(
      'ALTER TABLE "championships" DROP COLUMN IF EXISTS "owner_id"',
    );
    await queryRunner.query(
      'ALTER TABLE "users" DROP COLUMN IF EXISTS "display_name"',
    );
  }
}
