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
          padding: 16px 20px;
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
          width: 48px;
          height: 38px;
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
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          border: 2px solid white;
        }
  
        .pingbash-online-count-badge.zero {
          background: #6c757d;
        }
        
        .pingbash-hamburger-btn {
          background: none;
          border: none;
          color: #333;
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
          margin-bottom: 2px;
          opacity: 1;
        }
        
        .pingbash-message.new-message {
          animation: fadeInUp 0.3s ease;
          animation-fill-mode: forwards;
        }
        
        .pingbash-message-content {
          display: flex;
          align-items: flex-start;
          gap: 2px;
          max-width: 100%;
          word-wrap: break-word;
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
          flex: 1;
          min-width: 0;
          padding: 4px 8px;
          border-radius: 18px;
          position: relative;
        }
        
        .pingbash-message.own {
          display: flex;
          justify-content: flex-start;
        }
        
        .pingbash-message.own .pingbash-message-body {
          background: ${this.config.customColors?.primary || '#2596be'} !important;
          color: white !important;
          border-bottom-left-radius: 4px;
        }
        
        .pingbash-message:not(.own) .pingbash-message-body {
          background: #f0f0f0 !important;
          color: #333 !important;
          border-bottom-left-radius: 4px;
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
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1px;
          opacity: 0.7;
          font-size: 11px;
        }
        
        /* For own messages, align header to the left like other messages */
        .pingbash-message.own .pingbash-message-header {
          justify-content: space-between;
        }
        
        .pingbash-message-sender {
          font-weight: 600;
        }
        
        .pingbash-message-time {
          font-size: 10px;
        }
        
        .pingbash-message-text {
          font-size: var(--font-size, 14px);
          line-height: 1.4;
          word-wrap: break-word;
          color: var(--msg-text-color, #333);
        }
        
        .pingbash-message-text img {
          max-width: 200px !important;
          max-height: 200px !important;
          border-radius: 8px !important;
          margin: 1px 0 !important;
          display: block !important;
        }
        
        .pingbash-message-text a {
          color: #007bff !important;
          text-decoration: underline !important;
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
        
        /* W Version Bottom Bar Styling */
        .pingbash-bottom-bar {
          background: white;
          border-top: 1px solid #e0e0e0;
          padding: 10px 16px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        
        .pingbash-bar-left {
          display: flex;
          align-items: center;
        }
        
        .pingbash-media-controls {
          display: flex !important;
          gap: 10px;
          align-items: center;
          min-width: 126px;
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
          width: 24px;
          height: 24px;
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
          width: 300px !important;
          max-width: none !important;
          max-height: none !important;
          overflow: hidden !important;
        }
  
        .pingbash-emoji-grid {
          display: grid !important;
          grid-template-columns: repeat(5, 1fr) !important;
          gap: 4px !important;
          padding: 16px !important;
          height: 100% !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
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
          .pingbash-chat-dialog {
            width: calc(100vw - 40px);
            height: calc(100vh - 100px);
          }
          
          .pingbash-message-content {
            max-width: 85%;
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
          justify-content: center !important;
          align-items: center !important;
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
          top: 50% !important;
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

        .pingbash-create-group-btn {
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

        .pingbash-create-group-btn:disabled {
          background: #9CA3AF !important;
          cursor: not-allowed !important;
        }

        .pingbash-create-group-btn:not(:disabled):hover {
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
        }
      `;
  
      document.head.appendChild(style);
    },

});