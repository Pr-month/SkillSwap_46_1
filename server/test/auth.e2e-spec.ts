import { AppModule } from '@/app.module';
import { City } from '@/cities/entities/city.entity';
import { UserGender } from '@/users/enums/user.enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';

import cookieParser = require('cookie-parser');

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let cityRepository: Repository<City>;
  let cityId: string;
  let userId: string;

  const testUser: {
  email: string;
  password: string;
  name: string;
  birthdate: string;
  gender: UserGender;
  avatar: string;
  cityId?: string;
} = {
  email: `e2e-test-${Date.now()}@example.com`,
  password: 'password123',
  name: 'E2E Test User',
  birthdate: '1990-01-01',
  gender: UserGender.MALE,
  avatar: 'https://example.com/avatar.jpg',
};

  const newPassword = 'newPassword123';

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

    const city = await cityRepository.save(
      cityRepository.create({
        name: `E2E-город-${Date.now()}`,
        district: 'Центральный',
        subject: 'Москва',
        population: 1000000,
        lat: 55.7558,
        lon: 37.6173,
      }),
    );

    cityId = city.id;

    testUser.cityId = cityId;
  });

  afterAll(async () => {
    if (app) {
      if (userId) {
        await cityRepository.manager
          .getRepository('users')
          .delete(userId)
          .catch(() => undefined);
      }

      if (cityId) {
        await cityRepository.delete(cityId).catch(() => undefined);
      }

      await app.close();
    }
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testUser.email);

          userId = res.body.id;
        });
    });

    it('should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');

          const cookies = res.headers['set-cookie'];
          const cookiesArray = Array.isArray(cookies) ? cookies : [cookies];

          const accessTokenCookie = cookiesArray.find((c: string) =>
            c.startsWith('accessToken='),
          );

          expect(accessTokenCookie).toBeDefined();

          if (accessTokenCookie) {
            accessToken = accessTokenCookie.split(';')[0].split('=')[1];
          }
        });
    });

    it('should fail with invalid password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should get profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });
  });

  describe('/auth/password (PATCH)', () => {
    it('should fail without token', () => {
      return request(app.getHttpServer())
        .patch('/auth/password')
        .send({
          currentPassword: testUser.password,
          newPassword,
        })
        .expect(401);
    });

    it('should fail with incorrect current password', () => {
      return request(app.getHttpServer())
        .patch('/auth/password')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({
          currentPassword: 'wrongpassword',
          newPassword,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.code).toBe('user:invalid-credentials');
        });
    });

    it('should keep old password after failed password change', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);
    });

    it('should update password with correct current password', () => {
      return request(app.getHttpServer())
        .patch('/auth/password')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({
          currentPassword: testUser.password,
          newPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            message: 'Пароль успешно обновлен',
          });
        });
    });

    it('should fail login with old password after password update', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);
    });

    it('should login with new password after password update', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Успешный выход');
        });
    });
  });
});
