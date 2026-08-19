import { adminSeedData } from '@/scripts/data/admin.data';
import * as bcrypt from 'bcrypt';
import * as process from 'process';

import { City } from '../cities/entities/city.entity';
import { nodeEnvValue } from '../module/configuration/const';
import { User } from '../users/entities/user.entity';
import { getAppDataSource } from './data-source';

async function seed() {
  if (process.env.NODE_ENV !== nodeEnvValue.Development) {
    console.log(
      `Сидинг разрешён только в среде "${nodeEnvValue.Development}". ` +
        `Текущая среда: "${process.env.NODE_ENV}"`,
    );
    return;
  }

  const AppDataSource = await getAppDataSource();
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const cityRepo = AppDataSource.getRepository(City);

  const existingAdmin = await userRepo.findOne({
    where: { email: adminSeedData.email },
  });

  if (existingAdmin) {
    console.log('Администратор уже существует, сидинг пропущен');
    await AppDataSource.destroy();
    return;
  }

  const city = await cityRepo.findOne({
    where: { name: adminSeedData.city },
  });

  if (!city) {
    throw new Error(`Город "${adminSeedData.city}" не найден в базе данных`);
  }

  const saltRounds = Number(process.env.HASH_SALT) || 10;
  const hashedPassword = await bcrypt.hash(adminSeedData.password, saltRounds);

  const admin = await userRepo.save(
    userRepo.create({
      email: adminSeedData.email,
      password: hashedPassword,
      name: adminSeedData.name,
      birthdate: adminSeedData.birthdate,
      gender: adminSeedData.gender,
      role: adminSeedData.role,
      city,
    }),
  );

  console.log(`Сид администратора успешно выполнен: ${admin.email}`);
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('Ошибка при сидировании администратора:', e);
  process.exit(1);
});
