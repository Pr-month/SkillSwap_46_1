export declare const exceptionCodes: {
    readonly users: {
        readonly notFound: "user:not-found";
        readonly alreadyExists: "user:already-exists";
        readonly invalidCredentials: "user:invalid-credentials";
        readonly emailExists: "user:email-exists";
        readonly accessDenied: "user:access-denied";
    };
    readonly auth: {
        readonly invalidAccessToken: "auth:invalid-access-token";
        readonly expiredAccessToken: "auth:expired-access-token";
    };
    readonly skills: {
        readonly notFound: "skill:not-found";
        readonly alreadyExists: "skill:already-exists";
        readonly accessDenied: "skill:access-denied";
    };
    readonly requests: {
        readonly notFound: "request:not-found";
        readonly alreadyExists: "request:already-exists";
        readonly accessDenied: "request:access-denied";
        readonly invalidStatus: "request:invalid-status";
        readonly selfRequest: "request:self-request";
    };
    readonly favorites: {
        readonly notFound: "favorite:not-found";
        readonly alreadyExists: "favorite:already-exists";
    };
    readonly upload: {
        readonly fileRequired: "upload:file-required";
        readonly invalidImageType: "upload:invalid-image-type";
        readonly uploadFailed: "upload:upload-failed";
    };
    readonly categories: {
        readonly notFound: "category:not-found";
        readonly subcategoryNotFound: "category:subcategory-not-found";
    };
    readonly common: {
        readonly internal: "app:internal-error";
        readonly validation: "app:validation-failed";
        readonly unauthorized: "app:unauthorized";
        readonly forbidden: "app:forbidden";
        readonly notFound: "app:not-found";
        readonly conflict: "app:conflict";
        readonly payloadTooLarge: "app:payload-too-large";
    };
};
type ExceptionGroup = (typeof exceptionCodes)[keyof typeof exceptionCodes];
export type ExceptionCode = ExceptionGroup extends infer Group ? Group extends Record<string, string> ? Group[keyof Group] : never : never;
export declare const exceptionMessages: Record<ExceptionCode, string>;
export declare function isExceptionCode(value: unknown): value is ExceptionCode;
export {};
