import { createUserController, listUsersController } from "@/backend/api/v1/users/users.controller";
import { withApiHandler } from "@/backend/middlewares/with-api-handler";
import { connection } from "next/server";
const listHandler = withApiHandler(listUsersController);
const createHandler = withApiHandler(createUserController);
export async function GET(request: Request) { await connection(); return listHandler(request); }
export async function POST(request: Request) { await connection(); return createHandler(request); }
