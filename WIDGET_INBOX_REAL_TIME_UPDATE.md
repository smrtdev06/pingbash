# Widget Inbox Real-Time Updates & Header Icon Toggle

## Overview
The widget now receives real-time unread message count updates when inbox messages are sent. When the count is greater than 0, the dialog header logo is replaced with an inbox icon + badge. Clicking the inbox icon redirects to `https://pingbash.com/inbox`.

## Changes Made

### Backend Changes

#### 1. Private Message Handler (`MayaIQ_B-main/middlewares/socket/chat.js`)
- **Line 183-196**: Added real-time unread count emission for private messages (SEND_MSG event)
  ```javascript
  // Send updated unread count to receiver in real-time
  try {
      const unreadCount = await Controller.getTotalUnreadCount(receiverId);
      receiverSocket.emit(chatCode.GET_INBOX_UNREAD_COUNT, unreadCount);
      console.log(`📬 [INBOX] Real-time unread count sent to receiver ${receiverId}: ${unreadCount}`);
  } catch (error) {
      console.error(`📬 [INBOX] Failed to send unread count to receiver:`, error);
  }
  ```

#### 2. Group Message Handler - 1-on-1 Messages (`MayaIQ_B-main/middlewares/socket/chat.js`)
- **Line 330-343**: Added real-time unread count emission for 1-on-1 messages sent via group endpoint (SEND_GROUP_MSG event)
  ```javascript
  // Send updated unread count to online receiver in real-time
  try {
      const receiverSocketObj = sockets[targetUserSocket.Socket];
      if (receiverSocketObj) {
          const unreadCount = await Controller.getTotalUnreadCount(receiverId);
          receiverSocketObj.emit(chatCode.GET_INBOX_UNREAD_COUNT, unreadCount);
          console.log(`📬 [INBOX] Real-time unread count sent to receiver ${receiverId}: ${unreadCount}`);
      }
  } catch (error) {
      console.error(`📬 [INBOX] Failed to send unread count to receiver:`, error);
  }
  ```

### Widget Changes

#### 1. Inbox Unread Count Update Method (`widget/public/js/widget-split.js`)
- **Line 155-170**: Modified `updateInboxUnreadCount()` to call `toggleDialogHeaderIcon()`
  - Updates the hamburger menu badge as before
  - Now also toggles the dialog header logo/inbox icon

#### 2. Dialog Header Icon Toggle Method (`widget/public/js/widget-split.js`)
- **Line 172-220**: New `toggleDialogHeaderIcon(count)` method
  - Creates inbox icon dynamically if it doesn't exist
  - Inbox icon HTML includes SVG + badge
  - Adds click handler to redirect to `https://pingbash.com/inbox`
  - When `count > 0`: Hides logo, shows inbox icon with badge
  - When `count = 0`: Shows logo, hides inbox icon
  - Badge shows count (max "99+" for values > 99)

## How It Works

### Real-Time Flow:
1. **User A sends 1-on-1 message to User B**
2. **Backend**:
   - Saves message to database
   - Calculates User B's total unread count
   - Emits `GET_INBOX_UNREAD_COUNT` event to User B's socket with the count
3. **User B's Widget**:
   - Receives unread count via socket
   - Calls `updateInboxUnreadCount(count)`
   - Updates hamburger menu badge
   - Calls `toggleDialogHeaderIcon(count)`
   - If count > 0:
     - Hides Pingbash logo
     - Shows inbox icon with badge displaying count
   - If count = 0:
     - Shows Pingbash logo
     - Hides inbox icon

### UI Behavior:
- **Logo Visible**: When no unread messages (`count = 0`)
- **Inbox Icon Visible**: When there are unread messages (`count > 0`)
- **Inbox Icon Badge**: Shows exact count (1-99) or "99+" if more
- **Click Action**: Clicking inbox icon opens `https://pingbash.com/inbox` in new tab
- **Original Logo Click**: Still opens group creation modal (when visible)

## Icon Location
- **Dialog Header**: Left side, where the Pingbash logo normally appears
- **Same Size**: 32x32px SVG icon
- **Badge Position**: Top-right corner of icon (-5px top, -5px right)
- **Badge Style**: Red circle (#ff4444) with white text

## Benefits
1. **Immediate Feedback**: Users see unread count update instantly when they receive messages
2. **Visual Prominence**: Inbox icon replaces logo, making it highly visible
3. **Direct Access**: Clicking icon takes users straight to full inbox
4. **Clean UI**: Logo returns when no unread messages
5. **No Polling**: Real-time socket updates, no need for periodic API requests

## Testing Checklist
- [ ] User receives 1-on-1 message → unread count updates instantly
- [ ] Dialog header logo replaced with inbox icon when count > 0
- [ ] Inbox icon shows correct badge count
- [ ] Badge shows "99+" for counts > 99
- [ ] Clicking inbox icon opens pingbash.com/inbox in new tab
- [ ] Logo returns when all messages are read (count = 0)
- [ ] Works for both SEND_MSG and SEND_GROUP_MSG (1-on-1) events
- [ ] No console errors
- [ ] Badge count matches F version inbox count

