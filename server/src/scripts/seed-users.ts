import { Category } from '@/categories/entities/category.entity';
import { Subcategory } from '@/categories/entities/subcategory.entity';
import { City } from '@/cities/entities/city.entity';
import { nodeEnvValue } from '@/module/configuration/const';
import { Skill } from '@/skills/entities/skills.entity';
import { User } from '@/users/entities/user.entity';
import { UserRole } from '@/users/enums/user.enums';
import * as bcrypt from 'bcrypt';
import * as process from 'process';
import { In } from 'typeorm';

import { getAppDataSource } from './data-source';
import { adminSeedData } from './data/admin.data';
import { demoUserPassword, demoUsersSeedData } from './data/demo-users.data';

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

  try {
    const userRepo = AppDataSource.getRepository(User);
    const cityRepo = AppDataSource.getRepository(City);
    const categoryRepo = AppDataSource.getRepository(Category);
    const subcategoryRepo = AppDataSource.getRepository(Subcategory);
    const skillRepo = AppDataSource.getRepository(Skill);

    const saltRounds = Number(process.env.HASH_SALT) || 10;

    const existingAdmin = await userRepo.findOne({
      where: { email: adminSeedData.email },
    });

    if (existingAdmin) {
      console.log('Администратор уже существует');
    } else {
      const adminCity = await cityRepo.findOne({
        where: { name: adminSeedData.city },
      });

      if (!adminCity) {
        throw new Error(
          `Город "${adminSeedData.city}" для администратора не найден`,
        );
      }

      const hashedAdminPassword = await bcrypt.hash(
        adminSeedData.password,
        saltRounds,
      );

      const admin = userRepo.create({
        email: adminSeedData.email,
        password: hashedAdminPassword,
        name: adminSeedData.name,
        birthdate: adminSeedData.birthdate,
        gender: adminSeedData.gender,
        role: adminSeedData.role,
        city: adminCity,
        cityId: adminCity.id,
      });

      const savedAdmin = await userRepo.save(admin);

      console.log(`Создан администратор: ${savedAdmin.email}`);
    }

    const hashedDemoPassword = await bcrypt.hash(demoUserPassword, saltRounds);

    for (const demoUserData of demoUsersSeedData) {
      const city = await cityRepo.findOne({
        where: { name: demoUserData.city },
      });

      if (!city) {
        throw new Error(
          `Город "${demoUserData.city}" для пользователя ` +
            `"${demoUserData.email}" не найден`,
        );
      }

      const wantToLearn = await categoryRepo.find({
        where: {
          name: In(demoUserData.wantToLearnCategories),
        },
        relations: {
          subcategories: true,
        },
      });

      const foundCategoryNames = new Set(
        wantToLearn.map((category) => category.name),
      );

      const missingCategoryNames = demoUserData.wantToLearnCategories.filter(
        (name) => !foundCategoryNames.has(name),
      );

      if (missingCategoryNames.length > 0) {
        throw new Error(
          `Не найдены категории интересов пользователя ` +
            `"${demoUserData.email}": ${missingCategoryNames.join(', ')}`,
        );
      }

      const wantToLearnSubcategories = wantToLearn.flatMap(
        (category) => category.subcategories,
      );

      const skillCategory = await categoryRepo.findOne({
        where: { name: demoUserData.skill.category },
      });

      if (!skillCategory) {
        throw new Error(
          `Категория навыка "${demoUserData.skill.category}" не найдена`,
        );
      }

      const skillSubcategory = await subcategoryRepo.findOne({
        where: {
          name: demoUserData.skill.subcategory,
          categoryId: skillCategory.id,
        },
      });

      if (!skillSubcategory) {
        throw new Error(
          `Подкатегория навыка ` +
            `"${demoUserData.skill.subcategory}" не найдена`,
        );
      }

      let user = await userRepo.findOne({
        where: { email: demoUserData.email },
      });

      if (user) {
        user.wantToLearn = wantToLearn;
        user.wantToLearnSubcategories = wantToLearnSubcategories;
        user = await userRepo.save(user);

        console.log(`Пользователь уже существует: ${user.email}`);
      } else {
        user = userRepo.create({
          email: demoUserData.email,
          password: hashedDemoPassword,
          name: demoUserData.name,
          birthdate: demoUserData.birthdate,
          gender: demoUserData.gender,
          avatar: demoUserData.avatar,
          about: demoUserData.about,
          role: UserRole.USER,
          city,
          cityId: city.id,
          wantToLearn,
          wantToLearnSubcategories,
        });

        user = await userRepo.save(user);

        console.log(`Создан пользователь: ${user.email}`);
      }

      const existingSkill = await skillRepo.findOne({
        where: {
          title: demoUserData.skill.title,
          ownerId: user.id,
        },
      });

      if (existingSkill) {
        console.log(
          `Навык пользователя уже существует: ${existingSkill.title}`,
        );
        continue;
      }

      const skill = skillRepo.create({
        title: demoUserData.skill.title,
        description: demoUserData.skill.description,
        images: demoUserData.skill.images,
        category: skillCategory,
        categoryId: skillCategory.id,
        subcategory: skillSubcategory,
        subcategoryId: skillSubcategory.id,
        owner: user,
        ownerId: user.id,
      });

      const savedSkill = await skillRepo.save(skill);

      console.log(
        `Создан навык "${savedSkill.title}" пользователя ${user.email}`,
      );
    }

    console.log('Сидинг пользователей завершён');
  } finally {
    await AppDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error('Ошибка при сидировании пользователей:', error);
  process.exit(1);
});
