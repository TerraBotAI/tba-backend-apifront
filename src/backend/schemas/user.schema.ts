import { z } from "zod";
export const userIdSchema = z.object({ id: z.string().uuid() });
export const createUserSchema = z.object({ email: z.string().email().max(320), name: z.string().trim().min(1).max(120) });
export const paginationSchema = z.object({ page: z.coerce.number().int().positive().default(1), pageSize: z.coerce.number().int().min(1).max(100).default(20), email: z.string().email().optional() });
