-- Migration to add chat rules functionality to groups table
-- Run this SQL script to add chat rules support

-- Add chat_rules column to store the rules text
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS chat_rules TEXT DEFAULT '';

-- Add show_chat_rules column to control visibility
ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS show_chat_rules BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN groups.chat_rules IS 'Text content of the chat rules for the group';
COMMENT ON COLUMN groups.show_chat_rules IS 'Whether to display chat rules to users joining the group';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_groups_show_chat_rules ON groups(show_chat_rules) WHERE show_chat_rules = true; 