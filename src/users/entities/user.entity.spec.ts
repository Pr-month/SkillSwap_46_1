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
    ).toMatchObject({ select: false });
    expect(
      columns.find(({ propertyName }) => propertyName === 'refreshToken')
        ?.options,
    ).toMatchObject({ select: false });
  });

  it('describes skill and category relations', () => {
    const relations = getMetadataArgsStorage().relations.filter(
      ({ target }) => target === User,
    );

    expect(
      relations.map(({ propertyName, relationType }) => [
        propertyName,
        relationType,
      ]),
    ).toEqual([
      ['skills', 'one-to-many'],
      ['wantToLearn', 'many-to-many'],
      ['favoriteSkills', 'many-to-many'],
    ]);
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
