# SkillSwap Backend

Бэкенд платформы SkillSwap на NestJS.

## Стек

* NestJS 11
* TypeORM
* PostgreSQL 16
* JWT
* AWS S3
* [Socket.IO](https://socket.io/)
* Swagger

## Запуск

```bash
npm install
npm run start:dev
```

Сервер запустится на http://localhost:4567.

Swagger доступен на http://localhost:4567/docs.

## База данных

Запуск PostgreSQL через Docker:

```bash
docker-compose up -d
```

## Переменные окружения

Создай файл `.env` на основе `.env.example`:

```env
NODE_ENV=development
APP_PORT=4567
HASH_SALT=10
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=1234
DB_NAME=skillswap
DB_SYNCHRONIZE=true

LOGGER_TYPE=dev

S3_REGION=ru-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://s3.twcstorage.ru
S3_BUCKET_NAME=...
```

## Сидинг

```bash
npm run seeding:cities
npm run seeding:categories
npm run seeding:users
```

## Скрипты

| Команда                      | Описание                     |
| ---------------------------- | ---------------------------- |
| `npm run start:dev`          | Запуск в watch-режиме        |
| `npm run build`              | Сборка проекта               |
| `npm run start:prod`         | Запуск собранного приложения |
| `npm run test`               | Unit-тесты                   |
| `npm run test:e2e`           | E2E-тесты                    |
| `npm run test:cov`           | Тесты с покрытием            |
| `npm run lint`               | Линтер с автофиксом          |
| `npm run format`             | Форматирование Prettier      |
| `npm run seeding:cities`     | Сидинг городов               |
| `npm run seeding:categories` | Сидинг категорий             |
| `npm run seeding:users`      | Сидинг администратора        |

## Документация API

Swagger UI доступен по адресу http://localhost:4567/docs.
