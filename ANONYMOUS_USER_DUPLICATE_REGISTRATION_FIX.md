# Anonymous User Duplicate Registration Fix

## Problem

Anonymous users were appearing **twice** in the online users list even though only one user had logged in:

```javascript
Online users: ▶ (3) [123, 142677196, 426771962]
```

The same anonymous user ID was being registered multiple times, causing duplicates in the backend's online users tracking.

## Root Causes

### Root Cause #1: Multiple Button Event Handlers

The "Continue as Guest" button had **two event handlers** attached:
- `addEventListener('click', ...)` - Line 348 in `events.js`
- `onclick = ...` - Line 369 in `events.js`

Both handlers called `continueAsAnonymous()`, causing it to run **twice per click**!

### Root Cause #2: Multiple Socket Event Emissions

The `'user logged as annon'` socket event was being emitted from **5 different locations** in the code:

### 1. Socket Reconnect Handler (`socket.js:53`)
```javascript
this.socket.on('connect', () => {
  if (!this.isAuthenticated && this.anonId) {
    this.socket.emit('user logged as annon', { userId: this.anonId }); // ❌ Duplicate!
  }
});
```

### 2. joinGroup() Method (`socket.js:1551`)
```javascript
joinGroup() {
  this.socket.emit('user logged as annon', { userId: this.anonId }); // ❌ Duplicate!
}
```

### 3. Auto-Signin in init() (`core.js:91`)
```javascript
init() {
  if (savedAnonToken) {
    this.socket.emit('user logged as annon', { userId: anonId }); // ❌ Duplicate!
  }
}
```

### 4. continueAsAnonymous() - Immediate (`auth.js:250`)
```javascript
continueAsAnonymous() {
  if (this.socket && this.socket.connected) {
    this.socket.emit('user logged as annon', { userId: anonId }); // ❌ Duplicate!
  }
}
```

### 5. continueAsAnonymous() - Delayed (`auth.js:256`)
```javascript
continueAsAnonymous() {
  setTimeout(() => {
    this.socket.emit('user logged as annon', { userId: anonId }); // ❌ Duplicate!
  }, 1000);
}
```

### Why This Caused Duplicates

**Scenario 1: Fresh Anonymous User**
```
1. User opens widget → calls init()
2. Shows sign-in modal
3. User clicks "Continue as Anonymous" → calls continueAsAnonymous()
   - Emits 'user logged as annon' immediately (or delayed)
4. Socket connects → calls connect handler
   - Emits 'user logged as annon' again ❌
5. joinGroup() is called
   - Emits 'user logged as annon' again ❌

Result: Same user registered 3-5 times! 
```

**Scenario 2: Returning Anonymous User**
```
1. User opens widget → calls init()
2. Finds savedAnonToken in localStorage
3. Emits 'user logged as annon' in init() 
4. Socket connects → calls connect handler
   - Emits 'user logged as annon' again ❌
5. joinGroup() is called  
   - Emits 'user logged as annon' again ❌

Result: Same user registered 2-3 times!
```

**Scenario 3: Socket Reconnect**
```
1. User already logged in as anonymous
2. Socket disconnects and reconnects
3. Connect handler fires
   - Emits 'user logged as annon' again ❌
4. joinGroup() is called again
   - Emits 'user logged as annon' again ❌

Result: User registered multiple more times!
```

## Solution

Added a session flag `this.anonUserRegistered` to track if the anonymous user has already been registered in the current session.

### Implementation

#### 1. Removed Duplicate Button Handlers (`events.js`)

**Before:**
```javascript
// DUPLICATE handlers - both call continueAsAnonymous()!
continueAnonBtn.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();
  this.continueAsAnonymous(); // ❌ Called first time
});

continueAnonBtn.addEventListener('mousedown', () => { ... }); // ❌ Unnecessary debug
continueAnonBtn.addEventListener('mouseup', () => { ... }); // ❌ Unnecessary debug

continueAnonBtn.onclick = (event) => {
  event.preventDefault();
  event.stopPropagation();
  this.continueAsAnonymous(); // ❌ Called AGAIN!
};
```

**After:**
```javascript
// Only ONE click handler
continueAnonBtn.addEventListener('click', (event) => {
  if( window.isDebugging ) console.log(`🔍 [Widget] Continue As Guest button ${index + 1} CLICKED!`);
  event.preventDefault();
  event.stopPropagation();
  this.continueAsAnonymous(); // ✅ Called only once!
});
```

#### 2. Added Registration Flag (`widget-split.js`)
```javascript
class PingbashChatWidget {
  constructor(config = {}) {
    // ... existing code ...
    
    // Track if anonymous user has been registered in this session
    this.anonUserRegistered = false;
  }
}
```

#### 3. Updated Socket Reconnect Handler (`socket.js`)
```javascript
// For anonymous users, re-register on reconnection
if (!this.isAuthenticated && this.anonId && !this.anonUserRegistered) {
  setTimeout(() => {
    if (this.socket && this.socket.connected) {
      this.socket.emit('user logged as annon', { userId: this.anonId });
      this.anonUserRegistered = true; // ✅ Set flag
      if (window.isDebugging) console.log('🔌 [Widget] Anonymous user registered on reconnect');
    }
  }, 500);
}
```

#### 4. Updated joinGroup() Method (`socket.js`)
```javascript
// First register as anonymous user - only if not already registered
if (!this.anonUserRegistered) {
  this.socket.emit('user logged as annon', { userId: this.anonId });
  this.anonUserRegistered = true; // ✅ Set flag
  if (window.isDebugging) console.log('🔍 [Widget] Anonymous user registered in joinGroup');
} else {
  if (window.isDebugging) console.log('🔍 [Widget] Anonymous user already registered, skipping duplicate registration');
}
```

#### 5. Updated Auto-Signin in init() (`core.js`)
```javascript
// Register as anonymous user after socket connection
setTimeout(() => {
  if (this.socket && this.socket.connected && !this.anonUserRegistered) {
    this.socket.emit('user logged as annon', { userId: anonId });
    this.anonUserRegistered = true; // ✅ Set flag
    if (window.isDebugging) console.log('👤 [Widget] Anonymous user registered in init');
  } else if (this.anonUserRegistered) {
    if (window.isDebugging) console.log('👤 [Widget] Anonymous user already registered, skipping');
  }
}, 1000);
```

#### 6. Updated continueAsAnonymous() (`auth.js`)
```javascript
// Register as anonymous user - only if not already registered
if (this.socket && this.socket.connected && !this.anonUserRegistered) {
  this.socket.emit('user logged as annon', { userId: anonId });
  this.anonUserRegistered = true; // ✅ Set flag
  if (window.isDebugging) console.log('👤 [Widget] Anonymous user registered in continueAsAnonymous');
} else if (this.anonUserRegistered) {
  if (window.isDebugging) console.log('👤 [Widget] Anonymous user already registered, skipping duplicate');
} else {
  // If socket not ready, register after connection
  setTimeout(() => {
    if (this.socket && this.socket.connected && !this.anonUserRegistered) {
      this.socket.emit('user logged as annon', { userId: anonId });
      this.anonUserRegistered = true; // ✅ Set flag
      if (window.isDebugging) console.log('👤 [Widget] Anonymous user registered (delayed) in continueAsAnonymous');
    }
  }, 1000);
}
```

## How It Works

### Before Fix
```
User opens widget:
1. ❌ init() emits 'user logged as annon'
2. ❌ connect handler emits 'user logged as annon'  
3. ❌ joinGroup() emits 'user logged as annon'

Backend receives: 3 registrations for same user ID
Online users: [142677196, 142677196, 142677196] ❌
```

### After Fix
```
User opens widget:
1. ✅ init() emits 'user logged as annon' + sets flag
2. ⏭️  connect handler checks flag, skips
3. ⏭️  joinGroup() checks flag, skips

Backend receives: 1 registration
Online users: [142677196] ✅
```

### Detailed Flow

#### Fresh Anonymous User
```
1. User opens widget
2. init() called → no savedToken → shows sign-in modal
3. User clicks "Continue as Anonymous"
   → continueAsAnonymous() called
   → Checks: !this.anonUserRegistered ✅
   → Emits 'user logged as annon'
   → Sets: this.anonUserRegistered = true
4. Socket connects → connect handler
   → Checks: !this.anonUserRegistered ❌ (already true)
   → Skips emission
5. joinGroup() called
   → Checks: !this.anonUserRegistered ❌ (already true)
   → Skips emission

Result: Only 1 registration ✅
```

#### Returning Anonymous User
```
1. User opens widget
2. init() finds savedAnonToken
   → Checks: !this.anonUserRegistered ✅
   → Emits 'user logged as annon'
   → Sets: this.anonUserRegistered = true
3. Socket connects → connect handler
   → Checks: !this.anonUserRegistered ❌ (already true)
   → Skips emission
4. joinGroup() called
   → Checks: !this.anonUserRegistered ❌ (already true)
   → Skips emission

Result: Only 1 registration ✅
```

#### Socket Reconnection
```
1. User already logged in (anonUserRegistered = true)
2. Socket disconnects
3. Socket reconnects → connect handler
   → Checks: !this.anonUserRegistered ❌ (already true)
   → Skips emission
4. joinGroup() called
   → Checks: !this.anonUserRegistered ❌ (already true)
   → Skips emission

Result: No duplicate registration ✅
```

## Benefits

✅ **No Duplicate Users**: Each anonymous user appears only once in online users list
✅ **Consistent Behavior**: Works for fresh users, returning users, and reconnections
✅ **Better Performance**: Reduces unnecessary socket emissions
✅ **Clear Debugging**: Console logs show exactly where registration happens and when it's skipped
✅ **Session-Based**: Flag resets when page refreshes (new session)

## Console Logs

### When Registration Happens
```
👤 [Widget] Anonymous user registered in continueAsAnonymous
```
or
```
🔌 [Widget] Anonymous user registered on reconnect
```
or
```
🔍 [Widget] Anonymous user registered in joinGroup
```
or
```
👤 [Widget] Anonymous user registered in init
```

### When Duplicate is Prevented
```
👤 [Widget] Anonymous user already registered, skipping
```
or
```
🔍 [Widget] Anonymous user already registered, skipping duplicate registration
```

## Testing

### Test 1: Fresh Anonymous User
```
1. Clear localStorage
2. Open widget
3. Click "Continue as Anonymous"
4. Check console for "Anonymous user registered"
5. Verify only ONE registration log
6. Check online users list → should show user once ✅
```

### Test 2: Returning Anonymous User  
```
1. Complete Test 1
2. Refresh page
3. Widget should auto-login
4. Check console for "Anonymous user registered in init"
5. Verify only ONE registration log
6. Check online users list → should show user once ✅
```

### Test 3: Socket Reconnection
```
1. Complete Test 2
2. Disable network briefly
3. Re-enable network
4. Socket reconnects
5. Check console → should show "already registered, skipping"
6. No duplicate registration
7. Check online users list → still shows user once ✅
```

### Test 4: Multiple Tabs
```
1. Open widget in Tab 1
2. Login as anonymous
3. Open widget in Tab 2
4. Login as anonymous
5. Both should get SAME anonymous ID (from localStorage)
6. Check online users → should show user ONCE ✅
```

## Files Modified

1. **`widget/public/js/events.js`** - Removed duplicate `onclick` handler and debug event listeners
2. **`widget/public/js/widget-split.js`** - Added `anonUserRegistered` flag
3. **`widget/public/js/socket.js`** - Added flag check in connect handler and joinGroup()
4. **`widget/public/js/core.js`** - Added flag check in init()
5. **`widget/public/js/auth.js`** - Added flag check in continueAsAnonymous()

## Related Fixes

This fix works together with:
- `ANONYMOUS_USER_ID_FIX.md` - Persistent localStorage-based ID generation
- Both fixes combined ensure:
  1. Same browser always gets same anonymous ID
  2. Same anonymous ID is registered only once per session

## Important Notes

### Session-Based Flag
- `anonUserRegistered` flag is NOT stored in localStorage
- It's a runtime flag that resets on page refresh
- This is intentional - when user refreshes, we DO want to register them again with the backend

### Why Not Store in localStorage?
```javascript
// ❌ DON'T DO THIS:
localStorage.setItem('anonUserRegistered', 'true');

// Why? Because:
// - Page refresh = new socket connection
// - Backend might have lost track of user (server restart)
// - Need to re-register on fresh page load
```

### Flag Lifecycle
```
Page Load → anonUserRegistered = false
First Registration → anonUserRegistered = true
Socket Reconnect → anonUserRegistered stays true (no duplicate)
Page Refresh → anonUserRegistered = false again (fresh start)
```

This ensures users are properly registered on each new session while preventing duplicates within the same session.

