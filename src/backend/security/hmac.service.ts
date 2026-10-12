import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { getEnvironment } from "@/backend/config/env";

export type HmacInput = { method: string; pathname: string; search: string; timestamp: string; tenantId: string; nonce: string; body: string };
export function canonicalize(input: HmacInput) {
  const query = new URLSearchParams(input.search); query.sort();
  const bodyHash = createHash("sha256").update(input.body).digest("hex");
  return [input.method.toUpperCase(), input.pathname, query.toString(), input.timestamp, input.tenantId, input.nonce, bodyHash].join("\n");
}
export class HmacService {
  sign(input: HmacInput) { return createHmac("sha256", getEnvironment().HMAC_SECRET).update(canonicalize(input)).digest("hex"); }
  verify(input: HmacInput, signature: string) {
    const expected = Buffer.from(this.sign(input), "hex"); const supplied = Buffer.from(signature, "hex");
    return expected.length === supplied.length && timingSafeEqual(expected, supplied);
  }
}
