/**
 * Pingbash Inline Chat Integration
 * Direct chat embedding into page content - no floating widgets
 */

class PingbashInlineChat {
  constructor(container, config = {}) {
    this.container = typeof container === 'string' ? document.querySelector(container) : container;
    
    if (!this.container) {
      throw new Error('Container element not found');
    }
    
    // Configuration
    this.config = {
      groupName: config.groupName || 'default',
      apiUrl: config.apiUrl || 'https://pingbash.com',
      theme: config.theme || 'light',
      height: config.height || '500px',
      width: config.width || '100%',
      showHeader: config.showHeader !== false,
      allowFullscreen: config.allowFullscreen !== false,
      customColors: config.customColors || null,
      placeholder: config.placeholder || 'Type a message...',
      maxLength: config.maxLength || 500,
      ...config
    };
    
    // State
    this.socket = null;
    this.userId = null;
    this.groupId = null;
    this.messages = [];
    this.isConnected = false;
    
    // Initialize
    this.init();
  }
  
  async init() {
    console.log('🚀 Initializing Pingbash Inline Chat...');
    console.log('📦 Config:', this.config);
    
    this.createChatInterface();
    await this.loadSocketIO();
    this.initializeSocket();
  }
  
  createChatInterface() {
    // Clear container
    this.container.innerHTML = '';
    this.container.className = 'pingbash-chat-container';
    
    // Apply base styles
    this.applyStyles();
    
    // Create chat structure
    const chatHTML = `
      <div class="pingbash-chat" data-theme="${this.config.theme}">
        ${this.config.showHeader ? this.createHeader() : ''}
        <div class="pingbash-messages-area">
          <div class="pingbash-messages-list" id="pingbash-messages">
            <div class="pingbash-welcome">
              <div class="pingbash-welcome-title">Welcome to ${this.config.groupName}</div>
              <div class="pingbash-welcome-subtitle">Join the conversation</div>
            </div>
          </div>
        </div>
        <div class="pingbash-input-area">
          <div class="pingbash-input-wrapper">
            <input 
              type="text" 
              class="pingbash-message-input" 
              placeholder="${this.config.placeholder}"
              maxlength="${this.config.maxLength}"
              disabled
            />
            <button class="pingbash-send-button" disabled>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
              </svg>
            </button>
          </div>
          <div class="pingbash-status">
            <span class="pingbash-connection-status">Connecting...</span>
          </div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = chatHTML;
    this.attachEventListeners();
  }
  
  createHeader() {
    return `
      <div class="pingbash-header">
        <div class="pingbash-header-info">
          <div class="pingbash-header-title">${this.config.groupName}</div>
          <div class="pingbash-header-status">
            <div class="pingbash-status-indicator"></div>
            <span class="pingbash-status-text">Offline</span>
          </div>
        </div>
        ${this.config.allowFullscreen ? `
          <button class="pingbash-fullscreen-btn" title="Toggle Fullscreen">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M7,14H5V19H10V17H7V14M12,10H14V7H19V5H12V10M7,10H5V5H10V7H7V10M14,14H12V19H19V17H14V14Z"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  }
  
  applyStyles() {
    // Check if styles already applied
    if (document.getElementById('pingbash-chat-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'pingbash-chat-styles';
    style.textContent = `
      .pingbash-chat-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        width: ${this.config.width};
        height: ${this.config.height};
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
        background: #ffffff;
        display: flex;
        flex-direction: column;
      }
      
      .pingbash-chat {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      
      .pingbash-chat[data-theme="dark"] {
        background: #1a1a1a;
        color: #ffffff;
      }
      
      .pingbash-chat[data-theme="dark"] .pingbash-chat-container {
        background: #1a1a1a;
        border-color: #333;
      }
      
      .pingbash-header {
        background: linear-gradient(135deg, ${this.config.customColors?.primary || '#2596be'}, #1e7ba8);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-shrink: 0;
      }
      
      .pingbash-header-title {
        font-weight: 600;
        font-size: 16px;
      }
      
      .pingbash-header-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        opacity: 0.9;
      }
      
      .pingbash-status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #f44336;
        animation: pulse 2s infinite;
      }
      
      .pingbash-status-indicator.connected {
        background: #4CAF50;
      }
      
      .pingbash-fullscreen-btn {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .pingbash-fullscreen-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .pingbash-messages-area {
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      
      .pingbash-messages-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        scroll-behavior: smooth;
      }
      
      .pingbash-welcome {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }
      
      .pingbash-chat[data-theme="dark"] .pingbash-welcome {
        color: #999;
      }
      
      .pingbash-welcome-title {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: ${this.config.customColors?.primary || '#2596be'};
      }
      
      .pingbash-welcome-subtitle {
        font-size: 14px;
        opacity: 0.8;
      }
      
      .pingbash-message {
        margin-bottom: 16px;
        animation: fadeInUp 0.3s ease;
      }
      
      .pingbash-message-content {
        max-width: 70%;
        padding: 10px 14px;
        border-radius: 18px;
        position: relative;
        word-wrap: break-word;
      }
      
      .pingbash-message.own {
        display: flex;
        justify-content: flex-end;
      }
      
      .pingbash-message.own .pingbash-message-content {
        background: ${this.config.customColors?.primary || '#2596be'};
        color: white;
        border-bottom-right-radius: 4px;
      }
      
      .pingbash-message:not(.own) .pingbash-message-content {
        background: #f0f0f0;
        color: #333;
        border-bottom-left-radius: 4px;
      }
      
      .pingbash-chat[data-theme="dark"] .pingbash-message:not(.own) .pingbash-message-content {
        background: #333;
        color: #fff;
      }
      
      .pingbash-message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        opacity: 0.7;
        font-size: 11px;
      }
      
      .pingbash-message-sender {
        font-weight: 600;
      }
      
      .pingbash-message-time {
        font-size: 10px;
      }
      
      .pingbash-message-text {
        font-size: 14px;
        line-height: 1.4;
      }
      
      .pingbash-input-area {
        border-top: 1px solid #e0e0e0;
        padding: 12px 16px;
        flex-shrink: 0;
        background: #fafafa;
      }
      
      .pingbash-chat[data-theme="dark"] .pingbash-input-area {
        border-top-color: #333;
        background: #222;
      }
      
      .pingbash-input-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 8px;
      }
      
      .pingbash-message-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #ddd;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        background: white;
        transition: border-color 0.2s ease;
      }
      
      .pingbash-message-input:focus {
        border-color: ${this.config.customColors?.primary || '#2596be'};
        box-shadow: 0 0 0 2px rgba(37, 150, 190, 0.1);
      }
      
      .pingbash-message-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .pingbash-chat[data-theme="dark"] .pingbash-message-input {
        background: #333;
        border-color: #555;
        color: white;
      }
      
      .pingbash-send-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: ${this.config.customColors?.primary || '#2596be'};
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .pingbash-send-button:hover:not(:disabled) {
        background: #1e7ba8;
        transform: scale(1.05);
      }
      
      .pingbash-send-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        transform: none;
      }
      
      .pingbash-status {
        text-align: center;
        font-size: 12px;
        color: #666;
      }
      
      .pingbash-chat[data-theme="dark"] .pingbash-status {
        color: #999;
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
      
      .pingbash-chat[data-theme="dark"] .pingbash-error {
        background: #4a1a1a;
        color: #ff6b6b;
      }
      
      .pingbash-chat-container.fullscreen {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 10000;
        border-radius: 0;
        border: none;
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
      
      /* Responsive design */
      @media (max-width: 768px) {
        .pingbash-message-content {
          max-width: 85%;
        }
        
        .pingbash-messages-list {
          padding: 12px;
        }
        
        .pingbash-input-area {
          padding: 8px 12px;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  attachEventListeners() {
    const input = this.container.querySelector('.pingbash-message-input');
    const sendButton = this.container.querySelector('.pingbash-send-button');
    const fullscreenBtn = this.container.querySelector('.pingbash-fullscreen-btn');
    
    // Send message events
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    sendButton?.addEventListener('click', () => this.sendMessage());
    
    // Fullscreen toggle
    fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());
    
    // Escape key to exit fullscreen
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.container.classList.contains('fullscreen')) {
        this.toggleFullscreen();
      }
    });
  }
  
  async loadSocketIO() {
    if (window.io) {
      console.log('🔌 Socket.IO already loaded');
      return;
    }
    
    console.log('📥 Loading Socket.IO...');
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
      script.onload = () => {
        console.log('✅ Socket.IO loaded');
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  initializeSocket() {
    console.log('🔌 Connecting to:', this.config.apiUrl);
    
    // Use exact same configuration as W version
    this.socket = io(this.config.apiUrl);
    
    // Add the same debugging as W version
    this.socket.on('connect', () => {
      console.log('🔍 [Inline] Socket connected successfully!', this.socket.id);
      this.isConnected = true;
      this.updateConnectionStatus(true);
      this.joinGroup();
    });

    this.socket.on('disconnect', () => {
      console.log('🔍 [Inline] Socket disconnected');
      this.isConnected = false;
      this.updateConnectionStatus(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔍 [Inline] Socket connection error:', error);
      this.showError('Connection failed: ' + error.message);
      this.updateConnectionStatus(false);
    });
    
    this.setupSocketListeners();
  }
  
  setupSocketListeners() {
    // Use exact same event names as W version (lowercase with spaces)
    this.socket.on('get group msg', (messages) => {
      console.log('🔍 [Inline] Received get group msg:', messages?.length);
      this.displayMessages(messages || []);
    });
    
    this.socket.on('send group msg', (messages) => {
      console.log('🔍 [Inline] Received send group msg:', messages?.length);
      this.displayMessages(messages || []);
    });
    
    this.socket.on('forbidden', (message) => {
      console.error('🔍 [Inline] forbidden:', message);
      this.showError(message || 'Access denied');
    });
    
    this.socket.on('server error', (error) => {
      console.error('🔍 [Inline] server error:', error);
      this.showError('Server error occurred');
    });
    
    // Add other events that W version uses
    this.socket.on('join to group anon', (response) => {
      console.log('🔍 [Inline] join to group anon response:', response);
    });
    
    this.socket.on('group updated', (group) => {
      console.log('🔍 [Inline] group updated:', group);
    });
    
    this.socket.on('refresh', (data) => {
      console.log('🔍 [Inline] refresh:', data);
    });
  }
  
  async joinGroup() {
    try {
      // Resolve group ID - use the same method as W version
      this.groupId = await this.getGroupIdFromName();
      
      // Generate anonymous user ID - use same format as W version
      this.userId = Math.floor(Date.now() + Math.random() * 1000);
      
      console.log('🔍 [Inline] Joining group:', this.config.groupName, 'ID:', this.groupId);
      console.log('🔍 [Inline] Anonymous user ID:', this.userId);
      
      // First register as anonymous user (same as W version)
      this.socket.emit('user logged as annon', { userId: this.userId });
      
      // Join the group as anonymous user (same event name as W version)
      this.socket.emit('join to group anon', {
        groupId: this.groupId,
        anonId: this.userId
      });
      
      // Get messages (same as W version)
      const token = `anonuser${this.config.groupName}${this.userId}`;
      console.log('🔍 [Inline] Emitting GET_GROUP_MSG for group:', this.groupId, 'with token:', token.substring(0, 20) + '...');
      console.log('🔍 [Inline] Socket connected status:', this.socket.connected);
      console.log('🔍 [Inline] Socket ID:', this.socket.id);
      
      if (!this.socket.connected) {
        console.warn('🔍 [Inline] WARNING: Attempting to emit GET_GROUP_MSG but socket is not connected!');
      }
      
      this.socket.emit('get group msg', { 
        token: token, 
        groupId: this.groupId 
      });
      
    } catch (error) {
      console.error('🔍 [Inline] Failed to join group:', error);
      this.showError('Failed to join chat group');
    }
  }
  
  async getGroupIdFromName() {
    // For known groups, use specific IDs
    const knownGroups = {
      'testgroup3': 56,
      'support': 1,
      'general': 2,
      'sales': 3
    };
    
    if (knownGroups[this.config.groupName]) {
      console.log('🔍 [Inline] Using known group ID:', knownGroups[this.config.groupName], 'for', this.config.groupName);
      return knownGroups[this.config.groupName];
    }
    
    // Try API resolution for unknown groups
    try {
      const response = await fetch(`${this.config.apiUrl}/api/public/get/group-by-name/${this.config.groupName}`);
      if (response.ok) {
        const data = await response.json();
        console.log('🔍 [Inline] Resolved via API:', data.id, 'for', this.config.groupName);
        return data.id;
      }
    } catch (error) {
      console.warn('🔍 [Inline] API resolution failed:', error.message);
    }
    
    // Fallback to hash
    const hashId = this.hashCode(this.config.groupName);
    console.log('🔍 [Inline] Using hash-based ID:', hashId, 'for', this.config.groupName);
    return hashId;
  }
  
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  async sendMessage() {
    const input = this.container.querySelector('.pingbash-message-input');
    const message = input.value.trim();
    
    if (!message || !this.socket || !this.isConnected) return;
    
    console.log('🔍 [Inline] Sending message:', message);
    console.log('🔍 [Inline] Group ID:', this.groupId, 'User ID:', this.userId);
    
    // Use exact same event name as W version
    this.socket.emit('send group msg anon', {
      groupId: this.groupId,
      msg: message,
      anonId: this.userId
    });
    
    input.value = '';
  }
  
  displayMessages(messages) {
    const messagesList = this.container.querySelector('#pingbash-messages');
    messagesList.innerHTML = '';
    
    if (!messages.length) {
      messagesList.innerHTML = `
        <div class="pingbash-welcome">
          <div class="pingbash-welcome-title">Welcome to ${this.config.groupName}</div>
          <div class="pingbash-welcome-subtitle">Start the conversation!</div>
        </div>
      `;
      return;
    }
    
    messages.forEach(msg => this.addMessage(msg));
    this.scrollToBottom();
  }
  
  addMessage(message) {
    const messagesList = this.container.querySelector('#pingbash-messages');
    const isOwn = message.Sender_Id === this.userId;
    
    const messageEl = document.createElement('div');
    messageEl.className = `pingbash-message ${isOwn ? 'own' : ''}`;
    
    const time = new Date(message.Send_Time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageEl.innerHTML = `
      <div class="pingbash-message-content">
        <div class="pingbash-message-header">
          <span class="pingbash-message-sender">${message.sender_name || 'Anonymous'}</span>
          <span class="pingbash-message-time">${time}</span>
        </div>
        <div class="pingbash-message-text">${this.escapeHtml(message.Content)}</div>
      </div>
    `;
    
    messagesList.appendChild(messageEl);
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  scrollToBottom() {
    const messagesList = this.container.querySelector('.pingbash-messages-list');
    messagesList.scrollTop = messagesList.scrollHeight;
  }
  
  updateConnectionStatus(connected) {
    const indicator = this.container.querySelector('.pingbash-status-indicator');
    const statusText = this.container.querySelector('.pingbash-status-text');
    const input = this.container.querySelector('.pingbash-message-input');
    const button = this.container.querySelector('.pingbash-send-button');
    const connectionStatus = this.container.querySelector('.pingbash-connection-status');
    
    if (indicator) {
      indicator.classList.toggle('connected', connected);
    }
    
    if (statusText) {
      statusText.textContent = connected ? 'Online' : 'Offline';
    }
    
    if (input) {
      input.disabled = !connected;
      input.placeholder = connected ? this.config.placeholder : 'Connecting...';
    }
    
    if (button) {
      button.disabled = !connected;
    }
    
    if (connectionStatus) {
      connectionStatus.textContent = connected ? 'Connected' : 'Connecting...';
    }
  }
  
  showError(message) {
    const messagesList = this.container.querySelector('#pingbash-messages');
    const errorEl = document.createElement('div');
    errorEl.className = 'pingbash-error';
    errorEl.textContent = message;
    messagesList.appendChild(errorEl);
    this.scrollToBottom();
  }
  
  toggleFullscreen() {
    this.container.classList.toggle('fullscreen');
    
    // Dispatch event
    const event = new CustomEvent('pingbash-fullscreen-toggle', {
      detail: { isFullscreen: this.container.classList.contains('fullscreen') }
    });
    this.container.dispatchEvent(event);
  }
  
  // Public API
  destroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    // Remove styles
    const styles = document.getElementById('pingbash-chat-styles');
    if (styles) {
      styles.remove();
    }
    
    // Clear container
    this.container.innerHTML = '';
    this.container.className = '';
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    // Re-initialize if needed
    this.createChatInterface();
  }
}

// Global factory function
window.PingbashChat = {
  create: function(container, config = {}) {
    return new PingbashInlineChat(container, config);
  },
  
  // Auto-initialize from data attributes
  autoInit: function() {
    const elements = document.querySelectorAll('[data-pingbash-chat]');
    const instances = [];
    
    elements.forEach(el => {
      const config = {
        groupName: el.dataset.groupName || 'default',
        apiUrl: el.dataset.apiUrl || 'http://localhost:5000',
        theme: el.dataset.theme || 'light',
        height: el.dataset.height || '500px',
        width: el.dataset.width || '100%',
        showHeader: el.dataset.showHeader !== 'false',
        allowFullscreen: el.dataset.allowFullscreen !== 'false',
        placeholder: el.dataset.placeholder || 'Type a message...',
        customColors: el.dataset.customColors ? JSON.parse(el.dataset.customColors) : null
      };
      
      const instance = new PingbashInlineChat(el, config);
      instances.push(instance);
    });
    
    return instances;
  }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.PingbashChat.autoInit();
  });
} else {
  window.PingbashChat.autoInit();
}

console.log('🚀 Pingbash Inline Chat loaded successfully'); 