import { AppModule } from '@/app.module';
import { Category } from '@/categories/entities/category.entity';
import { City } from '@/cities/entities/city.entity';
import { ConfigurationService } from '@/module/configuration/configuration.service';
import { Request } from '@/requests/entities/request.entity';
import { RequestStatus } from '@/requests/enums/request-status.enum';
import { Skill } from '@/skills/entities/skills.entity';
import { User } from '@/users/entities/user.entity';
import { UserGender, UserRole } from '@/users/enums/user.enums';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { DataSource, Repository } from 'typeorm';

import cookieParser = require('cookie-parser');

describe('Requests (e2e)', () => {
  let app: INestApplication;

  let cityRepository: Repository<City>;
  let categoryRepository: Repository<Category>;
  let userRepository: Repository<User>;
  let skillRepository: Repository<Skill>;
  let requestRepository: Repository<Request>;

  let cityId: string;
  let categoryId: string;

  let senderId: string;
  let receiverId: string;

  let offeredSkillId: string;
  let requestedSkillId: string;

  let requestId: string;

  let senderCookie: string;
  let receiverCookie: string;

  const runId = Date.now();

  const senderEmail = `requests-sender-${runId}@example.com`;
  const receiverEmail = `requests-receiver-${runId}@example.com`;

  const nonExistentId = '11111111-1111-4111-8111-111111111111';

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
    requestRepository = dataSource.getRepository(Request);

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

    const sender = await userRepository.save(
      userRepository.create({
        email: senderEmail,
        password: 'not-used-in-requests-e2e',
        name: 'Requests Sender',
        about: null,
        birthdate: new Date('1990-01-01'),
        cityId,
        gender: UserGender.MALE,
        avatar: null,
        role: UserRole.USER,
        refreshToken: null,
      }),
    );

    senderId = sender.id;

    const receiver = await userRepository.save(
      userRepository.create({
        email: receiverEmail,
        password: 'not-used-in-requests-e2e',
        name: 'Requests Receiver',
        about: null,
        birthdate: new Date('1991-01-01'),
        cityId,
        gender: UserGender.FEMALE,
        avatar: null,
        role: UserRole.USER,
        refreshToken: null,
      }),
    );

    receiverId = receiver.id;

    const configurationService = app.get(ConfigurationService);

    const jwtService = new JwtService({
      secret: configurationService.jwtAccessSecret,
    });

    senderCookie = createAccessCookie(jwtService, sender);
    receiverCookie = createAccessCookie(jwtService, receiver);

    const offeredSkill = await skillRepository.save(
      skillRepository.create({
        title: `E2E Offered Skill ${runId}`,
        description: 'Навык отправителя для E2E-теста заявок',
        images: null,
        categoryId,
        subcategoryId: null,
        ownerId: senderId,
      }),
    );

    offeredSkillId = offeredSkill.id;

    const requestedSkill = await skillRepository.save(
      skillRepository.create({
        title: `E2E Requested Skill ${runId}`,
        description: 'Навык получателя для E2E-теста заявок',
        images: null,
        categoryId,
        subcategoryId: null,
        ownerId: receiverId,
      }),
    );

    requestedSkillId = requestedSkill.id;
  });

  afterAll(async () => {
    if (!app) {
      return;
    }

    if (requestId) {
      await requestRepository.delete(requestId).catch(() => undefined);
    }

    if (offeredSkillId || requestedSkillId) {
      const skillIds = [offeredSkillId, requestedSkillId].filter(Boolean);

      await skillRepository.delete(skillIds).catch(() => undefined);
    }

    if (senderId || receiverId) {
      const userIds = [senderId, receiverId].filter(Boolean);

      await userRepository.delete(userIds).catch(() => undefined);
    }

    if (categoryId) {
      await categoryRepository.delete(categoryId).catch(() => undefined);
    }

    if (cityId) {
      await cityRepository.delete(cityId).catch(() => undefined);
    }

    await app.close();
  });

  describe('аутентификация', () => {
    it('POST /requests без токена -> 401', () => {
      return request(app.getHttpServer())
        .post('/requests')
        .send({
          offeredSkillId,
          requestedSkillId,
        })
        .expect(401);
    });

    it('GET /requests/incoming без токена -> 401', () => {
      return request(app.getHttpServer()).get('/requests/incoming').expect(401);
    });

    it('GET /requests/outgoing без токена -> 401', () => {
      return request(app.getHttpServer()).get('/requests/outgoing').expect(401);
    });

    it('PATCH /requests/:id без токена -> 401', () => {
      return request(app.getHttpServer())
        .patch(`/requests/${nonExistentId}`)
        .send({
          status: RequestStatus.ACCEPTED,
        })
        .expect(401);
    });

    it('DELETE /requests/:id без токена -> 401', () => {
      return request(app.getHttpServer())
        .delete(`/requests/${nonExistentId}`)
        .expect(401);
    });
  });

  describe('POST /requests', () => {
    it('возвращает 400 для невалидного offeredSkillId', () => {
      return request(app.getHttpServer())
        .post('/requests')
        .set('Cookie', [senderCookie])
        .send({
          offeredSkillId: 'not-a-uuid',
          requestedSkillId,
        })
        .expect(400);
    });

    it('возвращает 404 для несуществующего навыка', () => {
      return request(app.getHttpServer())
        .post('/requests')
        .set('Cookie', [senderCookie])
        .send({
          offeredSkillId: nonExistentId,
          requestedSkillId,
        })
        .expect(404)
        .expect((response) => {
          expect(response.body.code).toBe('skill:not-found');
        });
    });

    it('запрещает предлагать чужой навык', () => {
      return request(app.getHttpServer())
        .post('/requests')
        .set('Cookie', [receiverCookie])
        .send({
          offeredSkillId,
          requestedSkillId,
        })
        .expect(403)
        .expect((response) => {
          expect(response.body.code).toBe('request:access-denied');
        });
    });

    it('запрещает отправлять заявку на собственный навык', () => {
      return request(app.getHttpServer())
        .post('/requests')
        .set('Cookie', [senderCookie])
        .send({
          offeredSkillId,
          requestedSkillId: offeredSkillId,
        })
        .expect(400)
        .expect((response) => {
          expect(response.body.code).toBe('request:self-request');
        });
    });

    it('создаёт заявку на обмен', () => {
      return request(app.getHttpServer())
        .post('/requests')
        .set('Cookie', [senderCookie])
        .send({
          offeredSkillId,
          requestedSkillId,
        })
        .expect(201)
        .expect((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.status).toBe(RequestStatus.PENDING);
          expect(response.body.isRead).toBe(false);

          expect(response.body.sender.id).toBe(senderId);
          expect(response.body.receiver.id).toBe(receiverId);

          expect(response.body.offeredSkill.id).toBe(offeredSkillId);
          expect(response.body.requestedSkill.id).toBe(requestedSkillId);

          requestId = response.body.id;
        });
    });
  });

  describe('GET /requests/incoming', () => {
    it('возвращает входящую заявку получателю', () => {
      return request(app.getHttpServer())
        .get('/requests/incoming')
        .set('Cookie', [receiverCookie])
        .expect(200)
        .expect((response) => {
          expect(Array.isArray(response.body)).toBe(true);

          const foundRequest = response.body.find(
            (item: { id: string }) => item.id === requestId,
          );

          expect(foundRequest).toBeDefined();
          expect(foundRequest.status).toBe(RequestStatus.PENDING);
          expect(foundRequest.sender.id).toBe(senderId);
          expect(foundRequest.receiver.id).toBe(receiverId);
          expect(foundRequest.offeredSkill.id).toBe(offeredSkillId);
          expect(foundRequest.requestedSkill.id).toBe(requestedSkillId);
        });
    });

    it('не показывает исходящую заявку отправителю во входящих', () => {
      return request(app.getHttpServer())
        .get('/requests/incoming')
        .set('Cookie', [senderCookie])
        .expect(200)
        .expect((response) => {
          const foundRequest = response.body.find(
            (item: { id: string }) => item.id === requestId,
          );

          expect(foundRequest).toBeUndefined();
        });
    });
  });

  describe('GET /requests/outgoing', () => {
    it('возвращает исходящую заявку отправителю', () => {
      return request(app.getHttpServer())
        .get('/requests/outgoing')
        .set('Cookie', [senderCookie])
        .expect(200)
        .expect((response) => {
          expect(Array.isArray(response.body)).toBe(true);

          const foundRequest = response.body.find(
            (item: { id: string }) => item.id === requestId,
          );

          expect(foundRequest).toBeDefined();
          expect(foundRequest.status).toBe(RequestStatus.PENDING);
          expect(foundRequest.sender.id).toBe(senderId);
          expect(foundRequest.receiver.id).toBe(receiverId);
        });
    });

    it('не показывает входящую заявку получателю в исходящих', () => {
      return request(app.getHttpServer())
        .get('/requests/outgoing')
        .set('Cookie', [receiverCookie])
        .expect(200)
        .expect((response) => {
          const foundRequest = response.body.find(
            (item: { id: string }) => item.id === requestId,
          );

          expect(foundRequest).toBeUndefined();
        });
    });
  });

  describe('PATCH /requests/:id', () => {
    it('возвращает 400 для невалидного id', () => {
      return request(app.getHttpServer())
        .patch('/requests/not-a-uuid')
        .set('Cookie', [receiverCookie])
        .send({
          status: RequestStatus.ACCEPTED,
        })
        .expect(400);
    });

    it('возвращает 404 для несуществующей заявки', () => {
      return request(app.getHttpServer())
        .patch(`/requests/${nonExistentId}`)
        .set('Cookie', [receiverCookie])
        .send({
          status: RequestStatus.ACCEPTED,
        })
        .expect(404)
        .expect((response) => {
          expect(response.body.code).toBe('request:not-found');
        });
    });

    it('запрещает отправителю изменить входящую заявку', () => {
      return request(app.getHttpServer())
        .patch(`/requests/${requestId}`)
        .set('Cookie', [senderCookie])
        .send({
          status: RequestStatus.ACCEPTED,
        })
        .expect(403)
        .expect((response) => {
          expect(response.body.code).toBe('request:access-denied');
        });
    });

    it('возвращает 400 для недопустимого статуса', () => {
      return request(app.getHttpServer())
        .patch(`/requests/${requestId}`)
        .set('Cookie', [receiverCookie])
        .send({
          status: RequestStatus.PENDING,
        })
        .expect(400);
    });

    it('получатель может принять заявку', () => {
      return request(app.getHttpServer())
        .patch(`/requests/${requestId}`)
        .set('Cookie', [receiverCookie])
        .send({
          status: RequestStatus.ACCEPTED,
        })
        .expect(200)
        .expect((response) => {
          expect(response.body.id).toBe(requestId);
          expect(response.body.status).toBe(RequestStatus.ACCEPTED);
          expect(response.body.isRead).toBe(true);
        });
    });

    it('не позволяет изменить уже принятую заявку', () => {
      return request(app.getHttpServer())
        .patch(`/requests/${requestId}`)
        .set('Cookie', [receiverCookie])
        .send({
          status: RequestStatus.REJECTED,
        })
        .expect(409)
        .expect((response) => {
          expect(response.body.code).toBe('request:invalid-status');
        });
    });
  });

  describe('DELETE /requests/:id', () => {
    it('запрещает получателю удалить исходящую заявку', () => {
      return request(app.getHttpServer())
        .delete(`/requests/${requestId}`)
        .set('Cookie', [receiverCookie])
        .expect(403)
        .expect((response) => {
          expect(response.body.code).toBe('request:access-denied');
        });
    });

    it('отправитель может удалить свою заявку', () => {
      return request(app.getHttpServer())
        .delete(`/requests/${requestId}`)
        .set('Cookie', [senderCookie])
        .expect(204);
    });

    it('возвращает 404 после удаления заявки', () => {
      return request(app.getHttpServer())
        .delete(`/requests/${requestId}`)
        .set('Cookie', [senderCookie])
        .expect(404)
        .expect((response) => {
          expect(response.body.code).toBe('request:not-found');
        });
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
