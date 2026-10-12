import { z } from "zod";
const environmentSchema = z.object({ DATABASE_URL: z.string().url(), HMAC_SECRET: z.string().min(32), HMAC_KEY_ID: z.string().min(1).max(128), HMAC_ALLOWED_TENANT_IDS: z.string().min(1), HMAC_TIMESTAMP_TOLERANCE_SECONDS: z.coerce.number().int().positive().default(300), NODE_ENV: z.enum(["development", "test", "production"]).default("development") });
export type Environment = z.infer<typeof environmentSchema>;
let cachedEnvironment: Environment | undefined;
export function getEnvironment(): Environment { if (!cachedEnvironment) cachedEnvironment = environmentSchema.parse(process.env); return cachedEnvironment; }
