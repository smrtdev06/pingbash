-- IP Timeout tracking table for anonymous users
-- This table tracks IP addresses that are temporarily restricted from groups

DROP TABLE IF EXISTS "public"."ip_timeouts";
CREATE TABLE "public"."ip_timeouts" (
  "id" SERIAL PRIMARY KEY,
  "group_id" int4 NOT NULL,
  "ip_address" inet NOT NULL,
  "timeout_by" int4 NOT NULL,
  "timeout_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "expires_at" timestamp NOT NULL,
  "reason" varchar(500) DEFAULT 'Temporarily restricted by moderator',
  "is_active" boolean DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX "idx_ip_timeouts_group_id" ON "public"."ip_timeouts" ("group_id");
CREATE INDEX "idx_ip_timeouts_ip_address" ON "public"."ip_timeouts" ("ip_address");
CREATE INDEX "idx_ip_timeouts_active" ON "public"."ip_timeouts" ("is_active") WHERE "is_active" = true;
CREATE INDEX "idx_ip_timeouts_expires_at" ON "public"."ip_timeouts" ("expires_at");

-- Prevent duplicate active timeouts for same IP/group combination
ALTER TABLE "public"."ip_timeouts" 
ADD CONSTRAINT "unique_ip_group_timeout" UNIQUE ("group_id", "ip_address", "is_active");

-- Add foreign key constraints
ALTER TABLE "public"."ip_timeouts" 
ADD CONSTRAINT "fk_ip_timeouts_group" FOREIGN KEY ("group_id") REFERENCES "public"."groups" ("id") ON DELETE CASCADE;

ALTER TABLE "public"."ip_timeouts" 
ADD CONSTRAINT "fk_ip_timeouts_timeout_by" FOREIGN KEY ("timeout_by") REFERENCES "public"."Users" ("Id") ON DELETE CASCADE;

-- Add comments for documentation
COMMENT ON TABLE "public"."ip_timeouts" IS 'Tracks IP addresses temporarily restricted from groups';
COMMENT ON COLUMN "public"."ip_timeouts"."group_id" IS 'ID of the group where timeout applies';
COMMENT ON COLUMN "public"."ip_timeouts"."ip_address" IS 'IP address that is timed out';
COMMENT ON COLUMN "public"."ip_timeouts"."timeout_by" IS 'ID of user who issued the timeout';
COMMENT ON COLUMN "public"."ip_timeouts"."expires_at" IS 'When the timeout expires';
COMMENT ON COLUMN "public"."ip_timeouts"."is_active" IS 'Whether the timeout is currently active';

-- Create a function to automatically clean up expired timeouts
CREATE OR REPLACE FUNCTION cleanup_expired_ip_timeouts()
RETURNS void AS $$
BEGIN
    UPDATE ip_timeouts 
    SET is_active = false 
    WHERE is_active = true AND expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql; 