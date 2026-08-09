import * as bcrypt from 'bcrypt';

import { AppDataSource } from '../config/ormconfig';
import { User } from '../users/entities/user.entity';
import { adminSeedData } from './data/admin.data';

async function seed() {
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

  const SALT_ROUNDS = 10;
  const hashedPassword = await bcrypt.hash(
    adminSeedData.password,
    SALT_ROUNDS,
  );

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
