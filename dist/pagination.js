import { z } from "zod";
import { HttpError } from "./errors.js";
const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});
export function parsePagination(query) {
    const result = paginationSchema.safeParse(query);
    if (!result.success) {
        throw new HttpError(400, "page must be an integer >= 1 and limit must be between 1 and 50");
    }
    const { page, limit } = result.data;
    return { page, limit, offset: (page - 1) * limit };
}
export function buildMeta(page, limit, total) {
    return { page, limit, total, totalPages: Math.ceil(total / limit) };
}
//# sourceMappingURL=pagination.js.map