import "dotenv/config";
import { Pool, types } from "pg";
// 1700 = NUMERIC ka type id. Isse price number ban ke aayega, string nahi
types.setTypeParser(1700, (val) => parseFloat(val));
export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
export async function withTransaction(fn) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await fn(client);
        await client.query("COMMIT");
        return result;
    }
    catch (err) {
        try {
            await client.query("ROLLBACK");
        }
        catch (rollbackErr) {
            console.error("Rollback failed", rollbackErr);
        }
        throw err;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=db.js.map