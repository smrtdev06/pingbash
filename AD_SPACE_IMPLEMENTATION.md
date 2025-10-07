# Ad Space Implementation in Chat Widget Header

## Overview
Added a sample advertisement display in the center region of the chat widget header.

## Changes Made

### 1. HTML Structure (`widget/public/js/ui.js`)
Added a new center section to the header with a sample ad:

```html
<div class="pingbash-header-center">
  <!-- Ad Space -->
  <div class="pingbash-header-ad">
    <a href="https://example.com" target="_blank" rel="noopener noreferrer" class="pingbash-ad-link">
      <div class="pingbash-ad-content">
        <span class="pingbash-ad-text">🎉 Special Offer!</span>
        <span class="pingbash-ad-label">Ad</span>
      </div>
    </a>
  </div>
</div>
```

**Header Layout:**
```
┌─────────────────────────────────────────────────────┐
│ Logo │      [AD SPACE]      │ Popout │ Menu      │
└─────────────────────────────────────────────────────┘
```

### 2. CSS Styles (`widget/public/js/styles.js`)

#### Desktop Styles:
- **`.pingbash-header-center`**: Flexbox container, centered, takes available space
- **`.pingbash-header-ad`**: Max width of 250px
- **`.pingbash-ad-content`**: 
  - Purple gradient background (`#667eea` to `#764ba2`)
  - Rounded corners, padding, shadow
  - Hover effect with transform and enhanced shadow
- **`.pingbash-ad-text`**: Main ad text (13px, bold, truncated)
- **`.pingbash-ad-label`**: Small "Ad" badge (9px, uppercase, semi-transparent background)

#### Mobile Styles:
- **Hidden by default** on screens ≤768px
- Alternative compact layout available (commented out) for mobile display

#### Dark Mode:
- Adjusted gradient: `#5568d3` to `#6941a0`
- Enhanced shadow with better contrast
- Label background: `rgba(255, 255, 255, 0.2)`

### 3. Drag Exclusion (`widget/public/js/ui.js`)
Added ad elements to drag exclusion list:
- `.pingbash-header-ad`
- `.pingbash-ad-link`

This prevents the header drag functionality from interfering with ad clicks.

## Features

✅ **Responsive Design**: Hidden on mobile, visible on desktop  
✅ **Dark Mode Support**: Adjusted colors for dark theme  
✅ **Interactive**: Clickable link with hover effects  
✅ **Accessible**: Opens in new tab with proper rel attributes  
✅ **Drag-Friendly**: Excluded from header drag functionality  
✅ **Clean Design**: Compact, professional appearance with gradient background  

## Customization

### Change Ad Content:
```html
<span class="pingbash-ad-text">Your Message Here</span>
```

### Change Ad Link:
```html
<a href="https://your-url.com" target="_blank" ...>
```

### Show Ad on Mobile:
Uncomment the alternative mobile styles in `styles.js` (lines ~238-254):
```css
.pingbash-header-center {
  padding: 0 8px !important;
}
```

### Change Ad Colors:
```css
/* Light mode */
.pingbash-ad-content {
  background: linear-gradient(135deg, #YOUR_COLOR1, #YOUR_COLOR2);
}

/* Dark mode */
.pingbash-dark-mode .pingbash-ad-content {
  background: linear-gradient(135deg, #YOUR_DARK_COLOR1, #YOUR_DARK_COLOR2) !important;
}
```

## Testing

**Desktop:**
1. ✅ Ad displays in center of header
2. ✅ Ad is clickable and opens link in new tab
3. ✅ Hover effect works smoothly
4. ✅ Clicking ad doesn't trigger header drag
5. ✅ Dark mode shows adjusted colors

**Mobile:**
1. ✅ Ad is hidden (more screen space for chat)
2. ✅ Header layout remains functional

## Example Preview

**Light Mode:**
```
Logo    🎉 Special Offer! [Ad]    [≡]
        ─────────────────────
          (Purple gradient)
```

**Dark Mode:**
```
Logo    🎉 Special Offer! [Ad]    [≡]
        ─────────────────────
        (Darker purple gradient)
```

## Future Enhancements

- Dynamic ad content loading from API
- Ad rotation/carousel
- Analytics tracking
- Ad targeting based on user preferences
- Close button for dismissible ads
- Animation effects (slide-in, fade)

