import { getUserController } from "@/backend/api/v1/users/users.controller";
import { withApiHandler } from "@/backend/middlewares/with-api-handler";
import { connection } from "next/server";
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  return withApiHandler((innerRequest, context) => getUserController(innerRequest, context, id))(request);
}
