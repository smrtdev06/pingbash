# 🚀 Pingbash Chat Web Component

A modern, embeddable chat widget that can be integrated into any website with a single HTML tag.

## ✨ Features

- **🎨 Fully Customizable**: Colors, themes, positioning, and branding
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🔒 Secure**: Shadow DOM encapsulation prevents CSS conflicts
- **⚡ Real-time**: WebSocket-powered instant messaging
- **🔔 Smart Notifications**: Visual alerts for new messages
- **🎯 Easy Integration**: Single HTML tag, no complex setup
- **🌐 Cross-browser**: Works in all modern browsers
- **♿ Accessible**: Built with accessibility best practices

## 🚀 Quick Start

### 1. Include the Web Component

```html
<script src="https://your-domain.com/components/PingbashChat.js"></script>
```

### 2. Add to Your HTML

```html
<pingbash-chat 
    group-name="your-group-name"
    api-url="https://your-api.com"
    position="bottom-right">
</pingbash-chat>
```

### 3. That's it! 🎉

Your chat widget is now live and ready to use.

## ⚙️ Configuration Options

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `group-name` | string | `"default"` | Chat group/room name |
| `width` | string | `"400px"` | Widget width |
| `height` | string | `"600px"` | Widget height |
| `theme` | string | `"light"` | Theme: `"light"` or `"dark"` |
| `position` | string | `"bottom-right"` | Position: `"bottom-right"`, `"bottom-left"`, `"top-right"`, `"top-left"` |
| `api-url` | string | `"https://pingbash.com"` | Backend API URL |
| `auto-open` | boolean | `false` | Auto-open chat on page load |
| `show-header` | boolean | `true` | Show chat header bar |
| `allow-minimize` | boolean | `true` | Enable minimize button |
| `custom-colors` | JSON | `null` | Custom color scheme |

### Custom Colors Example

```html
<pingbash-chat 
    custom-colors='{"primary":"#ff6b6b","secondary":"#4ecdc4","text":"#333","background":"#fff"}'>
</pingbash-chat>
```

## 💻 JavaScript API

### Getting the Widget

```javascript
// Get existing widget
const widget = document.querySelector('pingbash-chat');

// Create programmatically
const widget = PingbashChat.create({
    groupName: 'my-group',
    position: 'bottom-right',
    customColors: { primary: '#ff6b6b' }
});
```

### Control Methods

```javascript
widget.open();        // Open the chat
widget.close();       // Close the chat
widget.minimize();    // Minimize the chat
widget.restore();     // Restore from minimized
```

### Configuration Updates

```javascript
widget.updateConfig({
    theme: 'dark',
    customColors: { primary: '#purple' },
    position: 'bottom-left'
});
```

### Event Listeners

```javascript
// Chat opened
widget.addEventListener('pingbash-opened', () => {
    console.log('Chat opened!');
});

// Chat closed
widget.addEventListener('pingbash-closed', () => {
    console.log('Chat closed!');
});

// New message received
widget.addEventListener('pingbash-message', (event) => {
    console.log('New message:', event.detail);
});

// User joined
widget.addEventListener('pingbash-user-joined', (event) => {
    console.log('User joined:', event.detail);
});

// Chat minimized
widget.addEventListener('pingbash-minimized', () => {
    console.log('Chat minimized!');
});

// Chat restored
widget.addEventListener('pingbash-restored', () => {
    console.log('Chat restored!');
});
```

## 🎨 Styling & Themes

### Built-in Themes

- **Light Theme**: Clean, bright interface
- **Dark Theme**: Modern dark mode interface

### Custom Colors

You can customize the entire color scheme:

```javascript
const customColors = {
    primary: '#ff6b6b',      // Primary brand color
    secondary: '#4ecdc4',    // Secondary accent color
    text: '#333333',         // Text color
    background: '#ffffff'    // Background color
};
```

### CSS Custom Properties

The component uses CSS custom properties that you can override:

```css
pingbash-chat {
    --pb-primary-color: #your-color;
    --pb-secondary-color: #your-color;
    --pb-text-color: #your-color;
    --pb-background-color: #your-color;
}
```

## 📱 Responsive Design

The widget automatically adapts to different screen sizes:

- **Desktop**: Full-featured widget with all controls
- **Tablet**: Optimized layout for touch interaction
- **Mobile**: Full-screen overlay on small screens

## 🔧 Advanced Configuration

### Multiple Widgets

You can have multiple chat widgets on the same page:

```html
<pingbash-chat group-name="support" position="bottom-right"></pingbash-chat>
<pingbash-chat group-name="sales" position="bottom-left"></pingbash-chat>
```

### Dynamic Configuration

```javascript
// Change group dynamically
widget.updateConfig({ groupName: 'new-group' });

// Update colors based on user preference
widget.updateConfig({ 
    customColors: { primary: userPreferences.brandColor } 
});
```

## 🚀 Production Deployment

### CDN Hosting

Host the component file on your CDN:

```html
<script src="https://cdn.your-domain.com/pingbash-chat.min.js"></script>
```

### Self-Hosting

1. Download `PingbashChat.js`
2. Host on your server
3. Include in your HTML

### Performance Tips

- Load the component asynchronously
- Use the `loading="lazy"` attribute for better performance
- Consider using a service worker for offline support

## 🔒 Security Considerations

- The component uses Shadow DOM for style encapsulation
- All user input is properly sanitized
- WebSocket connections use secure protocols in production
- No external dependencies except Socket.IO

## 🐛 Troubleshooting

### Common Issues

**Widget not appearing:**
- Check that the script is loaded correctly
- Verify the API URL is accessible
- Check browser console for errors

**Connection issues:**
- Ensure WebSocket connections are allowed
- Check firewall/proxy settings
- Verify backend server is running

**Styling conflicts:**
- The component uses Shadow DOM to prevent conflicts
- Custom CSS should use the provided CSS custom properties

### Debug Mode

Enable debug logging:

```javascript
window.PingbashDebug = true;
```

## 📊 Browser Support

| Browser | Version |
|---------|---------|
| Chrome | 54+ |
| Firefox | 63+ |
| Safari | 10.1+ |
| Edge | 79+ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: [docs.pingbash.com](https://docs.pingbash.com)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@pingbash.com

---

Made with ❤️ by the Pingbash team 