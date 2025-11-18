# Widget Fullscreen Mode for *.pingbash.com Domains

## Feature

When the widget is loaded on any `*.pingbash.com` subdomain, it automatically enters **fullscreen mode**, filling the entire browser window.

## How It Works

### Automatic Detection

The widget automatically detects if it's running on a PingBash subdomain:

```javascript
const isPingbashDomain = window.location.hostname.match(/^([^.]+)\.pingbash\.com$/);
```

### Examples of Matching Domains

✅ **Will enable fullscreen:**
- `testgroup6.pingbash.com`
- `mychat.pingbash.com`
- `demo.pingbash.com`
- `support.pingbash.com`
- Any subdomain like `{anything}.pingbash.com`

❌ **Will NOT enable fullscreen:**
- `pingbash.com` (no subdomain)
- `www.pingbash.com` (www is treated as subdomain but main domain)
- `example.com`
- `chat.mywebsite.com`

## What Happens in Fullscreen Mode

When the widget detects a `*.pingbash.com` domain, it automatically:

1. **Creates layout container** (if not exists):
   ```html
   <div id="pingbash-chat-layout"></div>
   ```

2. **Applies fullscreen styles to body**:
   ```css
   body {
     margin: 0;
     padding: 0;
     height: 100vh;
     overflow: hidden;
   }
   ```

3. **Applies fullscreen styles to container**:
   ```css
   #pingbash-chat-layout {
     width: 100vw;
     height: 100vh;
     position: fixed;
     top: 0;
     left: 0;
     box-sizing: border-box;
   }
   ```

4. **Overrides widget configuration**:
   ```javascript
   config.width = '100vw';
   config.height = '100vh';
   config.autoOpen = true; // Chat opens automatically
   ```

5. **Extracts group name from subdomain**:
   - URL: `mychat.pingbash.com`
   - Group name: `mychat`

## Implementation

### File: `widget/public/js/widget-split.js`

**Code Added (lines 366-422):**

```javascript
// Check if we're on *.pingbash.com domain
const isPingbashDomain = window.location.hostname.match(/^([^.]+)\.pingbash\.com$/);

// ... existing config setup ...

// If on *.pingbash.com domain, automatically set fullscreen mode
if (isPingbashDomain) {
  if( window.isDebugging ) console.log('🌐 [Widget] Detected *.pingbash.com domain - enabling fullscreen mode');
  
  // Create layout element if it doesn't exist
  let layoutElement = document.getElementById('pingbash-chat-layout');
  if (!layoutElement) {
    layoutElement = document.createElement('div');
    layoutElement.id = 'pingbash-chat-layout';
    document.body.appendChild(layoutElement);
    if( window.isDebugging ) console.log('🌐 [Widget] Created layout element for fullscreen mode');
  }
  
  // Set fullscreen styles on body and layout element
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.height = '100vh';
  document.body.style.overflow = 'hidden';
  
  layoutElement.style.width = '100vw';
  layoutElement.style.height = '100vh';
  layoutElement.style.position = 'fixed';
  layoutElement.style.top = '0';
  layoutElement.style.left = '0';
  layoutElement.style.boxSizing = 'border-box';
  
  // Override config for fullscreen
  config.width = '100vw';
  config.height = '100vh';
  config.autoOpen = true;
  
  if( window.isDebugging ) console.log('🌐 [Widget] Fullscreen mode configured');
}
```

## Usage

### Option 1: Automatic (On *.pingbash.com)

Simply include the widget script on any `*.pingbash.com` subdomain:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Chat</title>
</head>
<body>
    <script src="https://pingbash.com/widget/js/widget-split.js"></script>
</body>
</html>
```

**That's it!** The widget will:
- Auto-detect the domain
- Extract the group name from subdomain
- Enable fullscreen mode
- Open the chat automatically

### Option 2: Manual Fullscreen (Any Domain)

For non-PingBash domains, you can manually enable fullscreen mode:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Chat</title>
    <style>
        html, body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }
        #pingbash-chat-layout {
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            box-sizing: border-box;
        }
    </style>
</head>
<body>
    <div id="pingbash-chat-layout"></div>
    
    <script src="https://pingbash.com/widget/js/widget-split.js"
        data-group-name="mychat"
        data-api-url="https://pingbash.com"
        data-width="100vw"
        data-height="100vh"
        data-auto-open="true"
    ></script>
</body>
</html>
```

## Console Logs

When the widget detects a PingBash domain, you'll see these logs (with debugging enabled):

```
🌐 [Widget] Extracted groupName from hostname: testgroup6
🌐 [Widget] Detected *.pingbash.com domain - enabling fullscreen mode
🌐 [Widget] Created layout element for fullscreen mode
🌐 [Widget] Fullscreen mode configured
```

## Benefits

### For PingBash.com Subdomains
1. ✅ **Zero Configuration** - Just include the script
2. ✅ **Automatic Group Detection** - Group name from subdomain
3. ✅ **Instant Fullscreen** - No manual styling needed
4. ✅ **Mobile Friendly** - Works on all devices
5. ✅ **Always Open** - Chat is immediately available

### For Custom Domains
1. ✅ **Manual Control** - Explicit configuration
2. ✅ **Flexible Layout** - Can customize container
3. ✅ **Custom Group Names** - Specify any group

## Demo Files

### Fullscreen Demo
- **File**: `widget/public/fullscreen-demo.html`
- **Purpose**: Shows fullscreen mode with manual configuration
- **Usage**: Open in browser to test fullscreen chat

### Standard Widget Demo
- **File**: `widget/public/index.html`
- **Purpose**: Shows standard embedded widget mode
- **Usage**: Open in browser to test embedded chat

## Testing

### Test on *.pingbash.com Domain

1. Deploy the widget to a subdomain:
   ```
   https://testchat.pingbash.com
   ```

2. HTML should be minimal:
   ```html
   <!DOCTYPE html>
   <html>
   <body>
       <script src="https://pingbash.com/widget/js/widget-split.js"></script>
   </body>
   </html>
   ```

3. Open in browser - chat fills the entire window!

### Test on Custom Domain

1. Use the `fullscreen-demo.html` file
2. Customize the `data-group-name` attribute
3. Open in browser - chat fills the entire window!

## Browser Compatibility

✅ **Works on all modern browsers:**
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

✅ **Responsive:**
- Desktop (1920x1080, 1366x768, etc.)
- Tablet (768x1024, etc.)
- Mobile (375x667, 414x896, etc.)

## Technical Details

### Regex Pattern
```javascript
/^([^.]+)\.pingbash\.com$/
```

**Breakdown:**
- `^` - Start of string
- `([^.]+)` - Capture group: one or more non-dot characters (the subdomain)
- `\.` - Literal dot
- `pingbash\.com` - Literal "pingbash.com"
- `$` - End of string

**Examples:**
```javascript
'test.pingbash.com'.match(/^([^.]+)\.pingbash\.com$/);
// ✅ Matches: ['test.pingbash.com', 'test']

'hello.world.pingbash.com'.match(/^([^.]+)\.pingbash\.com$/);
// ❌ No match (has multiple subdomains)

'pingbash.com'.match(/^([^.]+)\.pingbash\.com$/);
// ❌ No match (no subdomain)
```

### DOM Manipulation Timing

The fullscreen setup happens **during widget initialization**, before the widget creates its dialog:

```
1. Load widget-split.js
2. Detect domain
3. Create/modify layout container ← Fullscreen setup here
4. Apply body styles
5. Override config
6. Initialize widget
7. Create chat dialog (embedded in layout container)
```

This ensures the fullscreen mode is ready before any UI elements are created.

## Future Enhancements

Potential improvements:
1. Support for multi-level subdomains (e.g., `chat.dev.pingbash.com`)
2. Custom domain mapping (allow any domain to use subdomain-style naming)
3. Fullscreen exit button (toggle between fullscreen and windowed)
4. Responsive breakpoints (different layouts for mobile vs desktop)

## Related Files

- `widget/public/js/widget-split.js` - Main widget initialization
- `widget/public/js/ui.js` - UI creation and layout detection
- `widget/public/js/core.js` - Core widget functionality
- `widget/public/index.html` - Embedded mode demo
- `widget/public/fullscreen-demo.html` - Fullscreen mode demo

## Summary

**Feature**: Automatic fullscreen mode for `*.pingbash.com` domains

**Detection**: Regex matching on `window.location.hostname`

**Implementation**: 
- Auto-create/style layout container
- Override widget config
- Extract group name from subdomain

**Benefits**:
- Zero-config deployment
- Perfect for dedicated chat pages
- Mobile-friendly
- Always-open chat experience

