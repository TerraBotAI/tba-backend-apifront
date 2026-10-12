import { success } from "@/backend/helpers/http-response";
export async function healthController() { return success({ status: "ok", timestamp: new Date().toISOString() }); }
