import { success } from "@/backend/helpers/http-response";
import { createUserSchema, paginationSchema, userIdSchema } from "@/backend/schemas/user.schema";
import { UserService } from "@/backend/modules/users/user.service";
import type { ApiContext } from "@/backend/middlewares/with-api-handler";
const service = new UserService();
export async function listUsersController(request: Request, context: ApiContext) { const query = paginationSchema.parse(Object.fromEntries(new URL(request.url).searchParams)); const result = await service.list(context.tenant, query.page, query.pageSize, query.email); return success(result.users, { page: query.page, pageSize: query.pageSize, total: result.total }); }
export async function getUserController(_request: Request, context: ApiContext, rawId: string) { const { id } = userIdSchema.parse({ id: rawId }); return success(await service.findById(context.tenant, id)); }
export async function createUserController(request: Request, context: ApiContext) { const body = createUserSchema.parse(await request.json()); return success(await service.create(context.tenant, body), undefined, 201); }
