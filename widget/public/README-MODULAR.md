# Pingbash Chat Widget - Modular Version

## 📦 Overview

The Pingbash Chat Widget has been split into multiple JavaScript modules for better maintainability, organization, and development workflow. Each module handles a specific aspect of the widget functionality.

## 🏗️ Architecture

### Module Structure

```
widget/public/
├── widget-modular.js    # Main entry point (loads all modules)
├── core.js             # Core widget class and configuration
├── styles.js           # CSS styling
├── ui.js               # HTML generation and UI methods
├── socket.js           # Socket.IO communication
├── auth.js             # Authentication and user management
├── chat.js             # Chat functionality and message handling
├── modals.js           # Modals and popups
├── events.js           # Event listeners and interactions
└── test-modular.html   # Test page for the modular version
```

### Loading Order

The modules are loaded in a specific order to ensure dependencies are available:

1. **core.js** - Defines the `PingbashChatWidget` class
2. **styles.js** - Adds CSS styling methods
3. **ui.js** - Adds HTML generation and UI methods
4. **socket.js** - Adds Socket.IO communication
5. **auth.js** - Adds authentication methods
6. **chat.js** - Adds chat functionality
7. **modals.js** - Adds modal and popup methods
8. **events.js** - Adds event listeners and interactions

## 📋 Module Details

### 🔧 core.js
- **Purpose**: Basic widget class with configuration and state management
- **Key Features**:
  - Widget configuration and initialization
  - State management (authentication, groups, messages)
  - Utility methods (anonymous ID generation, localStorage handling)
  - Debug methods for testing

### 🎨 styles.js
- **Purpose**: CSS styling for all widget components
- **Key Features**:
  - Complete CSS for chat dialog, messages, modals
  - Responsive design rules
  - Theme support
  - Scrollbar styling

### 🖼️ ui.js
- **Purpose**: HTML generation and UI management
- **Key Features**:
  - Chat button and dialog creation
  - Modal HTML generation (sign-in, group creation, emoji picker, etc.)
  - Widget positioning
  - UI state management (open/close, badges)

### 📡 socket.js
- **Purpose**: Socket.IO communication and event handling
- **Key Features**:
  - Socket.IO library loading
  - Connection management
  - Message sending/receiving
  - Real-time event handling
  - Online users management

### 🔐 auth.js
- **Purpose**: User authentication and session management
- **Key Features**:
  - Sign-in modal handling
  - Anonymous user authentication
  - Token management
  - Page visibility tracking
  - Chat rules auto-display logic

### 💬 chat.js
- **Purpose**: Message handling, replies, file uploads, and scrolling
- **Key Features**:
  - Message display and rendering
  - Reply functionality
  - File and image uploads
  - Smart scrolling with image loading detection
  - Message ownership detection

### 🪟 modals.js
- **Purpose**: Modal dialogs and popups
- **Key Features**:
  - Chat rules modal (with editing for creators)
  - Group creation modal
  - Emoji picker
  - Mention picker (@-mentions)
  - Sound settings
  - Menu action handling

### 🎯 events.js
- **Purpose**: Event listeners and user interactions
- **Key Features**:
  - All event listener setup
  - Click, keyboard, and form event handling
  - File upload handling
  - Modal interaction events
  - Menu and button interactions

## 🚀 Usage

### Basic Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <!-- Your website content -->
    
    <!-- Load the modular widget -->
    <script 
        src="widget-modular.js"
        data-group-name="my-group"
        data-api-url="https://pingbash.com"
        data-position="bottom-right">
    </script>
</body>
</html>
```

### Configuration Options

All the same configuration options from the original widget are supported:

```html
<script 
    src="widget-modular.js"
    data-group-name="testgroup3"
    data-api-url="https://pingbash.com"
    data-position="bottom-right"
    data-theme="light"
    data-width="500px"
    data-height="600px"
    data-auto-open="false">
</script>
```

## ✨ Features

The modular version includes all features from the original widget:

- 🔐 **Authentication**: Sign in or continue as guest
- 💬 **Real-time messaging**: Socket.IO powered chat
- ↩️ **Reply system**: Reply to specific messages
- 📷 **File uploads**: Images and files
- 😀 **Emoji picker**: Full emoji support
- @ **Mentions**: Tag online users
- 👥 **Online users**: Live user count with badge
- 📋 **Chat rules**: Viewable and editable by group creators
- 🏗️ **Group creation**: Click logo to create new groups
- 🍔 **Admin features**: Hamburger menu with moderation tools
- 📱 **Responsive design**: Works on all screen sizes

## 🧪 Testing

Use the included `test-modular.html` file to test the modular version:

1. Open `test-modular.html` in a web browser
2. Check the console for module loading logs
3. Use the test buttons to verify functionality
4. Compare behavior with the original `widget.js`

## 🔍 Debugging

The modular version includes extensive logging:

- Module loading progress
- Widget initialization steps
- Feature availability checks
- Error handling and reporting

Check the browser console for detailed logs prefixed with:
- `📦 [Widget]` - Module loading
- `🚀 [Widget]` - Initialization
- `🔍 [Widget]` - General debugging
- `❌ [Widget]` - Errors

## 🆚 Comparison with Original

### Advantages of Modular Version:
- ✅ **Better organization**: Each module has a clear purpose
- ✅ **Easier maintenance**: Changes can be made to specific modules
- ✅ **Better debugging**: Module-specific logging
- ✅ **Selective loading**: Could be extended to load only needed modules
- ✅ **Team development**: Multiple developers can work on different modules

### Compatibility:
- ✅ **Same API**: Identical public interface
- ✅ **Same features**: All functionality preserved
- ✅ **Same configuration**: All options supported
- ✅ **Same behavior**: Identical user experience

## 📝 Development Notes

### Adding New Features:
1. Identify the appropriate module (or create a new one)
2. Add methods using `Object.assign(PingbashChatWidget.prototype, { ... })`
3. Update the module loading order if needed
4. Test with `test-modular.html`

### Module Dependencies:
- All modules extend the core `PingbashChatWidget` class
- Modules can call methods from previously loaded modules
- Event handlers should be set up in `events.js`
- UI elements should be created in `ui.js`

### Best Practices:
- Keep modules focused on their specific purpose
- Use consistent logging prefixes
- Document new methods and features
- Test thoroughly before deployment

## 🚀 Deployment

For production use, you can either:

1. **Use modular version**: Deploy all module files and use `widget-modular.js`
2. **Build single file**: Concatenate all modules into a single file
3. **Use original**: Continue using the original `widget.js` for simplicity

The modular version is fully functional and ready for production use. 