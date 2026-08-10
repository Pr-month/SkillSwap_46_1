import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../categories/entities/subcategory.entity';
import { getAppDataSource } from './data-source';
import { categoriesSeedData } from './data/categories.data';

async function seed() {
  const AppDataSource = await getAppDataSource();
  await AppDataSource.initialize();

  const categoryRepo = AppDataSource.getRepository(Category);
  const subcategoryRepo = AppDataSource.getRepository(Subcategory);

  const existing = await categoryRepo.count();
  if (existing > 0) {
    console.log('Категории уже есть в БД, сидинг пропущен');
    await AppDataSource.destroy();
    return;
  }

  for (const { name, subcategories } of categoriesSeedData) {
    const category = await categoryRepo.save(categoryRepo.create({ name }));

    const subcategoryEntities = subcategories.map((subName) =>
      subcategoryRepo.create({ name: subName, categoryId: category.id }),
    );
    await subcategoryRepo.save(subcategoryEntities);
  }

  console.log(
    `Сид категорий успешно выполнен: создано ${categoriesSeedData.length} категорий`,
  );
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error('Ошибка при сидировании категорий:', e);
  process.exit(1);
});
