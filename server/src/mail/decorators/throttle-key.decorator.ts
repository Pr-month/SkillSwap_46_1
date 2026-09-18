import { SetMetadata } from '@nestjs/common';

export const THROTTLE_KEY = 'throttleKey';
export const ThrottleKey = (key: string) => SetMetadata(THROTTLE_KEY, key);
