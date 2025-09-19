# 🔍 Debug Private Message Email Notifications

## Issue
No `[PRIVATE]` logs are appearing, indicating the private message email notification system isn't being triggered.

## Debugging Steps

### 1. Check if Backend is Running
```bash
cd MayaIQ_B-main
npm start
```
Look for:
- `✅ SMTP server is ready to send emails` (or error message)
- `🔌 [SOCKET] Registering private message handler for socket [ID]`

### 2. Check if Private Messages are Being Sent
Look in the backend logs for:
- `📨 [PRIVATE] Private message handler triggered`
- `📨 [PRIVATE] Data received: ...`

**If you DON'T see these logs:**
- Private messages aren't being sent from the frontend
- Check if you're using the inbox/private chat feature (not group chat)
- Verify the frontend is sending to the correct socket event: `"send msg"`

### 3. Check Online/Offline Detection
Look for these logs:
- `📨 [PRIVATE] Online users count: X`
- `📨 [PRIVATE] Sender found: true/false, Receiver found: true/false`
- `📨 [PRIVATE] Receiver socket exists: true/false`

**If receiver socket exists = true:**
- Both users are online → Email won't be sent (only inbox notification)
- You'll see: `📨 [PRIVATE] Inbox notification sent to online user X`

**If receiver socket exists = false:**
- Receiver is offline → Email should be sent
- You'll see: `📨 [PRIVATE] Receiver X is offline - sending email notification`

### 4. Check Email Function Execution
Look for these logs:
- `📧 [EMAIL] Attempting to send email notification: sender=X, receiver=Y`
- `📧 [EMAIL] Sender query result: X rows`
- `📧 [EMAIL] Receiver query result: X rows`

### 5. Test Private Messages

#### Option A: Use Test Script
```bash
cd MayaIQ_B-main
node test_private_message.js
```

#### Option B: Manual Test
1. Open two browser tabs
2. Login as different users in each tab
3. Go to **Inbox/Private Chat** (not group chat)
4. Close one tab (to make user offline)
5. Send private message from the other tab

### 6. Check SMTP Configuration
```bash
cd MayaIQ_B-main
node test_email_timeout.js
```

Look for SMTP settings and any connection errors.

## Common Issues

### Issue 1: No Private Messages Being Sent
**Symptoms:** No `📨 [PRIVATE]` logs at all
**Solution:** 
- Use the Inbox/Private Chat feature in the frontend
- Don't use group chat for testing private messages

### Issue 2: Both Users Online
**Symptoms:** See `📨 [PRIVATE] Inbox notification sent to online user X`
**Solution:** 
- Make one user offline (close their browser tab)
- Or test with a user that doesn't exist in the users array

### Issue 3: SMTP Not Configured
**Symptoms:** `❌ SMTP connection failed` or `❌ [EMAIL] SMTP configuration incomplete`
**Solution:** 
- Update `SMTP_PASS` in `db/env` with real credentials
- For Gmail, use App Password (not regular password)

### Issue 4: Users Not Found in Database
**Symptoms:** `❌ [EMAIL] Sender with ID X not found` or `❌ [EMAIL] Receiver with ID Y not found`
**Solution:** 
- Check user IDs exist in database
- Run: `node test_email_timeout.js` to see available users

## Expected Log Flow for Offline User

```
🔌 [SOCKET] Registering private message handler for socket ABC123
📨 [PRIVATE] Private message handler triggered
📨 [PRIVATE] Data received: { to: 2, msg: "Hello", hasToken: true }
📨 [PRIVATE] Processing private message: sender=1, receiver=2
📨 [PRIVATE] Online users count: 1
📨 [PRIVATE] Sender found: true, Receiver found: false
📨 [PRIVATE] Receiver details: Not found
📨 [PRIVATE] Sender socket exists: true, Receiver socket exists: false
📨 [PRIVATE] Message sent to sender socket
📨 [PRIVATE] Receiver 2 is offline - sending email notification
📧 [EMAIL] Attempting to send email notification: sender=1, receiver=2
📧 [EMAIL] Sender query result: 1 rows
📧 [EMAIL] Receiver query result: 1 rows
📧 [EMAIL] Sender: John (john@example.com)
📧 [EMAIL] Receiver: Jane (jane@example.com)
📧 [EMAIL] Sending email to jane@example.com with subject: New message from John
✅ [EMAIL] Email notification sent successfully to jane@example.com
```

## Next Steps
1. Start the backend and look for the initial logs
2. Try sending a private message and check which logs appear
3. Follow the debugging steps based on what you see (or don't see) 