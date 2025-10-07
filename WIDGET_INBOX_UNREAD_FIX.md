# Widget Inbox Unread Count - Method Not Found Fix

## Issue
Error when opening dialog or clicking inbox:
```
Uncaught TypeError: this.clearInboxUnreadCount is not a function
```

## Root Cause
The widget uses a split module architecture where:
1. **`widget-split.js`** - Defines the minimal constructor for `PingbashChatWidget` class
2. **Separate module files** - Add methods to the prototype via `Object.assign()`

The inbox unread methods (`updateInboxUnreadCount`, `clearInboxUnreadCount`, `loadInboxUnreadCount`) were only defined in `widget.js` (the monolithic version), but not in `widget-split.js` (the split version used in production).

When the events module tried to call `this.clearInboxUnreadCount()`, the method didn't exist on the instance because it was never added to the constructor.

## Solution

### 1. Added Inbox State to `widget-split.js` Constructor
```javascript
// Inbox unread tracking (for 1-on-1 and mentions)
this.inboxUnreadCount = 0;
this.lastSeenMessageId = null;
```

### 2. Added Inbox Methods to `widget-split.js` Constructor
```javascript
// Update inbox unread count badge
this.updateInboxUnreadCount = (count) => {
  this.inboxUnreadCount = count || 0;
  const badge = this.dialog?.querySelector('.pingbash-inbox-badge');
  if (badge) {
    badge.textContent = this.inboxUnreadCount;
    badge.style.display = this.inboxUnreadCount > 0 ? 'inline-block' : 'none';
  }
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

### 3. Added Safety Checks in Module Files

Added checks before calling methods to prevent errors if they're not available:

**`events.js`**:
```javascript
// In openDialog()
if (this.clearInboxUnreadCount) {
  this.clearInboxUnreadCount();
} else {
  if( window.isDebugging ) console.warn('📬 [Widget] clearInboxUnreadCount not available yet');
}

// In handleMenuAction()
case 'inbox':
  if (this.clearInboxUnreadCount) {
    this.clearInboxUnreadCount();
  }
  break;
```

**`chat.js`**:
```javascript
// In handleNewMessages()
if (!this.isOpen && trulyNewMessages.length > 0) {
  if (this.trackInboxUnreadMessages) {
    this.trackInboxUnreadMessages(trulyNewMessages);
  }
}
```

### 4. Added Initialization Call in `core.js`
```javascript
async init() {
  // ... existing code ...
  
  // Load inbox unread count from localStorage
  if (this.loadInboxUnreadCount) {
    this.loadInboxUnreadCount();
  }
  
  await this.loadSocketIO();
  // ... rest of init
}
```

## Files Modified

1. **`widget/public/js/widget-split.js`**
   - Added `inboxUnreadCount` and `lastSeenMessageId` state variables
   - Added `updateInboxUnreadCount()`, `clearInboxUnreadCount()`, `loadInboxUnreadCount()` methods to constructor

2. **`widget/public/js/core.js`**
   - Added `loadInboxUnreadCount()` call in `init()` method

3. **`widget/public/js/events.js`**
   - Added safety checks before calling `clearInboxUnreadCount()`

4. **`widget/public/js/chat.js`**
   - Added safety check before calling `trackInboxUnreadMessages()`

## Why This Architecture

The split module architecture separates code into:
- **Constructor code** (`widget-split.js`) - Instance properties and methods needed immediately
- **Prototype methods** (separate .js files) - Added via `Object.assign()` after loading

Methods defined in the constructor (like `updateOnlineUserCount`, `showOnlineUsers`, and now inbox methods) are available immediately on instance creation. This is necessary for methods that:
1. Need to be called during initialization
2. Are called from other modules before all prototypes are added
3. Need to access `this.dialog` which is created during initialization

## Testing
- ✅ Open dialog → No error, inbox count clears
- ✅ Click inbox menu item → No error, count clears
- ✅ Receive 1-on-1 message while dialog closed → Count increments
- ✅ Receive @mention while dialog closed → Count increments
- ✅ Reload page → Count persists from localStorage
- ✅ Badge displays correctly in hamburger menu

## Conclusion
The fix ensures inbox unread methods are available on the widget instance from the moment it's created, preventing "method not found" errors when the dialog is opened or inbox is clicked.
