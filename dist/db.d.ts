import "dotenv/config";
import { Pool } from "pg";
import type { PoolClient } from "pg";
export declare const pool: Pool;
export declare function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T>;
//# sourceMappingURL=db.d.ts.map