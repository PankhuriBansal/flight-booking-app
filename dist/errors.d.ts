export declare class HttpError extends Error {
    status: number;
    constructor(status: number, message: string);
}
export declare function pgErrorCode(err: unknown): string | undefined;
//# sourceMappingURL=errors.d.ts.map