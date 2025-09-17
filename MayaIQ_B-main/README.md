# MayaIQ Backend

For the Database.

groups:
- post_level:  0, null - Anyone, 1 - Verified users, 2 - Admin & Mods
- url_level:   0, null - Everyone,  1 - Admin & Mods
- slow_mode:   true or false
- slow_time:   number

group_users:  for moderators
- role_id:  0, null - users, 1 - Admin. 2-moderators
- chat_limit:   Only Moderators:  true or false
- manage_mods: Only Moderators:  true or false
- manage_chat:  Only Moderators:  true or false
- manage_censored:  Only Moderators:  true or false
- ban_user:  Only Moderators:  true or false

block_users:  For blocked users of group.
- user_id:  loggedin user
- group_id: selected group id
- block_id: blocked user id by loggedin user for selected group
 * This table rows shuold be unique by user_id, group_id and block_id
 So should run this sql first
  ALTER TABLE block_users
    ADD CONSTRAINT unique_user_group_block UNIQUE (user_id, group_id, block_id);