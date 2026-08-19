import { AppModule } from '@/app.module';
import { Category } from '@/categories/entities/category.entity';
import { City } from '@/cities/entities/city.entity';
import { Favorite } from '@/skills/entities/favorite.entity';
import { Skill } from '@/skills/entities/skills.entity';
import { User } from '@/users/entities/user.entity';
import { UserGender } from '@/users/enums/user.enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';

import cookieParser = require('cookie-parser');

describe('Favorites (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let userId: string;
  let cityId: string;
  let categoryId: string;
  let skillAId: string;
  let skillBId: string;
  let skillCId: string;

  let cityRepository: Repository<City>;
  let categoryRepository: Repository<Category>;
  let skillRepository: Repository<Skill>;
  let favoriteRepository: Repository<Favorite>;
  let userRepository: Repository<User>;

  const email = `favorites-e2e-${Date.now()}@example.com`;
  const password = 'password123';
  const nonExistentSkillId = '11111111-1111-4111-8111-111111111111';

  const authCookie = () => `accessToken=${accessToken}`;

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

    cityRepository = app.get(getRepositoryToken(City));
    categoryRepository = app.get(getRepositoryToken(Category));
    skillRepository = app.get(getRepositoryToken(Skill));
    favoriteRepository = app.get(getRepositoryToken(Favorite));
    userRepository = app.get(getRepositoryToken(User));

    const city = await cityRepository.save(
      cityRepository.create({
        name: 'Москва',
        district: 'Центральный',
        subject: 'Москва',
        population: 12678079,
        lat: 55.7558,
        lon: 37.6173,
      }),
    );
    cityId = city.id;

    const category = await categoryRepository.save(
      categoryRepository.create({ name: `E2E-категория-${Date.now()}` }),
    );
    categoryId = category.id;

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password,
        name: 'Favorites E2E User',
        birthdate: '1990-01-01',
        gender: UserGender.MALE,
        cityId,
        avatar: 'https://example.com/avatar.jpg',
      })
      .expect(201)
      .expect((res) => {
        userId = res.body.id;
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        const cookies = res.headers['set-cookie'];
        const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];
        const accessTokenCookie = cookiesArray.find((c: string) =>
          c.startsWith('accessToken='),
        );
        if (accessTokenCookie) {
          accessToken = accessTokenCookie.split(';')[0].split('=')[1];
        }
      });

    const createSkill = async (title: string): Promise<string> => {
      let createdId = '';
      await request(app.getHttpServer())
        .post('/skills')
        .set('Cookie', [authCookie()])
        .send({
          title,
          description: 'Научу этому навыку с нуля за несколько занятий',
          categoryId,
        })
        .expect(201)
        .expect((res) => {
          createdId = res.body.id;
        });
      return createdId;
    };

    skillAId = await createSkill('E2E Skill A');
    skillBId = await createSkill('E2E Skill B');
    skillCId = await createSkill('E2E Skill C');
  });

  afterAll(async () => {
    if (app) {
      if (userId) {
        await favoriteRepository.delete({ userId }).catch(() => undefined);
        await skillRepository
          .delete({ ownerId: userId })
          .catch(() => undefined);
        await userRepository.delete(userId).catch(() => undefined);
      }
      if (categoryId) {
        await categoryRepository.delete(categoryId).catch(() => undefined);
      }
      if (cityId) {
        await cityRepository.delete(cityId).catch(() => undefined);
      }
      await app.close();
    }
  });

  describe('аутентификация', () => {
    it('GET /favorites без токена -> 401', () => {
      return request(app.getHttpServer()).get('/favorites').expect(401);
    });

    it('POST /skills/:id/favorite без токена -> 401', () => {
      return request(app.getHttpServer())
        .post(`/skills/${skillAId}/favorite`)
        .expect(401);
    });

    it('DELETE /skills/:id/favorite без токена -> 401', () => {
      return request(app.getHttpServer())
        .delete(`/skills/${skillAId}/favorite`)
        .expect(401);
    });

    it('GET /favorites/:id/check без токена -> 401', () => {
      return request(app.getHttpServer())
        .get(`/favorites/${skillAId}/check`)
        .expect(401);
    });
  });

  describe('GET /favorites/:id/check (проверка наличия в избранном)', () => {
    it('возвращает false для навыка, которого нет в избранном', () => {
      return request(app.getHttpServer())
        .get(`/favorites/${skillCId}/check`)
        .set('Cookie', [authCookie()])
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ isFavorite: false });
        });
    });

    it('возвращает 400 для невалидного id', () => {
      return request(app.getHttpServer())
        .get('/favorites/not-a-uuid/check')
        .set('Cookie', [authCookie()])
        .expect(400);
    });
  });

  describe('POST /skills/:id/favorite (добавление в избранное)', () => {
    it('добавляет навык в избранное', () => {
      return request(app.getHttpServer())
        .post(`/skills/${skillAId}/favorite`)
        .set('Cookie', [authCookie()])
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe(userId);
          expect(res.body.skillId).toBe(skillAId);
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body.skill.id).toBe(skillAId);
          expect(res.body.skill.title).toBe('E2E Skill A');
        });
    });

    it('возвращает true после добавления в избранное', () => {
      return request(app.getHttpServer())
        .get(`/favorites/${skillAId}/check`)
        .set('Cookie', [authCookie()])
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ isFavorite: true });
        });
    });

    it('возвращает 409 при повторном добавлении', () => {
      return request(app.getHttpServer())
        .post(`/skills/${skillAId}/favorite`)
        .set('Cookie', [authCookie()])
        .expect(409)
        .expect((res) => {
          expect(res.body.code).toBe('favorite:already-exists');
        });
    });

    it('возвращает 404 для несуществующего навыка', () => {
      return request(app.getHttpServer())
        .post(`/skills/${nonExistentSkillId}/favorite`)
        .set('Cookie', [authCookie()])
        .expect(404)
        .expect((res) => {
          expect(res.body.code).toBe('skill:not-found');
        });
    });

    it('возвращает 400 для невалидного id навыка', () => {
      return request(app.getHttpServer())
        .post('/skills/not-a-uuid/favorite')
        .set('Cookie', [authCookie()])
        .expect(400);
    });
  });

  describe('GET /favorites (список избранного)', () => {
    it('добавляет второй навык в избранное', () => {
      return request(app.getHttpServer())
        .post(`/skills/${skillBId}/favorite`)
        .set('Cookie', [authCookie()])
        .expect(201)
        .expect((res) => {
          expect(res.body.skillId).toBe(skillBId);
        });
    });

    it('возвращает оба избранных навыка', () => {
      return request(app.getHttpServer())
        .get('/favorites')
        .set('Cookie', [authCookie()])
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const skillIds = res.body.map((f: { skillId: string }) => f.skillId);
          expect(skillIds).toContain(skillAId);
          expect(skillIds).toContain(skillBId);
        });
    });
  });

  describe('DELETE /skills/:id/favorite (удаление из избранного)', () => {
    it('удаляет навык из избранного', () => {
      return request(app.getHttpServer())
        .delete(`/skills/${skillBId}/favorite`)
        .set('Cookie', [authCookie()])
        .expect(204);
    });

    it('возвращает false после удаления из избранного', () => {
      return request(app.getHttpServer())
        .get(`/favorites/${skillBId}/check`)
        .set('Cookie', [authCookie()])
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({ isFavorite: false });
        });
    });

    it('возвращает 404 при удалении несуществующего избранного', () => {
      return request(app.getHttpServer())
        .delete(`/skills/${skillBId}/favorite`)
        .set('Cookie', [authCookie()])
        .expect(404)
        .expect((res) => {
          expect(res.body.code).toBe('favorite:not-found');
        });
    });

    it('возвращает 400 для невалидного id навыка', () => {
      return request(app.getHttpServer())
        .delete('/skills/not-a-uuid/favorite')
        .set('Cookie', [authCookie()])
        .expect(400);
    });

    it('список после удаления содержит только оставшийся навык', () => {
      return request(app.getHttpServer())
        .get('/favorites')
        .set('Cookie', [authCookie()])
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          const skillIds = res.body.map((f: { skillId: string }) => f.skillId);
          expect(skillIds).toContain(skillAId);
          expect(skillIds).not.toContain(skillBId);
        });
    });
  });
});
