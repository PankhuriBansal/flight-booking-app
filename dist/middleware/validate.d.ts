import type { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
export declare function validateBody(schema: ZodType): (req: Request, res: Response, next: NextFunction) => void;
export declare function parseId(value: unknown): number | null;
export declare function requireId(value: unknown): number;
//# sourceMappingURL=validate.d.ts.map