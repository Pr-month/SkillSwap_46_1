import { City } from '@/cities/entities/city.entity';
import * as fs from 'fs';
import * as path from 'path';

import { nodeEnvValue } from '../module/configuration/const';
import { getAppDataSource } from '../scripts/data-source';

interface CityJsonItem {
  coords: {
    lat: string;
    lon: string;
  };
  district: string;
  name: string;
  population: number;
  subject: string;
}

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

    // Читаем JSON-файл
    const filePath = path.join(
      __dirname,
      '..',
      'scripts',
      'data',
      'russian-cities.json',
    );
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const citiesData: CityJsonItem[] = JSON.parse(rawData);

    let processed = 0;
    let skipped = 0;

    for (const item of citiesData) {
      const lat = Number(item.coords.lat);
      const lon = Number(item.coords.lon);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        console.warn(`Пропущен город "${item.name}": некорректные координаты`);
        skipped++;
        continue;
      }

      const existingCity = await cityRepository.findOne({
        where: { name: item.name, subject: item.subject },
      });

      if (existingCity) {
        skipped++;
        continue;
      }

      const city = cityRepository.create({
        name: item.name,
        district: item.district,
        subject: item.subject,
        population: item.population,
        lat,
        lon,
      });

      await cityRepository.save(city);
      processed++;
    }

    console.log(
      `Сидинг городов завершён. Создано: ${processed}, пропущено: ${skipped}`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

seedCities().catch((error) => {
  console.error('Ошибка сидинга городов:', error);
  process.exit(1);
});
