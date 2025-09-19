# Iframe Embedding Guide

This guide explains how to properly embed the Pingbash W-version chat widget in an iframe on external websites.

## Basic Iframe Embedding

### Simple Iframe Code
```html
<iframe 
  src="https://your-domain.com/w-version"
  width="400" 
  height="600"
  frameborder="0"
  allow="microphone; camera; geolocation"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
  style="border: 1px solid #ccc; border-radius: 8px;">
</iframe>
```

### Enhanced Iframe with Visibility Support
```html
<iframe 
  id="pingbash-chat"
  src="https://your-domain.com/w-version"
  width="400" 
  height="600"
  frameborder="0"
  allow="microphone; camera; geolocation"
  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
  style="border: 1px solid #ccc; border-radius: 8px;"
  onload="setupIframeVisibility()">
</iframe>

<script>
function setupIframeVisibility() {
  const iframe = document.getElementById('pingbash-chat');
  
  // Send visibility updates to iframe when parent page visibility changes
  document.addEventListener('visibilitychange', () => {
    const isVisible = !document.hidden;
    iframe.contentWindow.postMessage({
      type: 'iframe-visibility-change',
      visible: isVisible
    }, '*');
  });
  
  // Send focus/blur events
  window.addEventListener('focus', () => {
    iframe.contentWindow.postMessage({
      type: 'iframe-visibility-change',
      visible: true
    }, '*');
  });
  
  window.addEventListener('blur', () => {
    iframe.contentWindow.postMessage({
      type: 'iframe-visibility-change',
      visible: false
    }, '*');
  });
}
</script>
```

## Iframe Optimizations Applied

### 1. Enhanced Socket.IO Configuration
- ✅ Cross-origin support enabled
- ✅ Multiple transport methods (WebSocket + polling)
- ✅ Improved reconnection settings
- ✅ Iframe detection in query parameters

### 2. Improved Visibility Detection
- ✅ Multiple visibility detection methods
- ✅ Focus/blur event listeners
- ✅ Parent window message support
- ✅ Fallback to "always visible" for iframes

### 3. Enhanced Message Polling
- ✅ Automatic 5-second polling for iframes
- ✅ Aggressive message synchronization
- ✅ Real-time updates regardless of visibility API

### 4. Backend Iframe Support
- ✅ Iframe connection detection
- ✅ Enhanced logging for debugging
- ✅ CORS configuration optimized

## Troubleshooting

### Common Issues

**Messages not updating in real-time:**
- Check browser console for socket connection errors
- Verify CORS settings allow iframe embedding
- Ensure parent site doesn't block WebSocket connections

**Iframe not loading:**
- Check Content Security Policy (CSP) headers
- Verify X-Frame-Options allows embedding
- Ensure HTTPS if parent site uses HTTPS

**Visibility detection not working:**
- The system now uses multiple detection methods
- Automatic polling ensures messages sync every 5 seconds
- Focus/blur events provide additional reliability

### Debug Information

Check browser console for these log messages:
- `🔍 [W] Iframe detected` - Confirms iframe mode is active
- `🔍 [W] Iframe polling` - Shows automatic message polling
- `🔍 [BACKEND] Iframe connection detected` - Backend recognizes iframe

### Performance Considerations

**Iframe-Specific Optimizations:**
- Automatic message polling every 5 seconds
- Enhanced reconnection handling
- Multiple visibility detection methods
- Reduced reliance on Page Visibility API

**Resource Usage:**
- Slightly higher bandwidth due to polling
- Better user experience with real-time updates
- Optimized for mobile iframe embedding

## Advanced Configuration

### Custom Polling Interval
The default polling interval is 5 seconds for iframes. To customize:

```javascript
// In the iframe source code, modify:
const pollInterval = 3000; // 3 seconds instead of 5
```

### Parent-Child Communication
Enable two-way communication between parent and iframe:

```javascript
// Parent page
iframe.contentWindow.postMessage({
  type: 'custom-action',
  data: { /* your data */ }
}, '*');

// Iframe receives and can respond
window.addEventListener('message', (event) => {
  if (event.data.type === 'custom-action') {
    // Handle custom action
    event.source.postMessage({
      type: 'response',
      data: { /* response data */ }
    }, '*');
  }
});
```

## Testing Iframe Embedding

### Test Checklist
1. ✅ Iframe loads without errors
2. ✅ Socket connection establishes
3. ✅ Messages from other users appear in real-time
4. ✅ Sending messages works correctly
5. ✅ Page refresh/reload maintains functionality
6. ✅ Mobile devices work in iframe
7. ✅ Cross-browser compatibility

### Test Scenarios
- **Desktop → Mobile iframe**: Send from desktop, verify mobile iframe receives
- **Mobile → Desktop iframe**: Send from mobile, verify desktop iframe receives
- **Iframe → Direct access**: Messages sync between iframe and direct access
- **Multiple iframes**: Multiple iframes on same page work independently

## Browser Compatibility

### Supported Browsers
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Known Limitations
- Page Visibility API limited in iframes (handled by fallbacks)
- Some ad blockers may interfere with WebSocket connections
- Very old browsers may require polling-only mode

---

**The iframe embedding system is now optimized for real-time message synchronization across all devices and browsers!** 