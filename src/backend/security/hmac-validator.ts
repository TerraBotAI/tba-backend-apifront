import { getEnvironment } from "@/backend/config/env";
import { getPublicPrisma } from "@/backend/database/prisma/client";
import { InvalidSignatureException, TenantAccessException, UnauthorizedException } from "@/backend/exceptions/app-exception";
import { HmacService } from "./hmac.service";

export type AuthIdentity = { keyId: string; allowedTenantIds: Set<string> };
export class HmacValidator {
  async validate(request: Request): Promise<AuthIdentity> {
    const env = getEnvironment(); const timestamp = request.headers.get("x-timestamp"); const signature = request.headers.get("x-signature");
    const nonce = request.headers.get("x-nonce"); const keyId = request.headers.get("x-key-id"); const tenantId = request.headers.get("tenantid") ?? "";
    if (!timestamp || !signature || !nonce || !keyId) throw new UnauthorizedException("Missing HMAC authentication headers");
    if (keyId !== env.HMAC_KEY_ID) throw new UnauthorizedException("Unknown HMAC key");
    if (!/^\d{10,13}$/.test(timestamp) || !/^[A-Za-z0-9_-]{16,128}$/.test(nonce)) throw new InvalidSignatureException();
    const epoch = Number(timestamp.length === 13 ? timestamp.slice(0, -3) : timestamp);
    if (Math.abs(Math.floor(Date.now() / 1000) - epoch) > env.HMAC_TIMESTAMP_TOLERANCE_SECONDS) throw new InvalidSignatureException("Expired request signature");
    const url = new URL(request.url); const body = await request.clone().text();
    if (!new HmacService().verify({ method: request.method, pathname: url.pathname, search: url.search, timestamp, tenantId, nonce, body }, signature)) throw new InvalidSignatureException();
    try { await getPublicPrisma().hmacNonce.create({ data: { keyId, nonce, expiresAt: new Date((epoch + env.HMAC_TIMESTAMP_TOLERANCE_SECONDS) * 1000) } }); }
    catch { throw new InvalidSignatureException("Replayed request"); }
    return { keyId, allowedTenantIds: new Set(env.HMAC_ALLOWED_TENANT_IDS.split(",").map((value) => value.trim())) };
  }
  assertTenantAccess(identity: AuthIdentity, tenantId: string | null) { if (!identity.allowedTenantIds.has(tenantId ?? "public")) throw new TenantAccessException(); }
}
