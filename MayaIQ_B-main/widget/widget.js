/**
 * Pingbash Chat Widget
 * Complete chat system with button toggle and full W version functionality
 */

class PingbashChatWidget {
  constructor(config = {}) {
    // Configuration
    this.config = {
      groupName: config.groupName || 'testgroup3',
      apiUrl: config.apiUrl || 'https://pingbash.com',
      position: config.position || 'top-left',
      theme: config.theme || 'light',
      width: config.width || '500px',
      height: config.height || '700px',
      customColors: config.customColors || null,
      autoOpen: config.autoOpen || false,
      minWidth: config.minWidth || '350px',
      minHeight: config.minHeight || '400px',
      maxWidth: config.maxWidth || '800px',
      maxHeight: config.maxHeight || '900px',
      resizable: config.resizable !== false,
      ...config
    };

    console.log(this.config);
    
    // State
    this.socket = null;
    this.userId = null;
    this.groupId = null;
    this.group = null;
    this.messages = [];
    this.isConnected = false;
    this.isOpen = false;
    this.currentUser = null;
    this.groupMembers = [];
    this.blockedUsers = [];
    this.pinnedMessages = [];
    this.unreadCount = 0;
    
    // Authentication state
    this.isAuthenticated = false;
    this.connectAsAuthenticated = false;
    this.authenticatedToken = null;
    this.anonId = null;
    
    // Page visibility state (same as W version)
    this.pageVisible = true;
    this.pendingMessages = [];
    this.reloadTimeoutRef = null;
    
    // UI Elements
    this.widget = null;
    this.button = null;
    this.dialog = null;
    
    this.init();
  }
  
  async init() {
    console.log('🚀 Initializing Pingbash Chat Widget...');
    
    this.createWidget();
    this.applyStyles();
    await this.loadSocketIO();
    
    // Setup page visibility tracking (same as W version)
    this.setupPageVisibilityTracking();
    
    // Check if user is already authenticated (same keys as W version)
    const savedToken = localStorage.getItem('pingbash_token');
    const savedUserId = localStorage.getItem('pingbash_user_id');
    
    if (savedToken && savedUserId) {
      this.userId = savedToken;
      this.currentUserId = savedUserId;
      this.isAuthenticated = true;
      this.connectAsAuthenticated = true;
      this.authenticatedToken = savedToken;
      console.log('🔐 [Widget] Found saved token, auto-signing in...');
      this.initializeSocket();
    } else {
      // Show sign-in modal for first-time users
      console.log('👤 [Widget] New user detected, showing sign-in options...');
      setTimeout(() => this.showSigninModal(), 500);
    }
    
    if (this.config.autoOpen) {
      setTimeout(() => this.openDialog(), 1000);
    }
  }
  
  createWidget() {
    // Create main widget container
    this.widget = document.createElement('div');
    this.widget.className = 'pingbash-widget';
    this.widget.setAttribute('data-position', this.config.position);
    
    // Create chat button
    this.createChatButton();
    
    // Create chat dialog
    this.createChatDialog();
    
    // Add to page
    document.body.appendChild(this.widget);
    
    // Attach event listeners
    this.attachEventListeners();
  }
  
  createChatButton() {
    this.button = document.createElement('button');
    this.button.className = 'pingbash-chat-button';
    this.button.innerHTML = `
      <svg class="pingbash-chat-icon" viewBox="0 0 24 24" width="24" height="24">
        <path fill="currentColor" d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4A2,2 0 0,0 20,2M6,9V7H18V9H6M14,11V13H6V11H14M16,15V17H6V15H16Z"/>
      </svg>
      <span class="pingbash-unread-badge" style="display: none;">0</span>
    `;
    
    this.widget.appendChild(this.button);
  }
  
  createChatDialog() {
    this.dialog = document.createElement('div');
    this.dialog.className = 'pingbash-chat-dialog';
    this.dialog.innerHTML = `
      <!-- W Version Header: Logo + Group Name + Hamburger Menu -->
      <nav class="pingbash-header">
        <div class="pingbash-header-left">
          <div class="pingbash-header-logo-section">
            <img class="pingbash-logo" src="https://pingbash.com/logo-orange.png" alt="Pingbash" />
          </div>
        </div>
        <div class="pingbash-header-right">
          <div class="pingbash-hamburger-container">
            <button class="pingbash-hamburger-btn" title="Menu">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
              </svg>
            </button>
            <div class="pingbash-hamburger-dropdown" style="display: none;">
              <div class="pingbash-menu-item" data-action="group-info">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
                </svg>
                Group Info
              </div>
              <div class="pingbash-menu-item" data-action="members">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6C7.11,6 8,6.89 8,8C8,9.11 7.11,10 6,10C4.89,10 4,9.11 4,8C4,6.89 4.89,6 6,6M6,12C8.67,12 12,13.34 12,16V18H0V16C0,13.34 3.33,12 6,12Z"/>
                </svg>
                Members
              </div>
              <div class="pingbash-menu-item" data-action="banned-users">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M14.5,9L12,11.5L9.5,9L8,10.5L10.5,13L8,15.5L9.5,17L12,14.5L14.5,17L16,15.5L13.5,13L16,10.5L14.5,9Z"/>
                </svg>
                Banned Users
              </div>
              <div class="pingbash-menu-item" data-action="ip-bans">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M4,1C2.89,1 2,1.89 2,3V7C2,8.11 2.89,9 4,9H1V11H13V9H10C11.11,9 12,8.11 12,7V3C12,1.89 11.11,1 10,1H4M4,3H10V7H4V3M3,13V18L3,19H21V18V13H3M5,15H19V17H5V15Z"/>
                </svg>
                IP Bans
              </div>
              <div class="pingbash-menu-divider"></div>
              <div class="pingbash-menu-item" data-action="settings">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                </svg>
                Settings
              </div>
              <div class="pingbash-menu-item" data-action="close">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"/>
                </svg>
                Close Chat
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      <!-- W Version Messages Area -->
      <article class="pingbash-messages-area">
        <div class="pingbash-messages-container">
          <div class="pingbash-messages-list" id="pingbash-messages">
            <div class="pingbash-loading">Loading messages...</div>
          </div>
        </div>
        
        <!-- Sign In Prompt for First Time Users -->
        <div class="pingbash-signin-prompt" style="display: none;">
          <div class="pingbash-signin-content">
            <h3>Welcome to ${this.config.groupName}!</h3>
            <p>Sign in to unlock all features or continue as anonymous user.</p>
            <div class="pingbash-signin-buttons">
              <button class="pingbash-signin-btn">Sign In</button>
              <button class="pingbash-continue-anon-btn">Continue as Guest</button>
            </div>
          </div>
        </div>
      </article>
      
      <!-- W Version Bottom Sending Bar -->
      <nav class="pingbash-bottom-bar">
        <!-- Left side: Media and Emoji controls -->
        <div class="pingbash-bar-left">
          <div class="pingbash-media-controls">
            <button class="pingbash-media-btn pingbash-image-btn" title="Send image">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
              </svg>
            </button>
            <button class="pingbash-media-btn pingbash-file-btn" title="Attach file">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z"/>
              </svg>
            </button>
            <button class="pingbash-media-btn pingbash-emoji-btn" title="Add emoji">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M8.5,9C9.328,9,10,9.672,10,10.5 S9.328,12,8.5,12S7,11.328,7,10.5S7.672,9,8.5,9z M12,18c-4,0-5-3-5-3h10C17,15,16,18,12,18z M15.5,12C14.672,12,14,11.328,14,10.5 S14.672,9,15.5,9S17,9.672,17,10.5S16.328,12,15.5,12z"/>
              </svg>
            </button>
            <button class="pingbash-media-btn pingbash-sound-btn" title="Sound settings">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Center: Input field with W version styling -->
        <div class="pingbash-input-wrapper">
          <input 
            type="text" 
            class="pingbash-message-input" 
            placeholder="Write a message"
            maxlength="500"
            disabled
          />
          <button class="pingbash-send-btn" disabled>
            <span class="pingbash-send-text">Send</span>
            <svg class="pingbash-send-icon" viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M2,21L23,12L2,3V10L17,12L2,14V21Z"/>
            </svg>
          </button>
        </div>
      </nav>
      
      <!-- Sign In Modal -->
      <div class="pingbash-signin-modal" style="display: none;">
        <div class="pingbash-popup-overlay"></div>
        <div class="pingbash-popup-content">
          <div class="pingbash-popup-header">
            <h3>Sign In to ${this.config.groupName}</h3>
            <button class="pingbash-popup-close">×</button>
          </div>
          <div class="pingbash-popup-body">
            <div class="pingbash-signin-form">
              <div class="pingbash-form-group">
                <label for="signin-email">Email:</label>
                <input type="email" id="signin-email" class="pingbash-form-input" placeholder="Enter your email">
              </div>
              <div class="pingbash-form-group">
                <label for="signin-password">Password:</label>
                <input type="password" id="signin-password" class="pingbash-form-input" placeholder="Enter your password">
              </div>
              <div class="pingbash-signin-options">
                <button class="pingbash-signin-submit-btn">Sign In</button>
                <button class="pingbash-continue-anon-btn">Continue as Guest</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Sound Settings Popup -->
      <div class="pingbash-sound-popup" style="display: none;">
        <div class="pingbash-popup-overlay"></div>
        <div class="pingbash-popup-content">
          <div class="pingbash-popup-header">
            <h3>Play sounds:</h3>
            <button class="pingbash-popup-close">×</button>
          </div>
          <div class="pingbash-popup-body">
            <div class="pingbash-sound-option">
              <input type="radio" id="sound-all" name="sound" value="all" checked>
              <label for="sound-all">All sounds</label>
            </div>
            <div class="pingbash-sound-option">
              <input type="radio" id="sound-mentions" name="sound" value="mentions">
              <label for="sound-mentions">Only mentions</label>
            </div>
            <div class="pingbash-sound-option">
              <input type="radio" id="sound-none" name="sound" value="none">
              <label for="sound-none">No sounds</label>
            </div>
          </div>
          <div class="pingbash-popup-footer">
            <button class="pingbash-sound-ok-btn">OK</button>
          </div>
        </div>
      </div>
      
      <!-- Emoji Picker (same as before) -->
      <div class="pingbash-emoji-picker" style="display: none;">
            <div class="pingbash-emoji-grid">
              <span class="pingbash-emoji" data-emoji="😀">😀</span>
              <span class="pingbash-emoji" data-emoji="😃">😃</span>
              <span class="pingbash-emoji" data-emoji="😄">😄</span>
              <span class="pingbash-emoji" data-emoji="😁">😁</span>
              <span class="pingbash-emoji" data-emoji="😆">😆</span>
              <span class="pingbash-emoji" data-emoji="😅">😅</span>
              <span class="pingbash-emoji" data-emoji="😂">😂</span>
              <span class="pingbash-emoji" data-emoji="🤣">🤣</span>
              <span class="pingbash-emoji" data-emoji="😊">😊</span>
              <span class="pingbash-emoji" data-emoji="😇">😇</span>
              <span class="pingbash-emoji" data-emoji="🙂">🙂</span>
              <span class="pingbash-emoji" data-emoji="🙃">🙃</span>
              <span class="pingbash-emoji" data-emoji="😉">😉</span>
              <span class="pingbash-emoji" data-emoji="😌">😌</span>
              <span class="pingbash-emoji" data-emoji="😍">😍</span>
              <span class="pingbash-emoji" data-emoji="🥰">🥰</span>
              <span class="pingbash-emoji" data-emoji="😘">😘</span>
              <span class="pingbash-emoji" data-emoji="😗">😗</span>
              <span class="pingbash-emoji" data-emoji="😙">😙</span>
              <span class="pingbash-emoji" data-emoji="😚">😚</span>
              <span class="pingbash-emoji" data-emoji="😋">😋</span>
              <span class="pingbash-emoji" data-emoji="😛">😛</span>
              <span class="pingbash-emoji" data-emoji="😝">😝</span>
              <span class="pingbash-emoji" data-emoji="😜">😜</span>
              <span class="pingbash-emoji" data-emoji="🤪">🤪</span>
              <span class="pingbash-emoji" data-emoji="🤨">🤨</span>
              <span class="pingbash-emoji" data-emoji="🧐">🧐</span>
              <span class="pingbash-emoji" data-emoji="🤓">🤓</span>
              <span class="pingbash-emoji" data-emoji="😎">😎</span>
              <span class="pingbash-emoji" data-emoji="🤩">🤩</span>
              <span class="pingbash-emoji" data-emoji="🥳">🥳</span>
              <span class="pingbash-emoji" data-emoji="😏">😏</span>
              <span class="pingbash-emoji" data-emoji="😒">😒</span>
              <span class="pingbash-emoji" data-emoji="😞">😞</span>
              <span class="pingbash-emoji" data-emoji="😔">😔</span>
              <span class="pingbash-emoji" data-emoji="😟">😟</span>
              <span class="pingbash-emoji" data-emoji="😕">😕</span>
              <span class="pingbash-emoji" data-emoji="🙁">🙁</span>
              <span class="pingbash-emoji" data-emoji="☹️">☹️</span>
              <span class="pingbash-emoji" data-emoji="😣">😣</span>
              <span class="pingbash-emoji" data-emoji="😖">😖</span>
              <span class="pingbash-emoji" data-emoji="😫">😫</span>
              <span class="pingbash-emoji" data-emoji="😩">😩</span>
              <span class="pingbash-emoji" data-emoji="🥺">🥺</span>
              <span class="pingbash-emoji" data-emoji="😢">😢</span>
              <span class="pingbash-emoji" data-emoji="😭">😭</span>
              <span class="pingbash-emoji" data-emoji="😤">😤</span>
              <span class="pingbash-emoji" data-emoji="😠">😠</span>
              <span class="pingbash-emoji" data-emoji="😡">😡</span>
              <span class="pingbash-emoji" data-emoji="🤬">🤬</span>
              <span class="pingbash-emoji" data-emoji="🤯">🤯</span>
              <span class="pingbash-emoji" data-emoji="😳">😳</span>
              <span class="pingbash-emoji" data-emoji="🥵">🥵</span>
              <span class="pingbash-emoji" data-emoji="🥶">🥶</span>
              <span class="pingbash-emoji" data-emoji="😱">😱</span>
              <span class="pingbash-emoji" data-emoji="😨">😨</span>
              <span class="pingbash-emoji" data-emoji="😰">😰</span>
              <span class="pingbash-emoji" data-emoji="😥">😥</span>
              <span class="pingbash-emoji" data-emoji="😓">😓</span>
              <span class="pingbash-emoji" data-emoji="🤗">🤗</span>
              <span class="pingbash-emoji" data-emoji="🤔">🤔</span>
              <span class="pingbash-emoji" data-emoji="🤭">🤭</span>
              <span class="pingbash-emoji" data-emoji="🤫">🤫</span>
              <span class="pingbash-emoji" data-emoji="🤥">🤥</span>
              <span class="pingbash-emoji" data-emoji="😶">😶</span>
              <span class="pingbash-emoji" data-emoji="😐">😐</span>
              <span class="pingbash-emoji" data-emoji="😑">😑</span>
              <span class="pingbash-emoji" data-emoji="😬">😬</span>
              <span class="pingbash-emoji" data-emoji="🙄">🙄</span>
              <span class="pingbash-emoji" data-emoji="😯">😯</span>
              <span class="pingbash-emoji" data-emoji="😦">😦</span>
              <span class="pingbash-emoji" data-emoji="😧">😧</span>
              <span class="pingbash-emoji" data-emoji="😮">😮</span>
              <span class="pingbash-emoji" data-emoji="😲">😲</span>
              <span class="pingbash-emoji" data-emoji="🥱">🥱</span>
              <span class="pingbash-emoji" data-emoji="😴">😴</span>
              <span class="pingbash-emoji" data-emoji="🤤">🤤</span>
              <span class="pingbash-emoji" data-emoji="😪">😪</span>
              <span class="pingbash-emoji" data-emoji="😵">😵</span>
              <span class="pingbash-emoji" data-emoji="🤐">🤐</span>
              <span class="pingbash-emoji" data-emoji="🥴">🥴</span>
              <span class="pingbash-emoji" data-emoji="🤢">🤢</span>
              <span class="pingbash-emoji" data-emoji="🤮">🤮</span>
              <span class="pingbash-emoji" data-emoji="🤧">🤧</span>
              <span class="pingbash-emoji" data-emoji="😷">😷</span>
              <span class="pingbash-emoji" data-emoji="🤒">🤒</span>
              <span class="pingbash-emoji" data-emoji="🤕">🤕</span>
              <span class="pingbash-emoji" data-emoji="🤑">🤑</span>
              <span class="pingbash-emoji" data-emoji="🤠">🤠</span>
              <span class="pingbash-emoji" data-emoji="😈">😈</span>
              <span class="pingbash-emoji" data-emoji="👿">👿</span>
              <span class="pingbash-emoji" data-emoji="👹">👹</span>
              <span class="pingbash-emoji" data-emoji="👺">👺</span>
              <span class="pingbash-emoji" data-emoji="🤡">🤡</span>
              <span class="pingbash-emoji" data-emoji="💩">💩</span>
              <span class="pingbash-emoji" data-emoji="👻">👻</span>
              <span class="pingbash-emoji" data-emoji="💀">💀</span>
              <span class="pingbash-emoji" data-emoji="☠️">☠️</span>
              <span class="pingbash-emoji" data-emoji="👽">👽</span>
              <span class="pingbash-emoji" data-emoji="👾">👾</span>
              <span class="pingbash-emoji" data-emoji="🤖">🤖</span>
              <span class="pingbash-emoji" data-emoji="🎃">🎃</span>
              <span class="pingbash-emoji" data-emoji="😺">😺</span>
              <span class="pingbash-emoji" data-emoji="😸">😸</span>
              <span class="pingbash-emoji" data-emoji="😹">😹</span>
              <span class="pingbash-emoji" data-emoji="😻">😻</span>
              <span class="pingbash-emoji" data-emoji="😼">😼</span>
              <span class="pingbash-emoji" data-emoji="😽">😽</span>
              <span class="pingbash-emoji" data-emoji="🙀">🙀</span>
              <span class="pingbash-emoji" data-emoji="😿">😿</span>
              <span class="pingbash-emoji" data-emoji="😾">😾</span>
              <span class="pingbash-emoji" data-emoji="❤️">❤️</span>
              <span class="pingbash-emoji" data-emoji="🧡">🧡</span>
              <span class="pingbash-emoji" data-emoji="💛">💛</span>
              <span class="pingbash-emoji" data-emoji="💚">💚</span>
              <span class="pingbash-emoji" data-emoji="💙">💙</span>
              <span class="pingbash-emoji" data-emoji="💜">💜</span>
              <span class="pingbash-emoji" data-emoji="🤎">🤎</span>
              <span class="pingbash-emoji" data-emoji="🖤">🖤</span>
              <span class="pingbash-emoji" data-emoji="🤍">🤍</span>
              <span class="pingbash-emoji" data-emoji="💔">💔</span>
              <span class="pingbash-emoji" data-emoji="❣️">❣️</span>
              <span class="pingbash-emoji" data-emoji="💕">💕</span>
              <span class="pingbash-emoji" data-emoji="💞">💞</span>
              <span class="pingbash-emoji" data-emoji="💓">💓</span>
              <span class="pingbash-emoji" data-emoji="💗">💗</span>
              <span class="pingbash-emoji" data-emoji="💖">💖</span>
              <span class="pingbash-emoji" data-emoji="💘">💘</span>
              <span class="pingbash-emoji" data-emoji="💝">💝</span>
              <span class="pingbash-emoji" data-emoji="💟">💟</span>
              <span class="pingbash-emoji" data-emoji="♥️">♥️</span>
              <span class="pingbash-emoji" data-emoji="💯">💯</span>
              <span class="pingbash-emoji" data-emoji="💢">💢</span>
              <span class="pingbash-emoji" data-emoji="💥">💥</span>
              <span class="pingbash-emoji" data-emoji="💫">💫</span>
              <span class="pingbash-emoji" data-emoji="💦">💦</span>
              <span class="pingbash-emoji" data-emoji="💨">💨</span>
              <span class="pingbash-emoji" data-emoji="🕳️">🕳️</span>
              <span class="pingbash-emoji" data-emoji="💣">💣</span>
              <span class="pingbash-emoji" data-emoji="💬">💬</span>
              <span class="pingbash-emoji" data-emoji="👁️‍🗨️">👁️‍🗨️</span>
              <span class="pingbash-emoji" data-emoji="🗨️">🗨️</span>
              <span class="pingbash-emoji" data-emoji="🗯️">🗯️</span>
              <span class="pingbash-emoji" data-emoji="💭">💭</span>
              <span class="pingbash-emoji" data-emoji="💤">💤</span>
              <span class="pingbash-emoji" data-emoji="👋">👋</span>
              <span class="pingbash-emoji" data-emoji="🤚">🤚</span>
              <span class="pingbash-emoji" data-emoji="🖐️">🖐️</span>
              <span class="pingbash-emoji" data-emoji="✋">✋</span>
              <span class="pingbash-emoji" data-emoji="🖖">🖖</span>
              <span class="pingbash-emoji" data-emoji="👌">👌</span>
              <span class="pingbash-emoji" data-emoji="🤏">🤏</span>
              <span class="pingbash-emoji" data-emoji="✌️">✌️</span>
              <span class="pingbash-emoji" data-emoji="🤞">🤞</span>
              <span class="pingbash-emoji" data-emoji="🤟">🤟</span>
              <span class="pingbash-emoji" data-emoji="🤘">🤘</span>
              <span class="pingbash-emoji" data-emoji="🤙">🤙</span>
              <span class="pingbash-emoji" data-emoji="👈">👈</span>
              <span class="pingbash-emoji" data-emoji="👉">👉</span>
              <span class="pingbash-emoji" data-emoji="👆">👆</span>
              <span class="pingbash-emoji" data-emoji="🖕">🖕</span>
              <span class="pingbash-emoji" data-emoji="👇">👇</span>
              <span class="pingbash-emoji" data-emoji="☝️">☝️</span>
              <span class="pingbash-emoji" data-emoji="👍">👍</span>
              <span class="pingbash-emoji" data-emoji="👎">👎</span>
              <span class="pingbash-emoji" data-emoji="✊">✊</span>
              <span class="pingbash-emoji" data-emoji="👊">👊</span>
              <span class="pingbash-emoji" data-emoji="🤛">🤛</span>
              <span class="pingbash-emoji" data-emoji="🤜">🤜</span>
              <span class="pingbash-emoji" data-emoji="👏">👏</span>
              <span class="pingbash-emoji" data-emoji="🙌">🙌</span>
              <span class="pingbash-emoji" data-emoji="👐">👐</span>
              <span class="pingbash-emoji" data-emoji="🤲">🤲</span>
              <span class="pingbash-emoji" data-emoji="🤝">🤝</span>
              <span class="pingbash-emoji" data-emoji="🙏">🙏</span>
              <span class="pingbash-emoji" data-emoji="✍️">✍️</span>
              <span class="pingbash-emoji" data-emoji="💅">💅</span>
              <span class="pingbash-emoji" data-emoji="🤳">🤳</span>
              <span class="pingbash-emoji" data-emoji="💪">💪</span>
              <span class="pingbash-emoji" data-emoji="🦾">🦾</span>
              <span class="pingbash-emoji" data-emoji="🦿">🦿</span>
              <span class="pingbash-emoji" data-emoji="🦵">🦵</span>
              <span class="pingbash-emoji" data-emoji="🦶">🦶</span>
              <span class="pingbash-emoji" data-emoji="👂">👂</span>
              <span class="pingbash-emoji" data-emoji="🦻">🦻</span>
              <span class="pingbash-emoji" data-emoji="👃">👃</span>
              <span class="pingbash-emoji" data-emoji="🧠">🧠</span>
              <span class="pingbash-emoji" data-emoji="🦷">🦷</span>
              <span class="pingbash-emoji" data-emoji="🦴">🦴</span>
              <span class="pingbash-emoji" data-emoji="👀">👀</span>
              <span class="pingbash-emoji" data-emoji="👁️">👁️</span>
              <span class="pingbash-emoji" data-emoji="👅">👅</span>
              <span class="pingbash-emoji" data-emoji="👄">👄</span>
            </div>
          </div>
        </div>
      </div>
    `;
    
    this.widget.appendChild(this.dialog);
  }
  
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
        background: white;
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
        background: #f8f9fa;
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
        padding: 16px;
        scroll-behavior: smooth;
      }
      
      .pingbash-loading {
        text-align: center;
        padding: 40px 20px;
        color: #666;
        font-size: 14px;
      }
      
      .pingbash-message {
        margin-bottom: 16px;
        opacity: 1;
      }
      
      .pingbash-message.new-message {
        animation: fadeInUp 0.3s ease;
        animation-fill-mode: forwards;
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
        background: ${this.config.customColors?.primary || '#2596be'} !important;
        color: white !important;
        border-bottom-right-radius: 4px;
        margin-left: auto;
      }
      
      .pingbash-message:not(.own) .pingbash-message-content {
        background: #f0f0f0 !important;
        color: #333 !important;
        border-bottom-left-radius: 4px;
        margin-right: auto;
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
        margin-bottom: 4px;
        opacity: 0.7;
        font-size: 11px;
      }
      
      /* For own messages, center the time when there's no sender name */
      .pingbash-message.own .pingbash-message-header {
        justify-content: flex-end;
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
      
      .pingbash-message-actions {
        position: absolute;
        top: -10px;
        right: 10px;
        display: none;
        gap: 4px;
      }
      
      .pingbash-message:hover .pingbash-message-actions {
        display: flex;
      }
      
      .pingbash-message-action {
        background: rgba(0,0,0,0.7);
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        cursor: pointer;
        transition: background 0.2s ease;
      }
      
      .pingbash-message-action:hover {
        background: rgba(0,0,0,0.9);
      }
      
      .pingbash-message-action.ban {
        background: #f44336;
      }
      
      .pingbash-message-action.timeout {
        background: #ff9800;
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
        font-size: 14px;
        line-height: 24px;
        font-family: inherit;
        color: #333;
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
        width: 300px;
        max-width: 90vw;
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
      
      .pingbash-emoji-picker {
        position: absolute;
        bottom: 100%;
        left: 0;
        background: white;
        border: 1px solid #ddd;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        padding: 12px;
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
      }
      
      .pingbash-emoji-grid {
        display: grid;
        grid-template-columns: repeat(8, 1fr);
        gap: 4px;
      }
      
      .pingbash-emoji {
        font-size: 20px;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.2s ease;
        text-align: center;
      }
      
      .pingbash-emoji:hover {
        background: #f0f0f0;
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
    `;
    
    document.head.appendChild(style);
  }
  
  attachEventListeners() {
    // Chat button click
    this.button.addEventListener('click', () => this.toggleDialog());
    
    // Hamburger menu
    const hamburgerBtn = this.dialog.querySelector('.pingbash-hamburger-btn');
    const hamburgerDropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
    
    hamburgerBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleHamburgerMenu();
    });
    
    // Hamburger menu items
    const menuItems = this.dialog.querySelectorAll('.pingbash-menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        const action = item.dataset.action;
        this.handleMenuAction(action);
        this.hideHamburgerMenu();
      });
    });
    
    // Close hamburger menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!hamburgerBtn?.contains(e.target) && !hamburgerDropdown?.contains(e.target)) {
        this.hideHamburgerMenu();
      }
    });
    
    // Message input
    const input = this.dialog.querySelector('.pingbash-message-input');
    const sendBtn = this.dialog.querySelector('.pingbash-send-btn');
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    sendBtn.addEventListener('click', () => this.sendMessage());
    
    // Media buttons
    const imageBtn = this.dialog.querySelector('.pingbash-image-btn');
    const fileBtn = this.dialog.querySelector('.pingbash-file-btn');
    const emojiBtn = this.dialog.querySelector('.pingbash-emoji-btn');
    const soundBtn = this.dialog.querySelector('.pingbash-sound-btn');
    
    imageBtn?.addEventListener('click', () => this.handleImageUpload());
    fileBtn?.addEventListener('click', () => this.handleFileUpload());
    soundBtn?.addEventListener('click', () => this.showSoundSettings());
    
    // Sound popup
    const soundPopup = this.dialog.querySelector('.pingbash-sound-popup');
    const soundCloseBtn = this.dialog.querySelector('.pingbash-popup-close');
    const soundOkBtn = this.dialog.querySelector('.pingbash-sound-ok-btn');
    const soundOverlay = this.dialog.querySelector('.pingbash-popup-overlay');
    
    soundCloseBtn?.addEventListener('click', () => this.hideSoundSettings());
    soundOkBtn?.addEventListener('click', () => this.saveSoundSettings());
    soundOverlay?.addEventListener('click', () => this.hideSoundSettings());
    
    // Sign-in modal
    const signinModal = this.dialog.querySelector('.pingbash-signin-modal');
    const signinCloseBtn = signinModal?.querySelector('.pingbash-popup-close');
    const signinSubmitBtn = this.dialog.querySelector('.pingbash-signin-submit-btn');
    const continueAnonBtn = this.dialog.querySelector('.pingbash-continue-anon-btn');
    const signinOverlay = signinModal?.querySelector('.pingbash-popup-overlay');
    
    signinCloseBtn?.addEventListener('click', () => this.hideSigninModal());
    signinSubmitBtn?.addEventListener('click', () => this.handleSignin());
    continueAnonBtn?.addEventListener('click', () => this.continueAsAnonymous());
    signinOverlay?.addEventListener('click', () => this.hideSigninModal());
    
    // Emoji picker
    const emojiPicker = this.dialog.querySelector('.pingbash-emoji-picker');
    
    emojiBtn?.addEventListener('click', () => {
      emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    });
    
    // Emoji selection
    const emojis = this.dialog.querySelectorAll('.pingbash-emoji');
    emojis.forEach(emoji => {
      emoji.addEventListener('click', () => {
        const emojiChar = emoji.dataset.emoji;
        input.value += emojiChar;
        emojiPicker.style.display = 'none';
        input.focus();
      });
    });
    
    // Close emoji picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!emojiBtn?.contains(e.target) && !emojiPicker?.contains(e.target)) {
        emojiPicker.style.display = 'none';
      }
    });
    
    // Escape key to close dialog
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.closeDialog();
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
      console.log('🔍 [Widget] Socket connected successfully!', this.socket.id);
      this.isConnected = true;
      this.updateConnectionStatus(true);
      this.joinGroup();
    });

    this.socket.on('disconnect', () => {
      console.log('🔍 [Widget] Socket disconnected');
      this.isConnected = false;
      this.updateConnectionStatus(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔍 [Widget] Socket connection error:', error);
      this.showError('Connection failed: ' + error.message);
      this.updateConnectionStatus(false);
    });
    
    this.setupSocketListeners();
  }
  
  setupSocketListeners() {
    // Add debug listener for ALL socket events
    this.socket.onAny((eventName, ...args) => {
      console.log('🔍 [Widget] Socket received event:', eventName, args);
    });
    
    // Use exact same event names as W version
    this.socket.on('get group msg', (messages) => {
      console.log('🔍 [Widget] Received get group msg:', messages?.length);
      // Initial message load - replace all messages
      this.displayMessages(messages || []);
    });
    
    this.socket.on('send group msg', (messages) => {
      console.log('🔍 [Widget] Received send group msg (real-time):', messages?.length);
      console.log('🔍 [Widget] Raw message data:', messages);
      // Real-time message updates - merge with existing messages (same as W version)
      this.handleNewMessages(messages || []);
    });
    
    this.socket.on('forbidden', (message) => {
      console.error('🔍 [Widget] forbidden:', message);
      this.showError(message || 'Access denied');
    });
    
    this.socket.on('server error', (error) => {
      console.error('🔍 [Widget] server error:', error);
      this.showError('Server error occurred');
    });
    
    this.socket.on('expired', (data) => {
      console.error('🔍 [Widget] Token expired:', data);
      this.showError('Session expired. Please sign in again.');
    });
    
    this.socket.on('join to group anon', (response) => {
      console.log('🔍 [Widget] join to group anon response:', response);
    });
    
    this.socket.on('join to group', (response) => {
      console.log('🔍 [Widget] join to group response:', response);
    });
    
    this.socket.on('group updated', (group) => {
      console.log('🔍 [Widget] group updated:', group);
      this.group = group;
      this.groupMembers = group?.members || [];
    });
    
    this.socket.on('refresh', (data) => {
      console.log('🔍 [Widget] refresh:', data);
    });
    
    this.socket.on('get fav groups', (groups) => {
      console.log('🔍 [Widget] get fav groups response:', groups?.length, 'groups');
    });
  }
  
  async joinGroup() {
    try {
      // Resolve group ID - use known groups
      this.groupId = await this.getGroupIdFromName();
      
      console.log('🔍 [Widget] Joining group:', this.config.groupName, 'ID:', this.groupId);
      console.log('🔍 [Widget] Connect as authenticated:', !!this.connectAsAuthenticated);
      console.log('🔍 [Widget] Is authenticated:', this.isAuthenticated);
      
      if (this.connectAsAuthenticated && this.authenticatedToken) {
        // Join as authenticated user
        console.log('🔐 [Widget] Joining as authenticated user');
        this.userId = this.authenticatedToken;
        
        // Join the group as authenticated user (same as W version)
        console.log('🔍 [Widget] Emitting join to group with:', {
          token: this.authenticatedToken ? 'present' : 'missing',
          groupId: this.groupId,
          userId: this.currentUserId,
          userIdType: typeof this.currentUserId
        });
        
        // Debug: Let's also check what the token would decode to
        console.log('🔍 [Widget] Token details for verification:', {
          tokenLength: this.authenticatedToken?.length,
          tokenStart: this.authenticatedToken?.substring(0, 10),
          currentUserId: this.currentUserId,
          currentUserIdType: typeof this.currentUserId
        });
        this.socket.emit('join to group', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId),  // Ensure groupId is a number
          userId: parseInt(this.currentUserId)  // Ensure userId is a number
        });
        
        // Get messages with authenticated token
        console.log('🔍 [Widget] Emitting GET_GROUP_MSG for group:', this.groupId, 'with authenticated token');
        this.socket.emit('get group msg', { 
          token: this.authenticatedToken, 
          groupId: parseInt(this.groupId)
        });
        
        // Clear the flag
        this.connectAsAuthenticated = false;
        
      } else {
        // Join as anonymous user (original flow)
        console.log('🔍 [Widget] Joining as anonymous user');
        
        // Generate anonymous user ID - use same format as W version
        this.anonId = Math.floor(Date.now() + Math.random() * 1000);
        this.userId = `anonuser${this.config.groupName}${this.anonId}`;
        
        console.log('🔍 [Widget] Anonymous user ID:', this.anonId);
        
        // First register as anonymous user (same as W version)
        this.socket.emit('user logged as annon', { userId: this.anonId });
        
        // Join the group as anonymous user (same event name as W version)
        this.socket.emit('join to group anon', {
          groupId: parseInt(this.groupId),
          anonId: this.anonId
        });
        
        // Get messages with anonymous token
        console.log('🔍 [Widget] Emitting GET_GROUP_MSG for group:', this.groupId, 'with token:', this.userId.substring(0, 20) + '...');
        this.socket.emit('get group msg', { 
          token: this.userId, 
          groupId: parseInt(this.groupId)
        });
      }
      
      if (!this.socket.connected) {
        console.warn('🔍 [Widget] WARNING: Attempting to emit but socket is not connected!');
      }
      
    } catch (error) {
      console.error('🔍 [Widget] Failed to join group:', error);
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
      console.log('🔍 [Widget] Using known group ID:', knownGroups[this.config.groupName], 'for', this.config.groupName);
      return knownGroups[this.config.groupName];
    }
    
    // Fallback to hash
    const hashId = this.hashCode(this.config.groupName);
    console.log('🔍 [Widget] Using hash-based ID:', hashId, 'for', this.config.groupName);
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
    const input = this.dialog.querySelector('.pingbash-message-input');
    const message = input.value.trim();
    
    if (!message || !this.socket || !this.isConnected) return;
    
    console.log('🔍 [Widget] Sending message:', message);
    console.log('🔍 [Widget] Group ID:', this.groupId, 'User ID:', this.userId);
    console.log('🔍 [Widget] Authenticated:', this.isAuthenticated);
    
    if (this.isAuthenticated) {
      // Send as authenticated user (exact W version format)
      const payload = {
        groupId: parseInt(this.groupId),  // Ensure groupId is a number
        msg: message,
        token: this.userId,
        receiverId: null,
        parent_id: null
      };
      console.log('📤 [Widget] Sending as authenticated user');
      console.log('📤 [Widget] Token (first 20 chars):', this.userId.substring(0, 20) + '...');
      console.log('📤 [Widget] Full payload:', payload);
      console.log('📤 [Widget] Socket connected:', this.socket.connected);
      console.log('📤 [Widget] Socket ID:', this.socket.id);
      
      this.socket.emit('send group msg', payload);
      
      // Add a timeout to check if we get a response
      setTimeout(() => {
        console.log('📤 [Widget] Message sent 2 seconds ago - checking for response...');
      }, 2000);
    } else {
      // Send as anonymous user (exact W version format)
      const payload = {
        groupId: parseInt(this.groupId),  // Ensure groupId is a number
        msg: message,
        anonId: this.anonId,
        receiverId: null,
        parent_id: null
      };
      console.log('📤 [Widget] Sending as anonymous user');
      console.log('📤 [Widget] AnonId:', this.anonId);
      console.log('📤 [Widget] Full payload:', payload);
      console.log('📤 [Widget] Socket connected:', this.socket.connected);
      console.log('📤 [Widget] Socket ID:', this.socket.id);
      
      this.socket.emit('send group msg anon', payload);
      
      // Add a timeout to check if we get a response
      setTimeout(() => {
        console.log('📤 [Widget] Anonymous message sent 2 seconds ago - checking for response...');
      }, 2000);
    }
    
    input.value = '';
    console.log('🔍 [Widget] Input cleared, message sending complete');
  }
  
  // Handle real-time incoming messages (same logic as W version)
  handleNewMessages(data) {
    console.log('🔍 [Widget] handleNewMessages called with:', data?.length, 'messages');
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('🔍 [Widget] No new messages to process - data:', data);
      return;
    }
    
    console.log('🔍 [Widget] handleNewMessages received:', data.length, 'messages');
    console.log('🔍 [Widget] Current messages count:', this.messages?.length || 0);
    console.log('🔍 [Widget] New message details:', data.map(msg => ({
      id: msg.Id,
      content: msg.Content,
      sender: msg.sender_name,
      group_id: msg.group_id
    })));
    
    // Check if messages belong to current group (same as W version)
    const groupId = data.length && data[data.length - 1].group_id;
    console.log('🔍 [Widget] Message group ID:', groupId, 'Current group ID:', this.groupId);
    console.log('🔍 [Widget] Group ID match:', groupId === this.groupId);
    
    if (groupId === this.groupId) {
      console.log('🔍 [Widget] ✅ Messages for current group');
      console.log('🔍 [Widget] Page visible:', this.pageVisible);
      
      if (this.pageVisible) {
        console.log('🔍 [Widget] Page visible - adding messages immediately');
        console.log('🔍 [Widget] Before processing - existing:', this.messages?.length || 0, 'new:', data.length);
        
        // Don't merge here - let displayMessages handle the logic
        this.displayMessages(data);
        
        console.log('🔍 [Widget] ✅ Messages updated and displayed immediately');
              } else {
          console.log('🔍 [Widget] Page hidden - queuing messages for later');
          // Queue messages for when page becomes visible (same as W version)
          this.pendingMessages = this.mergeArrays(this.pendingMessages, data);
          console.log('🔍 [Widget] Queued messages - pending count:', this.pendingMessages.length);
          console.log('🔍 [Widget] Latest queued message ID:', this.pendingMessages[this.pendingMessages.length - 1]?.Id);
        }
    } else {
      console.log('🔍 [Widget] ❌ Messages not for current group, ignoring');
    }
  }
  
  // Merge arrays function (exact same logic as W version)
  mergeArrays(oldArray, newArray) {
    const oldMap = new Map(oldArray.map(item => [item?.Id, item]));
    for (const newItem of newArray) {
      oldMap.set(newItem?.Id, newItem); // updates existing or adds new
    }
    return Array.from(oldMap.values());
  }
  
  // Setup page visibility tracking (exact same logic as W version)
  setupPageVisibilityTracking() {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      this.pageVisible = isVisible;
      console.log('🔍 [Widget] Page visibility changed:', isVisible ? 'visible' : 'hidden');
      
      if (isVisible) {
        console.log('🔍 [Widget] Window reactivated - polling for new messages');
        
        // Clear any existing timeout
        if (this.reloadTimeoutRef) {
          clearTimeout(this.reloadTimeoutRef);
        }
        
        // Process any pending messages first
        if (this.pendingMessages.length > 0) {
          console.log('🔍 [Widget] Processing', this.pendingMessages.length, 'pending messages');
          const mergedMessages = this.mergeArrays(this.messages || [], this.pendingMessages);
          console.log('🔍 [Widget] After merging pending - total messages:', mergedMessages.length);
          
          // Force display of pending messages (bypass optimization checks)
          this.displayPendingMessages(mergedMessages);
          this.pendingMessages = []; // Clear pending messages
        }
        
        // Debounce polling to prevent rapid successive calls
        this.reloadTimeoutRef = setTimeout(() => {
          console.log('🔍 [Widget] Polling for new messages - Socket connected:', this.socket?.connected, 'Group ID:', this.groupId);
          
          if (this.socket && this.socket.connected && this.groupId) {
            console.log('🔍 [Widget] Emitting GET_GROUP_MSG to poll for new messages');
            // Use socket to poll for messages (same as W version)
            this.socket.emit('get group msg', {
              token: this.userId,
              groupId: parseInt(this.groupId)
            });
          } else {
            console.log('🔍 [Widget] Cannot poll messages - missing socket, group ID, or socket disconnected');
          }
        }, 200); // 200ms debounce (same as W version)
      }
    };
    
    // Listen for page visibility changes (same as W version)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Log initial page visibility state
    console.log('🔍 [Widget] Page visibility tracking setup complete');
    console.log('🔍 [Widget] Initial page visibility:', this.pageVisible);
    console.log('🔍 [Widget] Document hidden:', document.hidden);
  }
  
    displayMessages(messages) {
    const newMessages = messages || [];
    const messagesList = this.dialog.querySelector('#pingbash-messages');
    
    console.log('🔍 [Widget] displayMessages called with', newMessages.length, 'messages');
    
    if (!newMessages.length) {
      messagesList.innerHTML = `
        <div class="pingbash-loading">
          Welcome to ${this.config.groupName}!<br>
          Start the conversation...
        </div>
      `;
      this.messages = [];
      return;
    }
    
    // Check if this is initial load
    const isInitialLoad = !this.messages || this.messages.length === 0;
    
    if (isInitialLoad) {
      // Initial load - clear and render all messages
      console.log('🔍 [Widget] Initial load - rendering', newMessages.length, 'messages');
      messagesList.innerHTML = '';
      this.messages = newMessages;
      newMessages.forEach(msg => this.addMessage(msg));
    } else {
      // Quick check: if we have the same number of messages and the last message ID matches, skip
      if (this.messages && this.messages.length === newMessages.length) {
        const lastExistingId = this.messages[this.messages.length - 1]?.Id;
        const lastNewId = newMessages[newMessages.length - 1]?.Id;
        console.log('🔍 [Widget] Comparing message sets - existing:', this.messages.length, 'new:', newMessages.length);
        console.log('🔍 [Widget] Last existing ID:', lastExistingId, 'Last new ID:', lastNewId);
        if (lastExistingId === lastNewId) {
          console.log('🔍 [Widget] Same message set received, skipping processing');
          return;
        } else {
          console.log('🔍 [Widget] Different last message ID, proceeding with update');
        }
      }
      
      // Smart append - only add messages that don't exist in DOM
      console.log('🔍 [Widget] Smart append - checking for new messages');
      
      // Get existing message IDs from DOM (more reliable than stored array)
      const existingDomIds = new Set();
      messagesList.querySelectorAll('[data-message-id]').forEach(el => {
        existingDomIds.add(parseInt(el.getAttribute('data-message-id')));
      });
      
      // Find truly new messages
      const messagesToAdd = newMessages.filter(msg => !existingDomIds.has(msg.Id));
      
      console.log('🔍 [Widget] DOM has', existingDomIds.size, 'messages, received', newMessages.length, 'messages');
      console.log('🔍 [Widget] Found', messagesToAdd.length, 'new messages to append');
      
      if (messagesToAdd.length > 0) {
                 // Append only new messages (no clearing!)
         messagesToAdd.forEach(msg => {
           console.log('🔍 [Widget] Adding new message:', msg.Id, msg.Content?.substring(0, 20) + '...');
           this.addMessage(msg, true); // Pass true to indicate this is a new message
         });
        
        // Update stored messages
        this.messages = newMessages;
        
        console.log('🔍 [Widget] ✅ Appended', messagesToAdd.length, 'new messages without blinking');
        this.scrollToBottom();
      } else {
        console.log('🔍 [Widget] No new messages to add');
      }
    }
    
    // Only scroll for initial load
    if (isInitialLoad) {
      this.scrollToBottom();
    }
  }
  
  displayPendingMessages(messages) {
    // Special method for displaying pending messages - bypasses optimization checks
    console.log('🔍 [Widget] displayPendingMessages called with', messages.length, 'messages');
    
    const messagesList = this.dialog.querySelector('#pingbash-messages');
    const newMessages = messages || [];
    
    if (!newMessages.length) {
      return;
    }
    
    // Get existing message IDs from DOM
    const existingDomIds = new Set();
    messagesList.querySelectorAll('[data-message-id]').forEach(el => {
      existingDomIds.add(parseInt(el.getAttribute('data-message-id')));
    });
    
    // Find messages that aren't in DOM yet
    const messagesToAdd = newMessages.filter(msg => !existingDomIds.has(msg.Id));
    
    console.log('🔍 [Widget] Pending messages - DOM has', existingDomIds.size, 'messages');
    console.log('🔍 [Widget] Pending messages - found', messagesToAdd.length, 'new messages to add');
    
    if (messagesToAdd.length > 0) {
      // Add new messages with animation
      messagesToAdd.forEach(msg => {
        console.log('🔍 [Widget] Adding pending message:', msg.Id, msg.Content?.substring(0, 20) + '...');
        this.addMessage(msg, true); // Mark as new for animation
      });
      
      console.log('🔍 [Widget] ✅ Added', messagesToAdd.length, 'pending messages');
      this.scrollToBottom();
    }
    
    // Update stored messages
    this.messages = newMessages;
  }
  
  addMessage(message, isNewMessage = false) {
    console.log('🔍 [Widget] addMessage called for message ID:', message.Id, 'Content:', message.Content, 'isNew:', isNewMessage);
    const messagesList = this.dialog.querySelector('#pingbash-messages');
    
    if (!messagesList) {
      console.error('🔍 [Widget] ERROR: Messages list element not found!');
      return;
    }
    
    // Check if message already exists to prevent duplicates
    const existingMessage = messagesList.querySelector(`[data-message-id="${message.Id}"]`);
    if (existingMessage) {
      console.log('🔍 [Widget] Message', message.Id, 'already exists in DOM, skipping');
      return;
    }
    
    // Determine if this is our own message (same logic as W version)
    let isOwn = false;
    if (this.isAuthenticated) {
      // For authenticated users, compare with currentUserId (the actual user ID number)
      // Ensure both are numbers for proper comparison
      const senderId = parseInt(message.Sender_Id);
      const currentUserId = parseInt(this.currentUserId);
      isOwn = senderId === currentUserId;
    } else {
      // For anonymous users, compare with anonId
      // Ensure both are numbers for proper comparison
      const senderId = parseInt(message.Sender_Id);
      const anonId = parseInt(this.anonId);
      isOwn = senderId === anonId;
    }
    
    console.log('🔍 [Widget] Message ownership check:', {
      rawSenderId: message.Sender_Id,
      parsedSenderId: parseInt(message.Sender_Id),
      rawCurrentUserId: this.currentUserId,
      parsedCurrentUserId: parseInt(this.currentUserId),
      rawAnonId: this.anonId,
      parsedAnonId: parseInt(this.anonId),
      isAuthenticated: this.isAuthenticated,
      isOwn: isOwn,
      senderName: message.sender_name
    });
    
    const messageEl = document.createElement('div');
    messageEl.className = `pingbash-message ${isOwn ? 'own' : ''} ${isNewMessage ? 'new-message' : ''}`;
    messageEl.setAttribute('data-message-id', message.Id);
    
    console.log('🔍 [Widget] Creating message element with class:', messageEl.className, 'ID:', message.Id);
    
    const time = new Date(message.Send_Time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const senderName = message.sender_name || 'Anonymous';
    
    messageEl.innerHTML = `
      <div class="pingbash-message-content">
        <div class="pingbash-message-header">
          ${!isOwn ? `<span class="pingbash-message-sender">${senderName}</span>` : ''}
          <span class="pingbash-message-time">${time}</span>
        </div>
        <div class="pingbash-message-text">${this.escapeHtml(message.Content)}</div>
        ${!isOwn ? `
          <div class="pingbash-message-actions">
            <button class="pingbash-message-action ban" onclick="window.pingbashWidget.banUser(${message.Sender_Id})">BAN</button>
            <button class="pingbash-message-action timeout" onclick="window.pingbashWidget.timeoutUser(${message.Sender_Id})">TO</button>
          </div>
        ` : ''}
      </div>
    `;
    
    messagesList.appendChild(messageEl);
    console.log('🔍 [Widget] ✅ Message element appended to DOM, total messages now:', messagesList.children.length);
    
    // Remove animation class after animation completes
    if (isNewMessage) {
      setTimeout(() => {
        messageEl.classList.remove('new-message');
      }, 300); // Match animation duration
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  scrollToBottom() {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      const messagesList = this.dialog.querySelector('.pingbash-messages-list');
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
      }
    });
  }
  
  updateConnectionStatus(connected) {
    const indicator = this.dialog.querySelector('.pingbash-status-indicator');
    const statusText = this.dialog.querySelector('.pingbash-status-text');
    const input = this.dialog.querySelector('.pingbash-message-input');
    const sendBtn = this.dialog.querySelector('.pingbash-send-btn');
    
    if (indicator) {
      indicator.classList.toggle('connected', connected);
    }
    
    if (statusText) {
      statusText.textContent = connected ? 'Online' : 'Connecting...';
    }
    
    if (input) {
      input.disabled = !connected;
      input.placeholder = connected ? 'Type a message...' : 'Connecting...';
    }
    
    if (sendBtn) {
      sendBtn.disabled = !connected;
    }
  }
  
  showError(message) {
    const messagesList = this.dialog.querySelector('#pingbash-messages');
    const errorEl = document.createElement('div');
    errorEl.className = 'pingbash-error';
    errorEl.textContent = message;
    messagesList.appendChild(errorEl);
    this.scrollToBottom();
  }
  
  toggleDialog() {
    if (this.isOpen) {
      this.closeDialog();
    } else {
      this.openDialog();
    }
  }
  
  openDialog() {
    this.isOpen = true;
    this.dialog.classList.add('open');
    this.unreadCount = 0;
    this.updateUnreadBadge();
    
    // Focus input
    const input = this.dialog.querySelector('.pingbash-message-input');
    if (input && !input.disabled) {
      setTimeout(() => input.focus(), 100);
    }
    
    this.dispatchEvent('pingbash-opened');
  }
  
  closeDialog() {
    this.isOpen = false;
    this.dialog.classList.remove('open');
    this.dispatchEvent('pingbash-closed');
  }
  
  minimizeDialog() {
    this.closeDialog();
  }
  
  toggleHamburgerMenu() {
    const dropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
    const isVisible = dropdown.style.display !== 'none';
    dropdown.style.display = isVisible ? 'none' : 'block';
  }
  
  hideHamburgerMenu() {
    const dropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
    dropdown.style.display = 'none';
  }
  
  handleMenuAction(action) {
    console.log('🍔 [Widget] Menu action:', action);
    
    switch(action) {
      case 'group-info':
        this.showGroupInfo();
        break;
      case 'members':
        this.showMembers();
        break;
      case 'banned-users':
        this.showBannedUsers();
        break;
      case 'ip-bans':
        this.showIpBans();
        break;
      case 'settings':
        this.showSettings();
        break;
      case 'close':
        this.closeDialog();
        break;
    }
  }
  
  showGroupInfo() {
    console.log('ℹ️ [Widget] Showing group info for:', this.config.groupName);
    // TODO: Implement group info modal
  }
  
  showMembers() {
    console.log('👥 [Widget] Showing group members');
    // TODO: Implement members modal
  }
  
  showBannedUsers() {
    console.log('🚫 [Widget] Showing banned users');
    if (!this.socket || !this.isConnected) return;
    
    if (!this.isAuthenticated) {
      this.showError('Please sign in to access admin features');
      return;
    }
    
    // Emit socket event to get banned users
    this.socket.emit('get banned users', {
      group_id: this.groupId,
      token: this.userId
    });
  }
  
  showIpBans() {
    console.log('🌐 [Widget] Showing IP bans');
    if (!this.socket || !this.isConnected) return;
    
    if (!this.isAuthenticated) {
      this.showError('Please sign in to access admin features');
      return;
    }
    
    // Emit socket event to get IP bans
    this.socket.emit('get ip bans', {
      group_id: this.groupId,
      token: this.userId
    });
  }
  
  showSettings() {
    console.log('⚙️ [Widget] Showing settings');
    // TODO: Implement settings modal
  }
  
  showSigninModal() {
    const modal = this.dialog.querySelector('.pingbash-signin-modal');
    modal.style.display = 'flex';
  }
  
  hideSigninModal() {
    const modal = this.dialog.querySelector('.pingbash-signin-modal');
    modal.style.display = 'none';
  }
  
  // REMOVED DUPLICATE METHOD - Using the one below
  
  // REMOVED DUPLICATE METHOD - Using the one below
  
  loginAsReal(token, groupId, anonId) {
    console.log('🔐 [Widget] loginAsReal:', anonId, '/', groupId, '/', token ? 'token-present' : 'no-token');
    if (token && groupId && anonId && this.socket) {
      // Use exact same event name as W version
      this.socket.emit('user logged wild sub', { token, groupId, anonId });
    }
  }
  
  handleImageUpload() {
    console.log('📷 [Widget] Image upload clicked');
    // Create hidden file input for images
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('📷 [Widget] Image selected:', file.name);
        await this.uploadAndSendFile(file, 'image');
      }
    };
    input.click();
  }
  
  handleFileUpload() {
    console.log('📎 [Widget] File upload clicked');
    // Create hidden file input for any file type
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log('📎 [Widget] File selected:', file.name);
        await this.uploadAndSendFile(file, 'file');
      }
    };
    input.click();
  }
  
  async uploadAndSendFile(file, type) {
    if (!this.socket || !this.isConnected) {
      console.error('❌ [Widget] Socket not connected');
      return;
    }
    
    try {
      // Show upload progress
      this.showUploadProgress(file.name);
      
      // Create FormData for file upload (W version format)
      const formData = new FormData();
      if (type === 'image') {
        formData.append('Image', file);
      } else {
        formData.append('File', file);
      }
      
      // Upload file to backend using W version endpoints
      const endpoint = type === 'image' 
        ? `${this.config.apiUrl}/api/private/add/chats/images`
        : `${this.config.apiUrl}/api/private/add/chats/files`;
        
      // Use the correct token based on authentication state
      const authToken = this.isAuthenticated ? this.userId : '';
      console.log('📤 [Widget] Upload auth token:', authToken ? authToken.substring(0, 20) + '...' : 'none');
      console.log('📤 [Widget] Is authenticated:', this.isAuthenticated);
      
      const uploadResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': authToken
        },
        body: formData
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status}`);
      }
      
      const uploadResult = await uploadResponse.json();
      console.log('✅ [Widget] File uploaded:', uploadResult);
      
      // Send message with file reference
      const messageContent = type === 'image' 
        ? `image::${uploadResult.url || uploadResult.filename}`
        : `file::${uploadResult.url || uploadResult.filename}`;
      
      this.socket.emit('send group msg anon', {
        group_id: this.groupId,
        content: messageContent,
        type: type,
        token: this.userId
      });
      
      this.hideUploadProgress();
      
    } catch (error) {
      console.error('❌ [Widget] File upload error:', error);
      this.hideUploadProgress();
      this.showError(`Failed to upload ${type}: ${error.message}`);
    }
  }
  
  showUploadProgress(filename) {
    const messagesContainer = this.dialog.querySelector('.pingbash-messages-list');
    const progressDiv = document.createElement('div');
    progressDiv.className = 'pingbash-upload-progress';
    progressDiv.innerHTML = `
      <div class="pingbash-upload-info">
        <span>📤 Uploading ${filename}...</span>
        <div class="pingbash-progress-bar">
          <div class="pingbash-progress-fill"></div>
        </div>
      </div>
    `;
    messagesContainer.appendChild(progressDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  hideUploadProgress() {
    const progress = this.dialog.querySelector('.pingbash-upload-progress');
    if (progress) {
      progress.remove();
    }
  }
  
  showSoundSettings() {
    const popup = this.dialog.querySelector('.pingbash-sound-popup');
    popup.style.display = 'flex';
  }
  
  hideSoundSettings() {
    const popup = this.dialog.querySelector('.pingbash-sound-popup');
    popup.style.display = 'none';
  }
  
  saveSoundSettings() {
    const selectedOption = this.dialog.querySelector('input[name="sound"]:checked');
    if (selectedOption) {
      this.soundSetting = selectedOption.value;
      console.log('🔊 [Widget] Sound setting saved:', this.soundSetting);
      // TODO: Save to localStorage or backend
    }
    this.hideSoundSettings();
  }
  
  toggleHamburgerMenu() {
    const dropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
    const isVisible = dropdown.style.display !== 'none';
    dropdown.style.display = isVisible ? 'none' : 'block';
  }
  
  hideHamburgerMenu() {
    const dropdown = this.dialog.querySelector('.pingbash-hamburger-dropdown');
    dropdown.style.display = 'none';
  }
  
  handleMenuAction(action) {
    console.log('🍔 [Widget] Menu action:', action);
    
    switch(action) {
      case 'group-info':
        this.showGroupInfo();
        break;
      case 'members':
        this.showMembers();
        break;
      case 'banned-users':
        this.showBannedUsers();
        break;
      case 'ip-bans':
        this.showIpBans();
        break;
      case 'settings':
        this.showSettings();
        break;
      case 'close':
        this.closeDialog();
        break;
    }
  }
  
  showGroupInfo() {
    console.log('ℹ️ [Widget] Showing group info for:', this.config.groupName);
    // TODO: Implement group info modal
  }
  
  showMembers() {
    console.log('👥 [Widget] Showing group members');
    // TODO: Implement members modal
  }
  
  showBannedUsers() {
    console.log('🚫 [Widget] Showing banned users');
    if (!this.socket || !this.isConnected) return;
    
    if (!this.isAuthenticated) {
      this.showError('Please sign in to access admin features');
      return;
    }
    
    // Emit socket event to get banned users
    this.socket.emit('get banned users', {
      group_id: this.groupId,
      token: this.userId
    });
  }
  
  showIpBans() {
    console.log('🌐 [Widget] Showing IP bans');
    if (!this.socket || !this.isConnected) return;
    
    if (!this.isAuthenticated) {
      this.showError('Please sign in to access admin features');
      return;
    }
    
    // Emit socket event to get IP bans
    this.socket.emit('get ip bans', {
      group_id: this.groupId,
      token: this.userId
    });
  }
  
  showSettings() {
    console.log('⚙️ [Widget] Showing settings');
    // TODO: Implement settings modal
  }
  
  showSigninModal() {
    const modal = this.dialog.querySelector('.pingbash-signin-modal');
    modal.style.display = 'flex';
  }
  
  hideSigninModal() {
    const modal = this.dialog.querySelector('.pingbash-signin-modal');
    modal.style.display = 'none';
  }
  
  async handleSignin() {
    const emailInput = this.dialog.querySelector('#signin-email');
    const passwordInput = this.dialog.querySelector('#signin-password');
    
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    // Email validation (same as W version)
    const isValidEmail = (email) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };
    
    if (!email.trim()) {
      this.showError('Please enter your email address');
      emailInput.focus();
      return;
    }
    
    if (!isValidEmail(email)) {
      this.showError('Please enter a valid email address');
      emailInput.focus();
      return;
    }
    
    if (!password.trim()) {
      this.showError('Please enter your password');
      passwordInput.focus();
      return;
    }
    
    try {
      console.log('🔐 [Widget] Attempting sign in...');
      
      const requestBody = {
        Email: email,
        Password: password,
        Role: 1
      };
      
      console.log('🔐 [Widget] Request URL:', `${this.config.apiUrl}/api/user/login`);
      console.log('🔐 [Widget] Request body:', requestBody);
      
      // Use exact W version sign-in API format
      const response = await fetch(`${this.config.apiUrl}/api/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      console.log('🔐 [Widget] Response status:', response.status);
      
      // Try to get response text regardless of status
      const responseText = await response.text();
      console.log('🔐 [Widget] Response text:', responseText);
      
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(`Forbidden: ${responseText}`);
        }
        throw new Error(`Sign in failed: ${response.status} - ${responseText}`);
      }
      
      // Parse the response text as JSON
      const result = JSON.parse(responseText);
      console.log('✅ [Widget] Sign in successful:', result);
      
      // Store token and user info (W version format)
      this.userId = result.token;
      this.currentUserId = result.id;
      this.isAuthenticated = true;
      
      console.log('🔍 [Widget] Sign-in successful - stored values:', {
        token: result.token ? 'present' : 'missing',
        userId: result.id,
        currentUserId: this.currentUserId
      });
      
      // Save to localStorage (same keys as W version)
      localStorage.setItem('pingbash_token', result.token);
      localStorage.setItem('pingbash_user_id', result.id);
      
      // Hide modal and continue
      this.hideSigninModal();
      
      // Always initialize socket with authenticated user after login
      console.log('🔐 [Widget] Initializing socket with authenticated user...');
      console.log('🔐 [Widget] - Authenticated token:', result.token.substring(0, 20) + '...');
      
      // Set a flag to indicate we're connecting as authenticated user
      this.connectAsAuthenticated = true;
      this.authenticatedToken = result.token;
      
      // Initialize socket (this will connect as authenticated user due to the flag)
      this.initializeSocket();
      
    } catch (error) {
      console.error('❌ [Widget] Sign in error:', error);
      this.showError('Sign in failed. Please check your credentials.');
    }
  }
  
  continueAsAnonymous() {
    console.log('👤 [Widget] Continuing as anonymous user');
    this.hideSigninModal();
    this.isAuthenticated = false;
    this.connectAsAuthenticated = false;
    this.authenticatedToken = null;
    // Initialize socket for anonymous user
    this.initializeSocket();
  }
  
  updateUnreadBadge() {
    const badge = this.button.querySelector('.pingbash-unread-badge');
    if (this.unreadCount > 0 && !this.isOpen) {
      badge.textContent = this.unreadCount > 9 ? '9+' : this.unreadCount.toString();
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  
  // Admin functions (same as W version)
  banUser(userId) {
    if (!this.socket || !this.isConnected) return;
    
    console.log('🔍 [Widget] Banning user:', userId);
    this.socket.emit('ban group user', {
      groupId: this.groupId,
      userId: userId,
      token: `anonuser${this.config.groupName}${this.userId}`
    });
  }
  
  timeoutUser(userId) {
    if (!this.socket || !this.isConnected) return;
    
    console.log('🔍 [Widget] Timing out user:', userId);
    this.socket.emit('timeout user', {
      groupId: this.groupId,
      userId: userId,
      token: `anonuser${this.config.groupName}${this.userId}`,
      timeoutMinutes: 15
    });
  }
  
  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }
  
  // Public API
  destroy() {
    if (this.socket) {
      this.socket.disconnect();
    }
    
    if (this.widget) {
      this.widget.remove();
    }
    
    const styles = document.getElementById('pingbash-widget-styles');
    if (styles) {
      styles.remove();
    }
  }
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  // Check for configuration in script tag
  const script = document.currentScript || document.querySelector('script[src*="PingbashChatWidget"]');
  const config = {};
  
  if (script) {
    // Get config from data attributes
    const dataset = script.dataset;
    if (dataset.groupName) config.groupName = dataset.groupName;
    if (dataset.apiUrl) config.apiUrl = dataset.apiUrl;
    if (dataset.position) config.position = dataset.position;
    if (dataset.theme) config.theme = dataset.theme;
    if (dataset.width) config.width = dataset.width;
    if (dataset.height) config.height = dataset.height;
    if (dataset.autoOpen) config.autoOpen = dataset.autoOpen === 'true';
    if (dataset.customColors) {
      try {
        config.customColors = JSON.parse(dataset.customColors);
      } catch (e) {
        console.warn('Invalid customColors JSON');
      }
    }
  }
  
  // Create global instance
  window.pingbashWidget = new PingbashChatWidget(config);
});

// Global factory function
window.PingbashChatWidget = PingbashChatWidget;

console.log('🚀 Pingbash Chat Widget loaded successfully'); 