/**
 * Pingbash Chat Widget - Styles Module
 * CSS styling for all widget components
 */

// Extend the PingbashChatWidget class with styling methods
Object.assign(PingbashChatWidget.prototype, {
  applyStyles() {
    // Check if styles are already applied
    if (document.getElementById('pingbash-widget-styles')) {
      console.log('🎨 [Widget] Styles already applied');
      return;
    }

    const style = document.createElement('style');
    style.id = 'pingbash-widget-styles';
    style.textContent = this.getWidgetCSS();
    document.head.appendChild(style);
    
    console.log('🎨 [Widget] Styles applied');
  },

  getWidgetCSS() {
    return `
      /* Pingbash Chat Widget Styles */
      .pingbash-chat-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        z-index: 9999;
      }

      /* Chat Button */
      .pingbash-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
      }

      .pingbash-chat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }

      .pingbash-chat-button svg {
        width: 24px;
        height: 24px;
      }

      .pingbash-unread-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ff4757;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
      }

      /* Chat Dialog */
      .pingbash-chat-dialog {
        position: fixed;
        top: 20px;
        right: 20px;
        width: 400px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        display: none;
        flex-direction: column;
        overflow: hidden;
        z-index: 10000;
      }

      /* Header */
      .pingbash-header {
        background: #f8f9fa;
        padding: 15px 20px;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pingbash-header-left {
        display: flex;
        align-items: center;
      }

      .pingbash-header-logo-section {
        display: flex;
        align-items: center;
      }

      .pingbash-logo {
        height: 32px;
        cursor: pointer;
        transition: opacity 0.2s;
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
        background-color: rgba(0,0,0,0.1);
      }

      .pingbash-hamburger-container {
        position: relative;
      }

      .pingbash-hamburger-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        min-width: 180px;
        z-index: 1000;
        overflow: hidden;
      }

      .pingbash-menu-item {
        padding: 12px 16px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        color: #333;
        transition: background-color 0.2s;
      }

      .pingbash-menu-item:hover {
        background-color: #f8f9fa;
      }

      .pingbash-menu-item svg {
        flex-shrink: 0;
      }

      .pingbash-menu-divider {
        height: 1px;
        background: #e9ecef;
        margin: 4px 0;
      }

      /* Messages Area */
      .pingbash-messages-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .pingbash-messages-container {
        flex: 1;
        overflow: hidden;
      }

      .pingbash-messages-list {
        height: 100%;
        overflow-y: auto;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .pingbash-loading {
        text-align: center;
        color: #666;
        padding: 40px 20px;
      }

      .pingbash-connection-error {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }

      .pingbash-error-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }

      .pingbash-error-title {
        font-size: 18px;
        font-weight: 600;
        color: #dc3545;
        margin-bottom: 12px;
      }

      .pingbash-error-message {
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 20px;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
      }

      .pingbash-retry-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .pingbash-retry-btn:hover {
        background: #0056b3;
      }

      /* Messages */
      .pingbash-message {
        display: flex;
        flex-direction: column;
        max-width: 80%;
      }

      .pingbash-message.own {
        align-self: flex-end;
      }

      .pingbash-message-content {
        background: #f8f9fa;
        padding: 12px 16px;
        border-radius: 18px;
        position: relative;
      }

      .pingbash-message.own .pingbash-message-content {
        background: #007bff;
        color: white;
      }

      .pingbash-message-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
        font-size: 12px;
      }

      .pingbash-message-sender {
        font-weight: 600;
        color: #666;
      }

      .pingbash-message.own .pingbash-message-sender {
        color: rgba(255,255,255,0.8);
      }

      .pingbash-message-time {
        color: #999;
        font-size: 11px;
      }

      .pingbash-message.own .pingbash-message-time {
        color: rgba(255,255,255,0.6);
      }

      .pingbash-message-reply {
        background: none;
        border: none;
        color: #007bff;
        font-size: 11px;
        cursor: pointer;
        padding: 2px 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
        margin-left: auto;
      }

      .pingbash-message-reply:hover {
        background-color: rgba(0,123,255,0.1);
      }

      .pingbash-message.own .pingbash-message-reply {
        color: rgba(255,255,255,0.8);
      }

      .pingbash-message.own .pingbash-message-reply:hover {
        background-color: rgba(255,255,255,0.1);
      }

      .pingbash-message-text {
        line-height: 1.4;
        word-wrap: break-word;
      }

      .pingbash-message-text img {
        max-width: 100%;
        border-radius: 8px;
        margin-top: 8px;
      }

      .pingbash-message-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .pingbash-message-action {
        background: #dc3545;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 10px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .pingbash-message-action:hover {
        background: #c82333;
      }

      .pingbash-message-action.timeout {
        background: #ffc107;
        color: #212529;
      }

      .pingbash-message-action.timeout:hover {
        background: #e0a800;
      }

      /* Reply Indicator */
      .pingbash-reply-indicator {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
        padding: 8px;
        background: rgba(0,0,0,0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .pingbash-reply-indicator:hover {
        background: rgba(0,0,0,0.1);
      }

      .pingbash-message.own .pingbash-reply-indicator {
        background: rgba(255,255,255,0.2);
      }

      .pingbash-message.own .pingbash-reply-indicator:hover {
        background: rgba(255,255,255,0.3);
      }

      .pingbash-reply-line {
        width: 3px;
        height: 100%;
        background: #007bff;
        border-radius: 2px;
        flex-shrink: 0;
        min-height: 20px;
      }

      .pingbash-message.own .pingbash-reply-line {
        background: rgba(255,255,255,0.8);
      }

      .pingbash-reply-content {
        flex: 1;
        min-width: 0;
      }

      .pingbash-reply-sender {
        font-size: 11px;
        font-weight: 600;
        color: #007bff;
        margin-bottom: 2px;
      }

      .pingbash-message.own .pingbash-reply-sender {
        color: rgba(255,255,255,0.9);
      }

      .pingbash-reply-text {
        font-size: 12px;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .pingbash-message.own .pingbash-reply-text {
        color: rgba(255,255,255,0.7);
      }

      /* Reply Preview */
      .pingbash-reply-preview {
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 8px;
        padding: 12px;
        margin: 0 20px 12px 20px;
        display: none;
        align-items: center;
        gap: 12px;
      }

      .pingbash-reply-preview-icon {
        font-size: 16px;
        flex-shrink: 0;
      }

      .pingbash-reply-preview-content-wrapper {
        flex: 1;
        min-width: 0;
      }

      .pingbash-reply-preview-sender {
        font-size: 12px;
        font-weight: 600;
        color: #007bff;
        margin-bottom: 2px;
      }

      .pingbash-reply-preview-content {
        font-size: 13px;
        color: #666;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .pingbash-reply-preview-close {
        background: none;
        border: none;
        color: #999;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: background-color 0.2s;
        flex-shrink: 0;
      }

      .pingbash-reply-preview-close:hover {
        background: rgba(0,0,0,0.1);
        color: #666;
      }

      /* Force hide reply preview when display: none */
      .pingbash-reply-preview[style*="display: none"],
      .pingbash-reply-preview[style*="display: none"] * {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        height: 0 !important;
        width: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
      }

      /* Bottom Bar */
      .pingbash-bottom-bar {
        background: white;
        border-top: 1px solid #e9ecef;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .pingbash-bar-left {
        display: flex;
        align-items: center;
      }

      .pingbash-media-controls {
        display: flex;
        gap: 8px;
      }

      .pingbash-media-btn {
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .pingbash-media-btn:hover {
        background: #f8f9fa;
        color: #333;
      }

      .pingbash-input-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .pingbash-input-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .pingbash-message-input {
        flex: 1;
        border: 1px solid #e9ecef;
        border-radius: 20px;
        padding: 10px 16px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .pingbash-message-input:focus {
        border-color: #007bff;
      }

      .pingbash-message-input:disabled {
        background: #f8f9fa;
        color: #999;
      }

      .pingbash-send-btn {
        background: #007bff;
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s;
        flex-shrink: 0;
      }

      .pingbash-send-btn:hover:not(:disabled) {
        background: #0056b3;
      }

      .pingbash-send-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }

      .pingbash-send-text {
        display: none;
      }

      .pingbash-send-icon {
        width: 16px;
        height: 16px;
      }

      /* Modals */
      .pingbash-signin-modal,
      .pingbash-sound-popup,
      .pingbash-chat-rules-popup,
      .pingbash-group-creation-modal,
      .pingbash-emoji-modal,
      .pingbash-mention-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10001;
      }

      .pingbash-popup-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: -1;
      }

      .pingbash-popup-content {
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        max-width: 90vw;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        position: relative;
        z-index: 1;
      }

      .pingbash-popup-header {
        padding: 20px 24px;
        border-bottom: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
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
        color: #999;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;
      }

      .pingbash-popup-close:hover {
        background: #f8f9fa;
        color: #666;
      }

      .pingbash-popup-body {
        padding: 24px;
        overflow-y: auto;
        flex: 1;
      }

      .pingbash-popup-footer {
        padding: 16px 24px;
        border-top: 1px solid #e9ecef;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      /* Form Elements */
      .pingbash-form-group {
        margin-bottom: 20px;
      }

      .pingbash-form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #333;
        font-size: 14px;
      }

      .pingbash-form-input {
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s;
        box-sizing: border-box;
      }

      .pingbash-form-input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
      }

      .pingbash-signin-options {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 24px;
      }

      .pingbash-signin-submit-btn,
      .pingbash-continue-anon-btn {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .pingbash-signin-submit-btn {
        background: #007bff;
        color: white;
      }

      .pingbash-signin-submit-btn:hover:not(:disabled) {
        background: #0056b3;
      }

      .pingbash-signin-submit-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }

      .pingbash-continue-anon-btn {
        background: #6c757d;
        color: white;
      }

      .pingbash-continue-anon-btn:hover {
        background: #545b62;
      }

      /* Sound Settings */
      .pingbash-sound-option {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
      }

      .pingbash-sound-option input[type="radio"] {
        margin: 0;
      }

      .pingbash-sound-ok-btn {
        background: #007bff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 6px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .pingbash-sound-ok-btn:hover {
        background: #0056b3;
      }

      /* Chat Rules */
      .pingbash-chat-rules-content {
        width: 500px;
        max-width: 90vw;
      }

      .pingbash-rules-display,
      .pingbash-rules-edit {
        min-height: 200px;
      }

      .pingbash-rules-text {
        white-space: pre-wrap;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.5;
        color: #333;
        margin: 0;
      }

      .pingbash-no-rules-text {
        color: #666;
        font-style: italic;
        text-align: center;
        padding: 40px 20px;
        margin: 0;
      }

      .pingbash-rules-textarea {
        width: 100%;
        min-height: 200px;
        padding: 12px;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        font-family: monospace;
        font-size: 13px;
        line-height: 1.5;
        resize: vertical;
        box-sizing: border-box;
      }

      .pingbash-rules-textarea:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
      }

      .pingbash-rules-view-footer,
      .pingbash-rules-edit-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .pingbash-rules-edit-btn,
      .pingbash-rules-close-btn,
      .pingbash-rules-cancel-btn,
      .pingbash-rules-save-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .pingbash-rules-edit-btn {
        background: #007bff;
        color: white;
      }

      .pingbash-rules-edit-btn:hover {
        background: #0056b3;
      }

      .pingbash-rules-close-btn,
      .pingbash-rules-cancel-btn {
        background: #6c757d;
        color: white;
      }

      .pingbash-rules-close-btn:hover,
      .pingbash-rules-cancel-btn:hover {
        background: #545b62;
      }

      .pingbash-rules-save-btn {
        background: #28a745;
        color: white;
      }

      .pingbash-rules-save-btn:hover {
        background: #218838;
      }

      /* Group Creation Modal */
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
        margin-bottom: 24px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e9ecef;
      }

      .pingbash-config-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      .pingbash-config-section h4 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #333;
      }

      .pingbash-char-counter {
        font-size: 12px;
        color: #666;
        margin-top: 4px;
      }

      .pingbash-radio-group {
        display: flex;
        gap: 16px;
      }

      .pingbash-radio-option {
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }

      .pingbash-radio-option input[type="radio"] {
        margin: 0;
      }

      .pingbash-size-controls {
        display: flex;
        gap: 16px;
        margin-top: 12px;
      }

      .pingbash-size-controls .pingbash-form-group {
        flex: 1;
        margin-bottom: 0;
      }

      .pingbash-color-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;
      }

      .pingbash-color-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .pingbash-color-item label {
        font-size: 12px;
        font-weight: 500;
        color: #666;
      }

      .pingbash-color-input {
        width: 100%;
        height: 40px;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        cursor: pointer;
        padding: 0;
      }

      .pingbash-settings-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 12px;
      }

      .pingbash-checkbox-option {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .pingbash-checkbox-option input[type="checkbox"] {
        margin: 0;
      }

      .pingbash-group-cancel-btn,
      .pingbash-group-create-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .pingbash-group-cancel-btn {
        background: #6c757d;
        color: white;
      }

      .pingbash-group-cancel-btn:hover {
        background: #545b62;
      }

      .pingbash-group-create-btn {
        background: #007bff;
        color: white;
      }

      .pingbash-group-create-btn:hover:not(:disabled) {
        background: #0056b3;
      }

      .pingbash-group-create-btn:disabled {
        background: #6c757d;
        cursor: not-allowed;
      }

      /* Emoji Picker */
      .pingbash-emoji-picker {
        width: 320px;
        max-height: 400px;
        overflow-y: auto;
      }

      .pingbash-emoji-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 8px;
        padding: 16px;
      }

      .pingbash-emoji {
        font-size: 24px;
        cursor: pointer;
        padding: 8px;
        border-radius: 6px;
        text-align: center;
        transition: background-color 0.2s;
        user-select: none;
      }

      .pingbash-emoji:hover {
        background: #f8f9fa;
      }

      /* Mention Picker */
      .pingbash-mention-dropdown {
        width: 200px;
        max-height: 300px;
        overflow-y: auto;
      }

      .pingbash-mention-list {
        padding: 8px 0;
      }

      .pingbash-mention-item {
        padding: 10px 16px;
        cursor: pointer;
        font-size: 14px;
        color: #333;
        transition: background-color 0.2s;
      }

      .pingbash-mention-item:hover {
        background: #f8f9fa;
      }

      /* Responsive Design */
      @media (max-width: 480px) {
        .pingbash-chat-dialog {
          width: calc(100vw - 40px);
          height: calc(100vh - 40px);
          top: 20px;
          right: 20px;
        }

        .pingbash-popup-content {
          width: calc(100vw - 40px);
          max-width: none;
        }

        .pingbash-size-controls {
          flex-direction: column;
        }

        .pingbash-color-grid {
          grid-template-columns: repeat(2, 1fr);
        }

        .pingbash-settings-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Hide elements with display: none */
      [style*="display: none"] {
        display: none !important;
      }

      /* Scrollbar Styling */
      .pingbash-messages-list::-webkit-scrollbar,
      .pingbash-popup-body::-webkit-scrollbar,
      .pingbash-emoji-picker::-webkit-scrollbar {
        width: 6px;
      }

      .pingbash-messages-list::-webkit-scrollbar-track,
      .pingbash-popup-body::-webkit-scrollbar-track,
      .pingbash-emoji-picker::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      .pingbash-messages-list::-webkit-scrollbar-thumb,
      .pingbash-popup-body::-webkit-scrollbar-thumb,
      .pingbash-emoji-picker::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }

      .pingbash-messages-list::-webkit-scrollbar-thumb:hover,
      .pingbash-popup-body::-webkit-scrollbar-thumb:hover,
      .pingbash-emoji-picker::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;
  }
}); 