-- IP Ban tracking table for group chat system
-- This table tracks IP addresses that are banned from groups

DROP TABLE IF EXISTS "public"."ip_bans";
CREATE TABLE "public"."ip_bans" (
  "id" SERIAL PRIMARY KEY,
  "group_id" int4 NOT NULL,
  "user_id" int4 NOT NULL,
  "ip_address" inet NOT NULL,
  "banned_by" int4 NOT NULL,
  "banned_at" timestamp DEFAULT CURRENT_TIMESTAMP,
  "reason" varchar(500) DEFAULT 'Banned by moderator',
  "is_active" boolean DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX "idx_ip_bans_group_id" ON "public"."ip_bans" ("group_id");
CREATE INDEX "idx_ip_bans_ip_address" ON "public"."ip_bans" ("ip_address");
CREATE INDEX "idx_ip_bans_user_id" ON "public"."ip_bans" ("user_id");
CREATE INDEX "idx_ip_bans_active" ON "public"."ip_bans" ("is_active") WHERE "is_active" = true;

-- Prevent duplicate bans for same IP/group combination
ALTER TABLE "public"."ip_bans" 
ADD CONSTRAINT "unique_ip_group_ban" UNIQUE ("group_id", "ip_address", "is_active");

-- Add foreign key constraints
ALTER TABLE "public"."ip_bans" 
ADD CONSTRAINT "fk_ip_bans_group" FOREIGN KEY ("group_id") REFERENCES "public"."groups" ("id") ON DELETE CASCADE;

ALTER TABLE "public"."ip_bans" 
ADD CONSTRAINT "fk_ip_bans_user" FOREIGN KEY ("user_id") REFERENCES "public"."Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "public"."ip_bans" 
ADD CONSTRAINT "fk_ip_bans_banned_by" FOREIGN KEY ("banned_by") REFERENCES "public"."Users" ("Id") ON DELETE CASCADE;

-- Add comments for documentation
COMMENT ON TABLE "public"."ip_bans" IS 'Tracks IP addresses banned from groups';
COMMENT ON COLUMN "public"."ip_bans"."group_id" IS 'ID of the group where ban applies';
COMMENT ON COLUMN "public"."ip_bans"."user_id" IS 'ID of the user who was banned';
COMMENT ON COLUMN "public"."ip_bans"."ip_address" IS 'IP address that is banned';
COMMENT ON COLUMN "public"."ip_bans"."banned_by" IS 'ID of user who issued the ban';
COMMENT ON COLUMN "public"."ip_bans"."is_active" IS 'Whether the ban is currently active'; 