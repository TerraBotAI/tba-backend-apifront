import { Pool, type PoolClient } from "pg";
import { getEnvironment } from "@/backend/config/env";
import { DatabaseException, TenantAccessException } from "@/backend/exceptions/app-exception";
import type { TenantContext } from "./tenant-resolver";

declare global { var tenantPool: Pool | undefined; }
function getPool() { return globalThis.tenantPool ??= new Pool({ connectionString: getEnvironment().DATABASE_URL, max: 10 }); }

export class TenantDatabaseService {
  async withTenantTransaction<T>(tenant: TenantContext, work: (client: PoolClient) => Promise<T>): Promise<T> {
    if (!tenant) throw new TenantAccessException("A tenantid header is required for this resource");
    const client = await getPool().connect();
    try {
      await client.query("BEGIN");
      // SET LOCAL is scoped to this transaction, including when the pool reuses the connection.
      await client.query("SELECT set_config('search_path', $1, true)", [`\"${tenant.schema}\", public`]);
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      if (error instanceof Error && "code" in error) throw error;
      throw new DatabaseException("Tenant database operation failed", undefined, { cause: error });
    } finally { client.release(); }
  }
}
