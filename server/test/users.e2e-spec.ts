import { City } from '@/cities/entities/city.entity';
import { exceptionCodes, exceptionMessages } from '@/common/errors/error-codes';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { User } from '@/users/entities/user.entity';
import { UserGender } from '@/users/enums/user.enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { DataSource } from 'typeorm';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let httpServer: ReturnType<INestApplication['getHttpServer']>;
  let dataSource: DataSource;
  let accessToken: string;
  let userId: string;
  let cityId: string;

  const unique = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const password = 'password123';
  const newPassword = 'newPassword123';
  const authCookie = () => `accessToken=${accessToken}`;

  const testUser = {
    email: `e2e-users-${unique}@example.com`,
    password,
    name: 'E2E Users Test',
    birthdate: '1990-01-01',
    gender: UserGender.FEMALE,
    avatar: 'https://example.com/avatar.jpg',
    about: 'About e2e user',
  };

  beforeAll(async () => {
    process.env.HASH_SALT = '10';

    const { AppModule } = await import('@/app.module');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalFilters(new AllExceptionsFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    httpServer = app.getHttpServer();

    dataSource = app.get(DataSource);
    const cityRepository = dataSource.getRepository(City);
    const city = await cityRepository.save(
      cityRepository.create({
        name: `E2E Users City ${unique}`,
        district: 'Test',
        subject: `E2E Users Subject ${unique}`,
        population: 1,
        lat: 55.7558,
        lon: 37.6173,
      }),
    );
    cityId = city.id;

    const registerResponse = await request(httpServer)
      .post('/auth/register')
      .send({ ...testUser, cityId })
      .expect(201);

    userId = registerResponse.body.id;
    const token = getCookieValue(
      registerResponse.headers['set-cookie'],
      'accessToken',
    );

    if (!userId || !token) {
      throw new Error('регистрация не вернула id или accessToken');
    }

    accessToken = token;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      if (userId) {
        await dataSource.getRepository(User).delete(userId);
      }
      if (cityId) {
        await dataSource.getRepository(City).delete(cityId);
      }
    }

    if (app) {
      await app.close();
    }
  });

  describe('/users/me (GET)', () => {
    it('возвращает профиль текущего пользователя', () => {
      return request(httpServer)
        .get('/users/me')
        .set('Cookie', [authCookie()])
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            id: userId,
            email: testUser.email,
            name: testUser.name,
            gender: testUser.gender,
            about: testUser.about,
            avatar: testUser.avatar,
          });
          expect(typeof res.body.city).toBe('string');
          expect(res.body.city).toBeTruthy();
          expect(res.body).not.toHaveProperty('password');
          expect(res.body).not.toHaveProperty('refreshToken');
        });
    });

    it('возвращает 401 без токена', () => {
      return request(httpServer)
        .get('/users/me')
        .expect(401)
        .expect(expectUnauthorized);
    });
  });

  describe('/users/:id (GET)', () => {
    it('возвращает публичный профиль пользователя по id', () => {
      return request(httpServer)
        .get(`/users/${userId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(userId);
          expect(res.body.email).toBe(testUser.email);
          expect(res.body).not.toHaveProperty('password');
          expect(res.body).not.toHaveProperty('refreshToken');
        });
    });

    it('возвращает 404 для несуществующего пользователя', () => {
      return request(httpServer)
        .get('/users/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee')
        .expect(404)
        .expect((res) => {
          expect(res.body).toMatchObject({
            code: exceptionCodes.users.notFound,
            message: exceptionMessages[exceptionCodes.users.notFound],
          });
        });
    });

    it('возвращает 400 для невалидного uuid', () => {
      return request(httpServer)
        .get('/users/not-a-uuid')
        .expect(400)
        .expect(expectValidationError);
    });
  });

  describe('/users/search (POST)', () => {
    it('возвращает список пользователей с пагинацией по умолчанию', () => {
      return request(httpServer)
        .post('/users/search')
        .send({})
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.page).toBe(1);
          expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
        });
    });

    it('фильтрует по городу', () => {
      const cityName = `E2E Users City ${unique}`;

      return request(httpServer)
        .post('/users/search')
        .send({ cities: [cityName] })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(
            res.body.data.some((user: { id: string }) => user.id === userId),
          ).toBe(true);
        });
    });

    it('соблюдает пагинацию limit', () => {
      return request(httpServer)
        .post('/users/search')
        .send({ page: 1, limit: 1 })
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeLessThanOrEqual(1);
          expect(res.body.page).toBe(1);
        });
    });

    it('отклоняет недопустимое значение skillOption', () => {
      return request(httpServer)
        .post('/users/search')
        .send({ skillOption: 'invalid-option' })
        .expect(400)
        .expect(expectValidationError);
    });
  });

  describe('/users/me (PATCH)', () => {
    it('обновляет профиль текущего пользователя', () => {
      return request(httpServer)
        .patch('/users/me')
        .set('Cookie', [authCookie()])
        .send({
          name: 'Updated E2E User',
          about: 'Updated about',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('Updated E2E User');
          expect(res.body.about).toBe('Updated about');
          expect(res.body.email).toBe(testUser.email);
        });
    });

    it('возвращает 401 без токена', () => {
      return request(httpServer)
        .patch('/users/me')
        .send({ name: 'No Auth' })
        .expect(401)
        .expect(expectUnauthorized);
    });

    it('возвращает 400 при неизвестных полях', () => {
      return request(httpServer)
        .patch('/users/me')
        .set('Cookie', [authCookie()])
        .send({ name: 'Valid name', unexpected: true })
        .expect(400)
        .expect(expectValidationError);
    });
  });

  describe('/users/me/password (PATCH)', () => {
    it('возвращает 401 без токена', () => {
      return request(httpServer)
        .patch('/users/me/password')
        .send({
          currentPassword: password,
          newPassword,
        })
        .expect(401)
        .expect(expectUnauthorized);
    });

    it('возвращает 401 при неверном текущем пароле', () => {
      return request(httpServer)
        .patch('/users/me/password')
        .set('Cookie', [authCookie()])
        .send({
          currentPassword: 'wrong-password',
          newPassword,
        })
        .expect(401)
        .expect((res) => {
          expect(res.body).toMatchObject({
            code: exceptionCodes.users.invalidCredentials,
            message: exceptionMessages[exceptionCodes.users.invalidCredentials],
          });
        });
    });

    it('возвращает 400 при коротком новом пароле', () => {
      return request(httpServer)
        .patch('/users/me/password')
        .set('Cookie', [authCookie()])
        .send({
          currentPassword: password,
          newPassword: '123',
        })
        .expect(400)
        .expect(expectValidationError);
    });

    it('меняет пароль и не пускает со старым', async () => {
      await request(httpServer)
        .patch('/users/me/password')
        .set('Cookie', [authCookie()])
        .send({
          currentPassword: password,
          newPassword,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toMatchObject({
            status: true,
            message: 'Пароль успешно обновлён',
          });
        });

      await request(httpServer)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password,
        })
        .expect(401)
        .expect(expectUnauthorized);

      await request(httpServer)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);
    });
  });
});

function expectUnauthorized(res: {
  body: { code?: string; message?: unknown };
}) {
  expect(res.body).toMatchObject({
    code: exceptionCodes.common.unauthorized,
  });
  expect(res.body.message).toEqual(expect.any(String));
}

function expectValidationError(res: {
  body: { code?: string; message?: unknown };
}) {
  expect(res.body.code).toBe(exceptionCodes.common.validation);
  expect(res.body.message).toBeDefined();
}

function getCookieValue(
  cookies: string | string[] | undefined,
  name: string,
): string | undefined {
  const cookiesArray = Array.isArray(cookies)
    ? cookies
    : cookies
      ? [cookies]
      : [];

  const cookie = cookiesArray.find((item) => item.startsWith(`${name}=`));

  return cookie?.split(';')[0]?.split('=')[1];
}
