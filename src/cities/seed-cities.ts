import { nodeEnvValue } from '../module/configuration/const';
import { getAppDataSource } from '../scripts/data-source';
import { City } from './entities/city.entity';

async function seedCities() {
  if (process.env.NODE_ENV !== nodeEnvValue.Development) {
    console.log(
      `Сидинг городов доступен только в среде "${nodeEnvValue.Development}"`,
    );
    return;
  }

  const AppDataSource = await getAppDataSource();
  await AppDataSource.initialize();

  try {
    const cityRepository = AppDataSource.getRepository(City);
    const cities = await cityRepository.find();
    const validCities: City[] = [];

    for (const city of cities) {
      const lat = Number(city.lat);
      const lon = Number(city.lon);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        console.warn(`Пропущен город "${city.name}": некорректные координаты`);
        continue;
      }

      city.lat = lat;
      city.lon = lon;
      validCities.push(city);
    }

    await cityRepository.save(validCities);

    console.log(`Сидинг городов завершён. Обработано: ${validCities.length}`);
  } finally {
    await AppDataSource.destroy();
  }
}

seedCities().catch((error) => {
  console.error('Ошибка сидинга городов:', error);
  process.exit(1);
});
