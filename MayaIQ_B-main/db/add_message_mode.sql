
ALTER TABLE "public"."Messages" 
ADD COLUMN "message_mode" int2 DEFAULT 0;

UPDATE "public"."Messages" 
SET "message_mode" = 0 
WHERE "Receiver_Id" IS NULL;

UPDATE "public"."Messages" 
SET "message_mode" = 1 
WHERE "Receiver_Id" IS NOT NULL AND "group_id" IS NOT NULL;

CREATE INDEX idx_messages_mode ON "public"."Messages" ("message_mode");
CREATE INDEX idx_messages_group_mode ON "public"."Messages" ("group_id", "message_mode"); 