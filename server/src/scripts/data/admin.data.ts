import { UserGender, UserRole } from '../../users/enums/user.enums';

export const adminSeedData = {
  email: process.env.ADMIN_EMAIL ?? 'admin@skillswap.local',
  password: process.env.ADMIN_PASSWORD ?? 'Admin12345',
  name: 'Администратор',
  birthdate: new Date('2000-01-01'),
  city: 'Москва',
  gender: UserGender.OTHER,
  role: UserRole.ADMIN,
};
