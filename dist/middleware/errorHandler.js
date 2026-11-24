import { HttpError } from "../errors.js";
export function notFound(req, res) {
    res.status(404).json({
        message: `Route not found: ${req.method} ${req.originalUrl}`,
    });
}
export function errorHandler(err, _req, res, next) {
    if (res.headersSent) {
        next(err);
        return;
    }
    if (err instanceof HttpError) {
        res.status(err.status).json({ message: err.message });
        return;
    }
    const type = err.type;
    if (type === "entity.parse.failed") {
        res.status(400).json({ message: "Request body is too large" });
        return;
    }
    console.error(err);
    res.status(500).json({ message: "Server error" });
}
//# sourceMappingURL=errorHandler.js.map