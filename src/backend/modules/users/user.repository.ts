import type { PoolClient } from "pg";
import { randomUUID } from "node:crypto";
import { ConflictException, NotFoundException } from "@/backend/exceptions/app-exception";
export type User = { id: string; email: string; name: string; createdAt: Date };
function map(row: { id: string; email: string; name: string; created_at: Date }): User { return { id: row.id, email: row.email, name: row.name, createdAt: row.created_at }; }
export class UserRepository {
  async list(client: PoolClient, page: number, pageSize: number, email?: string) {
    const where = email ? "WHERE email = $1" : ""; const values = email ? [email, pageSize, (page - 1) * pageSize] : [pageSize, (page - 1) * pageSize];
    const offsetIndex = email ? 3 : 2; const total = await client.query<{ count: string }>(`SELECT count(*) FROM users ${where}`, email ? [email] : []);
    const rows = await client.query<{ id: string; email: string; name: string; created_at: Date }>(`SELECT id, email, name, created_at FROM users ${where} ORDER BY created_at DESC LIMIT $${offsetIndex - 1} OFFSET $${offsetIndex}`, values);
    return { users: rows.rows.map(map), total: Number(total.rows[0].count) };
  }
  async findById(client: PoolClient, id: string) { const result = await client.query<{ id: string; email: string; name: string; created_at: Date }>("SELECT id, email, name, created_at FROM users WHERE id = $1", [id]); if (!result.rows[0]) throw new NotFoundException("User not found"); return map(result.rows[0]); }
  async create(client: PoolClient, data: { email: string; name: string }) {
    try { const result = await client.query<{ id: string; email: string; name: string; created_at: Date }>("INSERT INTO users (id, email, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at", [randomUUID(), data.email, data.name]); return map(result.rows[0]); }
    catch (error) { if (typeof error === "object" && error && "code" in error && error.code === "23505") throw new ConflictException("A user with this email already exists"); throw error; }
  }
}
