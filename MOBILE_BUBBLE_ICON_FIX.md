# Mobile Bubble Icon Implementation

## Summary
Modified the widget to show only the bubble icon in the top-right corner on mobile devices during the first load, instead of auto-opening the full chat dialog.

## Changes Made

### 1. Modified `widget/public/js/core.js`

#### Added Mobile Detection Method
Added a new `isMobileDevice()` method that detects mobile devices using multiple criteria:
- **Screen size**: Checks if viewport width is ≤ 768px
- **User agent**: Detects mobile browsers (Android, iOS, etc.)
- **Touch capability**: Checks for touch input support
- Returns `true` if device is considered mobile

```javascript
isMobileDevice() {
    const isMobileScreen = window.innerWidth <= 768;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isMobile = isMobileScreen || (isMobileUserAgent && isTouchDevice);
    return isMobile;
}
```

#### Modified Widget Initialization
Updated the `init()` method to conditionally open the dialog based on device type:
- **Desktop**: Dialog auto-opens (existing behavior)
- **Mobile**: Dialog stays closed, only bubble icon visible (new behavior)

```javascript
// Check if on mobile device
const isMobile = this.isMobileDevice();

// On mobile: keep dialog closed, show only bubble icon
// On desktop: open dialog by default
setTimeout(() => {
    if (!isMobile) {
        this.openDialog();
    }
    this.updateButtonVisibility();
}, 1000);
```

## Behavior

### Mobile Devices (width ≤ 768px or mobile user agent)
- Widget shows **only the bubble icon** in the top-right corner on initial load
- User must tap the bubble icon to open the chat dialog
- Dialog can be closed to return to bubble-only view

### Desktop Devices
- Widget **auto-opens the full dialog** on initial load (original behavior)
- Chat button is hidden when dialog is open
- User can close dialog to show the chat button

## Testing

### To Test on Mobile
1. Open the widget on a mobile device or use browser DevTools mobile emulation
2. Set viewport width to ≤ 768px
3. Widget should load with only the circular bubble icon visible in the top-right
4. Tap the bubble icon to open the chat dialog
5. Close dialog to return to bubble-only view

### To Test on Desktop
1. Open the widget on a desktop browser (width > 768px)
2. Widget should auto-open the full chat dialog
3. Chat button should be hidden
4. Close dialog to see the chat button appear

## Configuration
The position can be configured via the `data-position` attribute:
```html
<script src="./js/widget-split.js"
    data-position="top-right"
    ...>
</script>
```

Available positions:
- `top-right` (recommended for mobile)
- `top-left`
- `bottom-right`
- `bottom-left`

## Debug Logging
When `window.isDebugging = true`, the console will show:
- Mobile detection details (screen size, user agent, touch capability)
- Whether dialog is being auto-opened or staying closed
- Device type classification

Example console output:
```
📱 [Widget] Mobile detection: {
    isMobileScreen: true,
    isMobileUserAgent: true,
    isTouchDevice: true,
    isMobile: true,
    screenWidth: 375
}
💬 [Widget] Dialog closed - showing chat button
```

