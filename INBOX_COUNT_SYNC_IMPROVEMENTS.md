# Inbox Count Sync Improvements

## Issue
Widget was showing incorrect unread count (3) while F version showed correct count (2). The widget wasn't properly syncing with backend on load.

## Root Causes
1. **Delayed initialization**: Widget requested backend count after 1.5 seconds, showing stale data initially
2. **No visual reset**: Widget didn't clear old count on reload
3. **Race conditions**: Old count might be displayed before backend response arrives

## Solutions Implemented

### 1. Initialize UI to 0 Immediately (`widget/public/js/widget-split.js`)
- **Line 49-54**: Added immediate UI initialization to 0
  ```javascript
  // Initialize inbox UI to 0 immediately
  setTimeout(() => {
    if (this.updateInboxUnreadCount) {
      this.updateInboxUnreadCount(0);
    }
  }, 100);
  ```
- Ensures widget always starts with 0, then updates to correct backend value

### 2. Faster Backend Request (`widget/public/js/socket.js`)
- **Line 96**: Reduced delay from 1500ms to 500ms
  ```javascript
  }, 500); // Previously 1500ms
  ```
- Widget requests fresh count from backend much faster after connection

### 3. Enhanced Logging (`widget/public/js/socket.js` & `events.js`)
- **socket.js Line 419**: Added logging to show previous vs new count
  ```javascript
  console.log('📬 [Widget] Inbox unread count from backend:', count, '(previous:', this.inboxUnreadCount + ')');
  ```
- **events.js Line 1338**: Added logging when requesting count
  ```javascript
  console.log('📬 [Widget] Requesting inbox unread count from backend (current:', this.inboxUnreadCount + ')');
  ```
- Makes it easy to debug sync issues

## How It Works Now

### Load Sequence:
1. **T=0ms**: Widget initializes with `inboxUnreadCount = 0`
2. **T=100ms**: UI updated to show 0 (clears any stale display)
3. **T=500ms**: Socket connected, widget requests backend count
4. **T=~700ms**: Backend responds with correct count (e.g., 2)
5. **T=~700ms**: Widget updates UI to show correct count
6. **Every 30s**: Widget re-requests count to stay in sync

### Real-Time Updates:
- When user receives message → Backend emits count → Widget updates
- When user reads in F version → Backend emits count → Widget updates
- Always shows accurate, backend-calculated count

## Benefits
1. **Faster sync**: 500ms vs 1500ms delay
2. **Clean start**: Always shows 0 initially, then correct count
3. **Better debugging**: Console logs show count transitions
4. **No stale data**: Can't show old counts from previous sessions
5. **Real-time updates**: Instant sync when messages arrive or are read

## Testing
- [ ] Reload widget → Shows 0 briefly, then correct count
- [ ] Check console → See "Requesting inbox unread count" followed by "Inbox unread count from backend: X"
- [ ] Verify count matches F version exactly
- [ ] Receive message → Count updates in <1 second
- [ ] Read in F version → Widget count updates immediately
- [ ] Multiple tabs → All show same count

