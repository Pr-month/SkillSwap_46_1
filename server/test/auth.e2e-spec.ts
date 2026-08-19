import { AppModule } from '@/app.module';
import { City } from '@/cities/entities/city.entity';
import { User } from '@/users/entities/user.entity';
import { UserGender } from '@/users/enums/user.enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Repository } from 'typeorm';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let cityRepository: Repository<City>;
  let userRepository: Repository<User>;

  const testUser = {
    email: 'e2e-test@example.com',
    password: 'password123',
    name: 'E2E Test User',
    birthdate: '1990-01-01',
    gender: UserGender.MALE,
    cityId: '',
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
    userRepository = app.get(getRepositoryToken(User));

    const city = await cityRepository.findOne({
      where: { name: 'Москва' },
    });

    if (!city) {
      throw new Error('Город Москва не найден. Запустите сидинг городов.');
    }

    testUser.cityId = city.id;

    // Удаляем тестового пользователя, если он остался от предыдущих запусков
    const existingUser = await userRepository.findOne({
      where: { email: testUser.email },
    });

    if (existingUser) {
      await userRepository.delete(existingUser.id);
    }
  });

  afterAll(async () => {
    if (app) {
      // Удаляем тестового пользователя
      const user = await userRepository.findOne({
        where: { email: testUser.email },
      });

      if (user) {
        await userRepository.delete(user.id);
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
