import * as bcrypt from 'bcrypt';
import * as process from 'process';

import { nodeEnvValue } from '../module/configuration/const';
import { User } from '../users/entities/user.entity';
import { getAppDataSource } from './data-source';
import { adminSeedData } from './data/admin.data';

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

  const existingAdmin = await userRepo.findOne({
    where: { email: adminSeedData.email },
  });

  if (existingAdmin) {
    console.log('Администратор уже существует, сидинг пропущен');
    await AppDataSource.destroy();
    return;
  }

  const saltRounds = Number(process.env.HASH_SALT) || 10;
  const hashedPassword = await bcrypt.hash(adminSeedData.password, saltRounds);

  const admin = await userRepo.save(
    userRepo.create({
      ...adminSeedData,
      password: hashedPassword,
    }),
  );

  console.log(`Сид администратора успешно выполнен: ${admin.email}`);
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('Ошибка при сидировании администратора:', e);
  process.exit(1);
});
