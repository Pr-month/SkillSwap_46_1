export const exceptionCodes = {
  users: {
    notFound: 'user:not-found',
    alreadyExists: 'user:already-exists',
    invalidCredentials: 'user:invalid-credentials',
    emailExists: 'user:email-exists',
    accessDenied: 'user:access-denied',
    invalidToken: 'user:invalid-token',
    emailNotConfirmed: 'user:email-not-confirmed',
    emailAlreadyConfirmed: 'user:email-already-confirmed',
  },
  auth: {
    invalidAccessToken: 'auth:invalid-access-token',
    expiredAccessToken: 'auth:expired-access-token',
  },
  skills: {
    notFound: 'skill:not-found',
    alreadyExists: 'skill:already-exists',
    accessDenied: 'skill:access-denied',
  },
  requests: {
    notFound: 'request:not-found',
    alreadyExists: 'request:already-exists',
    accessDenied: 'request:access-denied',
    invalidStatus: 'request:invalid-status',
    selfRequest: 'request:self-request',
  },
  favorites: {
    notFound: 'favorite:not-found',
    alreadyExists: 'favorite:already-exists',
  },
  upload: {
    fileRequired: 'upload:file-required',
    invalidImageType: 'upload:invalid-image-type',
    uploadFailed: 'upload:upload-failed',
  },
  categories: {
    notFound: 'category:not-found',
    subcategoryNotFound: 'category:subcategory-not-found',
  },
  common: {
    internal: 'app:internal-error',
    validation: 'app:validation-failed',
    unauthorized: 'app:unauthorized',
    forbidden: 'app:forbidden',
    notFound: 'app:not-found',
    conflict: 'app:conflict',
    payloadTooLarge: 'app:payload-too-large',
  },
  mail: {
    tooManyRequests: 'mail:too-many-requests',
  },
} as const;

type ExceptionGroup = (typeof exceptionCodes)[keyof typeof exceptionCodes];
export type ExceptionCode = ExceptionGroup extends infer Group
  ? Group extends Record<string, string>
    ? Group[keyof Group]
    : never
  : never;
