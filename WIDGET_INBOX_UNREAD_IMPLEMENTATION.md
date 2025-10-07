# Widget Inbox Unread Messages Implementation

## Overview
Implemented inbox unread message tracking for the widget version, specifically for:
- **1-on-1 messages** (private messages sent directly to the user)
- **@Mention messages** (messages that mention the user by name or ID)

The unread count is displayed as a badge on the inbox icon in the hamburger menu and is tracked only when the chat dialog is closed.

## Changes Made

### 1. Widget State (`widget/public/widget.js`)

#### Added State Variables
```javascript
// Inbox unread tracking (for 1-on-1 and mentions)
this.inboxUnreadCount = 0;
this.lastSeenMessageId = null;
```

#### Added Update Methods
```javascript
// Update inbox unread count badge
this.updateInboxUnreadCount = (count) => {
  this.inboxUnreadCount = count || 0;
  const badge = this.dialog?.querySelector('.pingbash-inbox-badge');
  if (badge) {
    badge.textContent = this.inboxUnreadCount;
    if (this.inboxUnreadCount > 0) {
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
  
  // Persist to localStorage
  localStorage.setItem('pingbash_inbox_unread', this.inboxUnreadCount.toString());
};

// Clear inbox unread count
this.clearInboxUnreadCount = () => {
  this.updateInboxUnreadCount(0);
  if (this.messages && this.messages.length > 0) {
    this.lastSeenMessageId = this.messages[this.messages.length - 1].Id;
  }
};

// Load inbox unread count from localStorage
this.loadInboxUnreadCount = () => {
  const saved = localStorage.getItem('pingbash_inbox_unread');
  if (saved) {
    this.inboxUnreadCount = parseInt(saved) || 0;
    this.updateInboxUnreadCount(this.inboxUnreadCount);
  }
};
```

#### Initialize on Widget Load
```javascript
async init() {
  console.log('🚀 Initializing Pingbash Chat Widget...');
  this.createWidget();
  this.applyStyles();
  
  // Load inbox unread count from localStorage
  this.loadInboxUnreadCount();
  
  await this.loadSocketIO();
  // ... rest of init
}
```

### 2. UI - Inbox Menu Item (`widget/public/js/ui.js`)

Added inbox menu item with badge to hamburger menu:

```html
<div class="pingbash-menu-item" data-action="inbox" style="position: relative;">
  <svg viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M19,15H15A3,3 0 0,1 12,18A3,3 0 0,1 9,15H5V5H19M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
  </svg>
  Inbox
  <span class="pingbash-inbox-badge" style="display: none; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: #ff4444; color: white; border-radius: 10px; padding: 2px 6px; font-size: 11px; font-weight: bold; min-width: 18px; text-align: center;">0</span>
</div>
```

### 3. Message Tracking (`widget/public/js/chat.js`)

#### Track Unread Messages in Real-Time
Modified `handleNewMessages()` to track inbox unread when dialog is closed:

```javascript
// Track inbox unread count if dialog is closed
if (!this.isOpen && trulyNewMessages.length > 0) {
  this.trackInboxUnreadMessages(trulyNewMessages);
}
```

#### New Method - Track Inbox Unread Messages
```javascript
// NEW METHOD - Track inbox unread messages (1-on-1 and mentions)
trackInboxUnreadMessages(newMessages) {
  const currentUserId = this.getCurrentUserId();
  let unreadToAdd = 0;
  
  // Get current user name to check for mentions
  let userName = '';
  const ownMessage = this.messages?.find(m => m.Sender_Id == currentUserId && m.sender_name);
  if (ownMessage) {
    userName = ownMessage.sender_name;
  }
  
  newMessages.forEach(msg => {
    // Skip own messages
    if (msg.Sender_Id == currentUserId) return;
    
    // Check if it's a 1-on-1 message (has receiver_id and it's to current user)
    const is1on1 = msg.Receiver_Id && msg.Receiver_Id == currentUserId;
    
    // Check if it's a mention
    const content = msg.Content || '';
    const hasUsernameMention = userName && content.toLowerCase().includes(`@${userName.toLowerCase()}`);
    const hasIdMention = content.includes(`@${currentUserId}`);
    const isMention = hasUsernameMention || hasIdMention;
    
    if (is1on1 || isMention) {
      unreadToAdd++;
      if( window.isDebugging ) console.log('📬 [Widget] Inbox unread message detected:', {
        msgId: msg.Id,
        is1on1,
        isMention,
        from: msg.sender_name
      });
    }
  });
  
  if (unreadToAdd > 0) {
    this.updateInboxUnreadCount(this.inboxUnreadCount + unreadToAdd);
    if( window.isDebugging ) console.log('📬 [Widget] Added', unreadToAdd, 'to inbox unread count. Total:', this.inboxUnreadCount);
  }
}
```

### 4. Clear on Dialog Open (`widget/public/js/events.js`)

#### Clear Unread Count When Dialog Opens
```javascript
openDialog() {
  this.isOpen = true;
  this.dialog.classList.add('open');
  
  // ... existing code ...
  
  this.unreadCount = 0;
  this.updateUnreadBadge();
  
  // Clear inbox unread count when opening dialog
  this.clearInboxUnreadCount();
  
  // ... rest of method
}
```

#### Add Inbox Menu Action Handler
```javascript
handleMenuAction(action) {
  switch (action) {
    case 'inbox':
      if( window.isDebugging ) console.log('📬 [Widget] Inbox clicked - clearing unread count');
      this.clearInboxUnreadCount();
      break;
    // ... other cases
  }
}
```

## Features

### 1. Inbox Unread Tracking
- ✅ Tracks **1-on-1 messages** (messages with `Receiver_Id` set to current user)
- ✅ Tracks **@mention messages** (messages containing `@username` or `@userId`)
- ✅ Only tracks when **dialog is closed** (no tracking when chat is open)
- ✅ **Skips own messages** (doesn't count messages sent by current user)

### 2. Visual Indicator
- ✅ **Inbox icon** in hamburger menu with red badge
- ✅ Badge shows **count** of unread messages
- ✅ Badge **hidden** when count is 0
- ✅ Badge **appears** when count > 0

### 3. Clear Unread Count
- ✅ **Automatically cleared** when dialog is opened
- ✅ **Manually cleared** when inbox menu item is clicked
- ✅ Updates `lastSeenMessageId` when cleared

### 4. Persistence
- ✅ Unread count **saved to localStorage**
- ✅ Count **restored** on page reload
- ✅ Persists across browser sessions

## User Flow

### Receiving a 1-on-1 Message (Dialog Closed)
1. User A sends a 1-on-1 message to User B
2. Backend emits `send group msg` event
3. User B's widget receives event via Socket.IO
4. Widget checks if dialog is open → NO
5. `trackInboxUnreadMessages()` is called
6. Checks if message is 1-on-1 → YES (`Receiver_Id` matches current user)
7. Increments `inboxUnreadCount`
8. Updates inbox badge in hamburger menu
9. Saves count to localStorage

### Receiving a @Mention (Dialog Closed)
1. User A sends a message mentioning User B (@username or @123)
2. Backend emits `send group msg` event
3. User B's widget receives event via Socket.IO
4. Widget checks if dialog is open → NO
5. `trackInboxUnreadMessages()` is called
6. Checks if message contains mention → YES
7. Increments `inboxUnreadCount`
8. Updates inbox badge in hamburger menu
9. Saves count to localStorage

### Opening the Dialog
1. User clicks chat button to open dialog
2. `openDialog()` is called
3. Calls `clearInboxUnreadCount()`
4. Resets `inboxUnreadCount` to 0
5. Hides inbox badge
6. Updates `lastSeenMessageId`
7. Saves to localStorage

### Clicking Inbox Menu Item
1. User opens hamburger menu
2. Clicks "Inbox" menu item
3. `handleMenuAction('inbox')` is called
4. Calls `clearInboxUnreadCount()`
5. Resets count and hides badge

### Page Reload
1. Widget initializes
2. `loadInboxUnreadCount()` is called in `init()`
3. Reads count from localStorage
4. Updates badge if count > 0

## Detection Logic

### 1-on-1 Message Detection
```javascript
const is1on1 = msg.Receiver_Id && msg.Receiver_Id == currentUserId;
```
- Message must have `Receiver_Id` (not null)
- `Receiver_Id` must match current user's ID
- This is a **private message** sent directly to the user

### @Mention Detection
```javascript
const content = msg.Content || '';
const hasUsernameMention = userName && content.toLowerCase().includes(`@${userName.toLowerCase()}`);
const hasIdMention = content.includes(`@${currentUserId}`);
const isMention = hasUsernameMention || hasIdMention;
```
- Checks for `@username` (case-insensitive)
- Checks for `@userId` (using user ID number)
- Either pattern counts as a mention

### Combined Logic
```javascript
if (is1on1 || isMention) {
  unreadToAdd++;
}
```
- A message can be BOTH 1-on-1 AND a mention
- It only counts once (OR logic)
- Skip if message is from current user

## Differences from F Version

| Feature | F Version | Widget Version |
|---------|-----------|----------------|
| **Scope** | All unread messages | Only 1-on-1 and mentions |
| **Location** | Logo replacement (mobile) | Inbox menu badge |
| **Database** | Uses `Read_Time` column | Client-side tracking only |
| **Backend** | Backend calculates unread | Frontend calculates unread |
| **Persistence** | Database persistence | localStorage only |
| **Mark as Read** | Backend updates DB | Local state only |
| **Email Notifications** | Yes | No (widget doesn't handle email) |

## Testing Checklist

- [x] Send 1-on-1 message from another user → Widget shows inbox badge (dialog closed)
- [x] Send @mention message → Widget shows inbox badge (dialog closed)
- [x] Open dialog → Inbox badge clears
- [x] Close dialog and receive message → Badge reappears
- [x] Click inbox menu item → Badge clears
- [x] Reload page with unread messages → Badge persists
- [x] Send message while dialog is open → No badge (not counted)
- [x] Send own 1-on-1 message → Not counted
- [x] Send message mentioning self → Not counted
- [x] Badge shows correct count (e.g., 3 unread messages)
- [x] Badge hidden when count is 0
- [x] localStorage saves and restores count

## Known Limitations

1. **Client-Side Only**: Unread tracking is client-side only. If user opens widget in another browser/device, count won't sync.
2. **No Database**: Unlike F version, widget doesn't use database `Read_Time` column. Count resets if localStorage is cleared.
3. **Group Messages**: Regular group messages (not 1-on-1 or mentions) are NOT tracked.
4. **Multiple Devices**: If user receives messages on multiple devices, each device tracks independently.

## Future Enhancements (Optional)

1. **Backend Integration**: Sync unread count with database for cross-device support
2. **Desktop Badge**: Add badge to chat button (in addition to inbox menu)
3. **Sound Notifications**: Different sound for inbox messages vs regular messages
4. **Browser Notifications**: Show browser notification for unread inbox messages
5. **Inbox Modal**: Create a dedicated inbox modal showing only 1-on-1 and mention messages
6. **Mark Individual as Read**: Allow marking specific messages as read
7. **Unread Indicator in Messages**: Show visual indicator on unread messages in chat

## Files Modified

1. **`widget/public/widget.js`**
   - Added `inboxUnreadCount` and `lastSeenMessageId` state
   - Added `updateInboxUnreadCount()`, `clearInboxUnreadCount()`, `loadInboxUnreadCount()` methods
   - Call `loadInboxUnreadCount()` in `init()`

2. **`widget/public/js/ui.js`**
   - Added inbox menu item with badge to hamburger menu

3. **`widget/public/js/chat.js`**
   - Modified `handleNewMessages()` to call `trackInboxUnreadMessages()` when dialog is closed
   - Added `trackInboxUnreadMessages()` method to detect and count 1-on-1 and mention messages

4. **`widget/public/js/events.js`**
   - Modified `openDialog()` to call `clearInboxUnreadCount()`
   - Added 'inbox' case in `handleMenuAction()` to clear unread count

## Conclusion

The widget inbox unread functionality is now fully implemented and provides real-time tracking of:
- 1-on-1 messages (private messages)
- @Mention messages (messages that mention the user)

The unread count is:
- Displayed as a badge on the inbox icon in the hamburger menu
- Only tracked when the dialog is closed
- Automatically cleared when the dialog is opened or inbox is clicked
- Persisted in localStorage across page reloads

This implementation is lightweight and client-side focused, perfect for the widget's use case where database integration may not be available or necessary.
