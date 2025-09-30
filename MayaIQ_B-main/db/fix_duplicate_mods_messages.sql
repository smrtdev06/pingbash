-- Fix duplicate mods messages in the database
-- This script removes duplicate mods messages created by the old logic
-- and keeps only one message per sender/content/timestamp combination

-- Step 1: Update old mods messages to have receiver_id = null (like new format)
UPDATE "Messages"
SET "Receiver_Id" = NULL
WHERE "message_mode" = 2 
  AND "Receiver_Id" IS NOT NULL;

-- Step 2: Delete duplicate mods messages (keep the one with lowest Id)
DELETE FROM "Messages" m1
USING "Messages" m2
WHERE m1."message_mode" = 2 
  AND m2."message_mode" = 2
  AND m1."Sender_Id" = m2."Sender_Id"
  AND m1."Content" = m2."Content"
  AND m1."group_id" = m2."group_id"
  AND ABS(EXTRACT(EPOCH FROM (m1."Send_Time" - m2."Send_Time"))) < 1  -- Same second
  AND m1."Id" > m2."Id";  -- Keep the first one, delete others

-- Verify the fix
SELECT COUNT(*) as "Mods Messages Count" 
FROM "Messages" 
WHERE "message_mode" = 2; 