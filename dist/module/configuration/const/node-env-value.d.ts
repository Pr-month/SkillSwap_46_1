type ValueOf<T> = T[keyof T];
export declare const nodeEnvValue: {
    readonly Development: "development";
    readonly Production: "production";
    readonly Test: "test";
};
export declare const nodeEnvValues: ("development" | "production" | "test")[];
export type NodeEnvValueType = ValueOf<typeof nodeEnvValue>;
export {};
