# Unread Messages Implementation - F Version Inbox

## Overview
Implemented comprehensive unread message functionality for the F version inbox, including:
- Real-time unread count tracking
- Visual badge indicators on chat list items
- Logo replacement with unread count badge in mobile header
- Automatic mark-as-read when opening chats
- Email notifications (already existed, now properly integrated)

## Changes Made

### 1. Backend (Already Existed)
The backend already had full support for unread messages:
- **Database**: `Messages` table has `Read_Time` column
- **Query**: `getUsers()` in `controller.js` calculates `Unread_Message_Count` for each conversation
- **Mark as Read**: `readMSG()` function updates `Read_Time` when user opens a chat
- **Email Notifications**: `sendPrivateMessageEmailNotification()` sends emails for new messages

### 2. Frontend - Inbox Page (`MayaIQ_F-main/src/app/inbox/page.tsx`)

#### Added State Management
```typescript
const [totalUnreadCount, setTotalUnreadCount] = useState<number>(0);
```

#### Calculate Total Unread Count
```typescript
useEffect(() => {
  const unreadTotal = inBoxUsers.reduce((sum, user) => {
    const unreadCount = typeof user.Unread_Message_Count === 'number' 
      ? user.Unread_Message_Count 
      : parseInt(String(user.Unread_Message_Count)) || 0;
    return sum + unreadCount;
  }, 0);
  setTotalUnreadCount(unreadTotal);
  console.log('📬 [Inbox] Total unread count:', unreadTotal);
}, [inBoxUsers]);
```

#### Increment Unread Count on New Messages
Modified `handleSendMsg()` to increment unread count when:
- Message is from the opposite user (not sent by current user)
- Chat is not currently open

```typescript
const isMessageFromOpposite = latestMessage.Sender_Id === oppositeUserId;
const isChatOpen = selectedUser?.Opposite_Id === oppositeUserId;
const shouldIncrementUnread = isMessageFromOpposite && !isChatOpen;

const updatedUser = {
  ...prevUsers[userIndex],
  Content: latestMessage.Content,
  Send_Time: latestMessage.Send_Time,
  Sender_Id: latestMessage.Sender_Id,
  Receiver_Id: latestMessage.Receiver_Id,
  Unread_Message_Count: shouldIncrementUnread ? currentUnread + 1 : currentUnread
};
```

#### Increment Unread Count on Group Notifications
Modified `handleSendGroupNotify()` to increment unread count for group notifications when chat is not open:

```typescript
const isChatOpen = selectedUser?.Opposite_Id === oppositeUserId;
const updatedUser = {
  ...prevUsers[userIndex],
  Content: `[Group Notification] ${data.message}`,
  Send_Time: new Date().toISOString(),
  Sender_Id: oppositeUserId,
  Receiver_Id: currentUserId,
  Unread_Message_Count: isChatOpen ? currentUnread : currentUnread + 1
};
```

#### Reset Unread Count When Opening Chat
Modified `userSelectHandler()` to reset unread count:

```typescript
const userSelectHandler = (user:User) => {
  // ... existing code ...
  readMsg(token, user.Opposite_Id);

  // Reset unread count for this user in the inbox list
  setInboxUsers(prevUsers => {
    return prevUsers.map(u => 
      u.Opposite_Id === user.Opposite_Id 
        ? { ...u, Unread_Message_Count: 0 }
        : u
    );
  });
  
  console.log('📬 [Inbox] Marked messages as read for user:', user.Opposite_Id);
}
```

#### Display Unread Count in Chat List
Changed from hardcoded `0` to actual unread count:

```typescript
unread={Number(user.Unread_Message_Count) || 0}
```

#### Pass Unread Count to Header
```typescript
<PageHeader unreadCount={totalUnreadCount} />
```

### 3. Frontend - Page Header (`MayaIQ_F-main/src/components/pageHeader.tsx`)

#### Added Props Interface
```typescript
interface PageHeaderProps {
  unreadCount?: number;
}

const PageHeader: React.FC<PageHeaderProps> = ({ unreadCount = 0 }) => {
```

#### Replace Logo with Badge When Unread Messages Exist
```typescript
<div className="flex gap-[12px] items-center whitespace-nowrap relative">
  {unreadCount > 0 ? (
    <div className="relative">
      <div className="w-[56px] h-[56px] bg-red-500 rounded-full flex items-center justify-center">
        <span className="text-white text-[20px] font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      </div>
    </div>
  ) : (
    <Image src={'/logo-orange.png'} alt="" width={100} height={100} style={{ width: "56px", height: "56px" }} priority />
  )}
  <span className="text-[23px] font-semibold">PingBash</span>
</div>
```

### 4. Frontend - Chat User Card (`MayaIQ_F-main/src/components/chats/ChatUserCard.tsx`)

#### Display Unread Badge
Added red circular badge showing unread count:

```typescript
{!isBlocked && unread !== undefined && unread > 0 && (
  <div className="absolute bottom-[4px] right-2 bg-red-500 text-white text-[12px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1">
    {unread > 99 ? '99+' : unread}
  </div>
)}
```

## Features

### 1. Real-Time Unread Tracking
- ✅ Unread count updates in real-time via Socket.IO
- ✅ Increments when receiving messages while chat is closed
- ✅ Increments for both 1-on-1 messages and group notifications
- ✅ Does NOT increment if chat is currently open

### 2. Visual Indicators
- ✅ **Chat List Badge**: Red circular badge on each chat item showing unread count
- ✅ **Mobile Header Badge**: Replaces Pingbash logo with red circular badge showing total unread count
- ✅ **Badge Display**: Shows "99+" for counts over 99

### 3. Mark as Read
- ✅ Automatically marks messages as read when user opens a chat
- ✅ Updates database via `readMsg()` socket event
- ✅ Resets local unread count immediately for instant UI feedback
- ✅ Backend updates `Read_Time` column in database

### 4. Email Notifications
- ✅ Already implemented in backend
- ✅ Sends email when user receives a new message
- ✅ Only sends if message is unread (`Read_Time IS NULL`)

## User Flow

### Receiving a Message (Chat Closed)
1. User A sends message to User B
2. Backend emits `SEND_MSG` event
3. User B's inbox receives event via Socket.IO
4. Inbox checks if chat is open → NO
5. Increments `Unread_Message_Count` for User A in inbox list
6. Updates total unread count
7. Mobile header logo changes to red badge with count
8. Chat list item shows red badge next to User A
9. Backend sends email notification to User B

### Receiving a Message (Chat Open)
1. User A sends message to User B
2. Backend emits `SEND_MSG` event
3. User B's inbox receives event via Socket.IO
4. Inbox checks if chat is open → YES
5. Does NOT increment unread count
6. Message appears in chat window
7. Backend marks message as read immediately

### Opening a Chat
1. User clicks on chat item with unread badge
2. `userSelectHandler()` is called
3. Sends `READ_MSG` socket event to backend
4. Backend updates `Read_Time` in database
5. Frontend resets `Unread_Message_Count` to 0 for that user
6. Badge disappears from chat item
7. Total unread count decreases
8. Mobile header updates (may revert to logo if no more unread)

## Testing Checklist

- [x] Send 1-on-1 message from widget → F version shows unread badge
- [x] Send group notification from widget → F version shows unread badge
- [x] Open chat with unread messages → badge disappears
- [x] Receive message while chat is open → no unread badge
- [x] Mobile header shows red badge instead of logo when unread > 0
- [x] Mobile header reverts to logo when unread = 0
- [x] Badge shows "99+" for counts over 99
- [x] Total unread count is sum of all conversations
- [x] Unread count persists across page refreshes (from backend)
- [x] Email notifications sent for unread messages (already working)

## Notes

### Backend Already Supported Unread Messages
The backend (`MayaIQ_B-main`) already had full support for unread messages:
- `Unread_Message_Count` was calculated in the `getUsers()` query
- `readMSG()` function existed to mark messages as read
- Email notifications were already being sent

The frontend was simply not using this data (it was hardcoded to `0`).

### Real-Time Updates
All unread count updates happen in real-time via Socket.IO:
- `SEND_MSG` event for 1-on-1 messages
- `SEND_GROUP_MSG` event for widget messages
- `SEND_GROUP_NOTIFY` event for group notifications

### State Management
Unread counts are managed in two places:
1. **Per-conversation**: `User.Unread_Message_Count` in `inBoxUsers` array
2. **Total**: `totalUnreadCount` state (sum of all conversations)

### Mobile-First Design
The logo replacement feature is mobile-specific (only shows on screens < 1024px) as per the existing `lg:hidden` class on the mobile header.

## Future Enhancements (Optional)

1. **Desktop Badge**: Add unread count badge to desktop sidebar/header
2. **Sound Notifications**: Play sound when receiving unread message (already exists for open chats)
3. **Browser Notifications**: Show browser notification for new messages
4. **Unread Indicator in Sidebar**: Show unread count next to "Inbox" menu item
5. **Persistence**: Store unread count in localStorage for offline tracking
6. **Mark All as Read**: Add button to mark all conversations as read
7. **Unread Filter**: Add filter to show only conversations with unread messages

## Files Modified

1. `MayaIQ_F-main/src/app/inbox/page.tsx`
   - Added `totalUnreadCount` state
   - Added unread count calculation effect
   - Modified `handleSendMsg()` to increment unread count
   - Modified `handleSendGroupNotify()` to increment unread count
   - Modified `userSelectHandler()` to reset unread count
   - Changed unread prop from `0` to actual count
   - Passed `totalUnreadCount` to PageHeader

2. `MayaIQ_F-main/src/components/pageHeader.tsx`
   - Added `PageHeaderProps` interface
   - Added `unreadCount` prop
   - Replaced logo with red badge when unread > 0

3. `MayaIQ_F-main/src/components/chats/ChatUserCard.tsx`
   - Added red circular badge for unread count
   - Shows "99+" for counts over 99

## Backend Files (No Changes Needed)

1. `MayaIQ_B-main/middlewares/socket/controller.js`
   - `getUsers()` - Already calculates `Unread_Message_Count`
   - `readMSG()` - Already marks messages as read
   - `sendPrivateMessageEmailNotification()` - Already sends emails

2. `MayaIQ_B-main/middlewares/socket/index.js`
   - `READ_MSG` event handler - Already exists
   - `SEND_MSG` event handler - Already exists

## Conclusion

The unread message functionality is now fully implemented and integrated with the existing backend infrastructure. Users will see:
- Real-time unread count badges on chat items
- Total unread count replacing the logo in mobile header
- Automatic mark-as-read when opening chats
- Email notifications for new messages (already working)

All changes are backward-compatible and do not affect existing functionality.
