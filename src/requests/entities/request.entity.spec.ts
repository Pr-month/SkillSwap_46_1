import { getMetadataArgsStorage } from 'typeorm';

import { RequestStatus } from '../enums/request-status.enum';
import { Request } from './request.entity';

describe('Request entity', () => {
  it('describes request columns and defaults', () => {
    const columns = getMetadataArgsStorage().columns.filter(
      ({ target }) => target === Request,
    );

    expect(columns.map(({ propertyName }) => propertyName)).toEqual([
      'id',
      'createdAt',
      'status',
      'isRead',
    ]);
    expect(
      columns.find(({ propertyName }) => propertyName === 'status')?.options,
    ).toMatchObject({
      enum: RequestStatus,
      default: RequestStatus.PENDING,
    });
    expect(
      columns.find(({ propertyName }) => propertyName === 'isRead')?.options,
    ).toMatchObject({ default: false });
  });

  it('describes request participants and exchanged skills', () => {
    const relations = getMetadataArgsStorage().relations.filter(
      ({ target }) => target === Request,
    );

    expect(relations.map(({ propertyName }) => propertyName)).toEqual([
      'sender',
      'receiver',
      'offeredSkill',
      'requestedSkill',
    ]);
    expect(relations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relationType: 'many-to-one',
          options: expect.objectContaining({ nullable: false }),
        }),
      ]),
    );
  });
});
