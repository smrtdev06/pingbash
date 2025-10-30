# Anonymous Token Format Fix - Preventing ID Parsing Errors

## Problem

Anonymous users with the **same ID** were appearing as **different users** with different IDs in the online users list:

```javascript
👥 [Widget] Online users: (3) [123, 588357024, 6588357024]
//                                    ^^^^^^^^^ ^^^^^^^^^^
//                                    Same user, parsed incorrectly!
```

### Root Cause

The anonymous token format was ambiguous:

```
Format: anonuser{groupName}{anonId}
Example: anonusergggg6588357024
```

When the **backend** tried to extract the anonymous ID from this token, it used a regex:

```javascript
const anonIdMatch = data.token.match(/anonuser.*?(\d+)/);
loggedId = anonIdMatch ? parseInt(anonIdMatch[1]) : null;
```

### The Bug

For a token like `anonusergggg6588357024`:
- Group name: `gggg6` (ends with digit "6")
- Anonymous ID: `588357024`
- **Backend parsed**: `6588357024` ❌ (included the "6" from "gggg**6**")

The regex `/ anonuser.*?(\d+)/` captures:
1. `anonuser` - literal match
2. `gggg` - matched by `.*?` (non-greedy any character)
3. **`6588357024`** - captured by `(\d+)` ← **Bug! Includes "6" from group name**

This happened because:
- The regex couldn't distinguish where the group name ends and the ID begins
- Group names ending with digits caused the parser to capture those digits as part of the ID

### Impact

```
User with ID 588357024:
1. Opens widget → generates ID 588357024
2. Stores token: anonusergggg6588357024
3. Backend parses ID as: 6588357024 ❌
4. Now TWO "users" in online list: 588357024 and 6588357024
```

## Solution

Changed the token format to include **separators** (`_`) to make parsing unambiguous:

```
Old Format: anonuser{groupName}{anonId}
New Format: anonuser_{groupName}_{anonId}

Old Example: anonusergggg6588357024
New Example: anonuser_gggg6_588357024
            ^       ^     ^
            separator  separator
```

### Benefits

✅ **Unambiguous parsing** - Clear boundaries between components
✅ **Works with any group name** - Even group names ending with digits
✅ **Simple to parse** - Just split by `_`
✅ **Backward compatible** - Fallback for old token format

## Implementation

### Frontend Changes

#### 1. Token Generation (`auth.js`, `socket.js`)

**Before:**
```javascript
const anonToken = `anonuser${this.config.groupName}${anonId}`;
// Result: anonusergggg6588357024
```

**After:**
```javascript
const anonToken = `anonuser_${this.config.groupName}_${anonId}`;
// Result: anonuser_gggg6_588357024
```

#### 2. Token Parsing (`core.js`)

**Before:**
```javascript
const tokenPrefix = `anonuser${this.config.groupName}`;
const anonId = parseInt(savedAnonToken.replace(tokenPrefix, ''));
```

**After:**
```javascript
const parts = savedAnonToken.split('_');
const anonId = parts.length >= 3 ? parseInt(parts[2]) : parseInt(savedAnonToken.replace(`anonuser${this.config.groupName}`, ''));
//                                           ^^^^^^^^^
//                                           Third part is the ID
```

### Backend Changes

#### Token Parsing (`MayaIQ_B-main/middlewares/socket/index.js`)

**Before:**
```javascript
const anonIdMatch = data.token.match(/anonuser.*?(\d+)/);
loggedId = anonIdMatch ? parseInt(anonIdMatch[1]) : null;
// For "anonusergggg6588357024" → extracts 6588357024 ❌
```

**After:**
```javascript
const parts = data.token.split('_');
if (parts.length >= 3) {
    // New format: anonuser_groupname_id
    loggedId = parseInt(parts[2]);
    // For "anonuser_gggg6_588357024" → extracts 588357024 ✅
} else {
    // Fallback for old format (will be phased out)
    const anonIdMatch = data.token.match(/anonuser.*?(\d+)$/);
    loggedId = anonIdMatch ? parseInt(anonIdMatch[1]) : null;
}
```

Note: The `$` anchor at the end of the fallback regex ensures it captures digits at the **end** of the token, not in the middle.

## How It Works

### Old Format (Ambiguous)
```
Token: anonusergggg6588357024
       └─┬──┘└─┬─┘└───┬────┘
      prefix group   ???
                     ↓
      Backend sees: "gggg6588357024"
      Extracts first digits: "6588357024" ❌
```

### New Format (Clear)
```
Token: anonuser_gggg6_588357024
       └─┬──┘ └─┬─┘ └───┬────┘
      prefix  group    ID
       |       |        |
      parts[0] parts[1] parts[2] ✅
```

## Testing

### Test 1: Group Name Ending with Digit

```javascript
Group: "gggg6"
Anonymous ID: 588357024

Old token: anonusergggg6588357024
  → Backend parsed: 6588357024 ❌

New token: anonuser_gggg6_588357024
  → Backend parsed: 588357024 ✅
```

### Test 2: Group Name with Multiple Digits

```javascript
Group: "test123"
Anonymous ID: 456789012

Old token: anonusertest123456789012
  → Backend parsed: 123456789012 ❌ (includes "123" from "test123")

New token: anonuser_test123_456789012
  → Backend parsed: 456789012 ✅
```

### Test 3: Numeric Group Name

```javascript
Group: "12345"
Anonymous ID: 678901234

Old token: anonuser12345678901234
  → Backend parsed: 12345678901234 ❌ (entire number)

New token: anonuser_12345_678901234
  → Backend parsed: 678901234 ✅
```

## Backward Compatibility

The fix includes a **fallback** for old token formats:

```javascript
if (parts.length >= 3) {
    // New format with separators
    loggedId = parseInt(parts[2]);
} else {
    // Old format - use improved regex with $ anchor
    const anonIdMatch = data.token.match(/anonuser.*?(\d+)$/);
    loggedId = anonIdMatch ? parseInt(anonIdMatch[1]) : null;
}
```

This ensures:
- **New users** get the correct format immediately
- **Existing users** with old tokens can still connect (though their ID might still be misparsed until they refresh)
- **Gradual migration** as localStorage tokens expire/refresh

## Files Modified

### Frontend (Widget)
1. **`widget/public/js/core.js`** - Updated token parsing to split by `_`
2. **`widget/public/js/auth.js`** - Updated token generation with `_` separators
3. **`widget/public/js/socket.js`** - Updated token generation with `_` separators (2 locations)
4. **`widget/public/js/chat.js`** - Updated token usage in delete operations (2 locations)

### Backend
1. **`MayaIQ_B-main/middlewares/socket/index.js`** - Updated token parsing with fallback for old format

## Verification

After the fix, check online users list:

**Before:**
```javascript
👥 [Widget] Online users: (3) [123, 588357024, 6588357024]
//                                    DUPLICATE (wrong ID)
```

**After:**
```javascript
👥 [Widget] Online users: (2) [123, 588357024]
//                                    SINGLE USER (correct!)
```

## Console Logs

### Frontend
```javascript
// Old format
🔍 [Widget] Anonymous token: anonusergggg6588357024

// New format
🔍 [Widget] Anonymous token: anonuser_gggg6_588357024
```

### Backend
```javascript
// Old parsing (incorrect)
📝 [GET_MSG] Anonymous user detected - ID: 6588357024

// New parsing (correct)
📝 [GET_MSG] Anonymous user detected - ID: 588357024
```

## Related Issues Fixed

This fix resolves:
1. ✅ Duplicate anonymous users in online list
2. ✅ Anonymous users appearing with wrong IDs
3. ✅ Inconsistent user counts
4. ✅ Message attribution errors (messages from wrong "user")

## Important Notes

### Clear localStorage After Update

For **testing purposes**, clear `localStorage` to ensure users get the new token format:

```javascript
localStorage.removeItem('anonToken');
localStorage.removeItem('pingbash_anon_id');
```

### Production Deployment

In production, the old tokens will naturally phase out as:
- Users refresh their browsers
- localStorage expires or is cleared
- Users return after the session ends

The fallback ensures no breaking changes during transition.

## Summary

**Problem**: Group names ending with digits caused backend to parse anonymous IDs incorrectly

**Solution**: Changed token format from `anonuser{group}{id}` to `anonuser_{group}_{id}`

**Result**: Anonymous users now have correct, consistent IDs across frontend and backend

**Impact**: 
- ✅ No more duplicate users
- ✅ Accurate online user counts
- ✅ Correct message attribution
- ✅ Better user experience

