export function omitSensitiveFields<T extends { password?: unknown }>(
  value: T,
): Omit<T, 'password'> {
  const { password, ...safeValue } = value;
  void password;
  return safeValue;
}
