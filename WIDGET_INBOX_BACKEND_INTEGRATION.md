# Widget Inbox Backend Integration

## Overview
The widget's inbox icon now displays unread message count from the F version (backend database) instead of client-side tracking. Clicking the inbox icon redirects users to the F version inbox at `https://pingbash.com/inbox`.

## Changes Made

### Backend Changes

#### 1. New Controller Function (`MayaIQ_B-main/middlewares/socket/controller.js`)
- Added `getTotalUnreadCount(loggedId)` function to calculate total unread messages for a user
- Queries the `Messages` table for unread messages (`Read_Time IS NULL` and `History_Iden = 1`)
- Exported the function in module.exports

#### 2. New Socket Event Handler (`MayaIQ_B-main/middlewares/socket/index.js`)
- Added socket event handler for `GET_INBOX_UNREAD_COUNT`
- Validates token and checks expiration
- Calls `getTotalUnreadCount()` and emits the count back to the client

#### 3. New Chat Constant (`MayaIQ_B-main/libs/chatCode.js`)
- Added `GET_INBOX_UNREAD_COUNT: "get inbox unread count"` constant

#### 4. Updated F Version Constants (`MayaIQ_F-main/src/resource/const/chat_const.ts`)
- Added `GET_INBOX_UNREAD_COUNT` constant for consistency

### Widget Changes

#### 1. Socket Listener (`widget/public/js/socket.js`)
- Added socket listener for `'get inbox unread count'` event
- Receives count from backend and updates the badge via `updateInboxUnreadCount()`
- Requests unread count on socket connection (with 1.5s delay)
- Sets up periodic refresh every 30 seconds for authenticated users

#### 2. Request Method (`widget/public/js/events.js`)
- Added `requestInboxUnreadCount()` method
- Only requests for authenticated users (skips anonymous users with `anonuser` token)
- Emits `'get inbox unread count'` event with user token
- Clears badge for anonymous users

#### 3. Inbox Click Action (`widget/public/js/events.js`)
- Changed inbox menu action to redirect to `https://pingbash.com/inbox` in a new tab
- Removed old client-side clearing logic

#### 4. Message Handler (`widget/public/js/chat.js`)
- Updated `handleNewMessages()` to request fresh unread count from backend when new messages arrive
- Added 500ms delay to let backend process the message before requesting count
- Removed old client-side tracking logic

#### 5. Widget Initialization (`widget/public/js/widget-split.js`)
- Simplified `updateInboxUnreadCount()` to only update UI (removed localStorage persistence)
- Removed `clearInboxUnreadCount()` and `loadInboxUnreadCount()` methods

#### 6. Core Initialization (`widget/public/js/core.js`)
- Removed call to `loadInboxUnreadCount()` from init method

#### 7. Open Dialog (`widget/public/js/events.js`)
- Removed `clearInboxUnreadCount()` call from `openDialog()` method

## How It Works

### For Authenticated Users:
1. Widget initializes and connects to socket
2. After 1.5s, requests unread count from backend
3. Backend calculates count from database and emits response
4. Widget updates badge with count from backend
5. Every 30 seconds, widget refreshes count from backend
6. When new messages arrive, widget requests fresh count (with 500ms delay)
7. Clicking inbox icon opens `https://pingbash.com/inbox` in new tab

### For Anonymous Users:
1. Widget skips unread count request (anonymous users don't have inbox)
2. Badge is cleared/hidden
3. Clicking inbox icon still redirects to `https://pingbash.com/inbox`

## Benefits

1. **Single Source of Truth**: Unread count comes from F version database, ensuring consistency
2. **Real-time Sync**: Widget always shows accurate count from backend
3. **No Local State**: No localStorage persistence needed, simplifying logic
4. **Automatic Updates**: Periodic refresh and message-triggered refresh keep count current
5. **Proper Redirect**: Users are directed to full inbox page for reading/managing messages

## Testing Checklist

- [ ] Authenticated user sees correct unread count on widget load
- [ ] Unread count updates when new 1-on-1 message arrives
- [ ] Unread count updates every 30 seconds automatically
- [ ] Anonymous users don't see unread badge
- [ ] Clicking inbox icon opens `https://pingbash.com/inbox` in new tab
- [ ] Badge displays correct count (0-99, or "99+" if more)
- [ ] Count matches F version inbox page count
- [ ] No console errors related to inbox functionality

