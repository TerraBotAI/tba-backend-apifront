import { z } from "zod";
import { getPublicPrisma } from "@/backend/database/prisma/client";
import { TenantNotFoundException, ValidationException } from "@/backend/exceptions/app-exception";

const tenantIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/);
export type TenantContext = { id: string; schema: string } | null;

export class TenantResolver {
  async resolve(headerValue: string | null): Promise<TenantContext> {
    if (!headerValue) return null;
    const parsed = tenantIdSchema.safeParse(headerValue);
    if (!parsed.success) throw new ValidationException("Invalid tenantid header", parsed.error.flatten());
    const tenant = await getPublicPrisma().tenant.findUnique({ where: { id: parsed.data } });
    if (!tenant || !tenant.active) throw new TenantNotFoundException();
    if (!/^client_[a-zA-Z0-9_]+$/.test(tenant.schema)) throw new TenantNotFoundException();
    return { id: tenant.id, schema: tenant.schema };
  }
}
