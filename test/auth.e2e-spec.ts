import { AppModule } from '@/app.module';
import { UserGender } from '@/users/enums/user.enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let _userId: string;

  const testUser = {
    email: 'e2e-test@example.com',
    password: 'password123',
    name: 'E2E Test User',
    birthdate: '1990-01-01',
    gender: UserGender.MALE,
    cityId: '00000000-0000-0000-0000-000000000001',
    avatar: 'https://example.com/avatar.jpg',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    if (app) {
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
