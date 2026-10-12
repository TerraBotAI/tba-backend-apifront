import { TenantDatabaseService } from "@/backend/database/tenant/tenant-database.service";
import type { TenantContext } from "@/backend/database/tenant/tenant-resolver";
import { UserRepository } from "./user.repository";
export class UserService {
  private readonly database = new TenantDatabaseService(); private readonly repository = new UserRepository();
  list(tenant: TenantContext, page: number, pageSize: number, email?: string) { return this.database.withTenantTransaction(tenant, (client) => this.repository.list(client, page, pageSize, email)); }
  findById(tenant: TenantContext, id: string) { return this.database.withTenantTransaction(tenant, (client) => this.repository.findById(client, id)); }
  create(tenant: TenantContext, data: { email: string; name: string }) { return this.database.withTenantTransaction(tenant, (client) => this.repository.create(client, data)); }
}
