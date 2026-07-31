import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return the API status message', () => {
      expect(appController.getStatus()).toBe('SkillSwap API is running');
    });
  });

  describe('health', () => {
    it('should return the health status and timestamp', () => {
      const response = appController.getHealth();

      expect(response.status).toBe('ok');
      expect(response.timestamp).toEqual(expect.any(String));
      expect(new Date(response.timestamp).toISOString()).toBe(
        response.timestamp,
      );
    });
  });
});
