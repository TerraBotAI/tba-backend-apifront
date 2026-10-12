CREATE TABLE "tenants" ("id" TEXT NOT NULL, "schema" TEXT NOT NULL, "active" BOOLEAN NOT NULL DEFAULT true, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "tenants_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX "tenants_schema_key" ON "tenants"("schema");
CREATE TABLE "hmac_nonces" ("key_id" TEXT NOT NULL, "nonce" TEXT NOT NULL, "expires_at" TIMESTAMP(3) NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "hmac_nonces_pkey" PRIMARY KEY ("key_id", "nonce"));
CREATE INDEX "hmac_nonces_expires_at_idx" ON "hmac_nonces"("expires_at");
