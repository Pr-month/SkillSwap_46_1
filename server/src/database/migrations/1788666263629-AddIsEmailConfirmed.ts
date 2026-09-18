import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsEmailConfirmed1788666263629 implements MigrationInterface {
    name = 'AddIsEmailConfirmed1788666263629'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isEmailConfirmed" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isEmailConfirmed"`);
    }

}
