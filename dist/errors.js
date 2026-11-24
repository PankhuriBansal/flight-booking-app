export class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
        this.name = "HttpError";
    }
}
export function pgErrorCode(err) {
    return err.code;
}
//# sourceMappingURL=errors.js.map