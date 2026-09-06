import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1788665897964 implements MigrationInterface {
    name = 'Init1788665897964'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "subcategories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "UQ_subcategories_category_name" UNIQUE ("category_id", "name"), CONSTRAINT "PK_793ef34ad0a3f86f09d4837007c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f7b015bc580ae5179ba5a4f42e" ON "subcategories"  ("category_id") `);
        await queryRunner.query(`CREATE TABLE "city" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "district" character varying(255) NOT NULL, "subject" character varying(255) NOT NULL, "population" integer NOT NULL, "lat" numeric(9,6) NOT NULL, "lon" numeric(9,6) NOT NULL, CONSTRAINT "UQ_b5ececfee915c28b8cb24f35835" UNIQUE ("name", "subject"), CONSTRAINT "PK_b222f51ce26f7e5ca86944a6739" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favorites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "skillId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_694af1b196590ec1bdad8e3ea29" UNIQUE ("userId", "skillId"), CONSTRAINT "PK_890818d27523748dd36a4d1bdc8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6f94c3071b80a48d60344116ed" ON "favorites"  ("skillId") `);
        await queryRunner.query(`CREATE INDEX "IDX_e747534006c6e3c2f09939da60" ON "favorites"  ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."users_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "about" text, "birthdate" date NOT NULL, "cityId" uuid NOT NULL, "gender" "public"."users_gender_enum" NOT NULL, "avatar" character varying(1000), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "refreshToken" character varying(500), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "skill" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" character varying(1000) NOT NULL, "images" text array, "category_id" uuid NOT NULL, "subcategory_id" uuid, "owner_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a0d33334424e64fb78dc3ce7196" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3cb82aab7c71a84b8176f25bbe" ON "skill"  ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_fdf8ae7fb3f86fea8d62101e33" ON "skill"  ("subcategory_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f369fb57a606b2f49337c92ef6" ON "skill"  ("owner_id") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."requests_status_enum" AS ENUM('pending', 'accepted', 'rejected', 'inProgress', 'done')`);
        await queryRunner.query(`CREATE TABLE "requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "status" "public"."requests_status_enum" NOT NULL DEFAULT 'pending', "isRead" boolean NOT NULL DEFAULT false, "senderId" uuid NOT NULL, "receiverId" uuid NOT NULL, "offeredSkillId" uuid NOT NULL, "requestedSkillId" uuid NOT NULL, CONSTRAINT "PK_0428f484e96f9e6a55955f29b5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_requests_receiver_status" ON "requests"  ("receiverId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_requests_sender_status" ON "requests"  ("senderId", "status") `);
        await queryRunner.query(`CREATE INDEX "IDX_requests_status" ON "requests"  ("status") `);
        await queryRunner.query(`CREATE TABLE "user_want_to_learn" ("usersId" uuid NOT NULL, "categoriesId" uuid NOT NULL, CONSTRAINT "PK_7f8e891578656e94a169fe08414" PRIMARY KEY ("usersId", "categoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_1b8c098fb697181d9e21dc4ea8" ON "user_want_to_learn"  ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_677c17642737075d6fb9bf211b" ON "user_want_to_learn"  ("categoriesId") `);
        await queryRunner.query(`CREATE TABLE "user_want_to_learn_subcategories" ("usersId" uuid NOT NULL, "subcategoriesId" uuid NOT NULL, CONSTRAINT "PK_ac595eb39f713b3c2a4d8c69fa5" PRIMARY KEY ("usersId", "subcategoriesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fb23dbfaa4e0b923fea4716c9d" ON "user_want_to_learn_subcategories"  ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f2a815d7a4838f8bcda04cd0c8" ON "user_want_to_learn_subcategories"  ("subcategoriesId") `);
        await queryRunner.query(`CREATE TABLE "user_favorite_skills" ("usersId" uuid NOT NULL, "skillId" uuid NOT NULL, CONSTRAINT "PK_e5f1ad1c231fecad1853ee047d9" PRIMARY KEY ("usersId", "skillId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d2e23e68da61d35ff04faa5080" ON "user_favorite_skills"  ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_193b14967588833a967c8f5465" ON "user_favorite_skills"  ("skillId") `);
        await queryRunner.query(`ALTER TABLE "subcategories" ADD CONSTRAINT "FK_f7b015bc580ae5179ba5a4f42ec" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_e747534006c6e3c2f09939da60f" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorites" ADD CONSTRAINT "FK_6f94c3071b80a48d60344116ed1" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_3785318df310caf8cb8e1e37d85" FOREIGN KEY ("cityId") REFERENCES "city"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skill" ADD CONSTRAINT "FK_3cb82aab7c71a84b8176f25bbe0" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skill" ADD CONSTRAINT "FK_fdf8ae7fb3f86fea8d62101e332" FOREIGN KEY ("subcategory_id") REFERENCES "subcategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "skill" ADD CONSTRAINT "FK_f369fb57a606b2f49337c92ef67" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_670f44ad50fac2e635f4213fa9b" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_df2b65da9fe84c28e82f221bcd5" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_305aae1d71ec0c00921c91aeae8" FOREIGN KEY ("offeredSkillId") REFERENCES "skill"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "requests" ADD CONSTRAINT "FK_e7acd23bb9c360b83cb3bfecfa6" FOREIGN KEY ("requestedSkillId") REFERENCES "skill"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_want_to_learn" ADD CONSTRAINT "FK_1b8c098fb697181d9e21dc4ea8a" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_want_to_learn" ADD CONSTRAINT "FK_677c17642737075d6fb9bf211b7" FOREIGN KEY ("categoriesId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_want_to_learn_subcategories" ADD CONSTRAINT "FK_fb23dbfaa4e0b923fea4716c9d8" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_want_to_learn_subcategories" ADD CONSTRAINT "FK_f2a815d7a4838f8bcda04cd0c8a" FOREIGN KEY ("subcategoriesId") REFERENCES "subcategories"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_favorite_skills" ADD CONSTRAINT "FK_d2e23e68da61d35ff04faa50801" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_favorite_skills" ADD CONSTRAINT "FK_193b14967588833a967c8f54655" FOREIGN KEY ("skillId") REFERENCES "skill"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_favorite_skills" DROP CONSTRAINT "FK_193b14967588833a967c8f54655"`);
        await queryRunner.query(`ALTER TABLE "user_favorite_skills" DROP CONSTRAINT "FK_d2e23e68da61d35ff04faa50801"`);
        await queryRunner.query(`ALTER TABLE "user_want_to_learn_subcategories" DROP CONSTRAINT "FK_f2a815d7a4838f8bcda04cd0c8a"`);
        await queryRunner.query(`ALTER TABLE "user_want_to_learn_subcategories" DROP CONSTRAINT "FK_fb23dbfaa4e0b923fea4716c9d8"`);
        await queryRunner.query(`ALTER TABLE "user_want_to_learn" DROP CONSTRAINT "FK_677c17642737075d6fb9bf211b7"`);
        await queryRunner.query(`ALTER TABLE "user_want_to_learn" DROP CONSTRAINT "FK_1b8c098fb697181d9e21dc4ea8a"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_e7acd23bb9c360b83cb3bfecfa6"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_305aae1d71ec0c00921c91aeae8"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_df2b65da9fe84c28e82f221bcd5"`);
        await queryRunner.query(`ALTER TABLE "requests" DROP CONSTRAINT "FK_670f44ad50fac2e635f4213fa9b"`);
        await queryRunner.query(`ALTER TABLE "skill" DROP CONSTRAINT "FK_f369fb57a606b2f49337c92ef67"`);
        await queryRunner.query(`ALTER TABLE "skill" DROP CONSTRAINT "FK_fdf8ae7fb3f86fea8d62101e332"`);
        await queryRunner.query(`ALTER TABLE "skill" DROP CONSTRAINT "FK_3cb82aab7c71a84b8176f25bbe0"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_3785318df310caf8cb8e1e37d85"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_6f94c3071b80a48d60344116ed1"`);
        await queryRunner.query(`ALTER TABLE "favorites" DROP CONSTRAINT "FK_e747534006c6e3c2f09939da60f"`);
        await queryRunner.query(`ALTER TABLE "subcategories" DROP CONSTRAINT "FK_f7b015bc580ae5179ba5a4f42ec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_193b14967588833a967c8f5465"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d2e23e68da61d35ff04faa5080"`);
        await queryRunner.query(`DROP TABLE "user_favorite_skills"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f2a815d7a4838f8bcda04cd0c8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb23dbfaa4e0b923fea4716c9d"`);
        await queryRunner.query(`DROP TABLE "user_want_to_learn_subcategories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_677c17642737075d6fb9bf211b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b8c098fb697181d9e21dc4ea8"`);
        await queryRunner.query(`DROP TABLE "user_want_to_learn"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_requests_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_requests_sender_status"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_requests_receiver_status"`);
        await queryRunner.query(`DROP TABLE "requests"`);
        await queryRunner.query(`DROP TYPE "public"."requests_status_enum"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f369fb57a606b2f49337c92ef6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fdf8ae7fb3f86fea8d62101e33"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3cb82aab7c71a84b8176f25bbe"`);
        await queryRunner.query(`DROP TABLE "skill"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_gender_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e747534006c6e3c2f09939da60"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6f94c3071b80a48d60344116ed"`);
        await queryRunner.query(`DROP TABLE "favorites"`);
        await queryRunner.query(`DROP TABLE "city"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f7b015bc580ae5179ba5a4f42e"`);
        await queryRunner.query(`DROP TABLE "subcategories"`);
    }

}
