# Inbox Read Message Sync Fix

## Issue
When user reads messages in F version inbox, the widget still showed the old unread count because it wasn't being notified of the change.

## Solution
Updated the `READ_MSG` socket handler to emit updated unread count to **all user's sockets** after marking messages as read.

## Changes Made

### Backend (`MayaIQ_B-main/middlewares/socket/index.js`)
- **Line 407-424**: Added logic to send updated unread count after reading messages
  ```javascript
  // Send updated unread count to all user's sockets (F version + widget)
  try {
      const unreadCount = await Controller.getTotalUnreadCount(receiver);
      
      // Find all sockets for this user
      const userSockets = users.filter(u => u.ID === receiver);
      console.log(`📬 [READ_MSG] Found ${userSockets.length} sockets for user ${receiver}`);
      
      userSockets.forEach(userSocket => {
          const socketObj = sockets[userSocket.Socket];
          if (socketObj && socketObj.connected) {
              socketObj.emit(chatCode.GET_INBOX_UNREAD_COUNT, unreadCount);
              console.log(`📬 [READ_MSG] Sent updated unread count (${unreadCount}) to socket ${userSocket.Socket}`);
          }
      });
  } catch (error) {
      console.error('📬 [READ_MSG] Failed to send unread count:', error);
  }
  ```

## How It Works Now

### Read Flow:
1. **User reads messages in F version inbox**
2. **F version calls `readMsg(token, oppositeId)`** → Emits `READ_MSG` socket event
3. **Backend**:
   - Marks messages as read (`Read_Time = CURRENT_TIMESTAMP`)
   - Calculates new unread count
   - Finds **all sockets** for that user (F version + widget)
   - Emits `GET_INBOX_UNREAD_COUNT` to each socket
4. **Widget receives update**:
   - Updates hamburger menu badge
   - Toggles dialog header (shows logo if count = 0)
5. **F version receives update**:
   - Updates inbox badge
   - Updates PageHeader badge

## Benefits
- **Real-time sync**: Widget and F version stay in sync
- **Multi-tab support**: Works even if user has multiple tabs open
- **Bidirectional**: Works whether you read in F version or widget
- **Instant feedback**: No polling or refresh needed

## Testing
- [ ] Read message in F version → Widget badge updates instantly
- [ ] Read message in F version → Widget dialog shows logo (if count = 0)
- [ ] Read message in F version → Widget dialog shows inbox icon with correct count (if count > 0)
- [ ] Multiple tabs: All tabs receive update
- [ ] No console errors

