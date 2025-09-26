/**
 * Pingbash Chat Web Component
 * A custom web component that can be embedded in any website
 */

class PingbashChatElement extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow DOM for encapsulation
    this.attachShadow({ mode: 'open' });
    
    // Default configuration
    this.config = {
      groupName: this.getAttribute('group-name') || 'default',
      width: this.getAttribute('width') || '400px',
      height: this.getAttribute('height') || '600px',
      theme: this.getAttribute('theme') || 'light',
      position: this.getAttribute('position') || 'bottom-right',
      apiUrl: this.getAttribute('api-url') || 'https://pingbash.com',
      autoOpen: this.getAttribute('auto-open') === 'true',
      showHeader: this.getAttribute('show-header') !== 'false',
      allowMinimize: this.getAttribute('allow-minimize') !== 'false',
      customColors: this.parseCustomColors(),
    };
    
    // State
    this.isOpen = this.config.autoOpen;
    this.isMinimized = false;
    this.chatContainer = null;
    this.iframe = null;
    
    this.init();
  }
  
  parseCustomColors() {
    const colors = this.getAttribute('custom-colors');
    if (!colors) return null;
    
    try {
      return JSON.parse(colors);
    } catch (e) {
      console.warn('Pingbash Chat: Invalid custom-colors JSON');
      return null;
    }
  }
  
  init() {
    this.createStyles();
    this.createChatWidget();
    this.attachEventListeners();
    
    // Auto-open if configured
    if (this.config.autoOpen) {
      setTimeout(() => this.openChat(), 1000);
    }
  }
  
  createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      :host {
        --pb-primary-color: ${this.config.customColors?.primary || '#2596be'};
        --pb-secondary-color: ${this.config.customColors?.secondary || '#ffffff'};
        --pb-text-color: ${this.config.customColors?.text || '#333333'};
        --pb-background-color: ${this.config.customColors?.background || '#ffffff'};
        
        position: fixed;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      :host([position="bottom-right"]) {
        bottom: 20px;
        right: 20px;
      }
      
      :host([position="bottom-left"]) {
        bottom: 20px;
        left: 20px;
      }
      
      :host([position="top-right"]) {
        top: 20px;
        right: 20px;
      }
      
      :host([position="top-left"]) {
        top: 20px;
        left: 20px;
      }
      
      .chat-widget {
        position: relative;
        transition: all 0.3s ease;
      }
      
      .chat-trigger {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, var(--pb-primary-color), #1e7ba8);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        border: none;
        outline: none;
      }
      
      .chat-trigger:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }
      
      .chat-trigger svg {
        width: 28px;
        height: 28px;
        fill: white;
      }
      
      .chat-container {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: ${this.config.width};
        height: ${this.config.height};
        background: var(--pb-background-color);
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        overflow: hidden;
        transform: scale(0.8) translateY(20px);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        border: 1px solid #e0e0e0;
      }
      
      .chat-container.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        visibility: visible;
      }
      
      .chat-container.minimized {
        height: 50px;
        transform: scale(1) translateY(0);
        opacity: 1;
        visibility: visible;
      }
      
      .chat-header {
        background: linear-gradient(135deg, var(--pb-primary-color), #1e7ba8);
        color: white;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-weight: 600;
        font-size: 14px;
      }
      
      .chat-header-title {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .chat-header-controls {
        display: flex;
        gap: 8px;
      }
      
      .chat-header-btn {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
      }
      
      .chat-header-btn:hover {
        background: rgba(255,255,255,0.3);
      }
      
      .chat-content {
        height: calc(100% - 50px);
        overflow: hidden;
      }
      
      .messages-container {
        height: calc(100% - 60px);
        display: flex;
        flex-direction: column;
      }
      
      .messages-list {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        background: var(--pb-background-color);
      }
      
      .message {
        margin-bottom: 12px;
        animation: fadeInUp 0.3s ease;
      }
      
      .message.own-message .message-content {
        background: var(--pb-primary-color);
        color: white;
        margin-left: 20%;
        border-radius: 18px 18px 4px 18px;
      }
      
      .message:not(.own-message) .message-content {
        background: #f0f0f0;
        color: var(--pb-text-color);
        margin-right: 20%;
        border-radius: 18px 18px 18px 4px;
      }
      
      .message-content {
        padding: 8px 12px;
        max-width: 80%;
      }
      
      .message-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
        opacity: 0.7;
        font-size: 11px;
      }
      
      .sender-name {
        font-weight: 600;
      }
      
      .message-time {
        font-size: 10px;
      }
      
      .message-text {
        font-size: 14px;
        line-height: 1.4;
        word-wrap: break-word;
      }
      
      .welcome-message {
        text-align: center;
        padding: 40px 20px;
        color: #666;
      }
      
      .welcome-text {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 8px;
        color: var(--pb-primary-color);
      }
      
      .welcome-subtext {
        font-size: 14px;
        opacity: 0.8;
      }
      
      .error-message {
        background: #ffebee;
        color: #c62828;
        padding: 8px 12px;
        border-radius: 8px;
        margin: 8px 12px;
        font-size: 13px;
        text-align: center;
      }
      
      .input-container {
        border-top: 1px solid #e0e0e0;
        padding: 12px;
        background: var(--pb-background-color);
      }
      
      .input-wrapper {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      
      .message-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #e0e0e0;
        border-radius: 20px;
        outline: none;
        font-size: 14px;
        font-family: inherit;
        background: white;
      }
      
      .message-input:focus {
        border-color: var(--pb-primary-color);
        box-shadow: 0 0 0 2px rgba(37, 150, 190, 0.1);
      }
      
      .send-button {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        border: none;
        background: var(--pb-primary-color);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .send-button:hover {
        background: #1e7ba8;
        transform: scale(1.05);
      }
      
      .send-button:active {
        transform: scale(0.95);
      }
      
      .typing-indicator {
        margin-top: 8px;
        font-size: 12px;
        color: #666;
        font-style: italic;
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
      
      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--pb-text-color);
        font-size: 14px;
      }
      
      .notification-badge {
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
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .status-indicator {
        width: 8px;
        height: 8px;
        background: #4CAF50;
        border-radius: 50%;
        margin-left: 4px;
        animation: blink 2s infinite;
      }
      
      @keyframes blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0.3; }
      }
      
      @media (max-width: 480px) {
        .chat-container {
          width: calc(100vw - 40px);
          height: calc(100vh - 100px);
          bottom: 70px;
          right: -10px;
        }
        
        :host([position="bottom-left"]) .chat-container {
          left: -10px;
          right: auto;
        }
      }
    `;
    
    this.shadowRoot.appendChild(style);
  }
  
  createChatWidget() {
    const widget = document.createElement('div');
    widget.className = 'chat-widget';
    
    // Create trigger button
    const trigger = document.createElement('button');
    trigger.className = 'chat-trigger';
    trigger.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v3c0 .6.4 1 1 1h.5c.2 0 .5-.1.7-.3L16.5 18H20c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H16l-4 4V16H4V4h16v12z"/>
      </svg>
    `;
    
    // Create notification badge
    this.notificationBadge = document.createElement('div');
    this.notificationBadge.className = 'notification-badge';
    this.notificationBadge.style.display = 'none';
    trigger.appendChild(this.notificationBadge);
    
    // Create chat container
    this.chatContainer = document.createElement('div');
    this.chatContainer.className = 'chat-container';
    
    if (this.config.showHeader) {
      this.createChatHeader();
    }
    
    this.createChatContent();
    
    widget.appendChild(trigger);
    widget.appendChild(this.chatContainer);
    
    this.shadowRoot.appendChild(widget);
  }
  
  createChatHeader() {
    const header = document.createElement('div');
    header.className = 'chat-header';
    
    const title = document.createElement('div');
    title.className = 'chat-header-title';
    title.innerHTML = `
      <span>Pingbash Chat</span>
      <div class="status-indicator"></div>
    `;
    
    const controls = document.createElement('div');
    controls.className = 'chat-header-controls';
    
    if (this.config.allowMinimize) {
      const minimizeBtn = document.createElement('button');
      minimizeBtn.className = 'chat-header-btn';
      minimizeBtn.innerHTML = '−';
      minimizeBtn.addEventListener('click', () => this.toggleMinimize());
      controls.appendChild(minimizeBtn);
    }
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'chat-header-btn';
    closeBtn.innerHTML = '×';
    closeBtn.addEventListener('click', () => this.closeChat());
    controls.appendChild(closeBtn);
    
    header.appendChild(title);
    header.appendChild(controls);
    
    this.chatContainer.appendChild(header);
  }
  
  createChatContent() {
    const content = document.createElement('div');
    content.className = 'chat-content';
    
    // Show loading initially
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.textContent = 'Loading chat...';
    content.appendChild(loading);
    
    this.chatContainer.appendChild(content);
  }
  
  createChatInterface() {
    if (this.chatInterface) return;
    
    const content = this.chatContainer.querySelector('.chat-content');
    content.innerHTML = '';
    
    // Create chat interface
    this.createMessagesContainer();
    this.createInputContainer();
    
    // Initialize WebSocket connection
    this.initializeSocket();
  }
  
  createMessagesContainer() {
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'messages-container';
    messagesContainer.innerHTML = `
      <div class="messages-list" id="messages-list">
        <div class="welcome-message">
          <div class="welcome-text">Welcome to ${this.config.groupName} chat!</div>
          <div class="welcome-subtext">Start chatting with the community</div>
        </div>
      </div>
    `;
    
    const content = this.chatContainer.querySelector('.chat-content');
    content.appendChild(messagesContainer);
  }
  
  createInputContainer() {
    const inputContainer = document.createElement('div');
    inputContainer.className = 'input-container';
    inputContainer.innerHTML = `
      <div class="input-wrapper">
        <input 
          type="text" 
          class="message-input" 
          placeholder="Type a message..."
          maxlength="500"
        />
        <button class="send-button" type="button">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
          </svg>
        </button>
      </div>
      <div class="typing-indicator" style="display: none;">
        <span class="typing-text">Someone is typing...</span>
      </div>
    `;
    
    const content = this.chatContainer.querySelector('.chat-content');
    content.appendChild(inputContainer);
    
    // Add input event listeners
    const input = inputContainer.querySelector('.message-input');
    const sendButton = inputContainer.querySelector('.send-button');
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    sendButton.addEventListener('click', () => this.sendMessage());
  }
  
  initializeSocket() {
    if (this.socket) return;
    
    console.log('🚀 Initializing socket connection...');
    console.log('🔗 API URL:', this.config.apiUrl);
    console.log('🏷️ Group Name:', this.config.groupName);
    
    try {
      // Import Socket.IO client
      this.loadSocketIO().then(() => {
        console.log('🔌 Creating Socket.IO connection to:', this.config.apiUrl);
        this.socket = io(this.config.apiUrl, {
          transports: ['websocket', 'polling'],
          timeout: 10000,
          forceNew: true
        });
        this.setupSocketListeners();
      }).catch(error => {
        console.error('❌ Failed to load Socket.IO:', error);
        this.showError('Failed to load Socket.IO library');
      });
    } catch (error) {
      console.error('❌ Failed to initialize socket:', error);
      this.showError('Failed to connect to chat server');
    }
  }
  
  async loadSocketIO() {
    if (window.io) {
      console.log('🔌 Socket.IO already loaded');
      return;
    }
    
    console.log('📥 Loading Socket.IO from CDN...');
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.socket.io/4.7.2/socket.io.min.js';
      script.onload = () => {
        console.log('✅ Socket.IO loaded successfully');
        resolve();
      };
      script.onerror = (error) => {
        console.error('❌ Failed to load Socket.IO:', error);
        reject(error);
      };
      document.head.appendChild(script);
    });
  }
  
  setupSocketListeners() {
    if (!this.socket) return;
    
    console.log('🎧 Setting up socket listeners...');
    
    this.socket.on('connect', () => {
      console.log('✅ Connected to Pingbash chat server');
      console.log('🆔 Socket ID:', this.socket.id);
      this.joinGroup();
      this.updateStatus(true);
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.showError('Connection failed: ' + error.message);
      this.updateStatus(false);
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from chat server:', reason);
      this.updateStatus(false);
    });
    
    this.socket.on('SEND_GROUP_MSG', (messages) => {
      console.log('📨 Received SEND_GROUP_MSG:', messages?.length, 'messages');
      this.handleNewMessages(messages);
    });
    
    this.socket.on('GET_GROUP_MSG', (messages) => {
      console.log('📥 Received GET_GROUP_MSG:', messages?.length, 'messages');
      this.displayMessages(messages);
    });
    
    this.socket.on('JOIN_TO_GROUP_ANON', (response) => {
      console.log('🚪 JOIN_TO_GROUP_ANON response:', response);
    });
    
    this.socket.on('FORBIDDEN', (message) => {
      console.error('🚫 FORBIDDEN:', message);
      this.showError(message || 'Access denied');
    });
    
    this.socket.on('SERVER_ERROR', (error) => {
      console.error('🔥 SERVER_ERROR:', error);
      this.showError('Server error occurred');
    });
    
    // Generic error handler
    this.socket.on('error', (error) => {
      console.error('🔥 Socket error:', error);
      this.showError('Socket error: ' + error.message);
    });
  }
  
  async joinGroup() {
    if (!this.socket) {
      console.error('❌ Cannot join group: socket not available');
      return;
    }
    
    // Register as anonymous user and join group
    const anonId = Math.floor(Date.now() + Math.random() * 1000);
    this.userId = anonId;
    const groupId = await this.getGroupIdFromName();
    const token = `anonuser${this.config.groupName}${anonId}`;
    
    console.log('🚪 Joining group...');
    console.log('👤 Anonymous ID:', anonId);
    console.log('🏷️ Group ID:', groupId);
    console.log('🎫 Token:', token);
    
    // First, join the group as anonymous user
    console.log('📤 Emitting JOIN_TO_GROUP_ANON...');
    this.socket.emit('JOIN_TO_GROUP_ANON', {
      groupId: groupId,
      anonId: anonId
    });
    
    // Then get existing messages
    console.log('📤 Emitting GET_GROUP_MSG...');
    this.socket.emit('GET_GROUP_MSG', {
      token: token,
      groupId: groupId
    });
  }
  
  async getGroupIdFromName() {
    // First try to resolve group name to ID via API with timeout
    try {
      console.log('🔍 Resolving group name via API:', `${this.config.apiUrl}/api/public/get/group-by-name/${this.config.groupName}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${this.config.apiUrl}/api/public/get/group-by-name/${this.config.groupName}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          console.log('✅ Resolved group name to ID via API:', data.id);
          return data.id;
        }
      } else {
        console.warn('⚠️ API response not OK:', response.status, response.statusText);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn('⚠️ API request timeout for group resolution');
      } else {
        console.warn('⚠️ Could not resolve group via API:', error.message);
      } 
    }
    
    // Fallback: use a hash of the group name as ID
    const hashId = this.hashCode(this.config.groupName);
    console.log('📝 Using hash-based group ID:', hashId);
    return hashId;
  }
  
  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
  
  async sendMessage() {
    const input = this.shadowRoot.querySelector('.message-input');
    const message = input.value.trim();
    
    if (!message || !this.socket) {
      console.warn('⚠️ Cannot send message: empty message or no socket');
      return;
    }
    
    const groupId = await this.getGroupIdFromName();
    
    console.log('📤 Sending message:', message);
    console.log('🏷️ Group ID:', groupId);
    console.log('👤 User ID:', this.userId);
    
    this.socket.emit('SEND_GROUP_MSG_ANON', {
      groupId: groupId,
      msg: message,
      anonId: this.userId
    });
    
    input.value = '';
  }
  
  displayMessages(messages) {
    const messagesList = this.shadowRoot.querySelector('#messages-list');
    
    // Clear all content including loading messages
    messagesList.innerHTML = '';
    
    console.log('📋 Displaying messages:', messages?.length || 0);
    
    if (!messages || messages.length === 0) {
      messagesList.innerHTML = `
        <div class="welcome-message">
          <div class="welcome-text">Welcome to ${this.config.groupName} chat!</div>
          <div class="welcome-subtext">Be the first to start the conversation</div>
        </div>
      `;
      return;
    }
    
    messages.forEach(msg => this.addMessage(msg));
    this.scrollToBottom();
  }
  
  handleNewMessages(messages) {
    if (!messages || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    this.addMessage(lastMessage);
    
    if (!this.isOpen) {
      this.showNotification();
    }
    
    this.scrollToBottom();
  }
  
  addMessage(message) {
    const messagesList = this.shadowRoot.querySelector('#messages-list');
    const messageEl = document.createElement('div');
    messageEl.className = 'message';
    
    const isOwnMessage = message.Sender_Id === this.userId;
    if (isOwnMessage) {
      messageEl.classList.add('own-message');
    }
    
    const timeStr = this.formatTime(message.Send_Time);
    const senderName = message.sender_name || 'Anonymous';
    
    messageEl.innerHTML = `
      <div class="message-content">
        <div class="message-header">
          <span class="sender-name">${senderName}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
          <span class="message-time">${timeStr}</span>
        </div>
        <div class="message-text">${this.escapeHtml(message.Content)}</div>
      </div>
    `;
    
    messagesList.appendChild(messageEl);
  }
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  scrollToBottom() {
    const messagesList = this.shadowRoot.querySelector('#messages-list');
    messagesList.scrollTop = messagesList.scrollHeight;
  }
  
  updateStatus(connected) {
    const indicator = this.shadowRoot.querySelector('.status-indicator');
    if (indicator) {
      indicator.style.background = connected ? '#4CAF50' : '#f44336';
    }
  }
  
  showError(message) {
    const messagesList = this.shadowRoot.querySelector('#messages-list');
    
    // Clear loading message if it exists
    const loadingEl = messagesList.querySelector('.loading');
    if (loadingEl) {
      loadingEl.remove();
    }
    
    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;
    messagesList.appendChild(errorEl);
    this.scrollToBottom();
  }
  
  attachEventListeners() {
    const trigger = this.shadowRoot.querySelector('.chat-trigger');
    trigger.addEventListener('click', () => this.toggleChat());
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!this.contains(e.target) && this.isOpen && !this.isMinimized) {
        // Don't auto-close, let user manually close
      }
    });
    
    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeChat();
      }
    });
  }
  
  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
  
  openChat() {
    this.isOpen = true;
    this.isMinimized = false;
    this.chatContainer.classList.add('open');
    this.chatContainer.classList.remove('minimized');
    
    // Create chat interface on first open
    if (!this.chatInterface) {
      this.chatInterface = true;
      this.createChatInterface();
    }
    
    this.hideNotification();
    this.dispatchEvent(new CustomEvent('pingbash-opened'));
  }
  
  closeChat() {
    this.isOpen = false;
    this.isMinimized = false;
    this.chatContainer.classList.remove('open', 'minimized');
    this.dispatchEvent(new CustomEvent('pingbash-closed'));
  }
  
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    this.chatContainer.classList.toggle('minimized', this.isMinimized);
    
    const event = this.isMinimized ? 'pingbash-minimized' : 'pingbash-restored';
    this.dispatchEvent(new CustomEvent(event));
  }
  
  showNotification(count = 1) {
    this.notificationBadge.textContent = count > 9 ? '9+' : count.toString();
    this.notificationBadge.style.display = 'flex';
  }
  
  hideNotification() {
    this.notificationBadge.style.display = 'none';
  }
  
  // Public API methods
  open() {
    this.openChat();
  }
  
  close() {
    this.closeChat();
  }
  
  minimize() {
    if (this.isOpen) {
      this.isMinimized = true;
      this.chatContainer.classList.add('minimized');
    }
  }
  
  restore() {
    if (this.isMinimized) {
      this.isMinimized = false;
      this.chatContainer.classList.remove('minimized');
    }
  }
  
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    
    // Update attributes
    Object.keys(newConfig).forEach(key => {
      const attrName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (typeof newConfig[key] === 'string') {
        this.setAttribute(attrName, newConfig[key]);
      }
    });
    
    // Recreate iframe if URL-affecting config changed
    if (newConfig.groupName || newConfig.theme || newConfig.customColors) {
      if (this.iframe) {
        this.iframe.src = this.buildIframeUrl();
      }
    }
  }
  
  // Lifecycle callbacks
  connectedCallback() {
    console.log('Pingbash Chat widget connected');
  }
  
  disconnectedCallback() {
    console.log('Pingbash Chat widget disconnected');
  }
  
  static get observedAttributes() {
    return [
      'group-name', 'width', 'height', 'theme', 'position', 
      'api-url', 'auto-open', 'show-header', 'allow-minimize', 'custom-colors'
    ];
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      const configKey = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      
      if (name === 'custom-colors') {
        this.config[configKey] = this.parseCustomColors();
      } else if (name === 'auto-open' || name === 'show-header' || name === 'allow-minimize') {
        this.config[configKey] = newValue === 'true';
      } else {
        this.config[configKey] = newValue;
      }
      
      // Re-initialize if significant changes
      if (['group-name', 'api-url', 'theme'].includes(name) && this.iframe) {
        this.iframe.src = this.buildIframeUrl();
      }
    }
  }
}

// Register the custom element
if (!customElements.get('pingbash-chat')) {
  customElements.define('pingbash-chat', PingbashChatElement);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PingbashChatElement;
}

// Global registration helper
window.PingbashChat = {
  // Create a new chat widget programmatically
  create: (config = {}) => {
    const element = document.createElement('pingbash-chat');
    
    // Set attributes from config
    Object.keys(config).forEach(key => {
      const attrName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (typeof config[key] === 'object') {
        element.setAttribute(attrName, JSON.stringify(config[key]));
      } else {
        element.setAttribute(attrName, config[key].toString());
      }
    });
    
    document.body.appendChild(element);
    return element;
  },
  
  // Find existing widget
  get: () => {
    return document.querySelector('pingbash-chat');
  }
};

console.log('Pingbash Chat Web Component loaded successfully'); 