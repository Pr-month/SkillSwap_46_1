export declare function omitSensitiveFields<T extends {
    password?: unknown;
}>(value: T): Omit<T, 'password'>;
