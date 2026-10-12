import { Prisma } from "@/generated/prisma/client";
import { ZodError } from "zod";
import { AppException, DatabaseException, InternalServerException, ValidationException } from "@/backend/exceptions/app-exception";
import { logger } from "@/backend/utils/logger";
import { TenantResolver, type TenantContext } from "@/backend/database/tenant/tenant-resolver";
import { HmacValidator, type AuthIdentity } from "@/backend/security/hmac-validator";
import { NextResponse } from "next/server";

export type ApiContext = { requestId: string; tenant: TenantContext; identity?: AuthIdentity };
type Controller = (request: Request, context: ApiContext) => Promise<Response>;
export function withApiHandler(controller: Controller, options: { hmac?: boolean } = { hmac: true }) {
  return async (request: Request): Promise<Response> => {
    const requestId = crypto.randomUUID();
    try {
      let identity: AuthIdentity | undefined;
      if (options.hmac !== false) identity = await new HmacValidator().validate(request);
      const tenant = await new TenantResolver().resolve(request.headers.get("tenantid"));
      if (identity) new HmacValidator().assertTenantAccess(identity, tenant?.id ?? null);
      const response = await controller(request, { requestId, tenant, identity }); response.headers.set("x-request-id", requestId); return response;
    } catch (error) {
      const normalized = error instanceof ZodError ? new ValidationException("Validation failed", error.flatten()) : error instanceof Prisma.PrismaClientKnownRequestError ? new DatabaseException("Database operation failed") : error instanceof AppException ? error : new InternalServerException();
      logger.error("request_failed", { requestId, code: normalized.code, statusCode: normalized.statusCode, message: normalized.message, stack: process.env.NODE_ENV === "production" ? undefined : normalized.stack });
      return NextResponse.json({ success: false, error: { code: normalized.code, message: normalized.message, details: normalized.details } }, { status: normalized.statusCode, headers: { "x-request-id": requestId } });
    }
  };
}
