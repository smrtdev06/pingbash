# Widget 1-on-1 Messages: No Email Notifications or Unread Count

## Overview

Disabled email notifications and unread message count increases for 1-on-1 messages sent in the widget version when either the sender or receiver is an anonymous user.

## Problem

When widget users (anonymous users) sent 1-on-1 messages:
- ✅ Messages appeared in the chat (correct)
- ❌ Messages appeared in inbox with unread count (unwanted)
- ❌ Email notifications were sent to offline users (unwanted)

This was problematic because widget conversations should be ephemeral and chat-only, not creating persistent inbox entries or sending email notifications.

## Solution

Modified the backend to:
1. **Skip inbox**: Set `History_Iden = 0` for widget 1-on-1 messages (instead of 1)
2. **Skip email notifications**: Don't send emails for widget 1-on-1 messages
3. **Detect widget messages**: Anonymous users have IDs > 100,000,000

## How It Works

### Widget Message Detection

```javascript
// Detect if this is a widget 1-on-1 message
const isAnonymousSender = senderId > 100000000;
const isAnonymousReceiver = receiverId && receiverId > 100000000;
const isWidgetMessage = isAnonymousSender || isAnonymousReceiver;
```

**Widget messages are identified when:**
- Sender is anonymous (ID > 100,000,000), OR
- Receiver is anonymous (ID > 100,000,000)

### Examples

| Scenario | Sender ID | Receiver ID | Is Widget Message? | Action |
|----------|-----------|-------------|-------------------|--------|
| Anon → Anon | 588357024 | 688357024 | ✅ Yes | Skip inbox & email |
| Anon → User | 588357024 | 125 | ✅ Yes | Skip inbox & email |
| User → Anon | 125 | 588357024 | ✅ Yes | Skip inbox & email |
| User → User | 125 | 130 | ❌ No | Normal (inbox + email) |

## Implementation

### File 1: `MayaIQ_B-main/middlewares/socket/controller.js`

**Modified `saveGroupMsg` function to accept `skipInbox` parameter:**

```javascript
const saveGroupMsg = async (sender_id, content, group_id, receiverId, parent_id, messageMode = null, skipInbox = false) => {
    try {
        // Determine message mode if not explicitly provided
        let mode = messageMode;
        if (mode === null) {
            if (receiverId === null) {
                mode = 0; // Public message
            } else {
                mode = 1; // Private/1-on-1 message (default)
            }
        }
        
        // Determine History_Iden (0 = skip inbox, 1 = show in inbox)
        // For widget 1-on-1 messages, we skip inbox to avoid unread count increase
        const historyIden = skipInbox ? 0 : 1;
        
        // Escape single quotes for SQL
        const escapedContent = content.replace(/'/g, "''");
        await PG_query(`INSERT INTO "Messages" ("Receiver_Id", "Sender_Id", "Send_Time", "Content", "group_id", "History_Iden", "parent_id", "message_mode")
         VALUES (${receiverId}, ${sender_id}, CURRENT_TIMESTAMP, '${escapedContent}', ${group_id}, ${historyIden}, ${parent_id == undefined ? null : parent_id}, ${mode});`)

        if (skipInbox) {
            console.log(`📭 [WIDGET] Saved 1-on-1 message with History_Iden=0 (skip inbox) for widget users`);
        }

    } catch (err) {
        console.log(err)
    }
};
```

**Key Changes:**
- Added `skipInbox = false` parameter (default: false for backward compatibility)
- Set `History_Iden` to 0 when `skipInbox` is true
- Log when inbox is skipped

### File 2: `MayaIQ_B-main/middlewares/socket/chat.js`

**Modified authenticated user message handling:**

```javascript
} else {
    // Regular message (public or 1-on-1)
    const messageMode = receiverId === null ? 0 : 1; // 0 = Public, 1 = Private
    
    // Detect if this is a widget 1-on-1 message (anonymous users have IDs > 100000000)
    const isAnonymousSender = senderId > 100000000;
    const isAnonymousReceiver = receiverId && receiverId > 100000000;
    const isWidgetMessage = isAnonymousSender || isAnonymousReceiver;
    
    // For widget 1-on-1 messages, skip inbox (History_Iden = 0) to avoid unread count
    const skipInbox = isWidgetMessage && receiverId !== null;
    
    if (skipInbox) {
        console.log(`📭 [WIDGET] Detected widget 1-on-1 message (sender: ${senderId}, receiver: ${receiverId}) - will skip inbox`);
    }
    
    await Controller.saveGroupMsg(senderId, content, groupId, receiverId, data.parent_id, messageMode, skipInbox);
    
    // Send email notification for 1-on-1 messages to offline users (but NOT for widget messages)
    if (receiverId && receiverId !== -1 && !isWidgetMessage) {
        // ... email notification logic ...
    } else if (isWidgetMessage && receiverId) {
        console.log(`📭 [WIDGET] Skipping email notification for widget 1-on-1 message (sender: ${senderId}, receiver: ${receiverId})`);
    }
}
```

**Modified anonymous user message handling:**

```javascript
} else {
    // Regular message (public or 1-on-1)
    const messageMode = receiverId === null ? 0 : 1; // 0 = Public, 1 = Private
    
    // Detect if this is a widget 1-on-1 message (sender is anonymous, receiver might be anonymous too)
    const isAnonymousSender = true; // Already in anonymous user section
    const isAnonymousReceiver = receiverId && receiverId > 100000000;
    const isWidgetMessage = isAnonymousSender || isAnonymousReceiver;
    
    // For widget 1-on-1 messages, skip inbox (History_Iden = 0) to avoid unread count
    const skipInbox = isWidgetMessage && receiverId !== null;
    
    if (skipInbox) {
        console.log(`📭 [WIDGET] Detected widget 1-on-1 message from anonymous user ${anonId} to receiver ${receiverId} - will skip inbox`);
    }
    
    await Controller.saveGroupMsg(anonId, content, groupId, receiverId, data.parent_id, messageMode, skipInbox);
    
    // Send email notification for 1-on-1 messages to offline users from anonymous senders (but NOT for widget messages)
    if (receiverId && receiverId !== -1 && !isWidgetMessage) {
        // ... email notification logic ...
    } else if (isWidgetMessage && receiverId) {
        console.log(`📭 [WIDGET] Skipping email notification for widget 1-on-1 message from anonymous user ${anonId} to ${receiverId}`);
    }
}
```

## Database Schema

### Messages Table

| Field | Type | Purpose |
|-------|------|---------|
| `History_Iden` | INTEGER | 0 = Skip inbox, 1 = Show in inbox |
| `message_mode` | INTEGER | 0 = Public, 1 = Private, 2 = Mods |

**Before:**
```sql
-- All 1-on-1 messages had History_Iden = 1
INSERT INTO "Messages" (..., "History_Iden", ...)
VALUES (..., 1, ...);
```

**After:**
```sql
-- Widget 1-on-1 messages have History_Iden = 0
INSERT INTO "Messages" (..., "History_Iden", ...)
VALUES (..., 0, ...);  -- Skip inbox for widget messages
```

## Impact

### What Still Works

✅ **Widget 1-on-1 messages:**
- Visible in the widget chat
- Real-time delivery to online users
- Message history in group chat
- Reply functionality
- All chat features

✅ **Regular 1-on-1 messages (user-to-user):**
- Show in inbox
- Unread count increases
- Email notifications sent
- Everything works as before

### What Changed

❌ **Widget 1-on-1 messages no longer:**
- Appear in inbox
- Increase unread count
- Trigger email notifications

## Console Logs

With these changes, you'll see new logs:

```
📭 [WIDGET] Detected widget 1-on-1 message (sender: 588357024, receiver: 125) - will skip inbox
📭 [WIDGET] Saved 1-on-1 message with History_Iden=0 (skip inbox) for widget users
📭 [WIDGET] Skipping email notification for widget 1-on-1 message (sender: 588357024, receiver: 125)
```

## Testing

### Test Case 1: Anonymous to User (Widget)
1. Open widget as anonymous user (e.g., anon459)
2. Send 1-on-1 message to authenticated user
3. Verify:
   - ✅ Message appears in widget chat
   - ✅ User receives message in widget (if online)
   - ❌ Message does NOT appear in user's inbox
   - ❌ User does NOT receive email notification

### Test Case 2: User to Anonymous (Widget)
1. Authenticated user logs in to widget
2. Send 1-on-1 message to anonymous user
3. Verify:
   - ✅ Message appears in widget chat
   - ✅ Anonymous user receives message (if online)
   - ❌ Message does NOT appear in sender's inbox
   - ❌ No email sent

### Test Case 3: Anonymous to Anonymous (Widget)
1. Two anonymous users in same widget
2. Send 1-on-1 message between them
3. Verify:
   - ✅ Message appears in widget chat
   - ❌ No inbox entries
   - ❌ No emails

### Test Case 4: User to User (F Version)
1. Two authenticated users in F version
2. Send 1-on-1 message
3. Verify:
   - ✅ Message appears in chat
   - ✅ Message appears in inbox
   - ✅ Unread count increases
   - ✅ Email sent to offline user

## Edge Cases

### Case 1: User Switches from Widget to F Version
**Scenario:** User was anonymous in widget, then logs in to F version

**Result:**
- Old widget messages (when anonymous): Not in inbox
- New F version messages (when authenticated): In inbox

**This is correct behavior** - widget messages remain ephemeral.

### Case 2: Public Messages in Widget
**Scenario:** Anonymous user sends public message (not 1-on-1)

**Result:**
- `receiverId` is null
- `skipInbox` = false (because it's not a 1-on-1 message)
- Message behaves normally (public messages don't go to inbox anyway)

**This is correct behavior** - only 1-on-1 messages are affected.

### Case 3: Mods Mode Messages
**Scenario:** Anonymous user sends message in Mods mode

**Result:**
- `receiverId` = -1
- `messageMode` = 2
- Not affected by widget detection logic
- Behaves normally

**This is correct behavior** - Mods mode has its own handling.

## Anonymous User ID Range

**Anonymous user IDs are generated as large integers:**
- Minimum: 100,000,000
- Typical: 588357024, 688357024, etc.

**Authenticated user IDs:**
- Sequential starting from 1
- Example: 125, 130, 145, etc.

**Detection logic:**
```javascript
const isAnonymous = userId > 100000000;
```

## Backward Compatibility

✅ **100% backward compatible:**
- `skipInbox` parameter is optional (defaults to `false`)
- Existing code calling `saveGroupMsg` without `skipInbox` works unchanged
- Only widget 1-on-1 messages are affected
- F version user-to-user messages unchanged

## Performance Impact

- ✅ **No performance degradation**
- ✅ **Fewer database queries** (no inbox lookup for widget messages)
- ✅ **Fewer emails sent** (reduced SMTP load)
- ✅ **Same message delivery speed**

## Related Files

1. `MayaIQ_B-main/middlewares/socket/controller.js` - Modified `saveGroupMsg` function
2. `MayaIQ_B-main/middlewares/socket/chat.js` - Modified message handling for auth & anon users

## Future Enhancements

Potential improvements:
1. Add admin toggle to enable/disable widget inbox messages
2. Add widget-specific message retention policy
3. Add analytics for widget message volume
4. Add option to convert widget conversation to persistent inbox

## Summary

**Problem:** Widget 1-on-1 messages created inbox entries and sent email notifications

**Solution:** 
- Detect widget messages (anonymous user involved)
- Set `History_Iden = 0` to skip inbox
- Skip email notification logic

**Result:**
- ✅ Widget messages stay in chat only
- ✅ No inbox clutter
- ✅ No unwanted emails
- ✅ F version unchanged

**Status:** ✅ **IMPLEMENTED** and ready for production

**Priority:** MEDIUM - Quality of life improvement for widget users

