import { healthController } from "@/backend/api/v1/health/health.controller";
import { withApiHandler } from "@/backend/middlewares/with-api-handler";
import { connection } from "next/server";
const handler = withApiHandler(healthController, { hmac: false });
export async function GET(request: Request) { await connection(); return handler(request); }
