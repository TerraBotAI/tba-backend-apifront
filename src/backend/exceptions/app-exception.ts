export class AppException extends Error {
  constructor(message: string, public readonly statusCode: number, public readonly code: string, public readonly details: unknown = null, public readonly isOperational = true, options?: ErrorOptions) { super(message, options); this.name = new.target.name; }
}
class HttpException extends AppException { constructor(message: string, statusCode: number, code: string, details?: unknown) { super(message, statusCode, code, details); } }
export class BadRequestException extends HttpException { constructor(message = "Bad request", details?: unknown) { super(message, 400, "BAD_REQUEST", details); } }
export class UnauthorizedException extends HttpException { constructor(message = "Unauthorized", details?: unknown) { super(message, 401, "UNAUTHORIZED", details); } }
export class ForbiddenException extends HttpException { constructor(message = "Forbidden", details?: unknown) { super(message, 403, "FORBIDDEN", details); } }
export class NotFoundException extends HttpException { constructor(message = "Resource not found", details?: unknown) { super(message, 404, "RESOURCE_NOT_FOUND", details); } }
export class ConflictException extends HttpException { constructor(message = "Conflict", details?: unknown) { super(message, 409, "CONFLICT", details); } }
export class ValidationException extends HttpException { constructor(message = "Validation failed", details?: unknown) { super(message, 422, "VALIDATION_ERROR", details); } }
export class TenantNotFoundException extends HttpException { constructor(message = "Tenant not found") { super(message, 404, "TENANT_NOT_FOUND"); } }
export class TenantAccessException extends HttpException { constructor(message = "Tenant access denied") { super(message, 403, "TENANT_ACCESS_DENIED"); } }
export class InvalidSignatureException extends HttpException { constructor(message = "Invalid request signature") { super(message, 401, "INVALID_SIGNATURE"); } }
export class DatabaseException extends HttpException { constructor(message = "Database operation failed", details?: unknown, options?: ErrorOptions) { super(message, 500, "DATABASE_ERROR", details); if (options?.cause) this.cause = options.cause; } }
export class InternalServerException extends HttpException { constructor(message = "Internal server error") { super(message, 500, "INTERNAL_SERVER_ERROR"); } }
