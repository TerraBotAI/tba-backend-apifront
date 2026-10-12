import "dotenv/config";
import { Pool } from "pg";
const tenantId = process.argv[2];
if (!tenantId || !/^[a-zA-Z0-9_-]{1,64}$/.test(tenantId)) throw new Error("Usage: npm run db:provision-tenant -- <tenant-id>");
const schema = `client_${tenantId.replace(/-/g, "_")}`;
const quote = (identifier: string) => `\"${identifier.replaceAll("\"", "\"\"")}\"`;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
try {
  await pool.query("BEGIN"); await pool.query(`CREATE SCHEMA IF NOT EXISTS ${quote(schema)}`);
  await pool.query(`CREATE TABLE IF NOT EXISTS ${quote(schema)}.users (id UUID PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`);
  await pool.query("INSERT INTO public.tenants (id, schema, active) VALUES ($1, $2, true) ON CONFLICT (id) DO UPDATE SET schema = EXCLUDED.schema, active = true", [tenantId, schema]); await pool.query("COMMIT");
} catch (error) { await pool.query("ROLLBACK"); throw error; } finally { await pool.end(); }
