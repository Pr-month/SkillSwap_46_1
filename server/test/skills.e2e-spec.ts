import { AppModule } from '@/app.module';
import { Category } from '@/categories/entities/category.entity';
import { City } from '@/cities/entities/city.entity';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { Skill } from '@/skills/entities/skills.entity';
import { User } from '@/users/entities/user.entity';
import { UserGender, UserRole } from '@/users/enums/user.enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import cookieParser = require('cookie-parser');

describe('Skills (e2e)', () => {
  let app: INestApplication;

  let cityRepository: Repository<City>;
  let categoryRepository: Repository<Category>;
  let userRepository: Repository<User>;
  let skillRepository: Repository<Skill>;

  let cityId: string;
  let categoryId: string;
  let ownerId: string;
  let anotherUserId: string;
  let skillId: string;

  let ownerCookie: string;
  let anotherUserCookie: string;

  const runId = Date.now();
  const ownerEmail = `skills-owner-${runId}@example.com`;
  const anotherUserEmail = `skills-another-${runId}@example.com`;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    const dataSource = app.get(DataSource);

    cityRepository = dataSource.getRepository(City);
    categoryRepository = dataSource.getRepository(Category);
    userRepository = dataSource.getRepository(User);
    skillRepository = dataSource.getRepository(Skill);

    const city = await cityRepository.save(
      cityRepository.create({
        name: `E2E City ${runId}`,
        district: 'E2E District',
        subject: `E2E Subject ${runId}`,
        population: 100000,
        lat: 55.7558,
        lon: 37.6173,
      }),
    );
    cityId = city.id;

    const category = await categoryRepository.save(
      categoryRepository.create({
        name: `E2E Category ${runId}`,
      }),
    );
    categoryId = category.id;

    const owner = await userRepository.save(
      userRepository.create({
        email: ownerEmail,
        password: 'not-used-in-skills-e2e',
        name: 'Skills Owner',
        about: null,
        birthdate: new Date('1990-01-01'),
        cityId,
        gender: UserGender.MALE,
        avatar: null,
        role: UserRole.USER,
        refreshToken: null,
      }),
    );
    ownerId = owner.id;

    const anotherUser = await userRepository.save(
      userRepository.create({
        email: anotherUserEmail,
        password: 'not-used-in-skills-e2e',
        name: 'Another User',
        about: null,
        birthdate: new Date('1991-01-01'),
        cityId,
        gender: UserGender.FEMALE,
        avatar: null,
        role: UserRole.USER,
        refreshToken: null,
      }),
    );
    anotherUserId = anotherUser.id;

    const configurationService = app.get(ConfigurationService);

    const jwtService = new JwtService({
      secret: configurationService.jwtAccessSecret,
    });

    ownerCookie = createAccessCookie(jwtService, owner);
    anotherUserCookie = createAccessCookie(jwtService, anotherUser);
  });

  afterAll(async () => {
    if (!app) {
      return;
    }

    if (skillId) {
      await skillRepository.delete(skillId);
    }

    if (ownerId || anotherUserId) {
      const userIds = [ownerId, anotherUserId].filter(Boolean);
      await userRepository.delete(userIds);
    }

    if (categoryId) {
      await categoryRepository.delete(categoryId);
    }

    if (cityId) {
      await cityRepository.delete(cityId);
    }

    await app.close();
  });

  describe('POST /skills', () => {
    it('отклоняет создание навыка без авторизации', () => {
      return request(app.getHttpServer())
        .post('/skills')
        .send({
          title: 'TypeScript',
          description: 'Научу основам TypeScript и типизации',
          categoryId,
        })
        .expect(401);
    });

    it('возвращает 400 для невалидных данных', () => {
      return request(app.getHttpServer())
        .post('/skills')
        .set('Cookie', [ownerCookie])
        .send({
          title: 'T',
          description: 'Коротко',
          categoryId,
        })
        .expect(400);
    });

    it('создаёт навык текущего пользователя', () => {
      return request(app.getHttpServer())
        .post('/skills')
        .set('Cookie', [ownerCookie])
        .send({
          title: 'TypeScript',
          description: 'Научу основам TypeScript и типизации',
          categoryId,
          images: ['https://example.com/typescript.jpg'],
        })
        .expect(201)
        .expect((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.title).toBe('TypeScript');
          expect(response.body.description).toBe(
            'Научу основам TypeScript и типизации',
          );
          expect(response.body.categoryId).toBe(categoryId);
          expect(response.body.ownerId).toBe(ownerId);
          expect(response.body.images).toEqual([
            'https://example.com/typescript.jpg',
          ]);

          skillId = response.body.id;
        });
    });
  });

  describe('GET /skills', () => {
    it('возвращает список навыков с пагинацией и поиском', () => {
      return request(app.getHttpServer())
        .get('/skills')
        .query({
          page: 1,
          limit: 10,
          search: 'typescript',
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.page).toBe(1);
          expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
          expect(Array.isArray(response.body.data)).toBe(true);

          const createdSkill = response.body.data.find(
            (skill: { id: string }) => skill.id === skillId,
          );

          expect(createdSkill).toBeDefined();
          expect(createdSkill.title).toBe('TypeScript');
          expect(createdSkill.owner.id).toBe(ownerId);
        });
    });
  });

  describe('GET /skills/:id', () => {
    it('отклоняет запрос одного навыка без авторизации', () => {
      return request(app.getHttpServer()).get(`/skills/${skillId}`).expect(401);
    });

    it('возвращает навык по идентификатору', () => {
      return request(app.getHttpServer())
        .get(`/skills/${skillId}`)
        .set('Cookie', [ownerCookie])
        .expect(200)
        .expect((response) => {
          expect(response.body.id).toBe(skillId);
          expect(response.body.title).toBe('TypeScript');
          expect(response.body.category.id).toBe(categoryId);
          expect(response.body.owner.id).toBe(ownerId);
          expect(response.body.owner).not.toHaveProperty('password');
          expect(response.body.owner).not.toHaveProperty('refreshToken');
        });
    });

    it('возвращает 400 для невалидного идентификатора', () => {
      return request(app.getHttpServer())
        .get('/skills/not-a-uuid')
        .set('Cookie', [ownerCookie])
        .expect(400);
    });

    it('возвращает 404 для несуществующего навыка', () => {
      return request(app.getHttpServer())
        .get('/skills/11111111-1111-4111-8111-111111111111')
        .set('Cookie', [ownerCookie])
        .expect(404);
    });
  });

  describe('PATCH /skills/:id', () => {
    it('отклоняет обновление без авторизации', () => {
      return request(app.getHttpServer())
        .patch(`/skills/${skillId}`)
        .send({
          title: 'Продвинутый TypeScript',
        })
        .expect(401);
    });

    it('запрещает другому пользователю изменять навык', () => {
      return request(app.getHttpServer())
        .patch(`/skills/${skillId}`)
        .set('Cookie', [anotherUserCookie])
        .send({
          title: 'Чужое название',
        })
        .expect(403);
    });

    it('позволяет владельцу обновить навык', () => {
      return request(app.getHttpServer())
        .patch(`/skills/${skillId}`)
        .set('Cookie', [ownerCookie])
        .send({
          title: 'Продвинутый TypeScript',
          description: 'Научу продвинутым возможностям TypeScript',
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.id).toBe(skillId);
          expect(response.body.title).toBe('Продвинутый TypeScript');
          expect(response.body.description).toBe(
            'Научу продвинутым возможностям TypeScript',
          );
          expect(response.body.ownerId).toBe(ownerId);
        });
    });
  });

  describe('DELETE /skills/:id', () => {
    it('отклоняет удаление без авторизации', () => {
      return request(app.getHttpServer())
        .delete(`/skills/${skillId}`)
        .expect(401);
    });

    it('запрещает другому пользователю удалять навык', () => {
      return request(app.getHttpServer())
        .delete(`/skills/${skillId}`)
        .set('Cookie', [anotherUserCookie])
        .expect(403);
    });

    it('позволяет владельцу удалить навык', () => {
      return request(app.getHttpServer())
        .delete(`/skills/${skillId}`)
        .set('Cookie', [ownerCookie])
        .expect(204);
    });

    it('возвращает 404 после удаления навыка', () => {
      return request(app.getHttpServer())
        .get(`/skills/${skillId}`)
        .set('Cookie', [ownerCookie])
        .expect(404);
    });
  });

  function createAccessCookie(jwtService: JwtService, user: User): string {
    const accessToken = jwtService.sign({
      sub: user.id,
      email: user.email,
      tokenType: 'access',
    });

    return `accessToken=${accessToken}`;
  }
});
