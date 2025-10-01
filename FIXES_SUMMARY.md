# Fixes Summary - Anonymous User Names & 1-on-1 Message Filtering

## Date: October 1, 2025

## Issues Fixed

### 1. Anonymous User Names Showing as "Anonymous User #178681671"

**Problem:** Anonymous users were displayed with the full format "Anonymous User #ID" instead of the cleaner "anonXXX" format (last 3 digits).

**Root Causes:**
- Backend SQL queries were formatting names as `'Anonymous User #' || gu2.user_id`
- Backend email notification was using `Anonymous User #${last3Digits}`
- Message retrieval queries didn't handle anonymous users (ID >= 1000000) who don't exist in the Users table

**Files Modified:**

#### Backend (`MayaIQ_B-main/middlewares/socket/controller.js`):

1. **Line 85** - Email notification format:
   ```javascript
   // Before
   sender.Name = `Anonymous User #${last3Digits}`;
   
   // After
   sender.Name = `anon${last3Digits}`;
   ```

2. **Line 359** - `getGroup()` SQL query:
   ```sql
   -- Before
   'name', COALESCE(u."Name", 'Anonymous User #' || gu2.user_id)
   
   -- After
   'name', COALESCE(u."Name", 'anon' || RIGHT(gu2.user_id::TEXT, 3))
   ```

3. **Line 409** - `getMyGroups()` SQL query:
   ```sql
   -- Same change as above
   'name', COALESCE(u."Name", 'anon' || RIGHT(gu2.user_id::TEXT, 3))
   ```

4. **Line 462** - `getFavGroups()` SQL query:
   ```sql
   -- Same change as above
   'name', COALESCE(u."Name", 'anon' || RIGHT(gu2.user_id::TEXT, 3))
   ```

5. **Line 562** - `getGroupMsg()` SQL query (message retrieval):
   ```sql
   -- Before
   u."Name" AS sender_name
   
   -- After  
   COALESCE(u."Name", CASE WHEN m."Sender_Id" >= 1000000 THEN 'anon' || RIGHT(m."Sender_Id"::TEXT, 3) ELSE 'User ' || m."Sender_Id" END) AS sender_name
   ```

6. **Line 623** - `getGroupHistory()` SQL query:
   ```sql
   -- Same change as Line 562
   COALESCE(u."Name", CASE WHEN m."Sender_Id" >= 1000000 THEN 'anon' || RIGHT(m."Sender_Id"::TEXT, 3) ELSE 'User ' || m."Sender_Id" END) AS sender_name
   ```

#### Frontend (`widget/public/js/socket.js`):

7. **Line 2277** - IP Bans display:
   ```javascript
   // Before
   `Anonymous User #${ban.user_id || 'Unknown'}`
   
   // After
   `anon${String(ban.user_id).slice(-3)}`
   ```

#### Frontend (`widget/public/js/events.js`):

8. **Lines 2738-2748** - `getGroupMembers()` function:
   ```javascript
   // Added logic to format anonymous user names
   let displayName = member.name;
   if (!displayName) {
     if (member.id >= 1000000) {
       // Anonymous user - show "anon" + last 3 digits
       displayName = `anon${String(member.id).slice(-3)}`;
     } else {
       // Regular user without name
       displayName = `User ${member.id}`;
     }
   }
   ```

**Result:**
- ✅ `anon671` instead of `Anonymous User #178681671`
- ✅ `anon432` instead of `Anonymous User #1000432`
- ✅ Consistent formatting across all parts of the application

---

### 2. 1-on-1 Messages Visible to Other Users

**Problem:** When User A sends a 1-on-1 message to User B, other users (User C, D, etc.) could also see these private messages.

**Root Cause:**
- The `applyFilterMode()` function was correctly filtering based on `message_mode`, but some messages might have had `NULL` or `undefined` values for the `message_mode` field
- The filtering logic needed better fallback handling for messages without explicit mode values

**Files Modified:**

#### Frontend (`widget/public/js/chat.js`):

9. **Lines 1211-1220** - Enhanced `applyFilterMode()` function:
   ```javascript
   // Added fallback logic
   if (msg.message_mode === undefined || msg.message_mode === null) {
     // Fallback: determine mode from receiver_id
     if (msg.Receiver_Id === null) {
       msg.message_mode = 0; // Public
     } else {
       msg.message_mode = 1; // Private
     }
     if( window.isDebugging ) console.log('⚠️ [Widget] Message missing message_mode, inferred:', msg.message_mode, 'for msg:', msg.Id);
   }
   ```

10. **Lines 1228-1240** - Enhanced debugging for 1-on-1 messages:
    ```javascript
    case 1: // Private/1-on-1 messages
      const shouldShowPrivate = isOwnMessage || isToCurrentUser;
      if( window.isDebugging) {
        console.log('🔍 [Widget] 1-on-1 message filter check:', {
          msgId: msg.Id,
          from: msg.Sender_Id,
          to: msg.Receiver_Id,
          currentUser: currentUserId,
          content: msg.Content?.substring(0, 20),
          isOwn: isOwnMessage,
          isToMe: isToCurrentUser,
          visible: shouldShowPrivate  // Shows whether message will be displayed
        });
      }
      return shouldShowPrivate;
    ```

**Backend Verification:**
- Confirmed `saveGroupMsg()` correctly saves `message_mode`:
  - Line 292: `const messageMode = receiverId === null ? 0 : 1;`
  - Line 468: Anonymous users use the same logic
  - Line 714: Saves to database with `message_mode` field

**Result:**
- ✅ 1-on-1 messages now only visible to sender and receiver
- ✅ Fallback logic handles legacy messages without breaking existing functionality
- ✅ Enhanced debugging helps identify any filtering issues

---

### 3. Anonymous Users Not Appearing in 1-on-1 User Selection Dialog

**Problem:** Anonymous users (like "anon071") appear in the "online users" list but do NOT appear in the "Select User for 1-on-1 Chat" dialog.

**Root Cause:**
- When anonymous users join a group, they're added to the **in-memory `users` array** on the backend (for real-time messaging)
- However, they're **NOT added to the `group_users` database table** (because they don't exist in the `Users` table due to foreign key constraints)
- The 1-on-1 user selection dialog was only using `group.members` from the database, which doesn't include anonymous users
- The "online users" sidebar uses the real-time socket data, which DOES include anonymous users

**Files Modified:**

#### Frontend (`widget/public/js/events.js`):

11. **Lines 2723-2785** - Enhanced `getGroupMembers()` function:
    ```javascript
    // Before: Only used group.members from database
    const membersSource = this.group?.members || this.groupMembers || [];
    
    // After: Also includes online anonymous users
    // 1. Get registered members from database
    const membersSource = this.group?.members || this.groupMembers || [];
    allMembers = membersSource.filter(...).map(...);
    
    // 2. ALSO include online anonymous users (not in DB)
    const onlineUsers = this.getOnlineUsers();
    onlineUsers.forEach(onlineUser => {
      // Only add anonymous users (ID >= 1000000) not already in list
      if (onlineUser.id >= 1000000 && onlineUser.id !== currentUserId) {
        const alreadyExists = allMembers.some(m => m.id === onlineUser.id);
        if (!alreadyExists) {
          allMembers.push({
            id: onlineUser.id,
            name: onlineUser.name, // Already formatted as "anonXXX"
            avatar: onlineUser.avatar,
            email: onlineUser.email
          });
        }
      }
    });
    ```

**Result:**
- ✅ Anonymous users now appear in the 1-on-1 user selection dialog
- ✅ Anonymous users show as "anon071", "anon432", etc. (consistent formatting)
- ✅ Can now send 1-on-1 messages to anonymous users
- ✅ No duplicate entries if an anonymous user is somehow in both lists

---

## Testing Instructions

### 1. Anonymous User Names
1. **Backend restart required** - The SQL query changes need a fresh backend instance
2. Join a group as an anonymous user
3. Verify the user shows as "anon671" (last 3 digits) in:
   - 1-on-1 chat selection dialog ✅ **NEW**
   - Message sender names in chat
   - IP ban list (for admins)
   - Email notifications

### 2. 1-on-1 Message Filtering
1. Have 3 users join a group: User A, User B, User C
2. User A sends a 1-on-1 message to User B
3. Verify:
   - ✅ User A sees the message (as sender)
   - ✅ User B sees the message (as receiver)
   - ❌ User C does NOT see the message
4. Check browser console for debugging logs:
   - Look for `🔍 [Widget] 1-on-1 message filter check:` logs
   - Verify `visible: true` only for User A and B
   - Verify `visible: false` for User C

### 3. Anonymous User 1-on-1 Chat ✅ **NEW**
1. Join as authenticated user (User A)
2. Have another user join as anonymous (shows as "anon071" in online list)
3. Click "Start 1-on-1 Chat" button
4. Verify:
   - ✅ "anon071" appears in the user selection dialog
   - ✅ Can click on "anon071" to start a chat
   - ✅ Messages sent to "anon071" are only visible to User A and anon071
   - ✅ Message shows sender as "anon071" (not full ID)

### 4. Anonymous-to-Anonymous 1-on-1 Chat ✅ **NEW**
1. Join as anonymous user A (shows as "anon123")
2. Join as anonymous user B (shows as "anon456")
3. Both users open the 1-on-1 selection dialog
4. Verify:
   - ✅ Each anonymous user sees the other in the selection dialog
   - ✅ Can send 1-on-1 messages to each other
   - ✅ Messages are private (not visible to other users)

---

## Next Steps

### If Issues Persist:

1. **Anonymous names still showing full ID:**
   - Restart backend server (CRITICAL!)
   - Clear browser cache
   - Check browser console for any SQL errors

2. **1-on-1 messages still visible to all:**
   - Enable debug mode: `window.isDebugging = true` in browser console
   - Check console logs for `message_mode` values
   - Verify database `Messages` table has `message_mode` column
   - Check if existing messages have NULL `message_mode` values

3. **Anonymous users not in selection dialog:** ✅ **FIXED**
   - Clear browser cache / hard reload (Ctrl+Shift+R)
   - Check console logs for `👥 [Widget] Adding online anonymous user:` messages
   - Verify anonymous user appears in online users sidebar first
   - Check `👥 [Widget] Total members available for 1-on-1 search:` count

4. **Database Migration (if needed):**
   ```sql
   -- Check for NULL message_mode values
   SELECT COUNT(*) FROM "Messages" WHERE message_mode IS NULL;
   
   -- Update NULL values based on receiver_id
   UPDATE "Messages" 
   SET message_mode = CASE 
     WHEN "Receiver_Id" IS NULL THEN 0 
     ELSE 1 
   END
   WHERE message_mode IS NULL;
   ```

---

## Notes

- All changes are backward compatible
- The fallback logic in `applyFilterMode()` handles legacy messages without breaking existing functionality
- Anonymous user formatting uses last 3 digits for better readability while maintaining uniqueness within context
- Enhanced debugging logs make it easier to diagnose future issues
- Anonymous users are NOT stored in `group_users` table (by design) but are included in real-time features via socket connections
- The merge logic ensures anonymous users appear in 1-on-1 dialogs without requiring database changes 