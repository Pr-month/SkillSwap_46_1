export interface MailThrottleConfig {
  ttl: number;
  maxAttempts: number;
}

export const MAIL_THROTTLE_KEYS = {
  confirmation: {
    ttl: 60 * 60,
    maxAttempts: 3,
  },
  'reset-password': {
    ttl: 60 * 60,
    maxAttempts: 5,
  },
} as const satisfies Record<string, MailThrottleConfig>;

export type MailThrottleKey = keyof typeof MAIL_THROTTLE_KEYS;

export const getMailThrottleRedisKey = (
  key: MailThrottleKey,
  email: string,
): string => `mail:${key}:${email}`;
