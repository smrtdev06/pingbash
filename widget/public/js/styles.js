/**
 * STYLES functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add styles methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) 
  Object.assign(window.PingbashChatWidget.prototype, {

  // EXACT COPY from widget.js - applyStyles method
    applyStyles() {
      // Remove existing styles if they exist (for hot reloading)
      const existingStyle = document.getElementById('pingbash-widget-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
  
      const style = document.createElement('style');
      style.id = 'pingbash-widget-styles';
      style.setAttribute('data-pingbash-widget', 'true');
      style.textContent = `
        /* Pingbash Chat Widget - Self-contained styles */
        /* CSS Reset for widget elements to prevent conflicts */
        .pingbash-widget,
        .pingbash-widget *,
        .pingbash-widget *::before,
        .pingbash-widget *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          border: 0;
          font-size: 100%;
          font: inherit;
          vertical-align: baseline;
          background: transparent;
          color: inherit;
          text-decoration: none;
          list-style: none;
          outline: none;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          
        }
        
        .pingbash-widget {
          /* Override any potential conflicts */
          all: initial;
          position: fixed !important;
          z-index: 2147483647 !important; /* Maximum z-index */
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          color: #333 !important;
          text-align: left !important;
          direction: ltr !important;
          /* Ensure no parent styles affect us */
          transform: none !important;
          filter: none !important;
          opacity: 1 !important;
          visibility: visible !important;
          /* Support for drag and drop */
          cursor: default !important;
        }
        
        .pingbash-widget.dragging {
          transition: none !important;
          user-select: none !important;
          box-shadow: 0 12px 48px rgba(0,0,0,0.2) !important;
        }
        
        .pingbash-chat-dialog.dragging {
          transition: none !important;
          user-select: none !important;
          box-shadow: 0 12px 48px rgba(0,0,0,0.25) !important;
          z-index: 2147483648 !important;
        }
        
        .pingbash-widget[data-position="top-left"] {
          top: 20px;
          left: 20px;
        }
        
        .pingbash-widget[data-position="top-right"] {
          top: 20px;
          right: 20px;
        }
        
        .pingbash-widget[data-position="bottom-left"] {
          bottom: 20px;
          left: 20px;
        }
        
        .pingbash-widget[data-position="bottom-right"] {
          bottom: 20px;
          right: 20px;
        }
        
        .pingbash-chat-button {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, ${this.config.customColors?.primary || '#2596be'}, #1e7ba8);
          color: white;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          outline: none;
        }
        
        .pingbash-chat-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        
        .pingbash-chat-button:active {
          transform: scale(0.95);
        }
        
        /* Chat button initially hidden (dialog opens by default) */
        .pingbash-chat-button {
          display: none;
        }
        
        .pingbash-chat-icon {
          width: 28px;
          height: 28px;
        }
        
        .pingbash-unread-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulse 2s infinite;
        }
        
        .pingbash-chat-dialog {
          position: absolute;
          ${this.config.position.includes('top') ? 'top: 70px;' : 'bottom: 70px;'}
          ${this.config.position.includes('left') ? 'left: 0;' : 'right: 0;'}
          width: ${this.config.width};
          height: ${this.config.height};
          min-width: ${this.config.minWidth};
          min-height: ${this.config.minHeight};
          max-width: ${this.config.maxWidth};
          max-height: ${this.config.maxHeight};
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          overflow: hidden;
          resize: ${this.config.resizable ? 'both' : 'none'};
          transform: scale(0.8) translateY(${this.config.position.includes('top') ? '-' : ''}20px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          border: 1px solid #e0e0e0;
          display: flex;
          flex-direction: column;
        }
        
                /* Mobile: Full-screen by default, popout mode when button clicked */
        @media (max-width: 768px) {
          .pingbash-chat-dialog {
            position: fixed !important;
            /* Full-screen mode (default on mobile) */
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: calc(100vh - 100px);
            max-width: 100vw !important;
            max-height: calc(100vh - 100px) !important;
            border-radius: 0 !important;
            border: none !important;
            /* Disable resize in full-screen mode */
            resize: none !important;
            overflow: hidden !important;
            z-index: 2147483647;
            transition: all 0.3s ease;
          }
          
          /* Popout mode - activated by button click */
          .pingbash-chat-dialog.popout-mode {
            top: 0px;
            left: 0;
            right: auto !important;
            bottom: auto !important;
            width: 350px;
            height: 500px;
            min-width: 100px !important;
            min-height: 100px !important;
            max-width: calc(100vw - 20px) !important;
            max-height: calc(100vh - 20px) !important;
            border-radius: 12px !important;
            border: 1px solid #e0e0e0 !important;
            resize: both !important;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important;
          }
          
          .pingbash-chat-dialog.open {
            opacity: 1;
            visibility: visible;
          }
          
          /* Embedded mode styles */
          .pingbash-chat-dialog.pingbash-embedded-mode {
            position: relative !important;
            width: 100% !important;
            height: 100% !important;
            top: auto !important;
            left: auto !important;
            right: auto !important;
            bottom: auto !important;
            transform: none !important;
            margin: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            resize: none !important;
            overflow: hidden !important;
            cursor: default !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
            min-height: 0 !important;
            max-height: 100% !important;
          }
          
          /* Disable drag cursor in embedded mode */
          .pingbash-chat-dialog.pingbash-embedded-mode .pingbash-header {
            cursor: default !important;
            user-select: auto !important;
            flex-shrink: 0 !important;
            min-height: auto !important;
          }
          
          /* Ensure input bar doesn't grow in embedded mode */
          .pingbash-chat-dialog.pingbash-embedded-mode .pingbash-input-bar {
            flex-shrink: 0 !important;
            min-height: auto !important;
          }
          
          /* Disable resize handle in embedded mode */
          .pingbash-chat-dialog.pingbash-embedded-mode .pingbash-resize-handle {
            display: none !important;
          }
          
          /* Ensure messages container fills available space in embedded mode */
          .pingbash-chat-dialog.pingbash-embedded-mode .pingbash-messages-list {
            flex: 1 !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            height: auto !important;
            max-height: none !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          /* Force layout element to maintain its original height */
          #pingbash-chat-layout {
            height: var(--original-height, 800px) !important;
            min-height: var(--original-height, 800px) !important;
            max-height: var(--original-height, 800px) !important;
            display: block !important;
            position: relative !important;
            overflow: hidden !important;
          }
          
          /* Ensure parent elements have height for percentage to work */
          html, body {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          
          /* Popup button styles */
          .pingbash-popup-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border: none;
            background: transparent;
            color: #333;
            cursor: pointer;
            border-radius: 6px;
            transition: background-color 0.2s;
          }
          
          .pingbash-popup-btn:hover {
            background: rgba(0, 0, 0, 0.05);
          }
          
          /* Mobile: Header IS draggable */
          .pingbash-header {
            cursor: move !important;
            user-select: none !important;
            /* Don't use touch-action: none - it blocks clicks on buttons/menu */
          }
          
          /* Show popout button only on mobile */
          .pingbash-popout-btn {
            display: flex !important;
          }
          
          /* Mobile: Make ad more compact */
          .pingbash-header-center {
            padding: 0 8px !important;
            flex: 1 !important;
            min-width: 0 !important;
          }
          
          .pingbash-header-ad {
            max-width: 180px !important;
          }
          
          .pingbash-ad-content {
            padding: 4px 8px !important;
          }
          
          .pingbash-ad-text {
            font-size: 11px !important;
          }
          
          .pingbash-ad-label {
            font-size: 8px !important;
            padding: 1px 4px !important;
          }
          
          /* Keep popout button visible in popout mode (icon will change) */
          
          /* Allow touch interactions on buttons and interactive elements */
          .pingbash-header button,
          .pingbash-header .pingbash-hamburger-btn,
          .pingbash-header .pingbash-hamburger-container,
          .pingbash-header .pingbash-popout-btn,
          .pingbash-header .pingbash-header-inbox-icon,
          .pingbash-header .pingbash-logo,
          .pingbash-hamburger-dropdown,
          .pingbash-menu-item {
            touch-action: auto !important;
            pointer-events: auto !important;
          }
          
          /* Make inbox icon more tappable on mobile (when visible) */
          .pingbash-header-inbox-icon {
            min-width: 44px !important;
            min-height: 44px !important;
            /* Don't force display - let JavaScript control visibility based on unread count */
            align-items: center !important;
            justify-content: center !important;
            cursor: pointer !important;
            -webkit-tap-highlight-color: rgba(0,0,0,0.1) !important;
          }
          
          .pingbash-header-inbox-icon svg {
            width: 28px !important;
            height: 28px !important;
          }
          
                    /* Custom resize handle for mobile - draggable element */
          .pingbash-resize-handle {
            position: absolute;
            bottom: 0;
            right: 0;
            left: auto;
            width: 44px;
            height: 44px;
            background: linear-gradient(135deg, transparent 50%, rgba(0,123,255,0.4) 50%);
            cursor: nwse-resize;
            display: none !important;
            align-items: center;
            justify-content: center;
            border-bottom-right-radius: 12px;
            z-index: 100;
            touch-action: none;
            user-select: none;
            justify-content: end;
          }
          
          /* Ensure dialog has relative positioning for resize handle */
          .pingbash-chat-dialog.pingbash-popup-mode {
            position: relative;
          }
          
          .pingbash-resize-handle svg {
            color: #007bff;
            opacity: 0.8;
            position: absolute;
            bottom: 4px;
            right: 4px;
          }
          
          /* Show resize handle in popout mode and popup mode */
          .pingbash-chat-dialog.popout-mode .pingbash-resize-handle,
          .pingbash-chat-dialog.pingbash-popup-mode .pingbash-resize-handle {
            display: flex !important;
          }
          
          /* Disable native browser resize when using custom handle */
          .pingbash-chat-dialog.popout-mode,
          .pingbash-chat-dialog.pingbash-popup-mode {
            resize: none !important;
            overflow: hidden !important;
          }
          
          /* Allow child elements to shrink below their normal minimums on mobile */
          .pingbash-header {
            padding: 8px 12px !important;
            min-height: auto !important;
            flex-shrink: 0;
          }
          
          .pingbash-header-left {
            gap: 8px !important;
            min-width: 0 !important;
          }
          
          .pingbash-logo {
            width: 32px !important;
            height: 26px !important;
            flex-shrink: 0;
          }
          
          .pingbash-header-title {
            font-size: 12px !important;
            min-width: 0 !important;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .pingbash-messages-area {
            padding: 8px !important;
            min-height: 20px !important;
          }
          
          .pingbash-messages-container {
            min-height: 20px !important;
          }
          
          .pingbash-messages-list {
            min-height: 20px !important;
          }
          
          /* Mobile: Position time at right end of message text */
          .pingbash-message-body {
            position: relative !important;
          }
          
          .pingbash-message-time {
            position: absolute !important;
            bottom: 4px !important;
            right: 8px !important;
            font-size: 9px !important;
            opacity: 0.8 !important;
          }
          
          .pingbash-message-text {
            padding-right: 60px !important; /* Space for timestamp */
            padding-bottom: 2px !important;
          }
          
          .pingbash-input-bar {
            padding: 6px 10px !important;
            min-height: auto !important;
            flex-shrink: 0;
          }
          
          .pingbash-controls-bar {
            padding: 4px 8px !important;
            min-height: auto !important;
            gap: 6px !important;
          }
          
          .pingbash-input-wrapper {
            min-width: 30px !important;
          }
          
          .pingbash-textarea {
            min-height: 24px !important;
            padding: 6px !important;
            font-size: 12px !important;
          }
          
          .pingbash-control-btn {
            width: 24px !important;
            height: 24px !important;
            padding: 4px !important;
          }
          
          .pingbash-btn {
            padding: 4px 8px !important;
            font-size: 12px !important;
            min-height: auto !important;
          }
        }
        
        .pingbash-chat-dialog.open {
          transform: scale(1) translateY(0);
          opacity: 1;
          visibility: visible;
        }
        
        /* W Version Header Styling */
        .pingbash-header {
          background: var(--title-bg-color, white);
          color: var(--title-color, #333);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border-bottom: 1px solid #e0e0e0;
          padding: 0px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          user-select: none;
        }
        
        .pingbash-header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .pingbash-header-logo-section {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .pingbash-logo {
          width: 28px;
          height: 22px;
          flex-shrink: 0;
        }
        
        .pingbash-group-name {
          font-size: 20px;
          font-weight: bold;
          color: #333;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 200px;
        }
        
        .pingbash-header-right {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        
        /* Header Center - Ad Space */
        .pingbash-header-center {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          padding: 0 15px;
        }
        
        .pingbash-header-ad {
          max-width: 250px;
          width: 100%;
        }
        
        .pingbash-ad-link {
          display: block;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease;
        }
        
        .pingbash-ad-link:hover {
          transform: scale(1.02);
        }
        
        .pingbash-ad-content {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 6px 12px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          transition: box-shadow 0.2s ease;
        }
        
        .pingbash-ad-link:hover .pingbash-ad-content {
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.5);
        }
        
        .pingbash-ad-text {
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .pingbash-ad-label {
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.3);
          padding: 2px 6px;
          border-radius: 3px;
          letter-spacing: 0.5px;
        }
  
        .pingbash-online-users-container {
          position: relative;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }
  
        .pingbash-online-users-container:hover {
          background-color: rgba(0,0,0,0.1);
        }
  
        .pingbash-online-users-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
        }
  
        .pingbash-online-count-badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #28a745;
          color: white;
          font-size: 11px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 10px;
          min-width: 18px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
  
        .pingbash-online-count-badge.zero {
          background: #6c757d;
        }

        /* Filter Container Styles (same as F version) */
        .pingbash-filter-container {
          position: relative;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
          transition: background-color 0.2s;
        }

        .pingbash-filter-container:hover {
          background-color: rgba(0,0,0,0.1);
        }

        .pingbash-filter-icon {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pingbash-filter-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 1000;
          min-width: 240px;
          padding: 16px;
          margin-top: 8px;
        }

        .pingbash-filter-widget {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pingbash-filter-option {
          display: flex;
          flex-direction: column;
          
        }

        .pingbash-filter-option > div:first-child {
          display: flex;
          align-items: center;
          margin-bottom: 8px;
          cursor: pointer;
        }

        .pingbash-filter-option input[type="radio"] {
          margin-right: 8px;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .pingbash-filter-option label {
          font-size: 16px;
          cursor: pointer;
          color: #333;
        }

        /* Old inline user search styles removed - now using modal */

        /* Filter Mode Text Styles (same as F version) */
        .pingbash-filter-mode-text {
          font-size: 11px;
          color: #666;
          background: #73dbf9;
          padding: 2px 6px;
          border-radius: 10px;
          margin: 0 4px;
          font-weight: normal;
        }
        
        .pingbash-popout-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: none;
          align-items: center;
          justify-content: center;
          margin-right: 4px;
          position: relative;
        }
        
        .pingbash-popout-btn:hover {
          background: rgba(0,123,255,0.1);
          color: #007bff;
        }
        
        /* Icon positioning - both icons in same button */
        .pingbash-popout-icon,
        .pingbash-fullscreen-icon {
          display: block;
          transition: opacity 0.2s ease;
        }
        
        .pingbash-hamburger-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-hamburger-btn:hover {
          background: rgba(0,0,0,0.05);
        }
        
        .pingbash-hamburger-container {
          position: relative;
        }
        
        .pingbash-hamburger-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 200px;
          z-index: 2147483647;
          padding: 8px 0;
          margin-top: 4px;
        }
        
        .pingbash-menu-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          font-size: 14px;
          color: #333;
        }
        
        .pingbash-menu-item:hover {
          background: rgba(0,0,0,0.05);
        }
        
        .pingbash-menu-item svg {
          flex-shrink: 0;
          opacity: 0.7;
        }
        
        .pingbash-menu-divider {
          height: 1px;
          background: #e0e0e0;
          margin: 8px 0;
        }
        
        /* Settings Menu Styles */
        .pingbash-settings-container {
          position: relative;
          margin-right: 12px;
        }
        
        .pingbash-settings-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #666;
          transition: color 0.2s ease;
          padding: 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-settings-btn:hover {
          color: #007bff;
          background: rgba(0,123,255,0.1);
        }
        
        .pingbash-settings-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 200px;
          z-index: 2147483647;
          margin-top: 4px;
          padding: 8px 0;
        }
        
        /* Professional Dark Mode Theme */
        
        /* Core Dark Mode Variables */
        .pingbash-dark-mode {
          --dark-bg-primary: #1a1a1a;
          --dark-bg-secondary: #2d2d2d;
          --dark-bg-tertiary: #3a3a3a;
          --dark-bg-input: #252525;
          --dark-bg-hover: #404040;
          --dark-bg-active: #4a4a4a;
          --dark-text-primary: #e5e5e5;
          --dark-text-secondary: #b8b8b8;
          --dark-text-muted: #888888;
          --dark-border: #404040;
          --dark-border-light: #555555;
          --dark-shadow: rgba(0, 0, 0, 0.5);
          --dark-accent: #4a9eff;
          --dark-accent-hover: #3d8bff;
          --dark-success: #52c41a;
          --dark-warning: #faad14;
          --dark-error: #ff4d4f;
        }
        
        /* Main Dialog Dark Mode */
        .pingbash-dark-mode.pingbash-chat-dialog {
          background: var(--dark-bg-primary) !important;
          border-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
          box-shadow: 0 8px 32px var(--dark-shadow) !important;
        }
        
        /* Header Dark Mode */
        .pingbash-dark-mode .pingbash-header {
          background: var(--dark-bg-secondary) !important;
          border-bottom-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-group-name {
          color: var(--dark-text-primary) !important;
        }
        
        /* Ad Space Dark Mode */
        .pingbash-dark-mode .pingbash-ad-content {
          background: linear-gradient(135deg, #5568d3 0%, #6941a0 100%) !important;
          box-shadow: 0 2px 8px rgba(85, 104, 211, 0.4) !important;
        }
        
        .pingbash-dark-mode .pingbash-ad-link:hover .pingbash-ad-content {
          box-shadow: 0 4px 12px rgba(85, 104, 211, 0.6) !important;
        }
        
        .pingbash-dark-mode .pingbash-ad-label {
          background: rgba(255, 255, 255, 0.2) !important;
        }
        
        /* Messages Area Dark Mode */
        .pingbash-dark-mode .pingbash-messages-area {
          background: var(--dark-bg-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-loading {
          color: var(--dark-text-secondary) !important;
        }
        
        /* Message Dark Mode */
        .pingbash-dark-mode .pingbash-message:not(.own) .pingbash-message-body {
          background: var(--dark-bg-secondary) !important;
          border-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-message:not(.own) .pingbash-message-sender {
          color: var(--dark-text-secondary) !important;
        }
        
        .pingbash-dark-mode .pingbash-message:not(.own) .pingbash-message-time {
          color: var(--dark-text-muted) !important;
        }
        
        .pingbash-dark-mode .pingbash-message:not(.own) .pingbash-message-text {
          color: var(--dark-text-primary) !important;
        }
        
        /* Own messages keep their blue theme but slightly adjusted for dark mode */
        .pingbash-dark-mode .pingbash-message.own .pingbash-message-body {
          background: linear-gradient(135deg, #1e5a8a, #2596be) !important;
        }
        
        /* Input Areas Dark Mode */
        .pingbash-dark-mode .pingbash-input-bar,
        .pingbash-dark-mode .pingbash-controls-bar {
          background: var(--dark-bg-secondary) !important;
          border-top-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-input-wrapper {
          background: var(--dark-bg-input) !important;
          border-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-message-input {
          background: transparent !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-message-input::placeholder {
          color: var(--dark-text-muted) !important;
        }
        
        /* Control Buttons Dark Mode */
        .pingbash-dark-mode .pingbash-control-btn,
        .pingbash-dark-mode .pingbash-media-btn {
          color: var(--dark-text-secondary) !important;
        }
        
        .pingbash-dark-mode .pingbash-control-btn:hover,
        .pingbash-dark-mode .pingbash-media-btn:hover {
          background: var(--dark-bg-hover) !important;
          color: var(--dark-accent) !important;
        }
        
        /* Dropdowns Dark Mode */
        .pingbash-dark-mode .pingbash-hamburger-dropdown,
        .pingbash-dark-mode .pingbash-settings-dropdown,
        .pingbash-dark-mode .pingbash-filter-dropdown {
          background: var(--dark-bg-secondary) !important;
          border-color: var(--dark-border) !important;
          box-shadow: 0 4px 12px var(--dark-shadow) !important;
        }
        
        .pingbash-dark-mode .pingbash-menu-item {
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-menu-item:hover {
          background: var(--dark-bg-hover) !important;
        }
        
        .pingbash-dark-mode .pingbash-menu-item svg {
          opacity: 0.8 !important;
        }
        
        .pingbash-dark-mode .pingbash-menu-divider {
          background: var(--dark-border) !important;
        }
        
        /* Online Users Badge Dark Mode */
        .pingbash-dark-mode .pingbash-online-users-container:hover {
          background: var(--dark-bg-hover) !important;
        }
        
        .pingbash-dark-mode .pingbash-online-users-icon {
          color: var(--dark-text-secondary) !important;
        }
        
        /* Filter Options Dark Mode */
        .pingbash-dark-mode .pingbash-filter-option {
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-filter-option:hover {
          background: var(--dark-bg-hover) !important;
        }
        
        .pingbash-dark-mode .pingbash-filter-option label {
          color: var(--dark-text-primary) !important;
        }
        
        /* Message Actions Dark Mode */
        .pingbash-dark-mode .pingbash-message-action {
          color: var(--dark-text-muted) !important;
        }
        
        .pingbash-dark-mode .pingbash-message-action:hover {
          background: var(--dark-bg-hover) !important;
          color: var(--dark-text-primary) !important;
        }
        
        /* Reply Preview Dark Mode */
        .pingbash-dark-mode .pingbash-reply-preview {
          background: var(--dark-bg-tertiary) !important;
          border-left-color: var(--dark-accent) !important;
        }
        
        .pingbash-dark-mode .pingbash-reply-preview-sender {
          color: var(--dark-accent) !important;
        }
        
        .pingbash-dark-mode .pingbash-reply-preview-content {
          color: var(--dark-text-secondary) !important;
        }
        
        /* Modal Dark Mode Styles */
        .pingbash-dark-mode .pingbash-popup-content {
          background: var(--dark-bg-secondary) !important;
          border-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-popup-header {
          border-bottom-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-popup-header h3 {
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-popup-close {
          color: var(--dark-text-secondary) !important;
        }
        
        .pingbash-dark-mode .pingbash-popup-close:hover {
          color: var(--dark-text-primary) !important;
        }
        
        /* Form Elements Dark Mode */
        .pingbash-dark-mode .pingbash-form-input {
          background: var(--dark-bg-input) !important;
          border-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-form-input:focus {
          border-color: var(--dark-accent) !important;
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2) !important;
        }
        
        .pingbash-dark-mode .pingbash-form-input::placeholder {
          color: var(--dark-text-muted) !important;
        }
        
        .pingbash-dark-mode .pingbash-form-group label {
          color: var(--dark-text-primary) !important;
        }
        
        /* Button Dark Mode */
        .pingbash-dark-mode .pingbash-continue-anon-btn {
          background: var(--dark-bg-tertiary) !important;
          color: var(--dark-text-primary) !important;
          border-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-continue-anon-btn:hover {
          background: var(--dark-bg-hover) !important;
        }
        
        /* Chat Rules Dark Mode */
        .pingbash-dark-mode .pingbash-rules-text,
        .pingbash-dark-mode .pingbash-no-rules-text {
          background: var(--dark-bg-input) !important;
          border-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-rules-textarea {
          background: var(--dark-bg-input) !important;
          border-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-rules-textarea:focus {
          border-color: var(--dark-accent) !important;
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.2) !important;
        }
        
        /* Sound Settings Dark Mode */
        .pingbash-dark-mode .pingbash-sound-option label {
          color: var(--dark-text-primary) !important;
        }
        
        /* Group Creation Modal Dark Mode */
        .pingbash-dark-mode .pingbash-config-panel {
          background: var(--dark-bg-secondary) !important;
          border-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-config-section {
          background: var(--dark-bg-tertiary) !important;
          border-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-config-title,
        .pingbash-dark-mode .pingbash-config-section h4 {
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-radio-option,
        .pingbash-dark-mode .pingbash-checkbox-option {
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-radio-option:hover,
        .pingbash-dark-mode .pingbash-checkbox-option:hover {
          background: var(--dark-bg-hover) !important;
        }
        
        .pingbash-dark-mode .pingbash-size-input,
        .pingbash-dark-mode .pingbash-group-name-input {
          background: var(--dark-bg-input) !important;
          border-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-size-input:focus,
        .pingbash-dark-mode .pingbash-group-name-input:focus {
          border-color: var(--dark-accent) !important;
          box-shadow: 0 0 0 3px rgba(74, 158, 255, 0.1) !important;
        }
        
        .pingbash-dark-mode .pingbash-input-label,
        .pingbash-dark-mode .pingbash-input-group label {
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-char-counter {
          color: var(--dark-text-muted) !important;
        }
        
        /* Preview Container Dark Mode */
        .pingbash-dark-mode .pingbash-preview-container {
          background: var(--dark-bg-primary) !important;
          border-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-preview-messages {
          background: var(--dark-bg-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-preview-input-container {
          background: var(--dark-bg-input) !important;
          border-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-preview-input {
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-preview-media-btn {
          color: var(--dark-text-secondary) !important;
        }
        
        .pingbash-dark-mode .pingbash-preview-media-btn:hover {
          background: var(--dark-bg-hover) !important;
          color: var(--dark-accent) !important;
        }
        
        /* User Search Modal Dark Mode */
        .pingbash-dark-mode .pingbash-user-search-modal-input {
          background: var(--dark-bg-input) !important;
          border-color: var(--dark-border) !important;
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-user-search-modal-input:focus {
          border-color: var(--dark-accent) !important;
          box-shadow: 0 0 0 2px rgba(74, 158, 255, 0.1) !important;
        }
        
        .pingbash-dark-mode .pingbash-user-search-results {
          background: var(--dark-bg-secondary) !important;
          border-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-user-result-item {
          border-bottom-color: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-user-result-item:hover {
          background: var(--dark-bg-hover) !important;
        }
        
        .pingbash-dark-mode .pingbash-user-result-name {
          color: var(--dark-text-primary) !important;
        }
        
        .pingbash-dark-mode .pingbash-user-result-status {
          color: var(--dark-text-secondary) !important;
        }
        
        .pingbash-dark-mode .pingbash-no-users-found,
        .pingbash-dark-mode .pingbash-loading-users {
          color: var(--dark-text-secondary) !important;
        }
        
        /* Scrollbar Dark Mode */
        .pingbash-dark-mode .pingbash-messages-list::-webkit-scrollbar-track {
          background: var(--dark-bg-secondary) !important;
        }
        
        .pingbash-dark-mode .pingbash-messages-list::-webkit-scrollbar-thumb {
          background: var(--dark-border) !important;
        }
        
        .pingbash-dark-mode .pingbash-messages-list::-webkit-scrollbar-thumb:hover {
          background: var(--dark-border-light) !important;
        }
        
        /* Notification Dark Mode */
        .pingbash-dark-mode .pingbash-timeout-notification,
        .pingbash-dark-mode .pingbash-unban-notification,
        .pingbash-dark-mode .pingbash-untimeout-notification {
          color: var(--dark-text-primary) !important;
        }
        
        /* Animation adjustments for dark mode */
        .pingbash-dark-mode .pingbash-message.new-message {
          animation: fadeInUpDark 0.3s ease !important;
        }
        
        @keyframes fadeInUpDark {
          from {
            opacity: 0;
            transform: translateY(10px);
            background: var(--dark-bg-hover);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            background: transparent;
          }
        }
        
        /* Hover effects for better dark mode experience */
        .pingbash-dark-mode .pingbash-hamburger-btn:hover,
        .pingbash-dark-mode .pingbash-settings-btn:hover {
          background: var(--dark-bg-hover) !important;
          color: var(--dark-accent) !important;
        }
        
        /* Selection colors for dark mode */
        .pingbash-dark-mode ::selection {
          background: var(--dark-accent) !important;
          color: white !important;
        }
        
        .pingbash-dark-mode ::-moz-selection {
          background: var(--dark-accent) !important;
          color: white !important;
        }
        
        /* W Version Messages Area */
        .pingbash-messages-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--msg-bg-color, #f8f9fa);
          padding: 14px;
          padding-top: 20px;
        }
        
        .pingbash-messages-container {
          flex: 1;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .pingbash-messages-list {
          flex: 1;
          overflow-y: auto;
          padding: 2px;
          scroll-behavior: smooth;
        }
        
        .pingbash-loading {
          text-align: center;
          padding: 40px 20px;
          color: #666;
          font-size: 14px;
        }
        
        .pingbash-message {
          margin-bottom: 2px !important;
          opacity: 1 !important;
          display: flex !important;
          width: 100% !important;
        }
        
        .pingbash-message.new-message {
          animation: fadeInUp 0.3s ease;
          animation-fill-mode: forwards;
        }
        
        .pingbash-message-content {
          display: flex !important;
          align-items: flex-start !important;
          gap: 2px !important;
          flex: 1 !important;
          max-width: 100% !important;
          word-wrap: break-word !important;
        }

        /* Message avatar styles (same as W version) */
        .pingbash-message-avatar {
          flex-shrink: 0;
          display: var(--show-avatars, block);
        }

        .pingbash-avatar-image {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        .pingbash-avatar-fallback {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          text-transform: uppercase;
        }

        .pingbash-message-body {
          flex: 1 !important;
          min-width: 0 !important;
          padding: 4px 8px !important;
          border-radius: 18px !important;
          position: relative !important;
        }
        
        .pingbash-message.own {
          display: flex;
          justify-content: flex-start;
        }
        
        .pingbash-message.own .pingbash-message-body {
          background: ${this.config.customColors?.primary || '#2596be'} !important;
          color: white !important;
          border-bottom-left-radius: 4px !important;
          max-width: 80% !important;
        }
        
        .pingbash-message:not(.own) .pingbash-message-body {
          background: #f0f0f0 !important;
          color: #333 !important;
          border-bottom-left-radius: 4px !important;
          max-width: 80% !important;
        }
        
        /* Ensure sender name styling for own messages */
        .pingbash-message.own .pingbash-message-sender {
          color: rgba(255,255,255,0.8) !important;
        }
        
        .pingbash-message.own .pingbash-message-time {
          color: rgba(255,255,255,0.7) !important;
        }
        
        .pingbash-message.own .pingbash-message-text {
          color: white !important;
        }
        
        .pingbash-message-header {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-bottom: 1px;
          opacity: 0.7;
          font-size: 11px;
        }
        
        /* For own messages, align header to the left like other messages */
        .pingbash-message.own .pingbash-message-header {
          justify-content: flex-start;
        }
        
        .pingbash-message-sender {
          font-weight: 600;
        }
        
        .pingbash-message-time {
          font-size: 9px !important;
          position: absolute !important;
          bottom: 2px !important;
          right: 8px !important;
          opacity: 0.7 !important;
        }
        
        .pingbash-message-body {
          position: relative !important;
        }
        
        .pingbash-message-text {
          font-size: var(--font-size, 14px);
          line-height: 1.4;
          word-wrap: break-word;
          color: var(--msg-text-color, #333);
          padding-right: 60px !important;
          padding-bottom: 4px !important;
        }
        
        .pingbash-message-text img {
          max-width: 200px !important;
          max-height: 200px !important;
          border-radius: 8px !important;
          margin: 1px 0 !important;
          display: block !important;
        }
        
        .pingbash-message-text a {
          color: var(--msg-text-color, #333);
        }

        .pingbash-message.own .pingbash-message-text a {
          color: white !important;
        }
        
        .pingbash-message-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
        }
        
        .pingbash-message-actions {
          position: absolute;
          top: -10px;
          right: 10px;
          display: flex;
          gap: 4px;
        }
        
        .pingbash-message:hover .pingbash-message-actions {
          display: flex;
        }
        
        .pingbash-message-action {
          background: none !important;
          border: none !important;
          color: #666 !important;
          cursor: pointer !important;
          font-size: 14px !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          transition: all 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-width: 20px !important;
          height: 20px !important;
        }
        
        .pingbash-message-action:hover {
          background: rgba(0,0,0,0.1) !important;
        }
        
        .pingbash-message-action.ban {
          color: #f44336 !important;
        }
        
        .pingbash-message-action.ban:hover {
          background: rgba(244, 67, 54, 0.1) !important;
        }
        
        .pingbash-message-action.timeout {
          color: #ff9800 !important;
        }
        
        .pingbash-message-action.timeout:hover {
          background: rgba(255, 152, 0, 0.1) !important;
        }
        
        .pingbash-message-action.delete {
          color: #e91e63 !important;
        }
        
        .pingbash-message-action.delete:hover {
          background: rgba(233, 30, 99, 0.1) !important;
        }
        
        /* W Version Bottom Bar Styling */
        /* First Bottom Bar: Input and Send Only */
        .pingbash-input-bar {
          background: var(--title-bg-color, white);
          border-top: 1px solid #e0e0e0;
          padding: 10px 16px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Second Bottom Bar: Controls Only */
        .pingbash-controls-bar {
          background: var(--title-bg-color, white);
          border-top: 1px solid #e0e0e0;
          padding: 8px 16px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          min-height: 40px;
        }
        
        .pingbash-controls-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .pingbash-controls-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .pingbash-control-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          transition: all 0.2s ease;
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          position: relative;
        }
        
        .pingbash-control-btn:hover {
          background: rgba(0,123,255,0.1);
          color: #007bff;
        }
        
        .pingbash-control-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* General rule: ALL dropdowns in controls bar should be bottom-aligned */
        .pingbash-controls-bar [class*="dropdown"] {
          position: absolute !important;
          top: auto !important;
          bottom: 100% !important;
          margin-top: 0 !important;
          margin-bottom: 8px !important;
        }
        
        .pingbash-media-controls {
          display: flex !important;
          gap: 8px;
          align-items: center;
          min-width: 100px;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        .pingbash-media-btn {
          background: none;
          border: none;
          color: #333;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s ease;
          display: flex !important;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          opacity: 1 !important;
          visibility: visible !important;
        }
        
        .pingbash-media-btn:hover {
          background: rgba(0,0,0,0.05);
        }
        
        .pingbash-media-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Chat filter in controls bar */
        .pingbash-controls-bar .pingbash-filter-container {
          position: relative;
        }
        
        .pingbash-controls-bar .pingbash-filter-dropdown {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 160px;
          z-index: 2147483647;
          margin-bottom: 8px;
          padding: 8px 0;
        }
        
        /* Override any existing filter dropdown positioning when in controls bar */
        .pingbash-controls-bar .pingbash-filter-dropdown {
          top: auto !important;
          bottom: 100% !important;
          margin-top: 0 !important;
          margin-bottom: 8px !important;
        }
        
        .pingbash-filter-option {
          padding: 8px 12px;
          cursor: pointer;
          transition: background-color 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .pingbash-filter-option:hover {
          background: rgba(0,123,255,0.1);
        }
        
        .pingbash-filter-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #ccc;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-filter-option.active .pingbash-filter-dot {
          background: #007bff;
        }
        
        /* Online users in controls bar */
        .pingbash-controls-bar .pingbash-online-users-container {
          position: relative;
        }
        
        .pingbash-controls-bar .pingbash-online-count-badge {
          position: absolute;
          top: -4px;
          left: 15px;
          background: #007bff;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: bold;
          min-width: 3px;
          text-align: center;
          line-height: 1;
          border: 2px solid #f8f9fa;
        }
        
        /* Settings in controls bar */
        .pingbash-controls-bar .pingbash-settings-container {
          position: relative;
        }
        
        .pingbash-controls-bar .pingbash-settings-dropdown {
          position: absolute;
          bottom: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          min-width: 200px;
          z-index: 2147483647;
          margin-bottom: 8px;
          padding: 8px 0;
        }
        
        /* Override any existing settings dropdown positioning when in controls bar */
        .pingbash-controls-bar .pingbash-settings-dropdown {
          top: auto !important;
          bottom: 100% !important;
          margin-top: 0 !important;
          margin-bottom: 8px !important;
        }
        
        .pingbash-input-wrapper {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--input-bg-color, #f8f9fa);
          border-radius: 25px;
          border: 1px solid #e9ecef;
          padding: 6px 12px;
          transition: border-color 0.2s ease;
        }
        
        .pingbash-input-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          padding: 0;
        }
        
        .pingbash-input-wrapper-old {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 6px 16px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 25px;
          gap: 8px;
        }
        
        .pingbash-message-input {
          flex: 1;
          border: none;
          outline: none;
          background: transparent;
          font-size: var(--font-size, 14px);
          line-height: 24px;
          font-family: inherit;
          color: var(--input-text-color, #333);
        }
        
        .pingbash-message-input::placeholder {
          color: #999;
        }
        
        .pingbash-message-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .pingbash-send-btn {
          height: 30px;
          padding: 3px 26px;
          border: none;
          border-radius: 25px;
          background: linear-gradient(to right, #BD00FF, #3A4EFF);
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          min-width: 60px;
        }
        
        .pingbash-send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        
        .pingbash-send-btn:active:not(:disabled) {
          transform: translateY(2px);
        }
        
        .pingbash-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        
        .pingbash-send-text {
          font-weight: 500;
        }
        
        .pingbash-send-icon {
          display: none;
        }
        
        @media (max-width: 480px) {
          .pingbash-send-text {
            display: none;
          }
          
          .pingbash-send-icon {
            display: block;
          }
          
          .pingbash-send-btn {
            min-width: 30px;
            padding: 3px 8px;
          }
        }
        
        /* Reply functionality styles */
        .pingbash-reply-preview {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 8px 12px !important;
          background: #f0f8ff !important;
          border-left: 3px solid #2596be !important;
          margin: 0 12px 8px 12px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
        }
        
        .pingbash-reply-preview-icon {
          color: #2596be !important;
          font-size: 14px !important;
        }
        
        .pingbash-reply-preview-content-wrapper {
          flex: 1 !important;
          min-width: 0 !important;
        }
        
        .pingbash-reply-preview-sender {
          font-weight: bold !important;
          color: #2596be !important;
          font-size: 12px !important;
          margin-bottom: 2px !important;
        }
        
        .pingbash-reply-preview-content {
          color: #666 !important;
          font-size: 11px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        
        .pingbash-reply-preview-close {
          background: none !important;
          border: none !important;
          color: #999 !important;
          cursor: pointer !important;
          font-size: 16px !important;
          padding: 0 !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .pingbash-reply-preview-close:hover {
          color: #666 !important;
        }
        
        .pingbash-message-reply {
          background: none !important;
          border: none !important;
          color: #2596be !important;
          cursor: pointer !important;
          font-size: 11px !important;
          font-weight: bold !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          transition: background-color 0.2s ease !important;
        }
        
        .pingbash-message-reply:hover {
          background: rgba(37, 150, 190, 0.1) !important;
        }
        
        .pingbash-reply-indicator {
          background: rgba(37, 150, 190, 0.1) !important;
          border-left: 3px solid #2596be !important;
          border-radius: 4px !important;
          padding: 6px 8px !important;
          margin: 4px 0 8px 0 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          transition: background-color 0.2s ease !important;
        }
        
        .pingbash-reply-indicator:hover {
          background: rgba(37, 150, 190, 0.15) !important;
        }
        
        .pingbash-reply-line {
          width: 3px !important;
          height: 100% !important;
          background: #2596be !important;
          border-radius: 2px !important;
          min-height: 30px !important;
        }
        
        .pingbash-reply-content {
          flex: 1 !important;
          display: flex;
  
          min-width: 0 !important;
        }
        
        .pingbash-reply-sender {
          font-weight: bold !important;
          color: #2596be !important;
          font-size: 12px !important;
          margin-bottom: 2px !important;
        }
        
        .pingbash-reply-text {
          color: #666 !important;
          font-size: 11px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        
        /* Reply functionality styles */
        .pingbash-reply-preview {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          padding: 8px 12px !important;
          background: #f0f8ff !important;
          border-left: 3px solid #2596be !important;
          margin: 0 12px 8px 12px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
        }
        
        .pingbash-reply-preview-icon {
          color: #2596be !important;
          font-size: 14px !important;
        }
        
        .pingbash-reply-preview-content-wrapper {
          flex: 1 !important;
          min-width: 0 !important;
        }
        
        .pingbash-reply-preview-sender {
          font-weight: bold !important;
          color: #2596be !important;
          font-size: 12px !important;
          margin-bottom: 2px !important;
        }
        
        .pingbash-reply-preview-content {
          color: #666 !important;
          font-size: 11px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        
        .pingbash-reply-preview-close {
          background: none !important;
          border: none !important;
          color: #999 !important;
          cursor: pointer !important;
          font-size: 16px !important;
          padding: 0 !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .pingbash-reply-preview-close:hover {
          color: #666 !important;
        }
        
        .pingbash-message-reply {
          background: none !important;
          border: none !important;
          color: #2596be !important;
          cursor: pointer !important;
          font-size: 11px !important;
          font-weight: bold !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          transition: background-color 0.2s ease !important;
        }
        
        .pingbash-message-reply:hover {
          background: rgba(37, 150, 190, 0.1) !important;
        }
        
        .pingbash-reply-indicator {
          background: rgba(37, 150, 190, 0.1) !important;
          border-left: 3px solid #2596be !important;
          border-radius: 4px !important;
          padding: 6px 8px !important;
          margin: 4px 0 8px 0 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          transition: background-color 0.2s ease !important;
        }
        
        .pingbash-reply-indicator:hover {
          background: rgba(37, 150, 190, 0.15) !important;
        }
        
        .pingbash-reply-line {
          width: 3px !important;
          height: 100% !important;
          background: #2596be !important;
          border-radius: 2px !important;
          min-height: 30px !important;
        }
        
        .pingbash-reply-content {
          flex: 1 !important;
          min-width: 0 !important;
        }
        
        .pingbash-reply-sender {
          font-weight: bold !important;
          color: #2596be !important;
          font-size: 12px !important;
          margin-bottom: 2px !important;
        }
        
        .pingbash-reply-text {
          color: #666 !important;
          font-size: 11px !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        
        /* Reply preview positioning fix */
        .pingbash-input-wrapper .pingbash-reply-preview {
          margin: 0 !important;
          border-radius: 4px 4px 0 0 !important;
          border-bottom: none !important;
        }
        
        /* Reply preview positioning fix */
        .pingbash-input-wrapper .pingbash-reply-preview {
          margin: 0 !important;
          border-radius: 4px 4px 0 0 !important;
          border-bottom: none !important;
        }
        
        /* Reply preview - final positioning above bottom bar */
        .pingbash-dialog .pingbash-reply-preview {
          position: relative !important;
          margin: 0 12px 4px 12px !important;
          border-radius: 8px !important;
          border: 1px solid #e0e0e0 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          background: #f0f8ff !important;
          border-left: 3px solid #2596be !important;
        }
        
        /* Ensure reply preview is completely hidden when display: none */
        .pingbash-reply-preview[style*="display: none"],
        .pingbash-reply-preview[style*="display:none"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        
        .pingbash-reply-preview[style*="display: none"] *,
        .pingbash-reply-preview[style*="display:none"] * {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Fix reply indicator styling for own messages (right-aligned blue messages) */
        .pingbash-message.own .pingbash-reply-indicator {
          background: rgba(255, 255, 255, 0.2) !important;
          border-left: 3px solid rgba(255, 255, 255, 0.8) !important;
          margin-right: 0 !important;
          max-width: 100% !important;
        }
        
        .pingbash-message.own .pingbash-reply-sender {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        
        .pingbash-message.own .pingbash-reply-text {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        
        .pingbash-message.own .pingbash-reply-line {
          background: rgba(255, 255, 255, 0.8) !important;
        }
        
        /* Sound Settings Popup */
        .pingbash-sound-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2147483648;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-popup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
        }
        
        .pingbash-popup-content {
          position: relative;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          max-width: 90vw;
          overflow-y: auto;
          height: 90%;
        }
        
        .pingbash-popup-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e0e0e0;
        }
        
        .pingbash-popup-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        
        .pingbash-popup-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-popup-close:hover {
          color: #333;
        }
        
        .pingbash-popup-body {
          padding: 20px;
        }
        
        .pingbash-sound-option {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
        }
        
        .pingbash-sound-option input[type="radio"] {
          margin-right: 8px;
        }
        
        .pingbash-sound-option label {
          cursor: pointer;
          font-size: 14px;
          color: #333;
        }
        
        .pingbash-popup-footer {
          display: flex;
          justify-content: flex-end;
          padding: 16px 20px;
          border-top: 1px solid #e0e0e0;
        }
        
        .pingbash-sound-ok-btn {
          background: #2596be;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-sound-ok-btn:hover {
          background: #1e7ba8;
        }
        
        /* Chat Rules Popup */
        .pingbash-chat-rules-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2147483648;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-chat-rules-content {
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .pingbash-chat-rules-popup .pingbash-popup-body {
          flex: 1;
          overflow-y: auto;
          max-height: 60vh;
        }
        
        .pingbash-rules-display {
          width: 100%;
        }
        
        .pingbash-rules-text {
          width: 100%;
          min-height: 200px;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
          white-space: pre-wrap;
          word-wrap: break-word;
          overflow-y: auto;
          resize: none;
          margin: 0;
        }
        
        .pingbash-no-rules-text {
          width: 100%;
          min-height: 200px;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: #f8f9fa;
          font-style: italic;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          margin: 0;
        }
        
        .pingbash-rules-edit {
          width: 100%;
        }
        
        .pingbash-rules-textarea {
          width: 100%;
          min-height: 200px;
          padding: 12px;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          line-height: 1.5;
          color: #333;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
        }
        
        .pingbash-rules-textarea:focus {
          border-color: #2596be;
          box-shadow: 0 0 0 2px rgba(37, 150, 190, 0.2);
        }
        
        .pingbash-rules-view-footer,
        .pingbash-rules-edit-footer {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        
        .pingbash-rules-edit-btn,
        .pingbash-rules-close-btn,
        .pingbash-rules-cancel-btn,
        .pingbash-rules-save-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s ease;
        }
        
        .pingbash-rules-edit-btn {
          background: #2596be;
          color: white;
        }
        
        .pingbash-rules-edit-btn:hover {
          background: #1e7ba8;
        }
        
        .pingbash-rules-close-btn,
        .pingbash-rules-cancel-btn {
          background: #6c757d;
          color: white;
        }
        
        .pingbash-rules-close-btn:hover,
        .pingbash-rules-cancel-btn:hover {
          background: #5a6268;
        }
        
        .pingbash-rules-save-btn {
          background: #28a745;
          color: white;
        }
        
        .pingbash-rules-save-btn:hover {
          background: #218838;
        }
        
        /* Sign In Form */
        .pingbash-signin-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2147483648;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-signin-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .pingbash-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        
        .pingbash-form-group label {
          font-size: 14px;
          font-weight: 600;
          color: #333;
        }
        
        .pingbash-form-input {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s ease;
        }
        
        .pingbash-form-input:focus {
          border-color: #2596be;
          box-shadow: 0 0 0 2px rgba(37, 150, 190, 0.1);
        }
        
        .pingbash-signin-options {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        
        .pingbash-signin-submit-btn {
          flex: 1;
          background: #2596be;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-signin-submit-btn:hover {
          background: #1e7ba8;
        }
        
        .pingbash-continue-anon-btn {
          flex: 1;
          background: #f0f0f0;
          color: #333;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-continue-anon-btn:hover {
          background: #e0e0e0;
        }
        
        /* Auth Footer Styles */
        .pingbash-auth-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #eee;
          text-align: center;
        }
        
        .pingbash-auth-footer p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        
        .pingbash-show-signup-btn,
        .pingbash-show-signin-btn {
          background: none;
          border: none;
          color: #2596be;
          text-decoration: underline;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          padding: 0;
          margin-left: 4px;
        }
        
        .pingbash-show-signup-btn:hover,
        .pingbash-show-signin-btn:hover {
          color: #1e7ba8;
        }
        
        /* Sign Up Modal */
        .pingbash-signup-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2147483648;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-signup-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .pingbash-signup-options {
          display: flex;
          gap: 12px;
          margin-top: 8px;
        }
        
        .pingbash-signup-submit-btn {
          flex: 1;
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-signup-submit-btn:hover {
          background: #218838;
        }
        
        /* Email Verification Modal */
        .pingbash-verification-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2147483648;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-verification-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: center;
        }
        
        .pingbash-verification-icon {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }
        
        .pingbash-verification-text {
          font-size: 14px;
          color: #666;
          margin: 0;
          line-height: 1.5;
        }
        
        .pingbash-verification-email {
          color: #2596be;
          font-weight: 600;
        }
        
        .pingbash-otp-container {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 20px 0;
        }
        
        .pingbash-otp-input {
          width: 50px;
          height: 50px;
          text-align: center;
          font-size: 18px;
          font-weight: 600;
          border: 2px solid #ddd;
          border-radius: 8px;
          outline: none;
          transition: border-color 0.2s ease;
          font-family: inherit;
        }
        
        .pingbash-otp-input:focus {
          border-color: #2596be;
          box-shadow: 0 0 0 2px rgba(37, 150, 190, 0.1);
        }
        
        .pingbash-otp-input.filled {
          border-color: #28a745;
          background-color: #f8fff9;
        }
        
        .pingbash-verification-timer {
          font-size: 14px;
          color: #666;
          margin: 10px 0;
        }
        
        .pingbash-timer-display {
          font-weight: 600;
          color: #dc3545;
        }
        
        .pingbash-verification-actions {
          display: flex;
          gap: 12px;
          margin-top: 20px;
        }
        
        .pingbash-verify-btn {
          flex: 1;
          background: #28a745;
          color: white;
          border: none;
          padding: 12px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-verify-btn:hover:not(:disabled) {
          background: #218838;
        }
        
        .pingbash-verify-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
        
        .pingbash-resend-btn {
          flex: 1;
          background: #f0f0f0;
          color: #333;
          border: none;
          padding: 12px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-resend-btn:hover:not(:disabled) {
          background: #e0e0e0;
        }
        
        .pingbash-resend-btn:disabled {
          background: #f8f8f8;
          color: #999;
          cursor: not-allowed;
        }
        
        .pingbash-verification-footer {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #eee;
        }
        
        .pingbash-verification-footer p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        
        .pingbash-back-to-signin-btn {
          background: none;
          border: none;
          color: #2596be;
          text-decoration: underline;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          padding: 0;
          margin-left: 4px;
        }
        
        .pingbash-back-to-signin-btn:hover {
          color: #1e7ba8;
        }
        
        /* Emoji and Mention Modal Styles (exact same as sign-in modal) */
        .pingbash-emoji-modal,
        .pingbash-mention-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2147483647;
          display: flex;
          align-items: center;
          justify-content: center;
        }
  
        .pingbash-emoji-picker {
          width: 100% !important;
          max-width: 420px !important;
          max-height: 600px !important;
          height: 90vh !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2) !important;
        }
  
        .pingbash-emoji-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fill, minmax(45px, 1fr)) !important;
          gap: 4px !important;
          padding: 12px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          max-height: 400px !important;
        }
        
        .pingbash-emoji {
          font-size: 24px !important;
          padding: 8px !important;
          cursor: pointer !important;
          border-radius: 6px !important;
          transition: background 0.2s ease !important;
          text-align: center !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .pingbash-emoji:hover {
          background: #f0f0f0 !important;
        }
        
        /* Enhanced Emoji Picker Styles */
        .pingbash-emoji-popup-content {
          max-width: 420px !important;
          width: 95vw !important;
          max-height: 90vh !important;
          height: auto !important;
          display: flex !important;
          flex-direction: column !important;
        }
        
        .pingbash-emoji-header {
          display: flex !important;
          padding: 12px !important;
          border-bottom: 1px solid #e0e0e0 !important;
          gap: 8px !important;
          align-items: center !important;
        }
        
        .pingbash-emoji-search {
          flex: 1 !important;
          padding: 8px 12px !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 20px !important;
          outline: none !important;
          font-size: 14px !important;
        }
        
        .pingbash-emoji-search:focus {
          border-color: #007bff !important;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
        }
        
        .pingbash-emoji-close {
          background: #f5f5f5 !important;
          border: none !important;
          border-radius: 50% !important;
          width: 32px !important;
          height: 32px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          cursor: pointer !important;
          font-size: 18px !important;
          color: #666 !important;
        }
        
        .pingbash-emoji-close:hover {
          background: #e0e0e0 !important;
        }
        
        .pingbash-emoji-tabs {
          display: flex !important;
          padding: 8px 12px !important;
          gap: 4px !important;
          border-bottom: 1px solid #e0e0e0 !important;
          background: #f8f9fa !important;
          overflow-x: auto !important;
        }
        
        .pingbash-emoji-tab {
          background: none !important;
          border: none !important;
          padding: 8px 12px !important;
          border-radius: 8px !important;
          cursor: pointer !important;
          font-size: 18px !important;
          transition: all 0.2s ease !important;
          min-width: 44px !important;
          height: 44px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .pingbash-emoji-tab:hover {
          background: rgba(0, 123, 255, 0.1) !important;
        }
        
        .pingbash-emoji-tab.active {
          background: #007bff !important;
          color: white !important;
        }
        
        .pingbash-emoji-tab[data-category="gifs"] {
          font-size: 12px !important;
          font-weight: 600 !important;
        }
        
        .pingbash-emoji-content {
          flex: 1 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          min-height: 0 !important;
        }
        
        .pingbash-gif-grid {
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: center !important;
          height: 100% !important;
          text-align: center !important;
          color: #666 !important;
          padding: 20px !important;
        }
        
        /* Responsive Styles for Emoji Modal */
        @media (max-width: 480px) {
          .pingbash-emoji-picker {
            max-width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
          
          .pingbash-emoji-popup-content {
            max-width: 100% !important;
            width: 100% !important;
            height: 100vh !important;
            max-height: 100vh !important;
            border-radius: 0 !important;
          }
          
          .pingbash-emoji-grid {
            grid-template-columns: repeat(auto-fill, minmax(40px, 1fr)) !important;
            max-height: calc(100vh - 200px) !important;
          }
          
          .pingbash-emoji {
            font-size: 20px !important;
            padding: 6px !important;
          }
          
          .pingbash-emoji-tab {
            font-size: 16px !important;
            min-width: 40px !important;
            height: 40px !important;
            padding: 6px 10px !important;
          }
        }
        
        @media (max-width: 360px) {
          .pingbash-emoji-grid {
            grid-template-columns: repeat(auto-fill, minmax(35px, 1fr)) !important;
          }
          
          .pingbash-emoji {
            font-size: 18px !important;
            padding: 4px !important;
          }
        }
        
        .pingbash-gif-placeholder p {
          margin: 8px 0 !important;
          font-size: 14px !important;
        }

        /* Send Notification Modal Styles */
        .pingbash-notification-modal .pingbash-popup-content {
          max-width: 500px !important;
          width: 90vw !important;
        }
        
        .pingbash-notification-form {
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
        }
        
        .pingbash-notification-textarea {
          width: 100% !important;
          min-height: 100px !important;
          padding: 12px !important;
          border: 2px solid #e0e0e0 !important;
          border-radius: 8px !important;
          font-family: inherit !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          resize: vertical !important;
          outline: none !important;
          transition: border-color 0.2s ease !important;
        }
        
        .pingbash-notification-textarea:focus {
          border-color: #007bff !important;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1) !important;
        }
        
        .pingbash-char-counter {
          text-align: right !important;
          font-size: 12px !important;
          color: #666 !important;
          margin-top: 4px !important;
        }
        
        .pingbash-char-count.over-limit {
          color: #dc3545 !important;
          font-weight: 600 !important;
        }
        
        .pingbash-notification-preview {
          background: #f8f9fa !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 8px !important;
          padding: 16px !important;
        }
        
        .pingbash-notification-preview h4 {
          margin: 0 0 12px 0 !important;
          font-size: 14px !important;
          color: #495057 !important;
          font-weight: 600 !important;
        }
        
        .pingbash-notification-preview-content {
          background: white !important;
          border: 1px solid #dee2e6 !important;
          border-radius: 6px !important;
          padding: 12px !important;
          min-height: 60px !important;
        }
        
        .pingbash-notification-preview-message {
          font-size: 14px !important;
          line-height: 1.4 !important;
          color: #495057 !important;
          font-style: italic !important;
        }
        
        .pingbash-notification-preview-message.has-content {
          font-style: normal !important;
          color: #212529 !important;
        }
        
        .pingbash-notification-buttons {
          display: flex !important;
          gap: 12px !important;
          justify-content: flex-end !important;
        }
        
        .pingbash-notification-cancel-btn {
          background: #6c757d !important;
          color: white !important;
          border: none !important;
          padding: 10px 20px !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: background-color 0.2s ease !important;
        }
        
        .pingbash-notification-cancel-btn:hover {
          background: #5a6268 !important;
        }
        
        .pingbash-notification-send-btn {
          background: #007bff !important;
          color: white !important;
          border: none !important;
          padding: 10px 20px !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        
        .pingbash-notification-send-btn:disabled {
          background: #ccc !important;
          cursor: not-allowed !important;
          opacity: 0.6 !important;
        }
        
        .pingbash-notification-send-btn:not(:disabled):hover {
          background: #0056b3 !important;
        }
        
        .pingbash-notification-send-btn.sending {
          background: #28a745 !important;
          cursor: wait !important;
        }
  
        /* @ Mention Styles */
        .pingbash-mention-dropdown {
          width: 300px !important;
        }
  
        .pingbash-mention-list {
          padding: 8px 0 !important;
          max-height: 250px !important;
          overflow-y: auto !important;
        }
  
        .pingbash-mention-item {
          padding: 12px 16px !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          transition: background-color 0.2s !important;
        }
  
        .pingbash-mention-item:hover,
        .pingbash-mention-item.selected {
          background-color: #f0f0f0 !important;
        }
  
        .pingbash-mention-avatar {
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          background-color: #007bff !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          font-weight: bold !important;
          color: white !important;
        }
  
        .pingbash-mention-name {
          font-weight: 500 !important;
          color: #333 !important;
          font-size: 14px !important;
        }
        
        /* Upload Progress */
        .pingbash-upload-progress {
          background: #f0f8ff;
          border: 1px solid #2596be;
          border-radius: 8px;
          padding: 12px;
          margin: 8px 0;
        }
        
        .pingbash-upload-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
          color: #333;
        }
        
        .pingbash-progress-bar {
          width: 100%;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
        }
        
        .pingbash-progress-fill {
          height: 100%;
          background: #2596be;
          width: 100%;
          animation: progressPulse 1.5s ease-in-out infinite;
        }
        
        @keyframes progressPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .pingbash-error {
          background: #ffebee;
          color: #c62828;
          padding: 8px 12px;
          border-radius: 8px;
          margin: 8px 0;
          font-size: 13px;
          text-align: center;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }
        
        /* Scrollbar styling */
        .pingbash-messages-list::-webkit-scrollbar {
          width: 6px;
        }
        
        .pingbash-messages-list::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .pingbash-messages-list::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.2);
          border-radius: 3px;
        }
        
        .pingbash-messages-list::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.3);
        }
        
        /* Mobile responsive */
        @media (max-width: 768px) {
          /* Dialog size is controlled by the main mobile media query at line ~175 */
          /* Do NOT override width/height here - keep it fixed 350x500 */
          
          .pingbash-message-content {
            max-width: 100%;
          }
        }
  
        /* Group Creation Modal Styles */
        .pingbash-group-creation-modal {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 10000 !important;
          display: none !important;
          align-items: center !important;
          justify-content: center !important;
        }
  
        .pingbash-group-creation-modal.show {
          display: flex !important;
        }

        /* Body-attached Group Creation Modal Styles - Larger Size */
        .pingbash-group-creation-modal-body {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          display: none !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 2147483648 !important; /* Higher than chat dialog */
        }

        .pingbash-group-creation-modal-body.show {
          display: flex !important;
        }

        .pingbash-group-creation-modal-body .pingbash-popup-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          z-index: 2147483648 !important;
        }

        .pingbash-group-creation-modal-body .pingbash-popup-content {
          width: 95% !important;
          max-width: 1400px !important;
          min-width: 320px !important;
          height: 90% !important;
          max-height: 800px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          z-index: 2147483649 !important; /* Even higher for content */
          position: relative !important;
          background: white !important;
          border-radius: 8px !important;
          padding: 24px !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Edit Chat Style Modal - Same centered styling as group creation modal */
        .pingbash-edit-style-modal-body {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          display: none ;
          align-items: center !important;
          justify-content: center !important;
          z-index: 2147483648 !important;
        }

        .pingbash-edit-style-modal-body.show {
          display: flex !important;
        }

        .pingbash-edit-style-modal-body .pingbash-popup-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          z-index: 2147483648 !important;
        }

        .pingbash-edit-style-modal-body .pingbash-popup-content {
          width: 95% !important;
          max-width: 1400px !important;
          min-width: 320px !important;
          height: 90% !important;
          max-height: 800px !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
          z-index: 2147483649 !important;
          position: relative !important;
          background: white !important;
          border-radius: 8px !important;
          padding: 24px !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* W Version Modal Styles */
        .pingbash-modal-title {
          font-size: 20px !important;
          font-weight: 600 !important;
          margin: 0 !important;
          text-align: center !important;
          flex: 1 !important;
        }

        .pingbash-group-name-section {
          margin-bottom: 16px !important;
        }

        .pingbash-input-label {
          display: block !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #374151 !important;
          margin-bottom: 8px !important;
        }

        .pingbash-group-name-input {
          width: 100% !important;
          padding: 8px 12px !important;
          border: 1px solid #D1D5DB !important;
          border-radius: 6px !important;
          font-size: 14px !important;
          outline: none !important;
          transition: border-color 0.2s !important;
        }

        .pingbash-group-name-input:focus {
          border-color: #3B82F6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
        }

        .pingbash-char-counter {
          font-size: 12px !important;
          color: #6B7280 !important;
          margin-top: 4px !important;
        }

        .pingbash-group-config-widget {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          position: relative !important;
          min-height: 0 !important;
        }

        .pingbash-config-toggle {
          position: absolute !important;
          top: 16px !important;
          right: 16px !important;
          z-index: 50 !important;
          background: white !important;
          border: 1px solid #D1D5DB !important;
          border-radius: 6px !important;
          padding: 8px 12px !important;
          cursor: pointer !important;
          font-size: 16px !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
          transition: all 0.2s !important;
        }

        .pingbash-config-toggle:hover {
          background: #F9FAFB !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
        }

        .pingbash-toggle-icon {
          display: inline-block !important;
          transition: transform 0.2s !important;
        }

        .pingbash-config-toggle.collapsed .pingbash-toggle-icon {
          transform: rotate(180deg) !important;
        }

        .pingbash-config-container {
          display: flex !important;
          flex-direction: row !important;
          gap: 20px !important;
          flex: 1 !important;
          width: 100% !important;
          min-height: 0 !important;
          max-height: 100% !important;
          overflow: hidden !important;
          transition: all 0.3s ease !important;
        }

        /* Force horizontal layout with higher specificity */
        .pingbash-group-creation-modal-body .pingbash-config-container {
          display: flex !important;
          flex-direction: row !important;
          align-items: stretch !important;
        }

        .pingbash-group-creation-modal-body .pingbash-config-panel {
          width: 320px !important;
          min-width: 320px !important;
          max-width: 320px !important;
          flex-shrink: 0 !important;
          flex-grow: 0 !important;
        }

        .pingbash-group-creation-modal-body .pingbash-chat-preview {
          flex: 1 !important;
          flex-grow: 1 !important;
          flex-shrink: 1 !important;
          min-width: 300px !important;
        }

        /* Responsive behavior - hide preview panel on narrow screens */
        @media (max-width: 700px) {
          .pingbash-group-creation-modal-body .pingbash-popup-content {
            width: 98% !important;
            padding: 16px !important;
            max-height: 95vh !important;
            overflow-y: auto !important;
          }
          
          .pingbash-config-container {
            flex-direction: column !important;
            gap: 0 !important;
            height: auto !important;
          }
          
          .pingbash-group-creation-modal-body .pingbash-config-container {
            flex-direction: column !important;
            gap: 0 !important;
          }
          
          .pingbash-group-creation-modal-body .pingbash-chat-preview {
            display: none !important;
          }
          
          .pingbash-group-creation-modal-body .pingbash-config-panel {
            width: 100% !important;
            min-width: 100% !important;
            max-width: 100% !important;
            flex: 1 !important;
            border: none !important;
            background: transparent !important;
            padding: 0 !important;
          }
          
          .pingbash-config-toggle {
            display: none !important;
          }
          
          .pingbash-config-section {
            margin-bottom: 20px !important;
            padding: 16px !important;
            background: #F9FAFB !important;
            border: 1px solid #E5E7EB !important;
            border-radius: 8px !important;
          }
          
          .pingbash-color-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          
          .pingbash-size-inputs {
            flex-direction: column !important;
            gap: 12px !important;
          }
        }

        /* Tablet responsive behavior */
        @media (max-width: 900px) and (min-width: 701px) {
          .pingbash-group-creation-modal-body .pingbash-config-panel {
            width: 280px !important;
            min-width: 280px !important;
            max-width: 280px !important;
          }
        }

        /* Debug styles removed - use test-debug-layout.html for debugging */

        .pingbash-config-container.config-hidden {
          gap: 0 !important;
        }

        .pingbash-config-container.config-hidden .pingbash-config-panel {
          width: 0 !important;
          padding: 0 !important;
          opacity: 0 !important;
          overflow: hidden !important;
        }

        .pingbash-config-panel {
          width: 320px !important;
          min-width: 320px !important;
          flex-shrink: 0 !important;
          height: 100% !important;
          max-height: 100% !important;
          background: #F9FAFB !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 8px !important;
          padding: 24px !important;
          overflow-y: auto !important;
          box-sizing: border-box !important;
        }

        .pingbash-config-section {
          margin-bottom: 24px !important;
        }

        .pingbash-config-title {
          font-size: 18px !important;
          font-weight: 600 !important;
          margin-bottom: 16px !important;
          color: #111827 !important;
        }

        .pingbash-radio-group {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        .pingbash-radio-option {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          cursor: pointer !important;
        }

        .pingbash-radio-option input[type="radio"] {
          display: none !important;
        }

        .pingbash-radio-dot {
          width: 16px !important;
          height: 16px !important;
          border: 2px solid #D1D5DB !important;
          border-radius: 50% !important;
          position: relative !important;
        }

        .pingbash-radio-option input[type="radio"]:checked + .pingbash-radio-dot {
          border-color: #3B82F6 !important;
        }

        .pingbash-radio-option input[type="radio"]:checked + .pingbash-radio-dot::after {
          content: '' !important;
          position: absolute !important;
          top: 2px !important;
          left: 2px !important;
          width: 8px !important;
          height: 8px !important;
          background: #3B82F6 !important;
          border-radius: 50% !important;
        }

        .pingbash-size-inputs {
          margin-top: 16px !important;
          display: flex !important;
          gap: 12px !important;
        }

        .pingbash-input-group {
          flex: 1 !important;
        }

        .pingbash-size-input {
          width: 100% !important;
          padding: 6px 8px !important;
          border: 1px solid #D1D5DB !important;
          border-radius: 4px !important;
          font-size: 14px !important;
          margin-bottom: 4px !important;
        }

        .pingbash-input-group label {
          font-size: 12px !important;
          color: #6B7280 !important;
        }

        .pingbash-color-grid {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 12px !important;
        }

        .pingbash-color-item {
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
        }

        .pingbash-color-item label {
          font-size: 12px !important;
          color: #374151 !important;
        }

        .pingbash-color-item input[type="color"] {
          width: 100% !important;
          height: 32px !important;
          border: 1px solid #D1D5DB !important;
          border-radius: 4px !important;
          cursor: pointer !important;
        }

        .pingbash-settings-grid {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        .pingbash-checkbox-option {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          cursor: pointer !important;
        }

        .pingbash-checkbox-option input[type="checkbox"] {
          display: none !important;
        }

        .pingbash-checkbox-mark {
          width: 16px !important;
          height: 16px !important;
          border: 2px solid #D1D5DB !important;
          border-radius: 3px !important;
          position: relative !important;
        }

        .pingbash-checkbox-option input[type="checkbox"]:checked + .pingbash-checkbox-mark {
          background: #3B82F6 !important;
          border-color: #3B82F6 !important;
        }

        .pingbash-checkbox-option input[type="checkbox"]:checked + .pingbash-checkbox-mark::after {
          content: '✓' !important;
          position: absolute !important;
          top: -2px !important;
          left: 2px !important;
          color: white !important;
          font-size: 12px !important;
        }

        .pingbash-font-size-section,
        .pingbash-corner-radius-section {
          margin-top: 16px !important;
        }

        .pingbash-font-size-section label,
        .pingbash-corner-radius-section label {
          display: block !important;
          font-size: 12px !important;
          color: #374151 !important;
          margin-bottom: 8px !important;
        }

        .pingbash-font-size-section input[type="range"],
        .pingbash-corner-radius-section input[type="range"] {
          width: 100% !important;
          margin-bottom: 4px !important;
        }

        .pingbash-font-size-value,
        .pingbash-corner-radius-value {
          font-size: 12px !important;
          color: #6B7280 !important;
        }

        .pingbash-chat-preview {
          flex: 1 !important;
          display: flex !important;
          flex-direction: column !important;
          position: relative !important;
          background: #F3F4F6 !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          min-width: 0 !important;
          height: 100% !important;
          max-height: 100% !important;
        }

        .pingbash-preview-container {
          width: 100% !important;
          height: 100% !important;
          background: white !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 12px !important;
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          transition: box-shadow 0.2s !important;
          user-select: none !important;
          overflow: hidden !important;
          margin: 10px !important;
        }

        /* Ensure preview container inherits all header styles */
        .pingbash-preview-container .pingbash-online-users-container {
          position: relative !important;
          cursor: pointer !important;
          padding: 8px !important;
          border-radius: 6px !important;
          transition: background-color 0.2s !important;
        }

        .pingbash-preview-container .pingbash-online-users-icon {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          color: #666 !important;
        }

        .pingbash-preview-container .pingbash-online-count-badge {
          position: absolute !important;
          top: -8px !important;
          right: -8px !important;
          background: #28a745 !important;
          color: white !important;
          font-size: 11px !important;
          font-weight: bold !important;
          padding: 2px 6px !important;
          border-radius: 10px !important;
          min-width: 18px !important;
          height: 18px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2) !important;
          border: 2px solid white !important;
        }

        .pingbash-preview-container .pingbash-online-count-badge.zero {
          background: #6c757d !important;
        }

        .pingbash-preview-container:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.2) !important;
        }

        .pingbash-preview-container.dragging {
          cursor: grabbing !important;
          box-shadow: 0 12px 32px rgba(0,0,0,0.3) !important;
        }

        /* Preview container uses EXACT same HTML structure as actual chat */

        .pingbash-preview-controls {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        /* Drag and resize handles removed - using horizontal flex layout */

        .pingbash-preview-messages {
          flex: 1 !important;
          padding: 14px !important;
          overflow-y: auto !important;
          background: var(--msg-bg-color, #F9FAFB) !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 6px !important;
        }

        .pingbash-preview-read-more {
          text-align: center !important;
          margin-bottom: 8px !important;
        }

        .pingbash-preview-read-more-btn {
          background: none !important;
          border: none !important;
          color: var(--msg-text-color, #666) !important;
          font-size: 14px !important;
          cursor: pointer !important;
          text-decoration: underline !important;
        }

        .pingbash-preview-message {
          display: flex !important;
          gap: 8px !important;
          margin-bottom: 4px !important;
          align-items: flex-start !important;
        }

        .pingbash-preview-message.own {
          justify-content: flex-start !important;
        }

        .pingbash-preview-message-content {
          flex: 1 !important;
          min-width: 0 !important;
        }

        .pingbash-preview-message-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 4px !important;
          opacity: 0.7 !important;
          font-size: 11px !important;
        }

        .pingbash-preview-message-actions {
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
          margin-left: auto !important;
        }

        .pingbash-preview-reply-btn {
          background: none !important;
          border: none !important;
          color: #2596be !important;
          cursor: pointer !important;
          font-size: 14px !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-preview-reply-btn:hover {
          background: rgba(37, 150, 190, 0.1) !important;
        }

        .pingbash-preview-avatar {
          width: 32px !important;
          height: 32px !important;
          background: #6B7280 !important;
          color: white !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          flex-shrink: 0 !important;
        }

        .pingbash-preview-sender {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: var(--msg-text-color, #6B7280) !important;
        }

        .pingbash-preview-time {
          font-size: 11px !important;
          color: var(--date-color, #999) !important;
        }

        .pingbash-preview-text {
          font-size: var(--font-size, 14px) !important;
          color: var(--msg-text-color, #111827) !important;
          line-height: 1.4 !important;
          word-wrap: break-word !important;
        }

        /* Own message styling */
        .pingbash-preview-message.own .pingbash-preview-message-content {
          background: var(--owner-msg-bg-color, #2596be) !important;
          color: white !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
          margin-left: auto !important;
          max-width: 80% !important;
        }

        .pingbash-preview-message.own .pingbash-preview-sender,
        .pingbash-preview-message.own .pingbash-preview-time,
        .pingbash-preview-message.own .pingbash-preview-text {
          color: white !important;
        }

        /* Regular message styling */
        .pingbash-preview-message:not(.own) .pingbash-preview-message-content {
          background: white !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 12px !important;
          padding: 8px 12px !important;
          max-width: 80% !important;
        }

        .pingbash-preview-input-area {
          border-top: 1px solid #E5E7EB !important;
          padding: 6px 12px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
        }

        .pingbash-preview-media-buttons {
          display: flex !important;
          gap: 10px !important;
          align-items: center !important;
        }

        .pingbash-preview-media-btn {
          background: none !important;
          border: none !important;
          font-size: 20px !important;
          cursor: pointer !important;
          padding: 4px !important;
          border-radius: 4px !important;
          transition: background 0.2s !important;
          color: var(--title-color, #333) !important;
        }

        .pingbash-preview-media-btn:hover {
          background: rgba(0,0,0,0.1) !important;
        }

        .pingbash-preview-input-container {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: var(--input-bg-color, white) !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 20px !important;
          padding: 6px 16px !important;
        }

        .pingbash-preview-input {
          flex: 1 !important;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          font-size: 14px !important;
          color: var(--input-text-color, #333) !important;
        }

        .pingbash-preview-send-btn {
          background: linear-gradient(135deg, #BD00FF 0%, #3A4EFF 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 20px !important;
          padding: 6px 16px !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: opacity 0.2s !important;
        }

        .pingbash-preview-send-btn:hover:not(:disabled) {
          opacity: 0.9 !important;
        }

        .pingbash-preview-send-btn:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }

        .pingbash-preview-demo-text {
          position: absolute !important;
          
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          text-align: center !important;
          color: rgba(255, 255, 255, 0.7) !important;
          pointer-events: none !important;
        }

        .pingbash-preview-demo-text h2 {
          font-size: 24px !important;
          font-weight: 700 !important;
          margin-bottom: 8px !important;
        }

        .pingbash-preview-demo-text p {
          font-size: 14px !important;
          margin-bottom: 4px !important;
        }

        .pingbash-create-group-btn,
        .pingbash-update-chat-style-btn {
          width: 100% !important;
          height: 40px !important;
          margin-top: 20px !important;
          padding: 8px 16px !important;
          border-radius: 12px !important;
          font-weight: 600 !important;
          color: white !important;
          border: none !important;
          cursor: pointer !important;
          font-size: 16px !important;
          background: linear-gradient(135deg, #BD00FF 0%, #3A4EFF 100%) !important;
          transition: opacity 0.2s !important;
        }

        .pingbash-create-group-btn:disabled,
        .pingbash-update-chat-style-btn:disabled {
          background: #9CA3AF !important;
          cursor: not-allowed !important;
        }

        .pingbash-create-group-btn:not(:disabled):hover,
        .pingbash-update-chat-style-btn:not(:disabled):hover {
          opacity: 0.9 !important;
        }

        /* Preview Input Area Styles */
        .pingbash-preview-input-area {
          border-top: 1px solid #E5E7EB !important;
          padding: 6px 12px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
        }

        .pingbash-preview-media-buttons {
          display: flex !important;
          gap: 10px !important;
          align-items: center !important;
        }

        .pingbash-preview-media-btn {
          background: none !important;
          border: none !important;
          font-size: 20px !important;
          cursor: pointer !important;
          padding: 4px !important;
          border-radius: 4px !important;
          transition: background 0.2s !important;
          color: var(--title-color, #333) !important;
        }

        .pingbash-preview-media-btn:hover {
          background: rgba(0,0,0,0.1) !important;
        }

        .pingbash-preview-input-container {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: var(--input-bg-color, white) !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 20px !important;
          padding: 6px 16px !important;
        }

        .pingbash-preview-input {
          flex: 1 !important;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          font-size: 14px !important;
          color: var(--input-text-color, #333) !important;
        }

        .pingbash-preview-send-btn {
          background: linear-gradient(135deg, #BD00FF 0%, #3A4EFF 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 20px !important;
          padding: 6px 16px !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: opacity 0.2s !important;
        }

        .pingbash-preview-send-btn:hover:not(:disabled) {
          opacity: 0.9 !important;
        }

        .pingbash-preview-send-btn:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
  
        .pingbash-group-creation-content {
          width: 90% !important;
          max-width: 600px !important;
          max-height: 80vh !important;
          margin: auto !important;
        }
  
        .pingbash-group-creation-container {
          display: block !important;
          padding: 0 !important;
        }
  
        .pingbash-config-panel {
          width: 100% !important;
          overflow-y: auto !important;
          padding: 0 !important;
        }
  
  
  
        .pingbash-config-section {
          margin-bottom: 25px !important;
          padding: 15px !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 8px !important;
          background: #fafafa !important;
        }
  
        .pingbash-config-section h4 {
          margin: 0 0 15px 0 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #333 !important;
        }
  
        .pingbash-char-counter {
          font-size: 12px !important;
          color: #666 !important;
          margin-top: 5px !important;
        }
  
        .pingbash-radio-group {
          display: flex !important;
          gap: 15px !important;
          margin-top: 8px !important;
        }
  
        .pingbash-radio-option {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          cursor: pointer !important;
          font-size: 14px !important;
        }
  
        .pingbash-radio-option input[type="radio"] {
          margin: 0 !important;
        }
  
        .pingbash-size-controls {
          display: flex !important;
          gap: 15px !important;
          margin-top: 15px !important;
        }
  
        .pingbash-size-controls .pingbash-form-group {
          flex: 1 !important;
          margin-bottom: 0 !important;
        }
  
        .pingbash-color-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
          gap: 15px !important;
        }
  
        .pingbash-color-item {
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }
  
        .pingbash-color-item label {
          font-size: 13px !important;
          font-weight: 500 !important;
          color: #555 !important;
        }
  
        .pingbash-color-input {
          width: 100% !important;
          height: 40px !important;
          border: 1px solid #ddd !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          padding: 0 !important;
        }
  
        .pingbash-settings-grid {
          display: grid !important;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important;
          gap: 12px !important;
          margin-bottom: 15px !important;
        }
  
        .pingbash-checkbox-option {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          padding: 8px !important;
          border-radius: 6px !important;
          transition: background-color 0.2s !important;
        }
  
        .pingbash-checkbox-option:hover {
          background-color: #f0f0f0 !important;
        }
  
        .pingbash-checkbox-option input[type="checkbox"] {
          margin: 0 !important;
        }
  
  
  
        .pingbash-group-cancel-btn,
        .pingbash-group-create-btn {
          padding: 12px 24px !important;
          border: none !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
  
        .pingbash-group-cancel-btn {
          background: #f8f9fa !important;
          color: #666 !important;
          border: 1px solid #ddd !important;
        }
  
        .pingbash-group-cancel-btn:hover {
          background: #e9ecef !important;
        }
  
        .pingbash-group-create-btn {
          background: linear-gradient(135deg, #BD00FF, #3A4EFF) !important;
          color: white !important;
        }
  
        .pingbash-group-create-btn:hover:not(:disabled) {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
        }
  
        .pingbash-group-create-btn:disabled {
          background: #ccc !important;
          cursor: not-allowed !important;
          opacity: 0.6 !important;
        }
  
        /* Responsive Design for Group Creation Modal */
        @media (max-width: 768px) {
          .pingbash-group-creation-content {
            width: 95% !important;
            margin: auto !important;
          }
  
          .pingbash-color-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
  
          .pingbash-settings-grid {
            grid-template-columns: 1fr !important;
          }
  
          .pingbash-size-controls {
            flex-direction: column !important;
            gap: 10px !important;
          }
        }

        /* Preview Input Area Styles */
        .pingbash-preview-input-area {
          border-top: 1px solid #E5E7EB !important;
          padding: 6px 12px !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
        }

        .pingbash-preview-media-buttons {
          display: flex !important;
          gap: 10px !important;
          align-items: center !important;
        }

        .pingbash-preview-media-btn {
          background: none !important;
          border: none !important;
          font-size: 20px !important;
          cursor: pointer !important;
          padding: 4px !important;
          border-radius: 4px !important;
          transition: background 0.2s !important;
          color: var(--title-color, #333) !important;
        }

        .pingbash-preview-media-btn:hover {
          background: rgba(0,0,0,0.1) !important;
        }

        .pingbash-preview-input-container {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          background: var(--input-bg-color, white) !important;
          border: 1px solid #E5E7EB !important;
          border-radius: 20px !important;
          padding: 6px 16px !important;
        }

        .pingbash-preview-input {
          flex: 1 !important;
          border: none !important;
          outline: none !important;
          background: transparent !important;
          font-size: 14px !important;
          color: var(--input-text-color, #333) !important;
        }

        .pingbash-preview-send-btn {
          background: linear-gradient(135deg, #BD00FF 0%, #3A4EFF 100%) !important;
          color: white !important;
          border: none !important;
          border-radius: 20px !important;
          padding: 6px 16px !important;
          font-size: 14px !important;
          cursor: pointer !important;
          transition: opacity 0.2s !important;
        }

        .pingbash-preview-send-btn:hover:not(:disabled) {
          opacity: 0.9 !important;
        }

        .pingbash-preview-send-btn:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }

        /* Preview Placeholder Styles */
        .pingbash-preview-placeholder {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 200px !important;
          text-align: center !important;
        }

        .pingbash-preview-placeholder-text h3 {
          color: var(--msg-text-color, #333) !important;
          margin-bottom: 12px !important;
          font-size: 18px !important;
        }

        .pingbash-preview-placeholder-text p {
          color: var(--date-color, #666) !important;
          margin: 6px 0 !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
        }

        /* Ensure preview messages inherit all actual message styles */
        .pingbash-preview-messages .pingbash-preview-message {
          display: flex !important;
          gap: 8px !important;
          margin-bottom: 4px !important;
          align-items: flex-start !important;
        }

        .pingbash-preview-messages .pingbash-preview-message.own {
          justify-content: flex-start !important;
        }

        .pingbash-preview-messages .pingbash-preview-message-content {
          flex: 1 !important;
          min-width: 0 !important;
        }

        .pingbash-preview-messages .pingbash-preview-message-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 4px !important;
          opacity: 0.7 !important;
          font-size: 11px !important;
        }

        .pingbash-preview-messages .pingbash-preview-text {
          font-size: var(--font-size, 14px) !important;
          color: var(--msg-text-color, #111827) !important;
          line-height: 1.4 !important;
          word-wrap: break-word !important;
        }

        .pingbash-preview-messages .pingbash-preview-avatar {
          width: 32px !important;
          height: 32px !important;
          background: #6B7280 !important;
          color: white !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          flex-shrink: 0 !important;
        }

        .pingbash-preview-messages .pingbash-preview-sender {
          font-size: 11px !important;
          font-weight: 600 !important;
          color: var(--msg-text-color, #6B7280) !important;
        }

        .pingbash-preview-messages .pingbash-preview-time {
          font-size: 11px !important;
          color: var(--date-color, #999) !important;
        }

        /* Filter Mode Text Styles (same as F version) */
        .pingbash-filter-mode-text {
          font-size: 11px;
          color: #666;
          background: #73dbf9;
          padding: 2px 6px;
          border-radius: 10px;
          margin: 0 4px;
          font-weight: normal;
        }

        /* Pinned Messages Widget Styles (same as W version) */
        .pingbash-pinned-messages-widget {
          display: block !important;
          background: #f8f9fa !important;
          border-bottom: 1px solid #e9ecef !important;
          padding: 0 !important;
          margin: 0 !important;
          position: relative !important;
          z-index: 10 !important;
        }

        .pingbash-pinned-container {
          display: flex !important;
          align-items: center !important;
          padding: 8px 12px !important;
          gap: 12px !important;
          min-height: 60px !important;
          background: var(--msg-bg-color, #F5F5F5) !important;
        }

        .pingbash-pinned-navigation {
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
          align-items: center !important;
        }

        .pingbash-pinned-dot {
          width: 8px !important;
          height: 8px !important;
          border-radius: 50% !important;
          background: #ccc !important;
          cursor: pointer !important;
          transition: background 0.2s ease !important;
        }

        .pingbash-pinned-dot.active {
          background: var(--title-color, #333333) !important;
        }

        .pingbash-pinned-dot:hover {
          background: var(--title-color, #333333) !important;
          opacity: 0.7 !important;
        }

        .pingbash-pinned-content {
          flex: 1 !important;
          cursor: pointer !important;
          padding: 4px 0 !important;
          overflow: hidden !important;
        }

        .pingbash-pinned-header {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin-bottom: 4px !important;
        }

        .pingbash-pinned-sender {
          font-weight: bold !important;
          color: var(--title-color, #333333) !important;
          font-size: var(--font-size, 14px) !important;
        }

        .pingbash-pinned-index {
          color: var(--title-color, #333333) !important;
          opacity: 0.7 !important;
          font-size: calc(var(--font-size, 14px) - 2px) !important;
        }

        .pingbash-pinned-text {
          color: var(--msg-text-color, #333333) !important;
          font-size: var(--font-size, 14px) !important;
          line-height: 1.4 !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          white-space: nowrap !important;
        }

        .pingbash-pinned-controls {
          display: flex !important;
          gap: 4px !important;
        }

        .pingbash-pinned-prev,
        .pingbash-pinned-next {
          background: none !important;
          border: 1px solid var(--title-color, #333333) !important;
          color: var(--title-color, #333333) !important;
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-pinned-prev:hover,
        .pingbash-pinned-next:hover {
          background: var(--title-color, #333333) !important;
          color: white !important;
        }

        .pingbash-pinned-prev:disabled,
        .pingbash-pinned-next:disabled {
          opacity: 0.3 !important;
          cursor: not-allowed !important;
        }

        .pingbash-pinned-prev:disabled:hover,
        .pingbash-pinned-next:disabled:hover {
          background: none !important;
          color: var(--title-color, #333333) !important;
        }

        /* Pin button styles */
        .pingbash-message-action.pin {
          background: none !important;
          border: none !important;
          color: var(--date-color, #666) !important;
          font-size: 14px !important;
          cursor: pointer !important;
          padding: 2px 4px !important;
          border-radius: 3px !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-message-action.pin:hover {
          background: rgba(0,0,0,0.1) !important;
          color: var(--title-color, #333333) !important;
        }

        /* Message highlight/blinking effect for pinned message navigation */
        .pingbash-message-highlight {
          animation: pingbash-message-blink 1s ease-in-out !important;
          border: 2px solid var(--title-color, #333333) !important;
          border-radius: 8px !important;
        }

        @keyframes pingbash-message-blink {
          0%, 100% { 
            background-color: transparent !important; 
            transform: scale(1) !important;
          }
          25% { 
            background-color: rgba(37, 150, 190, 0.1) !important; 
            transform: scale(1.02) !important;
          }
          50% { 
            background-color: rgba(37, 150, 190, 0.2) !important; 
            transform: scale(1.02) !important;
          }
          75% { 
            background-color: rgba(37, 150, 190, 0.1) !important; 
            transform: scale(1.02) !important;
          }
                 }

        /* Unpin button in pinned messages widget */
        .pingbash-pinned-unpin {
          background: none !important;
          border: 1px solid #dc3545 !important;
          color: #dc3545 !important;
          width: 24px !important;
          height: 24px !important;
          border-radius: 50% !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 12px !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-pinned-unpin:hover {
          background: #dc3545 !important;
          color: white !important;
        }

        /* Chat Limitations Popup Styles (same as W version) */
        .pingbash-chat-limitations-popup {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 2147483647 !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pingbash-chat-limitations-popup .pingbash-popup-content {
          width: 400px !important;
          max-width: 90% !important;
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          position: relative !important;
          margin: 0 auto !important;
        }

        .pingbash-limitations-content {
          padding: 0 !important;
          max-height: 400px !important;
          overflow-y: auto !important;
        }

        .pingbash-limitation-section {
          margin-bottom: 20px !important;
        }

        .pingbash-limitation-section h4 {
          font-weight: 600 !important;
          margin-bottom: 12px !important;
          color: #333 !important;
          font-size: 16px !important;
        }

        .pingbash-limitation-section .pingbash-radio-group {
          display: flex !important;
          flex-direction: column !important;
          gap: 8px !important;
        }

        .pingbash-limitation-section .pingbash-radio-option {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          cursor: pointer !important;
          font-size: 16px !important;
          padding: 4px 0 !important;
        }

        .pingbash-limitation-section .pingbash-radio-option input[type="radio"] {
          width: 16px !important;
          height: 16px !important;
          margin: 0 !important;
        }

        .pingbash-limitation-divider {
          border-top: 1px solid #e0e0e0 !important;
          margin: 20px 0 !important;
        }

        .pingbash-slow-mode-options {
          margin-top: 12px !important;
          padding-left: 24px !important;
        }

        .pingbash-custom-seconds {
          margin-top: 8px !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }

        .pingbash-custom-seconds .pingbash-form-group {
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
          margin: 0 !important;
        }

        .pingbash-custom-seconds input {
          width: 80px !important;
          padding: 4px 8px !important;
          border: 1px solid #ccc !important;
          border-radius: 4px !important;
          font-size: 14px !important;
        }

        .pingbash-limitations-cancel-btn,
        .pingbash-limitations-ok-btn {
          padding: 8px 16px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-limitations-cancel-btn {
          background: #f5f5f5 !important;
          color: #333 !important;
          margin-right: 8px !important;
        }

        .pingbash-limitations-cancel-btn:hover {
          background: #e0e0e0 !important;
        }

        .pingbash-limitations-ok-btn {
          background: #007bff !important;
          color: white !important;
        }

        .pingbash-limitations-ok-btn:hover {
          background: #0056b3 !important;
        }

        /* Manage Chat Popup Styles */
        .pingbash-manage-chat-popup {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 2147483647 !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pingbash-manage-chat-popup .pingbash-popup-content {
          width: 400px !important;
          max-width: 90% !important;
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          position: relative !important;
          margin: 0 auto !important;
        }

        .pingbash-manage-chat-content {
          padding: 0 !important;
          min-height: 200px !important;
        }

        .pingbash-manage-chat-options {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
          padding: 20px !important;
        }

        .pingbash-manage-chat-option {
          display: flex !important;
          align-items: center !important;
          padding: 12px 16px !important;
          background: #f8f9fa !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #333 !important;
          transition: all 0.2s ease !important;
          text-align: left !important;
          width: 100% !important;
          outline: none !important;
        }

        .pingbash-manage-chat-option:hover {
          background: #e9ecef !important;
          border-color: #adb5bd !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }

        .pingbash-pinned-messages-view {
          padding: 20px !important;
        }

        .pingbash-pinned-messages-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 16px !important;
          padding-bottom: 12px !important;
          border-bottom: 1px solid #e0e0e0 !important;
        }

        .pingbash-pinned-messages-header h4 {
          margin: 0 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #333 !important;
        }

        .pingbash-back-to-menu {
          background: #f8f9fa !important;
          border: 1px solid #e0e0e0 !important;
          color: #333 !important;
          cursor: pointer !important;
          padding: 6px 12px !important;
          border-radius: 4px !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-back-to-menu:hover {
          background: #e9ecef !important;
          border-color: #adb5bd !important;
        }

        .pingbash-pinned-messages-list {
          max-height: 300px !important;
          overflow-y: auto !important;
        }

        .pingbash-no-pinned {
          text-align: center !important;
          padding: 40px 20px !important;
          color: #666 !important;
          font-style: italic !important;
          font-size: 14px !important;
        }

        .pingbash-no-pinned-messages {
          text-align: center !important;
          padding: 40px 20px !important;
          color: #666 !important;
          font-style: italic !important;
        }

        .pingbash-pinned-message-item {
          display: flex !important;
          align-items: flex-start !important;
          gap: 12px !important;
          padding: 12px !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 6px !important;
          margin-bottom: 8px !important;
          background: #f8f9fa !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-pinned-message-item:hover {
          background: #e9ecef !important;
          border-color: #adb5bd !important;
        }

        .pingbash-pinned-message-content {
          flex: 1 !important;
          min-width: 0 !important;
        }

        .pingbash-pinned-message-sender {
          font-weight: 600 !important;
          color: #333 !important;
          font-size: 13px !important;
          margin-bottom: 4px !important;
        }

        .pingbash-pinned-message-text {
          color: #555 !important;
          font-size: 14px !important;
          line-height: 1.4 !important;
          word-wrap: break-word !important;
        }

        .pingbash-pinned-message-time {
          color: #999 !important;
          font-size: 12px !important;
          margin-top: 4px !important;
        }

        .pingbash-unpin-btn {
          background: none !important;
          border: none !important;
          color: #dc3545 !important;
          cursor: pointer !important;
          font-size: 16px !important;
          padding: 4px !important;
          border-radius: 3px !important;
          transition: all 0.2s ease !important;
          flex-shrink: 0 !important;
          width: 28px !important;
          height: 28px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pingbash-unpin-btn:hover {
          background: rgba(220, 53, 69, 0.1) !important;
          transform: scale(1.1) !important;
        }

        .pingbash-pinned-message-actions {
          display: flex !important;
          gap: 4px !important;
        }

        .pingbash-unpin-message-btn {
          background: #dc3545 !important;
          border: none !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 3px !important;
          cursor: pointer !important;
          font-size: 12px !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-unpin-message-btn:hover {
          background: #c82333 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-jump-to-message-btn {
          background: #007bff !important;
          border: none !important;
          color: white !important;
          padding: 4px 8px !important;
          border-radius: 3px !important;
          cursor: pointer !important;
          font-size: 12px !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-jump-to-message-btn:hover {
          background: #0056b3 !important;
          transform: translateY(-1px) !important;
        }

        /* Moderator Management Popup Styles */
        .pingbash-moderator-management-popup {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 2147483647 !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pingbash-moderator-management-popup .pingbash-popup-content {
          width: 500px !important;
          max-width: 90% !important;
          max-height: 80vh !important;
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          position: relative !important;
          margin: 0 auto !important;
          overflow-y: auto !important;
        }

        .pingbash-moderator-management-content {
          padding: 0 !important;
        }

        .pingbash-moderators-section,
        .pingbash-add-moderator-section {
          padding: 20px !important;
          border-bottom: 1px solid #e0e0e0 !important;
        }

        .pingbash-moderators-section h4,
        .pingbash-add-moderator-section h4 {
          margin: 0 0 16px 0 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #333 !important;
        }

        .pingbash-moderators-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 12px !important;
        }

        .pingbash-moderator-item {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 12px !important;
          background: #f8f9fa !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-moderator-item:hover {
          background: #e9ecef !important;
          border-color: #adb5bd !important;
        }

        .pingbash-moderator-info {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
        }

        .pingbash-moderator-avatar {
          width: 40px !important;
          height: 40px !important;
          border-radius: 50% !important;
          background: #6c757d !important;
          color: white !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 16px !important;
          font-weight: bold !important;
          flex-shrink: 0 !important;
        }

        .pingbash-moderator-details {
          flex: 1 !important;
          min-width: 0 !important;
        }

        .pingbash-moderator-name {
          font-weight: 600 !important;
          color: #333 !important;
          font-size: 14px !important;
          margin-bottom: 4px !important;
        }

        .pingbash-moderator-permissions {
          font-size: 12px !important;
          color: #666 !important;
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 4px !important;
        }

        .pingbash-permission-badge {
          background: #e3f2fd !important;
          color: #1976d2 !important;
          padding: 2px 6px !important;
          border-radius: 10px !important;
          font-size: 10px !important;
          font-weight: 500 !important;
        }

        .pingbash-moderator-actions {
          display: flex !important;
          gap: 8px !important;
        }

        .pingbash-moderator-edit-btn,
        .pingbash-moderator-remove-btn {
          padding: 6px 12px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-moderator-edit-btn {
          background: #007bff !important;
          color: white !important;
        }

        .pingbash-moderator-edit-btn:hover {
          background: #0056b3 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-moderator-remove-btn {
          background: #dc3545 !important;
          color: white !important;
        }

        .pingbash-moderator-remove-btn:hover {
          background: #c82333 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-member-search {
          position: relative !important;
        }

        .pingbash-member-search-input {
          width: 100% !important;
          padding: 12px !important;
          border: 1px solid #ddd !important;
          border-radius: 6px !important;
          font-size: 14px !important;
          outline: none !important;
          transition: border-color 0.2s ease !important;
        }

        .pingbash-member-search-input:focus {
          border-color: #007bff !important;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1) !important;
        }

        .pingbash-member-search-results {
          position: absolute !important;
          top: 100% !important;
          left: 0 !important;
          right: 0 !important;
          background: white !important;
          border: 1px solid #ddd !important;
          border-top: none !important;
          border-radius: 0 0 6px 6px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          max-height: 200px !important;
          overflow-y: auto !important;
          z-index: 1000 !important;
        }

        .pingbash-member-result-item {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          padding: 12px !important;
          cursor: pointer !important;
          border-bottom: 1px solid #f0f0f0 !important;
          transition: background-color 0.2s ease !important;
        }

        .pingbash-member-result-item:hover {
          background: #f5f5f5 !important;
        }

        .pingbash-member-result-item:last-child {
          border-bottom: none !important;
        }

        .pingbash-member-result-avatar {
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          background: #6c757d !important;
          color: white !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          font-weight: bold !important;
          flex-shrink: 0 !important;
        }

        .pingbash-member-result-name {
          font-weight: 500 !important;
          color: #333 !important;
          font-size: 14px !important;
        }

        /* Moderator Permissions Popup */
        .pingbash-mod-permissions-popup {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 2147483648 !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pingbash-mod-permissions-overlay {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0,0,0,0.5) !important;
        }

        .pingbash-mod-permissions-content {
          position: relative !important;
          width: 400px !important;
          max-width: 90% !important;
          max-height: 85vh !important;
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          margin: 0 auto !important;
          overflow-y: auto !important;
        }

        .pingbash-mod-permissions-header {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          padding: 16px 20px !important;
          border-bottom: 1px solid #e0e0e0 !important;
        }

        .pingbash-mod-permissions-header h4 {
          margin: 0 !important;
          font-size: 16px !important;
          font-weight: 600 !important;
          color: #333 !important;
        }

        .pingbash-mod-permissions-close {
          background: none !important;
          border: none !important;
          font-size: 20px !important;
          cursor: pointer !important;
          color: #666 !important;
          padding: 0 !important;
          width: 24px !important;
          height: 24px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pingbash-mod-permissions-close:hover {
          color: #333 !important;
        }

        .pingbash-mod-permissions-body {
          padding: 20px !important;
        }

        .pingbash-mod-permissions-body .pingbash-moderator-info {
          margin-bottom: 20px !important;
          padding-bottom: 16px !important;
          border-bottom: 1px solid #e0e0e0 !important;
        }

        .pingbash-permissions-list {
          display: flex !important;
          flex-direction: column !important;
          gap: 16px !important;
        }

        .pingbash-permission-item {
          display: flex !important;
          flex-direction: column !important;
          gap: 4px !important;
          cursor: pointer !important;
          padding: 12px !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-permission-item:hover {
          background: #f8f9fa !important;
          border-color: #adb5bd !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
        }

        .pingbash-permission-item:active {
          transform: translateY(0) !important;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
        }

        .pingbash-permission-checkbox {
          margin-right: 8px !important;
          width: 16px !important;
          height: 16px !important;
          cursor: pointer !important;
          flex-shrink: 0 !important;
          accent-color: #007bff !important;
          border: 1px solid #ddd !important;
          border-radius: 3px !important;
        }

        .pingbash-permission-checkbox:checked {
          background-color: #007bff !important;
          border-color: #007bff !important;
        }

        .pingbash-permission-checkbox:focus {
          outline: 2px solid rgba(0, 123, 255, 0.3) !important;
          outline-offset: 2px !important;
        }

        .pingbash-permission-label {
          font-weight: 500 !important;
          color: #333 !important;
          font-size: 14px !important;
          display: flex !important;
          align-items: center !important;
        }

        .pingbash-permission-description {
          color: #666 !important;
          font-size: 12px !important;
          margin-left: 24px !important;
          line-height: 1.4 !important;
        }

        .pingbash-mod-permissions-footer {
          display: flex !important;
          justify-content: flex-end !important;
          gap: 12px !important;
          padding: 16px 20px !important;
          border-top: 1px solid #e0e0e0 !important;
        }

        .pingbash-mod-permissions-cancel,
        .pingbash-mod-permissions-save,
        .pingbash-moderators-cancel-btn,
        .pingbash-moderators-save-btn {
          padding: 8px 16px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-mod-permissions-cancel,
        .pingbash-moderators-cancel-btn {
          background: #f8f9fa !important;
          color: #333 !important;
          border: 1px solid #ddd !important;
        }

        .pingbash-mod-permissions-cancel:hover,
        .pingbash-moderators-cancel-btn:hover {
          background: #e9ecef !important;
        }

        .pingbash-mod-permissions-save,
        .pingbash-moderators-save-btn {
          background: #007bff !important;
          color: white !important;
        }

        .pingbash-mod-permissions-save:hover,
        .pingbash-moderators-save-btn:hover {
          background: #0056b3 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-no-moderators {
          text-align: center !important;
          padding: 40px 20px !important;
          color: #666 !important;
          font-style: italic !important;
          font-size: 14px !important;
        }

        /* Loading states for moderator management */
        .pingbash-loading-overlay {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(255, 255, 255, 0.8) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 1000 !important;
          border-radius: 8px !important;
        }

        .pingbash-spinner {
          width: 32px !important;
          height: 32px !important;
          border: 3px solid #f3f3f3 !important;
          border-top: 3px solid #007bff !important;
          border-radius: 50% !important;
          animation: pingbash-spin 1s linear infinite !important;
        }

        @keyframes pingbash-spin {
          0% { transform: rotate(0deg) !important; }
          100% { transform: rotate(360deg) !important; }
        }

        .pingbash-loading-text {
          margin-left: 12px !important;
          color: #333 !important;
          font-size: 14px !important;
          font-weight: 500 !important;
        }

        /* Button loading states */
        .pingbash-btn-loading {
          position: relative !important;
          color: transparent !important;
          pointer-events: none !important;
        }

        .pingbash-btn-loading::after {
          content: '' !important;
          position: absolute !important;
          top: 50% !important;
          left: 50% !important;
          width: 16px !important;
          height: 16px !important;
          margin-top: -8px !important;
          margin-left: -8px !important;
          border: 2px solid transparent !important;
          border-top: 2px solid currentColor !important;
          border-radius: 50% !important;
          animation: pingbash-spin 1s linear infinite !important;
        }

        .pingbash-moderator-edit-btn.pingbash-btn-loading::after,
        .pingbash-moderator-remove-btn.pingbash-btn-loading::after {
          border-top-color: white !important;
        }

        .pingbash-mod-permissions-save.pingbash-btn-loading::after {
          border-top-color: white !important;
        }

        /* Toast notifications for better user feedback */
        .pingbash-toast {
          position: fixed !important;
          top: 20px !important;
          right: 20px !important;
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
          border-left: 4px solid #007bff !important;
          padding: 16px 20px !important;
          max-width: 350px !important;
          z-index: 2147483650 !important;
          animation: pingbash-slide-in 0.3s ease-out !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 14px !important;
        }

        .pingbash-toast.success {
          border-left-color: #28a745 !important;
        }

        .pingbash-toast.error {
          border-left-color: #dc3545 !important;
        }

        .pingbash-toast.warning {
          border-left-color: #ffc107 !important;
        }

        .pingbash-toast-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          margin-bottom: 8px !important;
        }

        .pingbash-toast-title {
          font-weight: 600 !important;
          color: #333 !important;
          margin: 0 !important;
        }

        .pingbash-toast-close {
          background: none !important;
          border: none !important;
          color: #999 !important;
          cursor: pointer !important;
          font-size: 18px !important;
          padding: 0 !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pingbash-toast-close:hover {
          color: #666 !important;
        }

        .pingbash-toast-message {
          color: #666 !important;
          line-height: 1.4 !important;
          margin: 0 !important;
        }

        @keyframes pingbash-slide-in {
          from {
            transform: translateX(100%) !important;
            opacity: 0 !important;
          }
          to {
            transform: translateX(0) !important;
            opacity: 1 !important;
          }
        }

        @keyframes pingbash-slide-out {
          from {
            transform: translateX(0) !important;
            opacity: 1 !important;
          }
          to {
            transform: translateX(100%) !important;
            opacity: 0 !important;
          }
        }

        .pingbash-toast.removing {
          animation: pingbash-slide-out 0.3s ease-in !important;
        }

        /* Custom confirmation dialog */
        .pingbash-confirm-modal {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0,0,0,0.5) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          z-index: 2147483649 !important;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        }

        .pingbash-confirm-content {
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          max-width: 400px !important;
          width: 90% !important;
          overflow: hidden !important;
        }

        .pingbash-confirm-header {
          padding: 20px 24px 16px 24px !important;
          border-bottom: 1px solid #e0e0e0 !important;
        }

        .pingbash-confirm-title {
          margin: 0 !important;
          font-size: 18px !important;
          font-weight: 600 !important;
          color: #333 !important;
        }

        .pingbash-confirm-body {
          padding: 20px 24px !important;
        }

        .pingbash-confirm-message {
          margin: 0 !important;
          color: #666 !important;
          line-height: 1.5 !important;
          font-size: 14px !important;
        }

        .pingbash-confirm-footer {
          display: flex !important;
          justify-content: flex-end !important;
          gap: 12px !important;
          padding: 16px 24px 20px 24px !important;
          border-top: 1px solid #e0e0e0 !important;
        }

        .pingbash-confirm-btn {
          padding: 8px 16px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-confirm-cancel {
          background: #f8f9fa !important;
          color: #333 !important;
          border: 1px solid #ddd !important;
        }

        .pingbash-confirm-cancel:hover {
          background: #e9ecef !important;
        }

        .pingbash-confirm-ok {
          background: #dc3545 !important;
          color: white !important;
        }

        .pingbash-confirm-ok:hover {
          background: #c82333 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-confirm-ok.primary {
          background: #007bff !important;
        }

        .pingbash-confirm-ok.primary:hover {
          background: #0056b3 !important;
        }

        /* Censored Content Popup Styles */
        .pingbash-censored-content-popup {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 2147483647 !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .pingbash-censored-content-popup .pingbash-popup-content {
          width: 500px !important;
          max-width: 90% !important;
          max-height: 80vh !important;
          background: white !important;
          border-radius: 8px !important;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12) !important;
          position: relative !important;
          margin: 0 auto !important;
          overflow-y: auto !important;
        }

        .pingbash-censored-content-content {
          padding: 0 !important;
        }

        .pingbash-censored-words-list {
          max-height: 300px !important;
          overflow-y: auto !important;
          margin-bottom: 20px !important;
          padding: 20px !important;
        }

        .pingbash-censored-word-item {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          padding: 12px !important;
          background: #f8f9fa !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 6px !important;
          margin-bottom: 8px !important;
          transition: all 0.2s ease !important;
        }

        .pingbash-censored-word-item:hover {
          background: #e9ecef !important;
          border-color: #adb5bd !important;
        }

        .pingbash-censored-word-text {
          font-size: 14px !important;
          font-weight: 500 !important;
          color: #333 !important;
          flex: 1 !important;
          min-width: 0 !important;
          word-break: break-word !important;
        }

        .pingbash-censored-word-actions {
          display: flex !important;
          gap: 8px !important;
        }

        .pingbash-edit-word-btn,
        .pingbash-delete-word-btn {
          padding: 6px 12px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-edit-word-btn {
          background: #007bff !important;
          color: white !important;
        }

        .pingbash-edit-word-btn:hover {
          background: #0056b3 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-delete-word-btn {
          background: #dc3545 !important;
          color: white !important;
        }

        .pingbash-delete-word-btn:hover {
          background: #c82333 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-add-word-section {
          padding: 20px !important;
          border-top: 1px solid #e0e0e0 !important;
          background: #f8f9fa !important;
        }

        .pingbash-word-input-container {
          display: flex !important;
          gap: 12px !important;
        }

        .pingbash-censored-word-input {
          flex: 1 !important;
          padding: 12px !important;
          border: 1px solid #ddd !important;
          border-radius: 6px !important;
          font-size: 14px !important;
          outline: none !important;
          transition: border-color 0.2s ease !important;
        }

        .pingbash-censored-word-input:focus {
          border-color: #007bff !important;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1) !important;
        }

        .pingbash-add-word-btn {
          padding: 12px 20px !important;
          background: #28a745 !important;
          color: white !important;
          border: none !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-add-word-btn:hover {
          background: #218838 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-add-word-btn:disabled {
          background: #6c757d !important;
          cursor: not-allowed !important;
          transform: none !important;
        }

        .pingbash-censored-close-btn,
        .pingbash-censored-save-btn {
          padding: 8px 16px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
        }

        .pingbash-censored-close-btn {
          background: #f8f9fa !important;
          color: #333 !important;
          border: 1px solid #ddd !important;
        }

        .pingbash-censored-close-btn:hover {
          background: #e9ecef !important;
        }

        .pingbash-censored-save-btn {
          background: #28a745 !important;
          color: white !important;
        }

        .pingbash-censored-save-btn:hover {
          background: #218838 !important;
          transform: translateY(-1px) !important;
        }

        .pingbash-no-censored-words {
          text-align: center !important;
          padding: 40px 20px !important;
          color: #666 !important;
          font-style: italic !important;
          font-size: 14px !important;
        }

        /* Edit mode styles */
        .pingbash-censored-word-item.editing .pingbash-censored-word-text {
          display: none !important;
        }

        .pingbash-censored-word-item.editing .pingbash-censored-word-actions {
          display: none !important;
        }

        .pingbash-edit-word-input {
          flex: 1 !important;
          padding: 8px !important;
          border: 1px solid #007bff !important;
          border-radius: 4px !important;
          font-size: 14px !important;
          outline: none !important;
          margin-right: 8px !important;
        }

        .pingbash-save-edit-btn,
        .pingbash-cancel-edit-btn {
          padding: 6px 12px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
          outline: none !important;
          margin-left: 4px !important;
        }

        .pingbash-save-edit-btn {
          background: #28a745 !important;
          color: white !important;
        }

        .pingbash-save-edit-btn:hover {
          background: #218838 !important;
        }

        .pingbash-cancel-edit-btn {
          background: #6c757d !important;
          color: white !important;
        }

        .pingbash-cancel-edit-btn:hover {
          background: #5a6268 !important;
        }

        /* Mobile Responsive Styles for Censored Content */
        @media (max-width: 768px) {
          .pingbash-censored-content-popup .pingbash-popup-content {
            width: 95% !important;
            max-width: 95% !important;
            max-height: 90vh !important;
            margin: 10px auto !important;
          }

          .pingbash-censored-words-list {
            max-height: 250px !important;
            padding: 16px !important;
          }

          .pingbash-censored-word-item {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }

          .pingbash-censored-word-text {
            font-size: 16px !important;
            line-height: 1.4 !important;
          }

          .pingbash-censored-word-actions {
            align-self: flex-end !important;
          }

          .pingbash-edit-word-btn,
          .pingbash-delete-word-btn {
            padding: 8px 16px !important;
            font-size: 14px !important;
          }

          .pingbash-add-word-section {
            padding: 16px !important;
          }

          .pingbash-word-input-container {
            flex-direction: column !important;
            gap: 8px !important;
          }

          .pingbash-censored-word-input,
          .pingbash-add-word-btn {
            width: 100% !important;
            padding: 14px !important;
            font-size: 16px !important;
          }

          .pingbash-popup-footer {
            flex-direction: column !important;
            gap: 8px !important;
          }

          .pingbash-censored-close-btn,
          .pingbash-censored-save-btn {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .pingbash-censored-content-popup .pingbash-popup-content {
            width: 98% !important;
            max-width: 98% !important;
            margin: 5px auto !important;
            border-radius: 6px !important;
          }

          .pingbash-popup-header h3 {
            font-size: 18px !important;
          }

          .pingbash-censored-word-text {
            font-size: 17px !important;
          }

          .pingbash-edit-word-input {
            font-size: 16px !important;
            padding: 12px !important;
          }
        }

        /* Mobile Responsive Styles for Moderator Management */
        @media (max-width: 768px) {
          .pingbash-moderator-management-popup .pingbash-popup-content {
            width: 95% !important;
            max-width: 95% !important;
            max-height: 90vh !important;
            margin: 10px auto !important;
          }

          .pingbash-mod-permissions-content {
            width: 95% !important;
            max-width: 95% !important;
            max-height: 90vh !important;
            margin: 10px auto !important;
          }

          .pingbash-mod-permissions-header,
          .pingbash-mod-permissions-body,
          .pingbash-mod-permissions-footer {
            padding: 16px !important;
          }

          .pingbash-moderator-info {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }

          .pingbash-moderator-avatar {
            width: 36px !important;
            height: 36px !important;
            font-size: 14px !important;
          }

          .pingbash-permission-item {
            padding: 16px !important;
          }

          .pingbash-permission-label {
            font-size: 16px !important;
            line-height: 1.4 !important;
          }

          .pingbash-permission-description {
            margin-left: 0 !important;
            margin-top: 4px !important;
            font-size: 14px !important;
            line-height: 1.3 !important;
          }

          .pingbash-mod-permissions-footer {
            flex-direction: column !important;
            gap: 8px !important;
          }

          .pingbash-mod-permissions-cancel,
          .pingbash-mod-permissions-save {
            width: 100% !important;
            padding: 12px 16px !important;
            font-size: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .pingbash-moderator-management-popup .pingbash-popup-content,
          .pingbash-mod-permissions-content {
            width: 98% !important;
            max-width: 98% !important;
            margin: 5px auto !important;
            border-radius: 6px !important;
          }

          .pingbash-mod-permissions-header h4 {
            font-size: 18px !important;
          }

          .pingbash-permission-checkbox {
            width: 18px !important;
            height: 18px !important;
            margin-right: 12px !important;
          }

          .pingbash-permission-label {
            font-size: 17px !important;
          }

          .pingbash-permission-description {
            font-size: 15px !important;
          }
        }

        /* User Search Modal */
        .pingbash-user-search-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2147483648;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pingbash-user-search-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        
        .pingbash-search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .pingbash-user-search-modal-input {
          width: 100%;
          padding: 12px 40px 12px 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: border-color 0.2s ease;
          font-family: inherit;
        }
        
        .pingbash-user-search-modal-input:focus {
          border-color: #2596be;
          box-shadow: 0 0 0 2px rgba(37, 150, 190, 0.1);
        }
        
        .pingbash-search-icon {
          position: absolute;
          right: 12px;
          color: #666;
          pointer-events: none;
        }
        
        .pingbash-user-search-results {
          max-height: 400px;
          overflow-y: auto;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #f8f9fa;
        }
        
        .pingbash-user-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #e9ecef;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-user-result-item:hover {
          background: #e9ecef;
        }
        
        .pingbash-user-result-item:last-child {
          border-bottom: none;
        }
        
        .pingbash-user-result-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #6c757d;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .pingbash-user-result-info {
          flex: 1;
          min-width: 0;
        }
        
        .pingbash-user-result-name {
          font-weight: 600;
          color: #333;
          font-size: 14px;
          margin-bottom: 2px;
        }
        
        .pingbash-user-result-status {
          font-size: 12px;
          color: #666;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .pingbash-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .pingbash-status-dot.online {
          background: #28a745;
        }
        
        .pingbash-status-dot.offline {
          background: #6c757d;
        }
        
        .pingbash-user-search-cancel-btn {
          background: #f8f9fa;
          color: #333;
          border: 1px solid #ddd;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background-color 0.2s ease;
        }
        
        .pingbash-user-search-cancel-btn:hover {
          background: #e9ecef;
        }
        
        .pingbash-no-users-found {
          text-align: center;
          padding: 40px 20px;
          color: #666;
          font-style: italic;
          font-size: 14px;
        }
        
        .pingbash-loading-users {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 14px;
        }

        /* Send Notification Modal Styles */
        .pingbash-notification-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 999999999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        .pingbash-notification-modal .pingbash-popup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(2px);
        }

        .pingbash-notification-modal .pingbash-popup-content {
          width: 90%;
          max-width: 600px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.3);
          position: relative;
          max-height: 80vh;
          overflow-y: auto;
          animation: slideInScale 0.3s ease;
          margin: 20px;
        }

        .pingbash-notification-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .pingbash-notification-textarea {
          width: 100%;
          min-height: 120px;
          padding: 12px;
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          box-sizing: border-box;
        }

        .pingbash-notification-textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
        }

        .pingbash-char-counter {
          text-align: right;
          font-size: 12px;
          color: #6c757d;
          margin-top: 5px;
        }

        .pingbash-char-count.over-limit {
          color: #dc3545;
          font-weight: bold;
        }

        .pingbash-notification-preview {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          padding: 15px;
          background: #f8f9fa;
        }

        .pingbash-notification-preview h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #495057;
        }

        .pingbash-notification-preview-content {
          background: white;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 12px;
          min-height: 40px;
        }

        .pingbash-notification-preview-message {
          font-size: 14px;
          color: #6c757d;
          font-style: italic;
        }

        .pingbash-notification-preview-message.has-content {
          color: #333;
          font-style: normal;
          white-space: pre-wrap;
        }

        .pingbash-notification-buttons {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .pingbash-notification-cancel-btn {
          padding: 10px 20px;
          border: 2px solid #6c757d;
          background: white;
          color: #6c757d;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .pingbash-notification-cancel-btn:hover {
          background: #6c757d;
          color: white;
        }

        .pingbash-notification-send-btn {
          padding: 10px 20px;
          border: 2px solid #007bff;
          background: #007bff;
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .pingbash-notification-send-btn:disabled {
          background: #e9ecef;
          border-color: #e9ecef;
          color: #6c757d;
          cursor: not-allowed;
        }

        .pingbash-notification-send-btn:not(:disabled):hover {
          background: #0056b3;
          border-color: #0056b3;
        }

        .pingbash-notification-send-btn.sending {
          background: #28a745;
          border-color: #28a745;
        }

        /* Dark Mode Support for Send Notification Dialog */
        .pingbash-dark-mode .pingbash-notification-modal .pingbash-popup-content {
          background: #2d3748 !important;
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-popup-header {
          background: #2d3748 !important;
          color: #e2e8f0 !important;
          border-bottom: 1px solid #4a5568 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-popup-header h3 {
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-popup-close {
          color: #e2e8f0 !important;
          background: transparent !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-popup-close:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-form label {
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-textarea {
          background: #1a202c !important;
          border: 2px solid #4a5568 !important;
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-textarea:focus {
          border-color: #4299e1 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-char-counter {
          color: #a0aec0 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-preview h4 {
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-preview-content {
          background: #1a202c !important;
          border: 1px solid #4a5568 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-preview-message {
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-cancel-btn {
          background: #4a5568 !important;
          color: #e2e8f0 !important;
          border: 1px solid #4a5568 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-cancel-btn:hover {
          background: #2d3748 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-send-btn {
          background: #4299e1 !important;
          border-color: #4299e1 !important;
        }

        .pingbash-dark-mode .pingbash-notification-modal .pingbash-notification-send-btn:not(:disabled):hover {
          background: #3182ce !important;
          border-color: #3182ce !important;
        }

        /* Group Notification Dialog Styles - Inside Chat Dialog */
        .pingbash-group-notification-dialog {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          z-index: 1000 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          animation: fadeIn 0.3s ease !important;
          background: transparent !important;
        }

        .pingbash-group-notification-dialog .pingbash-popup-overlay {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          background: rgba(0, 0, 0, 0.5) !important;
          backdrop-filter: blur(2px) !important;
        }

        .pingbash-group-notification-dialog .pingbash-popup-content {
          background: white !important;
          border-radius: 12px !important;
          box-shadow: 0 15px 40px rgba(0,0,0,0.3) !important;
          position: relative !important;
          animation: slideInScale 0.3s ease !important;
          margin: 20px !important;
          max-width: 500px !important;
          width: 90% !important;
        }

        /* Dark Mode Support for Group Notification Dialog */
        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-popup-content {
          background: #2d3748 !important;
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-popup-header {
          background: #2d3748 !important;
          color: #e2e8f0 !important;
          border-bottom: 1px solid #4a5568 !important;
        }

        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-popup-header h3 {
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-popup-close {
          color: #e2e8f0 !important;
          background: transparent !important;
        }

        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-popup-close:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-notification-sender {
          color: #81c784 !important;
        }

        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-notification-message-display {
          background: #1a202c !important;
          border: 1px solid #4a5568 !important;
          color: #e2e8f0 !important;
        }

        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-notification-ok-btn {
          background: #4299e1 !important;
          color: white !important;
        }

        .pingbash-dark-mode .pingbash-group-notification-dialog .pingbash-notification-ok-btn:hover {
          background: #3182ce !important;
        }

        .pingbash-notification-sender {
          margin-bottom: 15px;
          color: #007bff;
          font-size: 14px;
        }

        .pingbash-notification-message-display {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .pingbash-notification-actions {
          display: flex;
          justify-content: center;
        }

        .pingbash-notification-ok-btn {
          padding: 10px 30px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s ease;
        }

        .pingbash-notification-ok-btn:hover {
          background: #0056b3;
        }

        /* Dark Mode Hamburger Icon Fix */
        /* When in dark mode, hamburger icon should use same color as settings icon */
        .pingbash-dark-mode .pingbash-hamburger-btn {
          color: #e5e5e5 !important;
        }

        .pingbash-dark-mode .pingbash-hamburger-btn svg path {
          fill: #e5e5e5 !important;
        }

        /* Override any group setting colors in dark mode for hamburger icon */
        .pingbash-dark-mode .pingbash-hamburger-btn svg {
          color: #e5e5e5 !important;
        }

        /* Dark Mode Popout/Fullscreen Button Fix */
        /* When in dark mode, popout button should use same color as hamburger icon */
        .pingbash-dark-mode .pingbash-popout-btn {
          color: #e5e5e5 !important;
        }

        .pingbash-dark-mode .pingbash-popout-btn svg path {
          fill: #e5e5e5 !important;
        }

        .pingbash-dark-mode .pingbash-popout-btn svg {
          color: #e5e5e5 !important;
        }

        .pingbash-dark-mode .pingbash-popout-btn:hover {
          background: rgba(255,255,255,0.1) !important;
        }

        /* Dark Mode Hamburger Menu Items Fix */
        /* When in dark mode, hamburger menu items should use #e5e5e5 color instead of group setting colors */
        .pingbash-dark-mode .pingbash-hamburger-dropdown .pingbash-menu-item {
          color: #e5e5e5 !important;
        }

        .pingbash-dark-mode .pingbash-hamburger-dropdown .pingbash-menu-item svg {
          color: #e5e5e5 !important;
        }

        .pingbash-dark-mode .pingbash-hamburger-dropdown .pingbash-menu-item svg path {
          fill: #e5e5e5 !important;
        }

        /* Override any group setting colors for hamburger menu item text and icons */
        .pingbash-dark-mode .pingbash-hamburger-dropdown .pingbash-menu-item * {
          color: #e5e5e5 !important;
        }

        /* Profile Popup Styles (same as chat rules popup) */
        .pingbash-profile-popup {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10000;
          display: none;
          align-items: center;
          justify-content: center;
        }

        .pingbash-profile-content {
          max-width: 500px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }

        .pingbash-profile-avatar-section {
          display: flex;
          justify-content: center;
          margin-bottom: 24px;
        }

        .pingbash-profile-avatar-container {
          position: relative;
          display: inline-block;
        }

        .pingbash-profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #e0e0e0;
        }

        .pingbash-avatar-upload-btn {
          position: absolute;
          bottom: 0;
          right: 0;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 8px rgba(0,123,255,0.3);
          transition: all 0.2s ease;
        }

        .pingbash-avatar-upload-btn:hover {
          background: #0056b3;
          transform: scale(1.05);
        }

        .pingbash-avatar-upload-btn svg {
          width: 16px;
          height: 16px;
        }

        .pingbash-profile-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .pingbash-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .pingbash-form-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pingbash-form-group label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }

        .pingbash-form-group input,
        .pingbash-form-group select {
          padding: 10px 14px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
          background: white;
        }

        .pingbash-form-group input:focus,
        .pingbash-form-group select:focus {
          outline: none;
          border-color: #007bff;
        }

        .pingbash-form-group input:read-only {
          background: #f5f5f5;
          cursor: not-allowed;
        }

        .pingbash-form-group select {
          cursor: pointer;
        }

        /* Profile Popup Buttons */
        .pingbash-profile-cancel-btn,
        .pingbash-profile-save-btn {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .pingbash-profile-cancel-btn {
          background: #6c757d;
          color: white;
          margin-right: 8px;
        }

        .pingbash-profile-cancel-btn:hover {
          background: #5a6268;
        }

        .pingbash-profile-save-btn {
          background: #28a745;
          color: white;
        }

        .pingbash-profile-save-btn:hover {
          background: #218838;
        }

        /* Dark Mode Profile Popup */
        .pingbash-dark-mode .pingbash-profile-avatar {
          border-color: #404040;
        }

        .pingbash-dark-mode .pingbash-form-group label {
          color: #b8b8b8;
        }

        .pingbash-dark-mode .pingbash-form-group input,
        .pingbash-dark-mode .pingbash-form-group select {
          background: #252525;
          border-color: #404040;
          color: #e5e5e5;
        }

        .pingbash-dark-mode .pingbash-form-group input:read-only {
          background: #1a1a1a;
        }

        .pingbash-dark-mode .pingbash-form-group select option {
          background: #252525;
          color: #e5e5e5;
        }

        /* Mobile Responsive */
        @media (max-width: 600px) {
          .pingbash-form-row {
            grid-template-columns: 1fr;
          }

          .pingbash-profile-avatar {
            width: 100px;
            height: 100px;
          }

          .pingbash-profile-content {
            width: 95%;
          }
        }

        /* Animation keyframes for modals */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInScale {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `;
  
      document.head.appendChild(style);
    },

});




