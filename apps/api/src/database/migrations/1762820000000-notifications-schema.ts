import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationsSchema1762820000000 implements MigrationInterface {
  name = 'NotificationsSchema1762820000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "recipient_id" uuid NOT NULL,
        "type" varchar(64) NOT NULL,
        "category" varchar(32) NOT NULL,
        "title" varchar(200) NOT NULL,
        "body" text NOT NULL,
        "championship_id" uuid,
        "entity_type" varchar(32),
        "entity_id" uuid,
        "deep_link" varchar(512) NOT NULL,
        "read_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_notifications_recipient_created" ON "notifications" ("recipient_id", "created_at" DESC)',
    );
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_notifications_recipient_unread"
      ON "notifications" ("recipient_id")
      WHERE "read_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_notifications_recipient_unread"');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_notifications_recipient_created"');
    await queryRunner.query('DROP TABLE IF EXISTS "notifications"');
  }
}
