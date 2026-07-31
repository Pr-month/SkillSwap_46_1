export enum EnvKey {
  Port = 'APP_PORT',
  HashSalt = 'HASH_SALT',
  JwtAccessSecret = 'JWT_ACCESS_SECRET',
  JwtRefreshSecret = 'JWT_REFRESH_SECRET',
  JwtAccessExpiresIn = 'JWT_ACCESS_EXPIRES_IN',
  JwtRefreshExpiresIn = 'JWT_REFRESH_EXPIRES_IN',
  DatabaseHost = 'DB_HOST',
  DatabasePort = 'DB_PORT',
  DatabaseUsername = 'DB_USERNAME',
  DatabasePassword = 'DB_PASSWORD',
  DatabaseName = 'DB_NAME',
  DatabaseSynchronize = 'DB_SYNCHRONIZE',
  LoggerType = 'LOGGER_TYPE'
}