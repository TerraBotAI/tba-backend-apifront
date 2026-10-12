import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Pool } from "pg";
import { TenantDatabaseService } from "@/backend/database/tenant/tenant-database.service";

const url = process.env.TEST_DATABASE_URL;
const suffix = Math.random().toString(36).slice(2, 10);
const schemaA = `client_test_a_${suffix}`;
const schemaB = `client_test_b_${suffix}`;
const quote = (identifier: string) => `\"${identifier}\"`;
const suite = describe.skipIf(!url);

suite("tenant schema isolation", () => {
  const pool = new Pool({ connectionString: url });
  const database = new TenantDatabaseService();
  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    for (const schema of [schemaA, schemaB]) {
      await pool.query(`CREATE SCHEMA ${quote(schema)}`);
      await pool.query(`CREATE TABLE ${quote(schema)}.users (email TEXT PRIMARY KEY)`);
    }
  });
  afterAll(async () => { for (const schema of [schemaA, schemaB]) await pool.query(`DROP SCHEMA IF EXISTS ${quote(schema)} CASCADE`); await pool.end(); });
  it("keeps concurrent transactions in their resolved schema", async () => {
    await Promise.all([
      database.withTenantTransaction({ id: "a", schema: schemaA }, (client) => client.query("INSERT INTO users (email) VALUES ($1)", ["a@example.test"])),
      database.withTenantTransaction({ id: "b", schema: schemaB }, (client) => client.query("INSERT INTO users (email) VALUES ($1)", ["b@example.test"])),
    ]);
    const [a, b] = await Promise.all([pool.query(`SELECT email FROM ${quote(schemaA)}.users`), pool.query(`SELECT email FROM ${quote(schemaB)}.users`)]);
    expect(a.rows).toEqual([{ email: "a@example.test" }]);
    expect(b.rows).toEqual([{ email: "b@example.test" }]);
  });
});
