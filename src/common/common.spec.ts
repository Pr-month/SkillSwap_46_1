import {
  ArgumentsHost,
  BadRequestException,
  ExecutionContext,
  HttpStatus,
  PayloadTooLargeException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { of } from 'rxjs';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

import { PaginationDto } from './dto/pagination.dto';
import { PaginatedResponseDto } from './dto/response.dto';
import { BusinessException } from './errors/business.exception';
import { exceptionCodes } from './errors/error-codes';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { omitSensitiveFields } from './transformers/omit-sensitive-fields.transformer';

describe('common', () => {
  describe('pagination', () => {
    it('uses defaults required by the specification', () => {
      const dto = plainToInstance(PaginationDto, {});

      expect(dto).toMatchObject({ page: 1, limit: 20, search: '' });
      expect(dto.skip).toBe(0);
    });

    it('transforms numeric query parameters and calculates skip', async () => {
      const dto = plainToInstance(PaginationDto, { page: '3', limit: '15' });

      expect(await validate(dto)).toHaveLength(0);
      expect(dto.skip).toBe(30);
    });

    it('rejects a limit above the safe maximum', async () => {
      const dto = plainToInstance(PaginationDto, { limit: '101' });

      expect(await validate(dto)).not.toHaveLength(0);
    });

    it('builds the response shape from the specification', () => {
      expect(new PaginatedResponseDto(['item'], 2, 41, 20)).toEqual({
        data: ['item'],
        page: 2,
        totalPages: 3,
      });
    });
  });

  describe('errors', () => {
    const filter = new AllExceptionsFilter();
    let status: jest.Mock;
    let json: jest.Mock;
    let host: ArgumentsHost;

    beforeEach(() => {
      json = jest.fn();
      status = jest.fn().mockReturnValue({ json });
      host = {
        switchToHttp: () => ({
          getRequest: () => ({ originalUrl: '/skills' }),
          getResponse: () => ({ status }),
        }),
      } as ArgumentsHost;
    });

    it('returns a readable business error', () => {
      filter.catch(
        new BusinessException(
          exceptionCodes.skills.notFound,
          HttpStatus.NOT_FOUND,
          { id: 'skill-id' },
        ),
        host,
      );

      expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: exceptionCodes.skills.notFound,
          message: 'Навык не найден',
          details: { id: 'skill-id' },
          path: '/skills',
        }),
      );
    });

    it('maps a missing TypeORM entity to 404', () => {
      filter.catch(new EntityNotFoundError('Skill', { id: 'missing' }), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ code: exceptionCodes.common.notFound }),
      );
    });

    it('maps a PostgreSQL unique violation to 409', () => {
      filter.catch(
        new QueryFailedError(
          'INSERT',
          [],
          Object.assign(new Error('duplicate'), { code: '23505' }),
        ),
        host,
      );

      expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ code: exceptionCodes.common.conflict }),
      );
    });

    it('keeps validation messages from Nest', () => {
      filter.catch(
        new BadRequestException(['page must not be less than 1']),
        host,
      );

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: exceptionCodes.common.validation,
          message: ['page must not be less than 1'],
        }),
      );
    });

    it('maps an oversized upload to 413', () => {
      filter.catch(new PayloadTooLargeException(), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: exceptionCodes.common.payloadTooLarge,
        }),
      );
    });
  });

  it('wraps a successful response when the interceptor is explicitly used', (done) => {
    const interceptor = new ResponseInterceptor<string>();

    interceptor
      .intercept({} as ExecutionContext, { handle: () => of('ok') })
      .subscribe((result) => {
        expect(result).toEqual({ status: true, data: 'ok' });
        done();
      });
  });

  it('removes a password without changing other fields', () => {
    expect(
      omitSensitiveFields({ id: 'user-id', password: 'secret', name: 'Иван' }),
    ).toEqual({ id: 'user-id', name: 'Иван' });
  });
});
