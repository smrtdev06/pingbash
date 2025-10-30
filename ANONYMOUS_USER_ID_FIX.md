# Anonymous User ID Duplication Fix

## Problem

The original anonymous user ID generation was creating **duplicate users** for the same browser, as shown in the issue:

```
Online users: Array(2)
  0: {id: 18878790, name: 'anon790'}
  1: {id: 118878790, name: 'anon790'}
```

Both users have the same name suffix (`790`) but different IDs, indicating the same browser was assigned different anonymous IDs.

## Root Cause

The original implementation used **browser fingerprinting only**:

```javascript
getAnonId() {
    const fingerprint = this.getBrowserFingerprint(); // Screen size, user agent, etc.
    const anonId = this.hashStringToNumber(fingerprint);
    return anonId % 1000000000;
}
```

### Why This Failed:

1. **Unstable Fingerprint**: Browser properties can change:
   - Screen resolution (window resize, display change)
   - User agent (browser update)
   - Timezone (travel, DST)
   - Language settings

2. **Race Conditions**: `getAnonId()` called multiple times before `anonToken` was saved to localStorage

3. **No Persistence Check**: Even though `anonToken` was stored, the ID itself wasn't stored separately, so if token was lost, a new ID would be generated

4. **Collision Risk**: Pure fingerprinting has collision risks for users with identical browser configurations

## Solution

Implemented a **persistent localStorage-based approach** with fallback to enhanced fingerprinting:

```javascript
getAnonId() {
    // Step 1: Check for existing stored ID
    const storedAnonId = localStorage.getItem('pingbash_anon_id');
    if (storedAnonId) {
        const parsedId = parseInt(storedAnonId);
        if (parsedId && !isNaN(parsedId) && parsedId > 0) {
            console.log('Using stored anonymous ID:', parsedId);
            return parsedId; // ✅ Same ID every time
        }
    }

    // Step 2: Generate new ID (only if none exists)
    const fingerprint = this.getBrowserFingerprint();
    const fingerprintHash = this.hashStringToNumber(fingerprint);
    
    // Add randomness + timestamp to ensure uniqueness
    const randomComponent = Math.floor(Math.random() * 1000);
    const timestamp = Date.now() % 100000;
    
    const combinedString = `${fingerprintHash}_${timestamp}_${randomComponent}`;
    const anonId = this.hashStringToNumber(combinedString) % 900000000 + 100000000;
    
    // Step 3: Persist the ID
    localStorage.setItem('pingbash_anon_id', anonId.toString());
    console.log('Generated new anonymous ID:', anonId);
    
    return anonId;
}
```

## Key Improvements

### 1. **Persistent Storage First**
- Anonymous ID stored in `localStorage.getItem('pingbash_anon_id')`
- Checked BEFORE generating new ID
- ✅ Same browser = Same ID (even if fingerprint changes)

### 2. **Enhanced Uniqueness**
When generating new IDs, combines:
- Browser fingerprint (device identity)
- Timestamp (temporal uniqueness)
- Random component (collision avoidance)

### 3. **Better ID Range**
- Old: 0 to 999,999,999
- New: 100,000,000 to 999,999,999
- Ensures IDs are always 9 digits

### 4. **Clear Logging**
- Logs when using stored ID
- Logs when generating new ID
- Helps debugging

## Storage Hierarchy

The system now uses TWO localStorage keys:

1. **`pingbash_anon_id`** (NEW)
   - Stores the anonymous user ID number
   - Checked first in `getAnonId()`
   - Never expires unless localStorage is cleared

2. **`anonToken`** (EXISTING)
   - Stores: `anonuser{groupName}{anonId}`
   - Example: `anonusertestgroup3847561923`
   - Used for authentication with backend

## Behavior Changes

### Before (Unstable)
```
Visit 1: getAnonId() → fingerprint → 18878790
Visit 2: getAnonId() → fingerprint (slightly different) → 118878790
Result: 2 different users ❌
```

### After (Stable)
```
Visit 1: getAnonId() → no stored ID → generate 847561923 → store in localStorage
Visit 2: getAnonId() → found stored ID 847561923 → return immediately
Result: Same user ✅
```

## Edge Cases Handled

### Case 1: localStorage Cleared
```javascript
// localStorage is empty
getAnonId() → no stored ID → generates new random ID → stores it
// New anonymous identity created
```

### Case 2: Incognito/Private Browsing
```javascript
// Private browsing has separate localStorage
getAnonId() → no stored ID → generates new ID → stores in private storage
// Gets new ID, but consistent within that private session
```

### Case 3: Different Browsers on Same Device
```javascript
// Chrome: localStorage.getItem('pingbash_anon_id') → '123456789'
// Firefox: localStorage.getItem('pingbash_anon_id') → '987654321'
// Correctly treated as different users ✅
```

### Case 4: Multiple Tabs
```javascript
// All tabs share same localStorage
// Tab 1: getAnonId() → 123456789
// Tab 2: getAnonId() → 123456789 (reads same stored value)
// Same user across tabs ✅
```

## Migration Strategy

### For Existing Users

**Scenario A**: User with saved `anonToken` but no `pingbash_anon_id`
```javascript
1. getAnonId() called
2. No 'pingbash_anon_id' found
3. Generates NEW anonymous ID (different from token)
4. Stores new ID
Result: User gets new identity (acceptable for anonymous users)
```

**Scenario B**: User visits after fix deployed
```javascript
1. First visit: Generates ID, stores in 'pingbash_anon_id'
2. Subsequent visits: Uses stored ID
Result: Consistent identity ✅
```

### Clean Migration (Optional)

If you want to preserve existing anonymous identities, add this migration code:

```javascript
getAnonId() {
    // Check for stored ID
    let storedAnonId = localStorage.getItem('pingbash_anon_id');
    
    // MIGRATION: Extract ID from existing anonToken if no stored ID
    if (!storedAnonId) {
        const anonToken = localStorage.getItem('anonToken');
        if (anonToken) {
            // anonToken format: anonuser{groupName}{anonId}
            const tokenPrefix = `anonuser${this.config.groupName}`;
            const extractedId = anonToken.replace(tokenPrefix, '');
            if (extractedId && !isNaN(parseInt(extractedId))) {
                storedAnonId = extractedId;
                localStorage.setItem('pingbash_anon_id', storedAnonId);
                console.log('Migrated existing anonymous ID:', storedAnonId);
            }
        }
    }
    
    if (storedAnonId) {
        // ... rest of code
    }
}
```

## Testing

### Test 1: First-Time User
```bash
1. Clear localStorage
2. Open widget
3. Continue as anonymous
Expected: New ID generated and stored
```

### Test 2: Returning User
```bash
1. Complete Test 1
2. Refresh page
3. Check ID
Expected: Same ID as Test 1 ✅
```

### Test 3: Screen Resize
```bash
1. Complete Test 1
2. Resize browser window
3. Refresh page
Expected: Same ID (not affected by fingerprint change) ✅
```

### Test 4: Multiple Sessions
```bash
1. Open widget in Tab 1
2. Get anonymous ID (e.g., 123456789)
3. Open widget in Tab 2
Expected: Same ID in both tabs ✅
```

### Test 5: Clear localStorage
```bash
1. Complete Test 1
2. Clear localStorage
3. Refresh page
Expected: NEW ID generated (fresh start)
```

## Verification

Check browser console for these logs:

**First Visit:**
```
👤 [Widget] Generated new anonymous ID: 847561923
```

**Subsequent Visits:**
```
👤 [Widget] Using stored anonymous ID: 847561923
```

**Online Users (No Duplicates):**
```javascript
Online users: Array(1)
  0: {id: 847561923, name: 'anon923'}
```

## Files Modified

- `widget/public/js/core.js` - Updated `getAnonId()` method

## Benefits

✅ **No more duplicate anonymous users**
✅ **Consistent identity across sessions**
✅ **Works even if browser fingerprint changes**
✅ **Better collision avoidance with timestamp + random**
✅ **Clear debugging with console logs**
✅ **Backward compatible (generates new ID if needed)**

## Limitations

⚠️ **localStorage Dependency**: If user clears localStorage, they get a new identity (acceptable for anonymous users)
⚠️ **Per-Browser**: Same person on different browsers = different anonymous identities (expected behavior)
⚠️ **Private Browsing**: Gets new ID per session (expected behavior)

