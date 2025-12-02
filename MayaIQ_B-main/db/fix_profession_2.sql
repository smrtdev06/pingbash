-- Fix users who have "2" as their Profession (from old default value)
-- Update them to have empty string instead

UPDATE "public"."Users" 
SET "Profession" = '' 
WHERE "Profession" = '2';

-- Verification query to check the fix
SELECT COUNT(*) as users_with_2 FROM "public"."Users" WHERE "Profession" = '2';
-- This should return 0 after running the update

