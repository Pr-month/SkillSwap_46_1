# SkillSwap

**SkillSwap** — веб-платформа для обмена навыками и знаниями между людьми.

Пользователь может найти человека, который владеет интересующим его навыком, предложить свой навык в ответ и договориться об обмене. Платформа объединяет поиск участников, профили и навыки, заявки на обмен, избранное и уведомления в одном сервисе.

## Демо

* **Production:** [site.udarilisvtantcy.com](https://site.udarilisvtantcy.com)
* **API:** [api.udarilisvtantcy.com](https://api.udarilisvtantcy.com)

## Основные возможности

### Пользователи и аутентификация

* регистрация и вход по email и паролю;
* JWT-аутентификация с `access` и `refresh` токенами;
* хранение токенов в `httpOnly` cookies;
* автоматическое обновление `access` токена;
* OAuth 2.0 через Google и Яндекс;
* подтверждение email;
* восстановление пароля по одноразовой ссылке.

### Поиск и профили

* поиск пользователей по параметрам;
* фильтрация по:

  * категориям и подкатегориям;
  * городам;
  * полу;
  * типу участия;
* профили пользователей с информацией о навыках;
* добавление пользователей в избранное.

### Навыки

* создание и редактирование навыков;
* добавление изображений;
* хранение изображений в S3;
* привязка навыков к категориям и подкатегориям.

### Обмен навыками

* отправка заявки на обмен;
* принятие и отклонение заявок;
* удаление заявок;
* WebSocket-уведомления о новых заявках.

### Интерфейс

* тёмная тема;
* адаптивная вёрстка;
* поддержка мобильных и десктопных устройств.

---

## Технологический стек

### Frontend

| Технология             | Назначение                               |
| ---------------------- | ---------------------------------------- |
| **React 19**           | Построение пользовательского интерфейса  |
| **TypeScript**         | Статическая типизация                    |
| **Redux Toolkit**      | Управление состоянием приложения         |
| **React Router v7**    | Клиентская маршрутизация                 |
| **Vite**               | Сборка и dev-сервер                      |
| **date-fns**           | Работа с датами                          |
| **clsx**               | Условная генерация CSS-классов           |
| **Jest**               | Unit-тестирование                        |
| **Storybook + Vitest** | Разработка и тестирование UI-компонентов |

### Backend

| Технология           | Назначение                                   |
| -------------------- | -------------------------------------------- |
| **NestJS 11**        | Серверное приложение и модульная архитектура |
| **PostgreSQL 16**    | Основная реляционная база данных             |
| **TypeORM**          | ORM и управление миграциями                  |
| **Redis 7**          | Кеширование и временное состояние            |
| **Passport + JWT**   | Аутентификация и авторизация                 |
| **OAuth 2.0**        | Авторизация через Google и Яндекс            |
| **Socket.IO**        | WebSocket-коммуникация и уведомления         |
| **Nodemailer**       | Отправка email через SMTP                    |
| **AWS SDK v3**       | Работа с S3-совместимым хранилищем           |
| **Swagger**          | Документирование REST API                    |
| **class-validator**  | Валидация DTO                                |
| **Jest + Supertest** | Unit- и E2E-тестирование                     |

### Infrastructure & DevOps

| Технология         | Назначение                                                |
| ------------------ | --------------------------------------------------------- |
| **Docker**         | Контейнеризация приложений                                |
| **Docker Compose** | Управление локальным и production-стеком                  |
| **Caddy 2**        | Reverse proxy и автоматическое получение TLS-сертификатов |
| **GitHub Actions** | CI/CD                                                     |
| **Timeweb S3**     | Хранение пользовательских изображений                     |

---

## Архитектура

Проект организован как **monorepo на npm workspaces** и состоит из frontend- и backend-приложений.

```text
skillswap/
├── server/                       # NestJS API
│   ├── src/
│   │   ├── auth/                 # Аутентификация и OAuth
│   │   ├── users/                # Пользователи и поиск
│   │   ├── skills/               # Навыки
│   │   ├── requests/             # Заявки на обмен
│   │   ├── favorites/            # Избранное
│   │   ├── categories/           # Категории и подкатегории
│   │   ├── cities/               # Города
│   │   ├── mail/                 # Email-рассылка
│   │   ├── s3/                   # Работа с S3
│   │   ├── gateway/              # WebSocket gateway
│   │   └── common/               # Общие фильтры, интерцепторы и утилиты
│   └── Dockerfile
│
├── site/                         # React SPA
│   ├── src/
│   │   ├── api/                  # HTTP-клиент и интерцепторы
│   │   ├── services/             # Redux slices и thunks
│   │   ├── pages/                # Страницы приложения
│   │   ├── shared/               # Общие UI-компоненты
│   │   └── utils/                # Утилиты и типы
│   ├── Dockerfile
│   └── Caddyfile
│
└── docker-compose.prod.yml       # Production-стек
```

### Backend

Backend построен на **NestJS** и разделён на функциональные модули. PostgreSQL используется как основное хранилище данных, а Redis — для кеширования и работы с временным состоянием.

Основные модули:

* `auth` — регистрация, вход, JWT и OAuth;
* `users` — профили и поиск пользователей;
* `skills` — управление навыками;
* `requests` — обмен заявками;
* `favorites` — избранные пользователи;
* `categories` / `cities` — справочники;
* `mail` — email-подтверждение и восстановление пароля;
* `s3` — загрузка изображений;
* `gateway` — WebSocket-уведомления.

### Frontend

Frontend представляет собой **React SPA**. Состояние приложения управляется через Redux Toolkit, маршрутизация выполняется с помощью React Router, а взаимодействие с API инкапсулировано в отдельном HTTP-клиенте.

---

## Локальная разработка

### Требования

Перед началом работы убедитесь, что установлены:

* Node.js;
* npm;
* Docker и Docker Compose.

### Установка

```bash
npm install
```

### Запуск инфраструктуры

Запустите PostgreSQL и Redis:

```bash
docker compose -f server/docker-compose.yml up -d postgres redis
```

### Настройка окружения

Создайте файл переменных окружения:

```bash
cp server/.env.example server/.env
```

После этого заполните необходимые значения в `server/.env`.

### Миграции и сиды

Примените миграции:

```bash
npm run migration:run --workspace server
```

Заполните справочники:

```bash
npm run seeding:cities --workspace server
npm run seeding:categories --workspace server
```

### Запуск приложений

Backend:

```bash
npm run start:dev
```

API будет доступен по адресу:

```text
http://localhost:4567
```

Frontend:

```bash
npm run start:client
```

Приложение будет доступно по адресу:

```text
http://localhost:5173
```

---

## Production

Production-окружение запускается через Docker Compose.

CI/CD настроен с помощью **GitHub Actions**:

```text
Pull Request
    │
    ├── lint
    └── unit tests
          │
          ▼
       main PR
          │
          ├── lint
          ├── unit tests
          └── e2e tests
                │
                ▼
             merge
                │
                ▼
         push в main
                │
                ├── lint
                ├── unit tests
                ├── e2e tests
                └── deploy на VPS
```

### Ручной запуск на сервере

```bash
git clone <repo> /root/skillswap
cd /root/skillswap
```

После этого необходимо добавить production-переменные окружения и запустить стек:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### HTTPS и reverse proxy

Caddy используется как reverse proxy перед frontend и API.

Он автоматически получает и обновляет TLS-сертификаты Let's Encrypt для:

* `site.udarilisvtantcy.com`
* `api.udarilisvtantcy.com`

---

## Переменные окружения

Полный список переменных находится в:

```text
server/.env.example
```

Основные группы настроек:

| Переменные      | Назначение                 |
| --------------- | -------------------------- |
| `DB_*`          | Подключение к PostgreSQL   |
| `REDIS_*`       | Подключение к Redis        |
| `JWT_*`         | Настройки JWT и секреты    |
| `S3_*`          | Подключение к S3-хранилищу |
| `GOOGLE_*`      | Настройки Google OAuth     |
| `YANDEX_*`      | Настройки Яндекс OAuth     |
| `MAIL_*`        | Настройки SMTP             |
| `CORS_ORIGINS`  | Разрешённые origin'ы       |
| `COOKIE_DOMAIN` | Домен для cookies          |

---

## Тестирование

### Backend

Unit-тесты:

```bash
npm run test:server
```

Покрытие:

```bash
npm run test:cov --workspace server
```

E2E:

```bash
npm run test:e2e --workspace server
```

### Frontend

```bash
npm run test:client
```

### Покрытие

Текущее покрытие проекта:

* **Server:** ~92% statements
* **OAuth-модуль:** 100%
* **Client:** ~90% statements

---

## CI/CD

Workflow находится в:

```text
.github/workflows/ci-cd.yml
```

Проверки выполняются в зависимости от типа события:

| Событие               | Проверки                         |
| --------------------- | -------------------------------- |
| Pull Request          | lint + unit tests                |
| Pull Request → `main` | lint + unit tests + E2E          |
| Push → `main`         | lint + unit tests + E2E + deploy |

---

## Лицензия

`UNLICENSED`

Учебный проект.
