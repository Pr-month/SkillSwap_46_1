import { instanceToPlain } from 'class-transformer';
import { getMetadataArgsStorage } from 'typeorm';
import { UserGender, UserRole } from '../enums/user.enums';
import { User } from './user.entity';

describe('User entity', () => {
  it('describes the user table columns', () => {
    const columns = getMetadataArgsStorage().columns.filter(
      ({ target }) => target === User,
    );
    const columnNames = columns.map(({ propertyName }) => propertyName);

    expect(columnNames).toEqual([
      'id',
      'name',
      'email',
      'password',
      'about',
      'birthdate',
      'city',
      'gender',
      'avatar',
      'role',
      'refreshToken',
    ]);
    expect(
      columns.find(({ propertyName }) => propertyName === 'email')?.options,
    ).toMatchObject({ unique: true });
    expect(
      columns.find(({ propertyName }) => propertyName === 'role')?.options,
    ).toMatchObject({ enum: UserRole, default: UserRole.USER });
    expect(
      columns.find(({ propertyName }) => propertyName === 'gender')?.options,
    ).toMatchObject({ enum: UserGender });
    expect(
      columns.find(({ propertyName }) => propertyName === 'password')?.options,
    ).not.toHaveProperty('select');
    expect(
      columns.find(({ propertyName }) => propertyName === 'refreshToken')
        ?.options,
    ).not.toHaveProperty('select');
  });

  it('does not register relations before related entities are implemented', () => {
    const relations = getMetadataArgsStorage().relations.filter(
      ({ target }) => target === User,
    );

    expect(relations).toEqual([]);
  });

  it('does not serialize password and refresh token', () => {
    const user = Object.assign(new User(), {
      email: 'user@example.com',
      password: 'password-hash',
      refreshToken: 'refresh-token-hash',
    });

    expect(instanceToPlain(user)).toEqual({ email: 'user@example.com' });
  });
});
