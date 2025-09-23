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

    // Chat rules state
    this.chatRules = '';
    this.isCreator = false;

    // Chat rules auto-display state (same as W version)
    this.pendingChatRulesDisplay = {
      groupId: null,
      userType: null,
      timestamp: 0
    };
    this.hasSeenRulesForGroup = this.loadSeenRules();

    // UI Elements
    this.widget = null;
    this.button = null;
    this.dialog = null;

      // Add debug methods for testing
  this.clearSeenRules = () => {
    localStorage.removeItem('pingbash_widget_seen_rules');
    this.hasSeenRulesForGroup = {};
    console.log('🔍 [Widget] [Chat Rules] Cleared all seen rules from localStorage');
  };

  this.clearAllTokens = () => {
    localStorage.removeItem('pingbash_token');
    localStorage.removeItem('pingbash_user_id');
    localStorage.removeItem('anonToken');
    console.log('🔍 [Widget] Cleared all authentication tokens from localStorage');
  };

  // Test method for group creation modal
  this.testGroupCreationModal = () => {
    console.log('🧪 [Widget] Testing group creation modal...');
    console.log('🧪 [Widget] Dialog element:', !!this.dialog);
    
    if (this.dialog) {
      const modal = this.dialog.querySelector('.pingbash-group-creation-modal');
      console.log('🧪 [Widget] Modal element found:', !!modal);
      
      if (modal) {
        console.log('🧪 [Widget] Modal current display:', modal.style.display);
        console.log('🧪 [Widget] Forcing modal to show...');
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '10000';
        modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
        console.log('🧪 [Widget] Modal should now be visible');
      }
    }
  };

  // Test method for logo click
  this.testLogoClick = () => {
    console.log('🧪 [Widget] Testing logo click...');
    const logo = this.dialog?.querySelector('.pingbash-logo');
    console.log('🧪 [Widget] Logo element found:', !!logo);
    
    if (logo) {
      console.log('🧪 [Widget] Logo element:', logo);
      console.log('🧪 [Widget] Logo cursor style:', logo.style.cursor);
      logo.click();
    }
  };

  // Test method for chat rules
  this.testChatRules = () => {
    console.log('🧪 [Widget] Testing chat rules...');
    console.log('🧪 [Widget] Current user ID:', this.currentUserId);
    console.log('🧪 [Widget] Group:', this.group);
    console.log('🧪 [Widget] Is creator:', this.isCreator);
    console.log('🧪 [Widget] Is authenticated:', this.isAuthenticated);
    
    this.showChatRules();
  };

  // Update online user count badge
  this.updateOnlineUserCount = (count) => {
    const badge = this.dialog?.querySelector('.pingbash-online-count-badge');
    if (badge) {
      badge.textContent = count || '0';
      if (count === 0) {
        badge.classList.add('zero');
      } else {
        badge.classList.remove('zero');
      }
      console.log('👥 [Widget] Updated online user count badge:', count);
    }
  };

  // Show online users method
  this.showOnlineUsers = () => {
    console.log('👥 [Widget] Showing online users');
    console.log('👥 [Widget] Online user IDs:', this.onlineUserIds);
    console.log('👥 [Widget] Online count:', this.onlineUserIds?.length || 0);
    
    // For now, just show an alert with the count
    // TODO: Implement online users modal
    const count = this.onlineUserIds?.length || 0;
    //alert(`Online Users: ${count}\n\nUser IDs: ${this.onlineUserIds?.join(', ') || 'None'}`);
  };



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
    const savedAnonToken = localStorage.getItem('anonToken');

    if (savedToken && savedUserId) {
      // Auto-signin with authenticated user
      this.userId = savedToken;
      this.currentUserId = savedUserId;
      this.isAuthenticated = true;
      this.connectAsAuthenticated = true;
      this.authenticatedToken = savedToken;
      console.log('🔐 [Widget] Found saved token, auto-signing in...');
      this.initializeSocket();

      // Trigger chat rules for auto-signed in users (same as W version)
      setTimeout(() => {
        console.log('🔍 [Widget] [Chat Rules] Triggering chat rules for auto-signed in user');
        console.log('🔍 [Widget] [Chat Rules] Auto-signin state - groupId:', this.groupId, 'socket connected:', this.socket?.connected);
        this.triggerChatRulesAfterLogin(savedToken, 'logged-in');
      }, 2000); // Longer delay to ensure socket and group are ready
    } else if (savedAnonToken) {
      // Auto-signin with anonymous user (same as W version)
      console.log('👤 [Widget] Found saved anonymous token, auto-signing in as anonymous...');

      // Extract anonId from token (format: anonuser{groupName}{anonId})
      const tokenPrefix = `anonuser${this.config.groupName}`;
      const anonId = parseInt(savedAnonToken.replace(tokenPrefix, ''));

      this.isAuthenticated = false;
      this.connectAsAuthenticated = false;
      this.authenticatedToken = null;
      this.anonId = anonId;
      this.currentUserId = anonId;
      this.userId = savedAnonToken;

      this.initializeSocket();

      // Register as anonymous user after socket connection (same as W version)
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          console.log('👤 [Widget] Auto-registering as anonymous user with ID:', anonId);
          this.socket.emit('user logged as annon', { userId: anonId });
        }
      }, 1000);

      // Trigger chat rules for auto-anonymous users (same as W version)
      setTimeout(() => {
        console.log('🔍 [Widget] [Chat Rules] Triggering chat rules for auto-anonymous user');
        this.triggerChatRulesAfterLogin(savedAnonToken, 'anonymous');
      }, 2000); // Longer delay to ensure socket and group are ready
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
    this.setupAutoScroll();
    
    // Initialize online user count badge
    this.updateOnlineUserCount(0);
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
            <img class="pingbash-logo" src="https://pingbash.com/logo-orange.png" alt="Pingbash" title="Click to create a new group" />
          </div>
        </div>
        <div class="pingbash-header-right">
          <div class="pingbash-online-users-container">
            <div class="pingbash-online-users-icon" title="Online Users">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6C7.11,6 8,6.89 8,8C8,9.11 7.11,10 6,10C4.89,10 4,9.11 4,8C4,6.89 4.89,6 6,6M6,12C8.67,12 12,13.34 12,16V18H0V16C0,13.34 3.33,12 6,12Z"/>
              </svg>
              <span class="pingbash-online-count-badge">0</span>
            </div>
          </div>
          <!-- Settings Menu (Admin Tools) -->
          <div class="pingbash-settings-container" style="display: none;">
            <button class="pingbash-settings-btn" title="Settings">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
              </svg>
            </button>
            <div class="pingbash-settings-dropdown" style="display: none;">
              <div class="pingbash-menu-item" data-action="chat-limitations" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11.5C15.4,11.5 16,12.4 16,13V16C16,17.4 15.4,18 14.8,18H9.2C8.6,18 8,17.4 8,16V13C8,12.4 8.6,11.5 9.2,11.5V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.5,8.7 10.5,10V11.5H13.5V10C13.5,8.7 12.8,8.2 12,8.2Z"/>
                </svg>
                Chat Limitations
              </div>
              <div class="pingbash-menu-item" data-action="manage-chat" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                </svg>
                Manage Chat
              </div>
              <div class="pingbash-menu-item" data-action="moderator-management" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z"/>
                </svg>
                Manage Moderators
              </div>
              <div class="pingbash-menu-item" data-action="censored-content" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M11,7H13A1,1 0 0,1 14,8V16A1,1 0 0,1 13,17H11A1,1 0 0,1 10,16V8A1,1 0 0,1 11,7M11,2A1,1 0 0,1 12,1A1,1 0 0,1 13,2V5H11V2M17.5,7A4.5,4.5 0 0,1 22,11.5A4.5,4.5 0 0,1 17.5,16H16V14H17.5A2.5,2.5 0 0,0 20,11.5A2.5,2.5 0 0,0 17.5,9H16V7H17.5M8,7V9H6.5A2.5,2.5 0 0,0 4,11.5A2.5,2.5 0 0,0 6.5,14H8V16H6.5A4.5,4.5 0 0,1 2,11.5A4.5,4.5 0 0,1 6.5,7H8Z"/>
                </svg>
                Censored Content
              </div>
              <div class="pingbash-menu-item" data-action="banned-users" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M14.5,9L12,11.5L9.5,9L8,10.5L10.5,13L8,15.5L9.5,17L12,14.5L14.5,17L16,15.5L13.5,13L16,10.5L14.5,9Z"/>
                </svg>
                Banned Users
              </div>
              <div class="pingbash-menu-item" data-action="ip-bans" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M4,1C2.89,1 2,1.89 2,3V7C2,8.11 2.89,9 4,9H1V11H13V9H10C11.11,9 12,8.11 12,7V3C12,1.89 11.11,1 10,1H4M4,3H10V7H4V3M3,13V18L3,19H21V18V13H3M5,15H19V17H5V15Z"/>
                </svg>
                IP Bans
              </div>
            </div>
          </div>
          
          <div class="pingbash-hamburger-container">
            <button class="pingbash-hamburger-btn" title="Menu">
              <svg viewBox="0 0 24 24" width="22" height="22">
                <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
              </svg>
            </button>
            <div class="pingbash-hamburger-dropdown" style="display: none;">
              <div class="pingbash-menu-item" data-action="chat-rules">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
                Chat Rules
              </div>
              <div class="pingbash-menu-item" data-action="copy-group-url">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z"/>
                </svg>
                Copy Group URL
              </div>
              <div class="pingbash-menu-item" data-action="add-to-favorites" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                </svg>
                Add to Favorites
              </div>
              <div class="pingbash-menu-item" data-action="remove-from-favorites" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z"/>
                </svg>
                Remove from Favorites
              </div>
              <div class="pingbash-menu-item" data-action="hide-chat">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.36,7 12,7Z"/>
                </svg>
                Hide Chat
              </div>
              <div class="pingbash-menu-item" data-action="show-chat" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z"/>
                </svg>
                Show Chat
              </div>
              <div class="pingbash-menu-divider"></div>
              <!-- Dark/Light Mode Toggle -->
              <div class="pingbash-menu-item" data-action="toggle-theme">
                <svg viewBox="0 0 24 24" width="16" height="16" class="pingbash-theme-icon-light">
                  <path fill="currentColor" d="M17.75,4.09L15.22,6.03L16.13,9.09L13.5,7.28L10.87,9.09L11.78,6.03L9.25,4.09L12.44,4L13.5,1L14.56,4L17.75,4.09M21.25,11L19.61,12.25L20.2,14.23L18.5,13.06L16.8,14.23L17.39,12.25L15.75,11L17.81,10.95L18.5,9L19.19,10.95L21.25,11M18.97,15.95C19.8,15.87 20.69,17.05 20.16,17.8C19.84,18.25 19.5,18.67 19.08,19.07C15.17,23 8.84,23 4.94,19.07C1.03,15.17 1.03,8.83 4.94,4.93C5.34,4.53 5.76,4.17 6.21,3.85C6.96,3.32 8.14,4.21 8.06,5.04C7.79,7.9 8.75,10.87 10.95,13.06C13.14,15.26 16.1,16.22 18.97,15.95M17.33,17.97C14.5,17.81 11.7,16.64 9.53,14.5C7.36,12.31 6.2,9.5 6.04,6.68C3.23,9.82 3.34,14.4 6.35,17.41C9.37,20.43 14,20.54 17.33,17.97Z"/>
                </svg>
                <svg viewBox="0 0 24 24" width="16" height="16" class="pingbash-theme-icon-dark" style="display: none;">
                  <path fill="currentColor" d="M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8M12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18M20,8.69V4H15.31L12,0.69L8.69,4H4V8.69L0.69,12L4,15.31V20H8.69L12,23.31L15.31,20H20V15.31L23.31,12L20,8.69Z"/>
                </svg>
                <span class="pingbash-theme-text">Dark Mode</span>
              </div>
              <div class="pingbash-menu-divider"></div>
              <div class="pingbash-menu-item" data-action="logout" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
                </svg>
                Log out
              </div>
              <div class="pingbash-menu-item" data-action="login" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V20H19V4H10V6H8V4A2,2 0 0,1 10,2Z"/>
                </svg>
                Log in
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
        <!-- Removed duplicate signin prompt - using full modal instead -->
      </article>
      
      <!-- W Version Bottom Sending Bar -->
          <div class="pingbash-reply-preview" style="display: none;">
           <div class="pingbash-reply-preview-icon">↩️</div>
           <div style="display:flex;">
           <div class="pingbash-reply-preview-image" style="width:40px; height:40px;"></div>
           <div class="pingbash-reply-preview-content-wrapper">
             <div class="pingbash-reply-preview-sender"></div>
             <div class="pingbash-reply-preview-content"></div>
           </div>
           <button class="pingbash-reply-preview-close">×</button>
           </div>
           
         </div>
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
        
        <!-- Reply Preview (hidden by default) - positioned above bottom bar -->
        
        
        <!-- Center: Input field with W version styling -->
        <div class="pingbash-input-wrapper">
          <div class="pingbash-input-row">
            <input 
              type="text" 
              id="pingbash-message-input"
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
        </div>
      </nav>
      
      <!-- Sign In Modal -->
      <div class="pingbash-signin-modal" style="display: none;">
        <div class="pingbash-popup-overlay"></div>
        <div class="pingbash-popup-content" style="height:350px">
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
      
      <!-- Chat Rules Popup -->
      <div class="pingbash-chat-rules-popup" style="display: none;">
        <div class="pingbash-popup-overlay"></div>
        <div class="pingbash-popup-content pingbash-chat-rules-content">
          <div class="pingbash-popup-header">
            <h3>Chat Rules - <span class="pingbash-group-name-display"></span></h3>
            <button class="pingbash-popup-close">×</button>
          </div>
          <div class="pingbash-popup-body">
            <div class="pingbash-chat-rules-view">
              <div class="pingbash-rules-display">
                <pre class="pingbash-rules-text"></pre>
                <p class="pingbash-no-rules-text" style="display: none;">No rules have been set for this group.</p>
              </div>
              <div class="pingbash-rules-edit" style="display: none;">
                <textarea class="pingbash-rules-textarea" placeholder="Enter the chat rules for this group...

Example:
1. Be respectful to all members
2. No spam or excessive posting
3. Stay on topic
4. No harassment or bullying
5. Follow community guidelines"></textarea>
              </div>
            </div>
          </div>
          <div class="pingbash-popup-footer">
            <div class="pingbash-rules-view-footer">
              <button class="pingbash-rules-edit-btn" style="display: none;">Edit Rules</button>
              <button class="pingbash-rules-close-btn">Close</button>
            </div>
            <div class="pingbash-rules-edit-footer" style="display: none;">
              <button class="pingbash-rules-cancel-btn">Cancel</button>
              <button class="pingbash-rules-save-btn">Save</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Group Creation Modal -->
      <div class="pingbash-group-creation-modal" style="display: none;">
        <div class="pingbash-popup-overlay"></div>
        <div class="pingbash-popup-content pingbash-group-creation-content">
          <div class="pingbash-popup-header">
            <h3>Create New Group</h3>
            <button class="pingbash-popup-close">×</button>
          </div>
          <div class="pingbash-popup-body">
            <div class="pingbash-group-creation-container">
              <!-- Configuration Panel (Full Width) -->
              <div class="pingbash-config-panel">
                <!-- Group Name Input -->
                <div class="pingbash-form-group">
                  <label for="group-name-input">Group Name *</label>
                  <input 
                    type="text" 
                    id="group-name-input" 
                    class="pingbash-form-input" 
                    placeholder="Enter group name..." 
                    maxlength="50"
                  />
                  <div class="pingbash-char-counter">0/50 characters</div>
                </div>

                <!-- Size Configuration -->
                <div class="pingbash-config-section">
                  <h4>Size Settings</h4>
                  <div class="pingbash-form-group">
                    <label>Size Mode</label>
                    <div class="pingbash-radio-group">
                      <label class="pingbash-radio-option">
                        <input type="radio" name="size-mode" value="fixed" checked>
                        <span>Fixed Size</span>
                      </label>
                      <label class="pingbash-radio-option">
                        <input type="radio" name="size-mode" value="responsive">
                        <span>Responsive</span>
                      </label>
                    </div>
                  </div>
                  <div class="pingbash-size-controls">
                    <div class="pingbash-form-group">
                      <label for="widget-width">Width (px)</label>
                      <input type="number" id="widget-width" class="pingbash-form-input" value="500" min="350" max="800">
                    </div>
                    <div class="pingbash-form-group">
                      <label for="widget-height">Height (px)</label>
                      <input type="number" id="widget-height" class="pingbash-form-input" value="400" min="300" max="900">
                    </div>
                  </div>
                </div>

                <!-- Color Configuration -->
                <div class="pingbash-config-section">
                  <h4>Colors</h4>
                  <div class="pingbash-color-grid">
                    <div class="pingbash-color-item">
                      <label for="bg-color">Background</label>
                      <input type="color" id="bg-color" class="pingbash-color-input" value="#ffffff">
                    </div>
                    <div class="pingbash-color-item">
                      <label for="title-color">Title</label>
                      <input type="color" id="title-color" class="pingbash-color-input" value="#333333">
                    </div>
                    <div class="pingbash-color-item">
                      <label for="msg-bg-color">Message Background</label>
                      <input type="color" id="msg-bg-color" class="pingbash-color-input" value="#f8f9fa">
                    </div>
                    <div class="pingbash-color-item">
                      <label for="msg-text-color">Message Text</label>
                      <input type="color" id="msg-text-color" class="pingbash-color-input" value="#000000">
                    </div>
                    <div class="pingbash-color-item">
                      <label for="owner-msg-color">Your Messages</label>
                      <input type="color" id="owner-msg-color" class="pingbash-color-input" value="#007bff">
                    </div>
                    <div class="pingbash-color-item">
                      <label for="input-bg-color">Input Background</label>
                      <input type="color" id="input-bg-color" class="pingbash-color-input" value="#ffffff">
                    </div>
                  </div>
                </div>

                <!-- Settings Configuration -->
                <div class="pingbash-config-section">
                  <h4>Settings</h4>
                  <div class="pingbash-settings-grid">
                    <label class="pingbash-checkbox-option">
                      <input type="checkbox" id="show-user-images" checked>
                      <span>Show User Images</span>
                    </label>
                    <label class="pingbash-checkbox-option">
                      <input type="checkbox" id="round-corners" checked>
                      <span>Round Corners</span>
                    </label>
                    <label class="pingbash-checkbox-option">
                      <input type="checkbox" id="show-chat-rules">
                      <span>Show Chat Rules</span>
                    </label>
                    <label class="pingbash-checkbox-option">
                      <input type="checkbox" id="custom-font-size">
                      <span>Custom Font Size</span>
                    </label>
                  </div>
                  <div class="pingbash-form-group" id="font-size-group" style="display: none;">
                    <label for="font-size">Font Size (px)</label>
                    <input type="number" id="font-size" class="pingbash-form-input" value="14" min="10" max="20">
                  </div>
                  <div class="pingbash-form-group" id="corner-radius-group">
                    <label for="corner-radius">Corner Radius (px)</label>
                    <input type="number" id="corner-radius" class="pingbash-form-input" value="8" min="0" max="20">
                  </div>
                </div>
                              </div>
              </div>
          </div>
          <div class="pingbash-popup-footer">
            <button class="pingbash-group-cancel-btn">Cancel</button>
            <button class="pingbash-group-create-btn" disabled>Create Group</button>
          </div>
        </div>
      </div>
      
                <!-- Emoji Picker Modal -->
          <div class="pingbash-emoji-modal" style="display: none;">
            <div class="pingbash-popup-overlay"></div>
            <div class="pingbash-popup-content">
              <div class="pingbash-emoji-picker">
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

          <!-- @ Mention Modal -->
          <div class="pingbash-mention-modal" style="display: none;">
            <div class="pingbash-popup-overlay"></div>
            <div class="pingbash-popup-content">
              <div class="pingbash-mention-dropdown">
                <div class="pingbash-mention-list">
                  <!-- Users will be populated here -->
                </div>
              </div>
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
        word-wrap: break-word;
      }
      
      .pingbash-message-text img {
        max-width: 200px !important;
        max-height: 200px !important;
        border-radius: 8px !important;
        margin: 4px 0 !important;
        display: block !important;
      }
      
      .pingbash-message-text a {
        color: #007bff !important;
        text-decoration: underline !important;
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
        gap: 8px;
        background: #f8f9fa;
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

    // Logo click to create group
    const logo = this.dialog.querySelector('.pingbash-logo');
    console.log('🔍 [Widget] Logo element found:', !!logo, logo);
    
    if (logo) {
      // Add visual indicator that logo is clickable
      logo.style.cursor = 'pointer';
      logo.style.transition = 'opacity 0.2s';
      
      logo.addEventListener('click', (e) => {
        console.log('🔍 [Widget] Logo clicked - opening create new group modal');
        console.log('🔍 [Widget] Event details:', e);
        e.preventDefault();
        e.stopPropagation();
        
        this.showGroupCreationModal();
      });
      
      // Add hover effect
      logo.addEventListener('mouseenter', () => {
        logo.style.opacity = '0.8';
      });
      
      logo.addEventListener('mouseleave', () => {
        logo.style.opacity = '1';
      });
    } else {
      console.error('❌ [Widget] Logo element not found! Available elements:', 
        Array.from(this.dialog.querySelectorAll('img')).map(img => ({
          src: img.src,
          className: img.className,
          alt: img.alt
        }))
      );
    }

    // Close modals when clicking outside (handled by modal overlay clicks)
    // Modal overlays will handle the click outside functionality

    // Message input
    const input = this.dialog.querySelector('.pingbash-message-input');
    const sendBtn = this.dialog.querySelector('.pingbash-send-btn');

    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Handle @ mentions
    input.addEventListener('input', (e) => {
      this.handleInputChange(e);
    });

    input.addEventListener('keydown', (e) => {
      this.handleMentionNavigation(e);
    });

    sendBtn.addEventListener('click', () => this.sendMessage());

    // Media buttons
    const imageBtn = this.dialog.querySelector('.pingbash-image-btn');
    const fileBtn = this.dialog.querySelector('.pingbash-file-btn');
    const emojiBtn = this.dialog.querySelector('.pingbash-emoji-btn');
    const soundBtn = this.dialog.querySelector('.pingbash-sound-btn');

    imageBtn?.addEventListener('click', () => this.handleImageUpload());
    fileBtn?.addEventListener('click', () => this.handleFileUpload());
    emojiBtn?.addEventListener('click', () => this.toggleEmojiPicker());
    soundBtn?.addEventListener('click', () => this.showSoundSettings());

    // Sound popup
    const soundPopup = this.dialog.querySelector('.pingbash-sound-popup');
    const soundCloseBtn = this.dialog.querySelector('.pingbash-popup-close');
    const soundOkBtn = this.dialog.querySelector('.pingbash-sound-ok-btn');
    const soundOverlay = this.dialog.querySelector('.pingbash-popup-overlay');

    soundCloseBtn?.addEventListener('click', () => this.hideSoundSettings());
    soundOkBtn?.addEventListener('click', () => this.saveSoundSettings());
    soundOverlay?.addEventListener('click', () => this.hideSoundSettings());

    // Reply preview close button event listener
    const replyCloseBtn = this.dialog.querySelector('.pingbash-reply-preview-close');
    replyCloseBtn?.addEventListener('click', () => {
      console.log('💬 [Widget] Reply preview close button clicked');
      this.hideReplyPreview();
    });

    // Sign-in modal
    const signinModal = this.dialog.querySelector('.pingbash-signin-modal');
    const signinCloseBtn = signinModal?.querySelector('.pingbash-popup-close');
    const signinSubmitBtn = this.dialog.querySelector('.pingbash-signin-submit-btn');
    const continueAnonBtns = this.dialog.querySelectorAll('.pingbash-continue-anon-btn');
    const signinOverlay = signinModal?.querySelector('.pingbash-popup-overlay');

    console.log('🔍 [Widget] Button elements found:', {
      signinCloseBtn: !!signinCloseBtn,
      signinSubmitBtn: !!signinSubmitBtn,
      continueAnonBtns: continueAnonBtns.length
    });

    // Debug: Add visual indicator to all continue buttons
    continueAnonBtns.forEach((btn, index) => {
      btn.style.border = '2px solid red';
      btn.style.backgroundColor = '#ffcccc';
      console.log(`🔍 [Widget] Continue button ${index + 1} styled for debugging`);
    });

    signinCloseBtn?.addEventListener('click', () => this.hideSigninModal());
    signinSubmitBtn?.addEventListener('click', () => this.handleSignin());

    // Attach event listeners to ALL Continue As Guest buttons
    continueAnonBtns.forEach((continueAnonBtn, index) => {
      console.log(`🔍 [Widget] Adding click listener to Continue As Guest button ${index + 1}`);
      console.log(`🔍 [Widget] Button ${index + 1} properties:`, {
        tagName: continueAnonBtn.tagName,
        className: continueAnonBtn.className,
        disabled: continueAnonBtn.disabled,
        style: continueAnonBtn.style.cssText,
        offsetWidth: continueAnonBtn.offsetWidth,
        offsetHeight: continueAnonBtn.offsetHeight,
        clientWidth: continueAnonBtn.clientWidth,
        clientHeight: continueAnonBtn.clientHeight
      });

      // Try multiple event types to debug
      continueAnonBtn.addEventListener('click', (event) => {
        console.log(`🔍 [Widget] Continue As Guest button ${index + 1} CLICKED!`);
        console.log('🔍 [Widget] Click event details:', {
          target: event.target,
          currentTarget: event.currentTarget,
          type: event.type
        });
        event.preventDefault();
        event.stopPropagation();
        this.continueAsAnonymous();
      });

      continueAnonBtn.addEventListener('mousedown', () => {
        console.log(`🔍 [Widget] Continue As Guest button ${index + 1} MOUSEDOWN!`);
      });

      continueAnonBtn.addEventListener('mouseup', () => {
        console.log(`🔍 [Widget] Continue As Guest button ${index + 1} MOUSEUP!`);
      });

      // Also try direct onclick
      continueAnonBtn.onclick = (event) => {
        console.log(`🔍 [Widget] Continue As Guest button ${index + 1} ONCLICK!`);
        event.preventDefault();
        event.stopPropagation();
        this.continueAsAnonymous();
      };

      // Mark that listener has been attached
      continueAnonBtn._listenerAttached = true;

      console.log(`🔍 [Widget] All event listeners added to Continue As Guest button ${index + 1}`);
    });

    if (continueAnonBtns.length === 0) {
      console.error('❌ [Widget] No Continue As Guest buttons found!');
    }
    signinOverlay?.addEventListener('click', () => this.hideSigninModal());

    // Chat rules popup
    const chatRulesPopup = this.dialog.querySelector('.pingbash-chat-rules-popup');
    const chatRulesCloseBtn = chatRulesPopup?.querySelector('.pingbash-popup-close');
    const chatRulesCloseBtnFooter = this.dialog.querySelector('.pingbash-rules-close-btn');
    const chatRulesEditBtn = this.dialog.querySelector('.pingbash-rules-edit-btn');
    const chatRulesCancelBtn = this.dialog.querySelector('.pingbash-rules-cancel-btn');
    const chatRulesSaveBtn = this.dialog.querySelector('.pingbash-rules-save-btn');
    const chatRulesOverlay = chatRulesPopup?.querySelector('.pingbash-popup-overlay');

    chatRulesCloseBtn?.addEventListener('click', () => this.hideChatRules());
    chatRulesCloseBtnFooter?.addEventListener('click', () => this.hideChatRules());
    chatRulesEditBtn?.addEventListener('click', () => this.editChatRules());
    chatRulesCancelBtn?.addEventListener('click', () => this.cancelEditChatRules());
    chatRulesSaveBtn?.addEventListener('click', () => this.saveChatRules());
    chatRulesOverlay?.addEventListener('click', () => this.hideChatRules());

    // Group creation modal
    const groupCreationModal = this.dialog.querySelector('.pingbash-group-creation-modal');
    const groupCreationCloseBtn = groupCreationModal?.querySelector('.pingbash-popup-close');
    const groupCancelBtn = this.dialog.querySelector('.pingbash-group-cancel-btn');
    const groupCreateBtn = this.dialog.querySelector('.pingbash-group-create-btn');
    const groupCreationOverlay = groupCreationModal?.querySelector('.pingbash-popup-overlay');

    groupCreationCloseBtn?.addEventListener('click', () => this.hideGroupCreationModal());
    groupCancelBtn?.addEventListener('click', () => this.hideGroupCreationModal());
    groupCreateBtn?.addEventListener('click', () => this.createNewGroup());
    groupCreationOverlay?.addEventListener('click', () => this.hideGroupCreationModal());

    // Group creation form interactions
    this.setupGroupCreationForm();

    // Online users icon click
    const onlineUsersContainer = this.dialog.querySelector('.pingbash-online-users-container');
    onlineUsersContainer?.addEventListener('click', () => {
      console.log('👥 [Widget] Online users icon clicked');
      this.showOnlineUsers();
    });

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

      // Request online users after connecting
      setTimeout(() => {
        this.requestOnlineUsers();

        // Set up periodic refresh of online users (every 60 seconds like F version)
        if (this.onlineUsersInterval) {
          clearInterval(this.onlineUsersInterval);
        }
        this.onlineUsersInterval = setInterval(() => {
          this.requestOnlineUsers();
        }, 60000);
      }, 1000);
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

      // Check if the response contains group information that can help us resolve the real ID
      if (response && response.groupId && response.groupId !== this.groupId) {
        console.log('✅ [Widget] Join response contains different group ID:', response.groupId, 'vs current:', this.groupId);
        // This might happen if the backend resolved the hash to a real ID
        this.groupId = response.groupId;
      }
    });

    this.socket.on('join to group', (response) => {
      console.log('🔍 [Widget] join to group response:', response);

      // Check if the response contains group information that can help us resolve the real ID
      if (response && response.groupId && response.groupId !== this.groupId) {
        console.log('✅ [Widget] Join response contains different group ID:', response.groupId, 'vs current:', this.groupId);
        // This might happen if the backend resolved the hash to a real ID
        this.groupId = response.groupId;
      }
    });

    this.socket.on('group updated', (group) => {
      console.log('🔍 [Widget] group updated:', group);
      this.group = group;
      this.groupMembers = group?.members || [];

      // Check if this group update contains the correct ID for our group name
      if (group && group.name && group.id &&
        group.name.toLowerCase() === this.config.groupName.toLowerCase() &&
        group.id !== this.groupId) {

        console.log('✅ [Widget] Group updated event contains correct ID:', group.id, 'for', this.config.groupName);
        console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to real ID:', group.id);

        const oldGroupId = this.groupId;
        this.groupId = group.id;

        // Rejoin with the correct ID to ensure proper message sync
        console.log('🔄 [Widget] Rejoining group with correct ID for better message sync...');
        this.rejoinGroupWithCorrectId();
      }

      // Request online users after getting group data
      if (group && group.id === parseInt(this.groupId)) {
        this.requestOnlineUsers();
      }
    });

    this.socket.on('refresh', (data) => {
      console.log('🔍 [Widget] refresh:', data);
    });

    // Listen for online users
    this.socket.on('get group online users', (userIds) => {
      console.log('👥 [Widget] Online users:', userIds);
      this.onlineUserIds = userIds || [];
      
      // Update the online user count badge
      this.updateOnlineUserCount(this.onlineUserIds.length);
    });

    // Listen for real-time user login/logout events
    this.socket.on('logged new user', (data) => {
      console.log('👥 [Widget] New user logged in:', data);
      // Request fresh online users when someone logs in
      setTimeout(() => {
        this.requestOnlineUsers();
      }, 500);
    });

    this.socket.on('user out', (data) => {
      console.log('👥 [Widget] User logged out:', data);
      // Request fresh online users when someone logs out
      setTimeout(() => {
        this.requestOnlineUsers();
      }, 500);
    });

    // Listen for user disconnect events
    this.socket.on('disconnect', (reason) => {
      console.log('👥 [Widget] User disconnected:', reason);
      // Request fresh online users when someone disconnects
      setTimeout(() => {
        this.requestOnlineUsers();
      }, 500);
    });

    // Listen for new user joining the group
    this.socket.on('new user', (data) => {
      console.log('👥 [Widget] New user joined:', data);
      // Request fresh online users when someone joins
      setTimeout(() => {
        this.requestOnlineUsers();
      }, 500);
    });

    this.socket.on('get fav groups', (groups) => {
      console.log('🔍 [Widget] get fav groups response:', groups?.length, 'groups');
      if (groups && groups.length > 0) {
        console.log('🔍 [Widget] Fav groups:', groups.map(g => `${g.name} (ID: ${g.id})`).join(', '));
      }
      this.handleGroupsReceived(groups);
    });

    this.socket.on('get my groups', (groups) => {
      console.log('🔍 [Widget] get my groups response:', groups?.length, 'groups');
      if (groups && groups.length > 0) {
        console.log('🔍 [Widget] My groups:', groups.map(g => `${g.name} (ID: ${g.id})`).join(', '));
      }
      this.handleGroupsReceived(groups);
    });

    // Chat rules listeners
    this.socket.on('get chat rules', (data) => {
      console.log('🔍 [Widget] [Chat Rules] Received get chat rules:', data);
      this.handleGetChatRules(data);
    });

    this.socket.on('update chat rules', (data) => {
      console.log('🔍 [Widget] [Chat Rules] Received update chat rules:', data);
      this.handleUpdateChatRules(data);
    });

    // Listen for join to group events (when users join/leave groups)
    this.socket.on('join to group', (response) => {
      console.log('👥 [Widget] Someone joined group:', response);
      // Request fresh online users when someone joins the group
      if (response && response.groupId === parseInt(this.groupId)) {
        setTimeout(() => {
          this.requestOnlineUsers();
        }, 500);
      }
    });

    this.socket.on('join to group anon', (response) => {
      console.log('👥 [Widget] Anonymous user joined group:', response);
      // Request fresh online users when anonymous user joins
      if (response && response.groupId === parseInt(this.groupId)) {
        setTimeout(() => {
          this.requestOnlineUsers();
        }, 500);
      }
    });
  }

  async joinGroup() {
    try {
      // Resolve group ID - use known groups
      this.groupId = await this.getGroupIdFromName();

      console.log('🔍 [Widget] Joining group:', this.config.groupName, 'ID:', this.groupId);
      console.log('🔍 [Widget] Connect as authenticated:', !!this.connectAsAuthenticated);
      console.log('🔍 [Widget] Is authenticated:', this.isAuthenticated);

      // Check if we have a pending chat rules trigger waiting for group ID
      this.checkPendingChatRulesTrigger();

      if (this.connectAsAuthenticated && this.authenticatedToken) {
        // Join as authenticated user
        console.log('🔐 [Widget] Joining as authenticated user');
        this.userId = this.authenticatedToken;

        // First, register as logged in user (same as F version)
        console.log('🔍 [Widget] Registering as logged in user...');
        this.socket.emit('user logged', { token: this.authenticatedToken });

        // Request user's groups to get correct group IDs (this will trigger handleGroupsReceived)
        console.log('🔍 [Widget] Requesting user groups to verify group ID...');
        this.socket.emit('get my groups', { token: this.authenticatedToken });
        this.socket.emit('get fav groups', { token: this.authenticatedToken });

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
        this.anonId = this.getAnonId();
        this.currentUserId = this.anonId;

        // Create anonymous token (same format as W version)
        const anonToken = `anonuser${this.config.groupName}${this.anonId}`;
        this.userId = anonToken;

        console.log('🔍 [Widget] Anonymous user ID:', this.anonId);
        console.log('🔍 [Widget] Anonymous token:', anonToken);

        // Store anonymous token in localStorage (same as W version)
        localStorage.setItem('anonToken', anonToken);

        // First register as anonymous user (same as W version)
        this.socket.emit('user logged as annon', { userId: this.anonId });

        // Join the group as anonymous user (same event name as W version)
        this.socket.emit('join to group anon', {
          groupId: parseInt(this.groupId),
          anonId: this.anonId
        });

        // Get messages with anonymous token
        console.log('🔍 [Widget] Emitting GET_GROUP_MSG for group:', this.groupId, 'with token:', anonToken.substring(0, 20) + '...');
        this.socket.emit('get group msg', {
          token: anonToken,
          groupId: parseInt(this.groupId)
        });

        // Trigger chat rules after anonymous user setup (same as W version)
        setTimeout(() => {
          console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after anonymous authentication');
          this.triggerChatRulesAfterLogin(anonToken, 'anonymous');
        }, 1500); // Delay to ensure group state is properly set

        // For anonymous users, try comprehensive group resolution after a short delay
        // This gives time for socket events to potentially provide the correct ID
        setTimeout(async () => {
          if (this.groupId === this.hashCode(this.config.groupName)) {
            console.log('🔍 [Widget] Still using hash ID after 3 seconds, trying comprehensive resolution...');
            await this.tryComprehensiveGroupResolution();
          }
        }, 3000);
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
    console.log('🔍 [Widget] Resolving group ID for:', this.config.groupName);

    // Try multiple approaches to get the real group ID
    let realGroupId = null;

    // Approach 1: Try the public API (if it works)
    try {
      console.log('🔍 [Widget] Trying public API approach...');
      const response = await fetch(`${this.config.apiUrl}/api/public/get/group-by-name/${encodeURIComponent(this.config.groupName)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const groupData = await response.json();
        console.log('✅ [Widget] Public API resolved group:', groupData);
        realGroupId = groupData.id;
      } else {
        console.log('❌ [Widget] Public API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ [Widget] Public API error:', error.message);
    }

    // Approach 2: If authenticated, try private API
    if (!realGroupId && this.isAuthenticated && this.authenticatedToken) {
      try {
        console.log('🔍 [Widget] Trying private API approach...');
        const response = await fetch(`${this.config.apiUrl}/api/private/get/groups/getGroup`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': this.authenticatedToken
          },
          body: JSON.stringify({
            groupName: this.config.groupName,
            userId: parseInt(this.currentUserId)
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.group && result.group.id) {
            console.log('✅ [Widget] Private API resolved group:', result.group);
            realGroupId = result.group.id;
          }
        } else {
          console.log('❌ [Widget] Private API failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.log('❌ [Widget] Private API error:', error.message);
      }
    }

    // If we found the real ID, use it; otherwise fall back to hash
    if (realGroupId) {
      console.log('✅ [Widget] Using real group ID:', realGroupId, 'for', this.config.groupName);
      return realGroupId;
    } else {
      const hashId = this.hashCode(this.config.groupName);
      console.log('🔍 [Widget] Using hash-based ID as fallback:', hashId, 'for', this.config.groupName);
      console.log('🔍 [Widget] Real group ID will be resolved later via socket events if possible');
      return hashId;
    }
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
      const safeMessage = this.makeTextSafe(message);
      const payload = {
        groupId: parseInt(this.groupId),  // Ensure groupId is a number
        msg: safeMessage,
        token: this.userId,
        receiverId: null,
        parent_id: this.replyingTo ? this.replyingTo.id : null
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
      const safeMessage = this.makeTextSafe(message);
      const payload = {
        groupId: parseInt(this.groupId),  // Ensure groupId is a number
        msg: safeMessage,
        anonId: this.anonId,
        receiverId: null,
        parent_id: this.replyingTo ? this.replyingTo.id : null
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

    // Clear reply state after sending
    if (this.replyingTo) {
      this.hideReplyPreview();
    }

    console.log('🔍 [Widget] Input cleared, message sending complete');
  }

  // Setup auto-scroll monitoring for height changes
  setupAutoScroll() {
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    if (!messagesList) return;

    // Use ResizeObserver to monitor height changes
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          // Check if we should auto-scroll (user is at bottom)
          const element = entry.target;
          const isAtBottom = element.scrollTop >= (element.scrollHeight - element.clientHeight - 50);
          
          if (isAtBottom) {
            console.log('📜 [Widget] Height changed, auto-scrolling to bottom');
            this.scrollToBottom();
          }
        }
      });
      
      this.resizeObserver.observe(messagesList);
      console.log('📜 [Widget] Auto-scroll monitoring enabled');
    }

    // Also monitor for new child elements (MutationObserver)
    if (window.MutationObserver) {
      this.mutationObserver = new MutationObserver((mutations) => {
        let shouldScroll = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            shouldScroll = true;
          }
        });
        
        if (shouldScroll) {
          console.log('📜 [Widget] New messages added, scrolling to bottom');
          this.scrollToBottomAfterImages();
        }
      });
      
      this.mutationObserver.observe(messagesList, {
        childList: true,
        subtree: true
      });
      console.log('📜 [Widget] Message monitoring enabled');
    }
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

        // Debug: Show last few message IDs from both sets
        const lastFewExisting = this.messages.slice(-3).map(m => ({ id: m.Id, content: m.Content?.substring(0, 30) }));
        const lastFewNew = newMessages.slice(-3).map(m => ({ id: m.Id, content: m.Content?.substring(0, 30) }));
        console.log('🔍 [Widget] Last few existing messages:', lastFewExisting);
        console.log('🔍 [Widget] Last few new messages:', lastFewNew);

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
        this.scrollToBottomAfterImages();
      } else {
        console.log('🔍 [Widget] No new messages to add');
      }
    }

    // Only scroll for initial load
    if (isInitialLoad) {
      this.scrollToBottomAfterImages();
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
      this.scrollToBottomAfterImages();
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

    // Format sender name same as F version
    let senderName;
    if (message.Sender_Id && message.Sender_Id > 100000) {
      // Anonymous user - show as anon + last 3 digits (same as F version)
      senderName = "anon" + String(message.Sender_Id).slice(-3);
      console.log(`🔍 [Widget] Anonymous user ${message.Sender_Id} displayed as: ${senderName}`);
    } else {
      // Regular user - use sender_name or fallback
      senderName = message.sender_name || 'Anonymous';
      console.log(`🔍 [Widget] Regular user ${message.Sender_Id} displayed as: ${senderName}`);
    }
    console.log('🔍 [Widget] Message content:', message.Content);
    const escapedContent = this.escapeForAttribute(message.Content);
    messageEl.innerHTML = `
      <div class="pingbash-message-content">
        ${message.parent_id ? this.renderReplyIndicator(message.parent_id) : ''}
        <div class="pingbash-message-header">
          ${!isOwn ? `<span class="pingbash-message-sender">${senderName}</span>` : ''}
          <span class="pingbash-message-time">${time}</span>
          <button class="pingbash-message-reply" onclick="window.pingbashWidget.replyToMessage(${message.Id}, '${senderName.replace(/'/g, "\\'")}', '${escapedContent}')">Reply</button>
        </div>
        <div class="pingbash-message-text">${this.renderMessageContent(message.Content)}</div>
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



  getReplyContentPreview(content) {
    if (!content) return '';

    // Handle images
    if (content.includes('<img')) {
      return content;
    }

    // Handle files
    if (content.includes('<a') || content.includes("&lt;a")) {
      return content;
    }

    // Handle regular text - strip HTML and limit length
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
  }

  // Make text safe for database (same as W version)
  makeTextSafe(str) {
    return str ? str.replace(/\\/g, '\\\\').replace(/'/g, "''") : "";
  }

  // Render message content with HTML support (same logic as W version)
  renderMessageContent(content) {
    if (!content) return '';

    // Check if content contains HTML tags (images, links, etc.)
    if (content.includes('<img') || content.includes('<a') || content.includes('gif::') || content.includes('sticker::')) {
      console.log('🖼️ [Widget] Rendering HTML content:', content.substring(0, 50) + '...');

      // Handle different content types (same as W version)
      if (content.includes('<img')) {
        // Image content - render as HTML
        return content;
      } else if (content.includes('gif::https://')) {
        // GIF content
        const gifUrl = content.slice('gif::'.length);
        return `<img src="${gifUrl}" style="width: 160px;" />`;
      } else if (content.includes('sticker::')) {
        // Sticker content (would need Lottie implementation)
        return `<div>🎭 Sticker: ${content.slice('sticker::'.length)}</div>`;
      } else if (content.includes('.gif') && content.includes('https://') && !content.includes(' ')) {
        // Direct GIF URL
        return `<img src="${content}" style="width: 160px;" />`;
      } else {
        // Other HTML content
        return content;
      }
    } else {
      // Plain text - escape HTML and convert URLs to links
      const escaped = this.escapeHtml(content);
      return escaped.replace(
        /(https?:\/\/[^\s]+)/g,
                  '<a href="$1" target="_blank" rel="noopener noreferrer" >$1</a>'
      );
    }
  }

  scrollToBottom() {
    // Use requestAnimationFrame to ensure DOM is updated before scrolling
    requestAnimationFrame(() => {
      const messagesList = this.dialog.querySelector('.pingbash-messages-list');
      if (messagesList) {
        messagesList.scrollTop = messagesList.scrollHeight;
        console.log('📜 [Widget] Scrolled to bottom:', messagesList.scrollTop, '/', messagesList.scrollHeight);
      }
    });
  }

  // Force immediate scroll to bottom
  forceScrollToBottom() {
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    if (messagesList) {
      messagesList.scrollTop = messagesList.scrollHeight;
      console.log('📜 [Widget] Force scrolled to bottom:', messagesList.scrollTop, '/', messagesList.scrollHeight);
    }
  }

  // Smart scroll that scrolls immediately and again after images load
  scrollToBottomAfterImages() {
    const messagesList = this.dialog.querySelector('.pingbash-messages-list');
    if (!messagesList) return;

    // FIRST: Scroll immediately to current height
    this.forceScrollToBottom();

    // THEN: Set up monitoring for image loading
    const images = messagesList.querySelectorAll('img');
    console.log('📜 [Widget] Found', images.length, 'images to monitor');

    if (images.length === 0) {
      // No images, we're done
      return;
    }

    let loadedImages = 0;
    const totalImages = images.length;

    const checkAllLoaded = () => {
      loadedImages++;
      console.log('📜 [Widget] Image loaded:', loadedImages, '/', totalImages);
      // Scroll after each image loads (not just when all are loaded)
      this.scrollToBottom();
      
      if (loadedImages >= totalImages) {
        console.log('📜 [Widget] All images loaded, final scroll');
        // Final scroll after all images are loaded
        setTimeout(() => this.scrollToBottom(), 100);
      }
    };

    // Set up load listeners for each image
    images.forEach((img, index) => {
      if (img.complete) {
        // Image already loaded
        console.log('📜 [Widget] Image', index, 'already loaded');
        checkAllLoaded();
      } else {
        // Wait for image to load
        img.addEventListener('load', checkAllLoaded, { once: true });
        img.addEventListener('error', checkAllLoaded, { once: true }); // Also scroll on error
      }
    });

    // Fallback: scroll after 2 seconds even if images haven't loaded
    setTimeout(() => {
      this.scrollToBottom();
    }, 2000);
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

  updatePosition(position) {
    // Update the position configuration
    this.config.position = position;

    // Remove all position classes
    this.button.classList.remove('top-left', 'top-right', 'bottom-left', 'bottom-right');
    this.dialog.classList.remove('top-left', 'top-right', 'bottom-left', 'bottom-right');

    // Add the new position class
    this.button.classList.add(position);
    this.dialog.classList.add(position);

    console.log('🔄 [Widget] Position updated to:', position);
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

    switch (action) {
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
      case 'chat-rules':
        this.showChatRules();
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

  toggleEmojiPicker() {
    console.log('😀 [Widget] Emoji button clicked');
    const emojiModal = this.dialog.querySelector('.pingbash-emoji-modal');
    if (!emojiModal) return;

    const isVisible = emojiModal.style.display !== 'none';

    if (isVisible) {
      // Hide the picker
      emojiModal.style.display = 'none';
    } else {
      // Show the picker
      emojiModal.style.display = 'flex';

      // Only attach listeners once when showing
      this.attachEmojiListeners();
      this.attachEmojiOverlayListener();
    }
  }

  attachEmojiListeners() {
    // Remove all existing listeners first
    const emojiElements = this.dialog.querySelectorAll('.pingbash-emoji');
    emojiElements.forEach(emoji => {
      // Clone the element to remove all event listeners
      const newEmoji = emoji.cloneNode(true);
      emoji.parentNode.replaceChild(newEmoji, emoji);
    });

    // Now add listeners to the clean elements
    const cleanEmojiElements = this.dialog.querySelectorAll('.pingbash-emoji');
    cleanEmojiElements.forEach(emoji => {
      emoji.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleEmojiClick(e);
      }, { once: false });
    });
  }

  handleEmojiClick(e) {
    // Prevent multiple clicks with a more robust check
    const now = Date.now();
    if (this.lastEmojiClickTime && (now - this.lastEmojiClickTime) < 300) {
      console.log('😀 [Widget] Emoji click ignored - too fast');
      return;
    }
    this.lastEmojiClickTime = now;

    const emoji = e.target.dataset.emoji;
    if (!emoji) {
      console.log('😀 [Widget] No emoji data found');
      return;
    }

    console.log('😀 [Widget] Emoji selected:', emoji);
    const input = this.dialog.querySelector('.pingbash-message-input');
    if (input) {
      // Insert emoji at cursor position
      const cursorPos = input.selectionStart;
      const textBefore = input.value.substring(0, cursorPos);
      const textAfter = input.value.substring(input.selectionEnd);
      input.value = textBefore + emoji + textAfter;

      // Move cursor after the emoji
      const newCursorPos = cursorPos + emoji.length;
      input.setSelectionRange(newCursorPos, newCursorPos);
      input.focus();
    }

    // Hide emoji picker
    this.hideEmojiPicker();
  }

  // @ Mention functionality
  handleInputChange(e) {
    const input = e.target;
    const value = input.value;
    const cursorPos = input.selectionStart;

    // Find @ symbol before cursor
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      const searchTerm = textBeforeCursor.substring(atIndex + 1);

      // Only show dropdown if @ is at start or after space, and search term is reasonable
      const charBeforeAt = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
      if ((charBeforeAt === ' ' || atIndex === 0) && searchTerm.length <= 20) {
        this.showMentionDropdown(searchTerm, atIndex);
        return;
      }
    }

    // Hide dropdown if no valid @ mention
    this.hideMentionDropdown();
  }

  handleMentionNavigation(e) {
    const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
    if (mentionModal.style.display === 'none') return;

    const items = mentionModal.querySelectorAll('.pingbash-mention-item');
    const selected = mentionModal.querySelector('.pingbash-mention-item.selected');
    let selectedIndex = selected ? Array.from(items).indexOf(selected) : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        this.updateMentionSelection(items, selectedIndex);
        break;

      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        this.updateMentionSelection(items, selectedIndex);
        break;

      case 'Enter':
      case 'Tab':
        e.preventDefault();
        if (selected) {
          this.selectMention(selected);
        }
        break;

      case 'Escape':
        this.hideMentionDropdown();
        break;
    }
  }

  showMentionDropdown(searchTerm, atIndex) {
    console.log('@ [Widget] Showing mention dropdown for:', searchTerm);

    // Get online users (mock data for now - in real app would come from socket)
    const onlineUsers = this.getOnlineUsers();
    const filteredUsers = onlineUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
    const list = mentionModal.querySelector('.pingbash-mention-list');

    if (filteredUsers.length === 0) {
      this.hideMentionDropdown();
      return;
    }

    // Store the atIndex for later use
    this.currentAtIndex = atIndex;

    // Populate dropdown
    list.innerHTML = filteredUsers.map((user, index) => `
      <div class="pingbash-mention-item ${index === 0 ? 'selected' : ''}" data-user-id="${user.id}" data-user-name="${user.name}" data-at-index="${atIndex}">
        <div class="pingbash-mention-avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div class="pingbash-mention-name">${user.name}</div>
      </div>
    `).join('');

    // Add click listeners
    list.querySelectorAll('.pingbash-mention-item').forEach(item => {
      item.addEventListener('click', () => this.selectMention(item));
    });

    // Add overlay click listener
    this.attachMentionOverlayListener();

    mentionModal.style.display = 'flex';
  }

  hideMentionDropdown() {
    const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
    mentionModal.style.display = 'none';
  }

  updateMentionSelection(items, selectedIndex) {
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === selectedIndex);
    });
  }

  selectMention(item) {
    const userName = item.dataset.userName;
    const atIndex = parseInt(item.dataset.atIndex);
    const input = this.dialog.querySelector('.pingbash-message-input');

    const value = input.value;
    const cursorPos = input.selectionStart;

    // Find the end of the current @ mention
    const textAfterAt = value.substring(atIndex + 1);
    const spaceIndex = textAfterAt.search(/\s/);
    const endIndex = spaceIndex === -1 ? value.length : atIndex + 1 + spaceIndex;

    // Replace the @ mention with the selected user
    const newValue = value.substring(0, atIndex) + `@${userName} ` + value.substring(endIndex);
    input.value = newValue;

    // Position cursor after the mention
    const newCursorPos = atIndex + userName.length + 2;
    input.setSelectionRange(newCursorPos, newCursorPos);
    input.focus();

    this.hideMentionDropdown();
  }

  requestOnlineUsers() {
    // Request online users from backend (now public endpoint)
    if (!this.socket || !this.isConnected || !this.groupId) {
      console.log('👥 [Widget] Cannot request online users - missing socket, connection, or groupId');
      return;
    }

    // Prevent too frequent requests
    const now = Date.now();
    if (this.lastOnlineUsersRequest && (now - this.lastOnlineUsersRequest) < 2000) {
      console.log('👥 [Widget] Skipping online users request - too frequent');
      return;
    }
    this.lastOnlineUsersRequest = now;

    console.log('👥 [Widget] Requesting online users for group:', this.groupId, '(public endpoint)');
    // No token needed - endpoint is now public
    this.socket.emit('get group online users', { groupId: parseInt(this.groupId) });
  }

  getOnlineUsers() {
    // Get real online users from socket data mapped to group members
    let onlineUsers = [];

    // First, try to map online user IDs to actual member names
    if (this.onlineUserIds && this.onlineUserIds.length > 0 && this.groupMembers && this.groupMembers.length > 0) {
      console.log('👥 [Widget] Mapping online user IDs to names:', this.onlineUserIds);
      console.log('👥 [Widget] Available group members:', this.groupMembers.length);

      onlineUsers = this.onlineUserIds
        .map(userId => {
          // Find member info from group members
          const member = this.groupMembers.find(m => m.id === userId);
          if (member) {
            return { id: member.id, name: member.name };
          } else {
            const last3Digits = String(userId).slice(-3);
            return { id: userId, name: `anon${last3Digits}` };
          }
        })
        .filter(user => user.name !== `User ${user.id}`); // Remove fallback names if possible
    }

    // If no online users mapped, use all group members as fallback
    if (onlineUsers.length === 0 && this.groupMembers && this.groupMembers.length > 0) {
      console.log('👥 [Widget] Using all group members as fallback');
      onlineUsers = this.groupMembers.map(member => ({
        id: member.id,
        name: member.name
      }));
    }

    // Final fallback to mock data if no real data available
    if (onlineUsers.length === 0) {
      console.log('👥 [Widget] Using mock data as final fallback');
      onlineUsers = [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Smith' },
        { id: 3, name: 'Mike Johnson' },
        { id: 4, name: 'Sarah Wilson' },
        { id: 5, name: 'David Brown' }
      ];
    }

    console.log('👥 [Widget] Final online users list:', onlineUsers);
    return onlineUsers;
  }

  hideEmojiPicker() {
    const emojiModal = this.dialog.querySelector('.pingbash-emoji-modal');
    emojiModal.style.display = 'none';
  }

  attachEmojiOverlayListener() {
    const emojiModal = this.dialog.querySelector('.pingbash-emoji-modal');
    const emojiOverlay = emojiModal.querySelector('.pingbash-popup-overlay');

    // Remove existing listener
    emojiOverlay.removeEventListener('click', this.handleEmojiOverlayClick);

    // Add new listener
    emojiOverlay.addEventListener('click', () => {
      this.hideEmojiPicker();
    });
  }

  attachMentionOverlayListener() {
    const mentionModal = this.dialog.querySelector('.pingbash-mention-modal');
    const mentionOverlay = mentionModal.querySelector('.pingbash-popup-overlay');

    // Remove existing listener
    mentionOverlay.removeEventListener('click', this.handleMentionOverlayClick);

    // Add new listener
    mentionOverlay.addEventListener('click', () => {
      this.hideMentionDropdown();
    });
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

      console.log('📤 [Widget] Upload response status:', uploadResponse.status);
      console.log('📤 [Widget] Upload response headers:', Object.fromEntries(uploadResponse.headers.entries()));

      // Get response text first to debug JSON parsing issues
      const responseText = await uploadResponse.text();
      console.log('📤 [Widget] Raw response text:', responseText);
      console.log('📤 [Widget] Response text length:', responseText.length);

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.status} - ${responseText}`);
      }

      // Try to parse JSON
      let uploadResult;
      try {
        uploadResult = responseText;
        console.log('✅ [Widget] File uploaded:', uploadResult);
      } catch (jsonError) {
        console.error('❌ [Widget] JSON parse error:', jsonError);
        console.error('❌ [Widget] Response that failed to parse:', responseText);
        throw new Error(`Invalid JSON response: ${jsonError.message}`);
      }

      // Send message with file reference (exact same format as W version)
      const messageContent = type === 'image'
        ? `<img src='${this.config.apiUrl}/uploads/chats/images/${uploadResult}' alt="" />`
        : `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" href=${this.config.apiUrl}/uploads/chats/files/${uploadResult}>File Name : ${uploadResult}</a>`;

      console.log('📤 [Widget] Sending file message:', messageContent);

      // Use the same socket event format as regular messages (exact same as F version)
      const safeMessage = this.makeTextSafe(messageContent);

      if (this.isAuthenticated && this.authenticatedToken) {
        console.log('📤 [Widget] Sending authenticated file message via socket');
        console.log('📤 [Widget] Socket payload:', {
          groupId: parseInt(this.groupId),
          msg: safeMessage,
          token: this.authenticatedToken ? 'present' : 'missing',
          receiverId: null,
          parent_id: null
        });
        this.socket.emit('send group msg', {
          groupId: parseInt(this.groupId),
          msg: safeMessage,
          token: this.authenticatedToken,
          receiverId: null,
          parent_id: null
        });

        // Listen for any error responses
        this.socket.once('error', (error) => {
          console.error('❌ [Widget] Socket error after sending file message:', error);
        });

        this.socket.once('forbidden', (data) => {
          console.error('❌ [Widget] Forbidden response after sending file message:', data);
        });
      } else {
        console.log('📤 [Widget] Sending anonymous file message via socket');
        console.log('📤 [Widget] Socket payload:', {
          groupId: parseInt(this.groupId),
          msg: safeMessage,
          anonId: this.anonId,
          receiverId: null,
          parent_id: null
        });
        this.socket.emit('send group msg anon', {
          groupId: parseInt(this.groupId),
          msg: safeMessage,
          anonId: this.anonId,
          receiverId: null,
          parent_id: null
        });
      }

      this.hideUploadProgress();

      // Force refresh messages after file upload to ensure it appears
      setTimeout(() => {
        console.log('📤 [Widget] Force refreshing messages after file upload');
        this.socket.emit('get group msg', {
          token: this.isAuthenticated ? this.authenticatedToken : this.userId,
          groupId: parseInt(this.groupId)
        });
      }, 1000);

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

    switch (action) {
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
      case 'chat-rules':
        this.showChatRules();
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
    console.log('🔍 [Widget] showSigninModal called');
    const modal = this.dialog.querySelector('.pingbash-signin-modal');
    modal.style.display = 'flex';

    // Re-attach event listeners when modal is shown (in case they got lost)
    setTimeout(() => {
      const continueAnonBtns = this.dialog.querySelectorAll('.pingbash-continue-anon-btn');
      console.log('🔍 [Widget] Re-checking Continue As Guest buttons in showSigninModal:', continueAnonBtns.length);

      continueAnonBtns.forEach((continueAnonBtn, index) => {
        if (continueAnonBtn && !continueAnonBtn._listenerAttached) {
          console.log(`🔍 [Widget] Re-attaching event listener to Continue As Guest button ${index + 1}`);
          continueAnonBtn.addEventListener('click', (event) => {
            console.log(`🔍 [Widget] Continue As Guest button ${index + 1} CLICKED (from showSigninModal)!`);
            event.preventDefault();
            event.stopPropagation();
            this.continueAsAnonymous();
          });
          continueAnonBtn._listenerAttached = true;
        }
      });
    }, 100);
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

      // Trigger chat rules after successful login (same as W version)
      setTimeout(() => {
        console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after logged-in authentication');
        console.log('🔍 [Widget] [Chat Rules] Current state - groupId:', this.groupId, 'socket connected:', this.socket?.connected);
        this.triggerChatRulesAfterLogin(result.token, 'logged-in');
      }, 1500); // Delay to ensure group state is properly set

    } catch (error) {
      console.error('❌ [Widget] Sign in error:', error);
      this.showError('Sign in failed. Please check your credentials.');
    }
  }

  continueAsAnonymous() {
    console.log('👤 [Widget] Continuing as anonymous user - START');

    try {
      this.hideSigninModal();
      console.log('👤 [Widget] Sign-in modal hidden');

      this.isAuthenticated = false;
      this.connectAsAuthenticated = false;
      this.authenticatedToken = null;
      console.log('👤 [Widget] Authentication state reset');

      // Generate anonymous ID using same method as W version
      const anonId = this.getAnonId();
      console.log("=== Anon Id ====", anonId);

      // Set anonymous user state (same as W version)
      this.anonId = anonId;
      this.currentUserId = anonId;

      // Create anonymous token (same format as W version)
      const anonToken = `anonuser${this.config.groupName}${anonId}`;
      this.userId = anonToken;

      // Store anonymous token in localStorage (same as W version)
      localStorage.setItem('anonToken', anonToken);

      // Initialize socket for anonymous user
      this.initializeSocket();

      // Register as anonymous user (same as W version)
      if (this.socket && this.socket.connected) {
        console.log('👤 [Widget] Registering as anonymous user with ID:', anonId);
        this.socket.emit('user logged as annon', { userId: anonId });
      } else {
        // If socket not ready, register after connection
        setTimeout(() => {
          if (this.socket && this.socket.connected) {
            console.log('👤 [Widget] Registering as anonymous user with ID (delayed):', anonId);
            this.socket.emit('user logged as annon', { userId: anonId });
          }
        }, 1000);
      }

      // Trigger chat rules after manual anonymous selection (same as W version)
      setTimeout(() => {
        console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after manual anonymous selection');
        this.triggerChatRulesAfterLogin(anonToken, 'anonymous');
      }, 1500); // Delay to ensure anonymous registration completes

      console.log('👤 [Widget] Continuing as anonymous user - COMPLETED');

    } catch (error) {
      console.error('❌ [Widget] Error in continueAsAnonymous:', error);
    }
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

  // Chat rules functions (same as W version)
  getChatRules() {
    if (!this.socket || !this.isConnected) return;

    console.log('🔍 [Widget] [Chat Rules] getChatRules called with groupId:', this.groupId, 'token:', this.isAuthenticated ? 'Available' : 'Missing');

    if (this.isAuthenticated && this.authenticatedToken && this.groupId) {
      this.socket.emit('get chat rules', {
        token: this.authenticatedToken,
        groupId: parseInt(this.groupId)
      });
      console.log('🔍 [Widget] [Chat Rules] Emitted get chat rules event');
    } else {
      console.log('🔍 [Widget] [Chat Rules] Cannot emit get chat rules - missing token or groupId');
    }
  }

  updateChatRules(chatRules, showChatRules = true) {
    if (!this.socket || !this.isConnected) return;

    console.log('🔍 [Widget] [Chat Rules] updateChatRules called with:', {
      groupId: this.groupId,
      chatRules: chatRules?.length,
      showChatRules
    });

    if (this.isAuthenticated && this.authenticatedToken && this.groupId) {
      this.socket.emit('update chat rules', {
        token: this.authenticatedToken,
        groupId: parseInt(this.groupId),
        chatRules,
        showChatRules
      });
      console.log('🔍 [Widget] [Chat Rules] Emitted update chat rules event');
    } else {
      console.log('🔍 [Widget] [Chat Rules] Cannot emit update chat rules - missing token or groupId');
    }
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

  // Chat rules popup functions
  showChatRules() {
    console.log('📋 [Widget] [Chat Rules] Showing chat rules');

    // Set group name in popup
    const groupNameDisplay = this.dialog.querySelector('.pingbash-group-name-display');
    if (groupNameDisplay) {
      groupNameDisplay.textContent = this.config.groupName || 'Group';
    }

    // Check if user is creator (same logic as W version)
    this.isCreator = this.currentUserId && this.group && (this.currentUserId == this.group.creater_id);
    
    console.log('📋 [Widget] [Chat Rules] Creator check:', {
      currentUserId: this.currentUserId,
      groupCreatorId: this.group?.creater_id,
      isCreator: this.isCreator,
      group: this.group
    });

    // Show/hide edit button based on creator status
    const editBtn = this.dialog.querySelector('.pingbash-rules-edit-btn');
    if (editBtn) {
      editBtn.style.display = this.isCreator ? 'block' : 'none';
      console.log('📋 [Widget] [Chat Rules] Edit button display:', editBtn.style.display);
    } else {
      console.error('📋 [Widget] [Chat Rules] Edit button not found in DOM');
    }

    // Load current rules if authenticated
    if (this.isAuthenticated) {
      this.getChatRules();
    } else {
      // Show default message for anonymous users
      this.displayChatRules('');
    }

    // Show the popup
    const popup = this.dialog.querySelector('.pingbash-chat-rules-popup');
    popup.style.display = 'flex';
  }

  hideChatRules() {
    const popup = this.dialog.querySelector('.pingbash-chat-rules-popup');
    popup.style.display = 'none';

    // Mark rules as seen when popup is closed (same as W version)
    if (this.groupId) {
      this.markRulesAsSeen(this.groupId);
    }
  }

  displayChatRules(rules) {
    console.log('📋 [Widget] [Chat Rules] Displaying rules:', rules?.length || 0, 'characters');

    this.chatRules = rules || '';

    const rulesText = this.dialog.querySelector('.pingbash-rules-text');
    const noRulesText = this.dialog.querySelector('.pingbash-no-rules-text');
    const rulesTextarea = this.dialog.querySelector('.pingbash-rules-textarea');

    if (this.chatRules.trim()) {
      rulesText.textContent = this.chatRules;
      rulesText.style.display = 'block';
      noRulesText.style.display = 'none';
    } else {
      rulesText.style.display = 'none';
      noRulesText.style.display = 'flex';
    }

    // Update textarea with current rules
    if (rulesTextarea) {
      rulesTextarea.value = this.chatRules;
    }
  }

  editChatRules() {
    console.log('📋 [Widget] [Chat Rules] Entering edit mode');

    const rulesDisplay = this.dialog.querySelector('.pingbash-rules-display');
    const rulesEdit = this.dialog.querySelector('.pingbash-rules-edit');
    const viewFooter = this.dialog.querySelector('.pingbash-rules-view-footer');
    const editFooter = this.dialog.querySelector('.pingbash-rules-edit-footer');

    rulesDisplay.style.display = 'none';
    rulesEdit.style.display = 'block';
    viewFooter.style.display = 'none';
    editFooter.style.display = 'flex';

    // Focus the textarea
    const textarea = this.dialog.querySelector('.pingbash-rules-textarea');
    if (textarea) {
      textarea.focus();
    }
  }

  cancelEditChatRules() {
    console.log('📋 [Widget] [Chat Rules] Cancelling edit mode');

    const rulesDisplay = this.dialog.querySelector('.pingbash-rules-display');
    const rulesEdit = this.dialog.querySelector('.pingbash-rules-edit');
    const viewFooter = this.dialog.querySelector('.pingbash-rules-view-footer');
    const editFooter = this.dialog.querySelector('.pingbash-rules-edit-footer');
    const textarea = this.dialog.querySelector('.pingbash-rules-textarea');

    // Reset textarea to original value
    if (textarea) {
      textarea.value = this.chatRules;
    }

    rulesDisplay.style.display = 'block';
    rulesEdit.style.display = 'none';
    viewFooter.style.display = 'flex';
    editFooter.style.display = 'none';
  }

  saveChatRules() {
    console.log('📋 [Widget] [Chat Rules] Saving chat rules');

    const textarea = this.dialog.querySelector('.pingbash-rules-textarea');
    if (!textarea) return;

    const newRules = textarea.value.trim();

    // Update chat rules via socket
    this.updateChatRules(newRules, true);

    // Update local state
    this.chatRules = newRules;
    this.displayChatRules(newRules);

    // Exit edit mode
    this.cancelEditChatRules();
  }

  // Socket event handlers for chat rules
  handleGetChatRules(data) {
    console.log('📋 [Widget] [Chat Rules] Received chat rules data:', data);

    const rules = data.chatRules || '';
    this.displayChatRules(rules);

    // Check if we have a pending display request after authentication (same as W version)
    if (this.pendingChatRulesDisplay.groupId === this.groupId &&
      this.pendingChatRulesDisplay.userType &&
      Date.now() - this.pendingChatRulesDisplay.timestamp < 10000) { // 10 second timeout

      console.log('🔍 [Widget] [Chat Rules] Checking pending display after authentication');

      const isCreator = this.pendingChatRulesDisplay.userType === 'logged-in' &&
        this.currentUserId &&
        parseInt(this.currentUserId) === (this.group?.creater_id || this.group?.creator_id);
      const hasSeenRules = this.groupId ? this.hasSeenRulesForGroup[this.groupId] : false;

      console.log('🔍 [Widget] [Chat Rules] Post-auth display conditions:', {
        userType: this.pendingChatRulesDisplay.userType,
        currentUserId: this.currentUserId,
        isCreator,
        hasSeenRules,
        groupId: this.groupId,
        showChatRules: data.showChatRules,
        hasRules: data.chatRules && data.chatRules.trim().length > 0
      });

      // Check if we should show rules (same conditions as W version)
      if (data.showChatRules &&
        data.chatRules &&
        data.chatRules.trim().length > 0 &&
        !hasSeenRules &&
        !isCreator) {

        console.log('🔍 [Widget] [Chat Rules] Auto-showing rules after', this.pendingChatRulesDisplay.userType, 'authentication');

        // Show the chat rules popup automatically
        setTimeout(() => {
          this.showChatRules();
          this.markRulesAsSeen(this.groupId);
        }, 500); // Small delay to ensure UI is ready

        // Clear pending state
        this.pendingChatRulesDisplay = {
          groupId: null,
          userType: null,
          timestamp: 0
        };
      } else {
        console.log('🔍 [Widget] [Chat Rules] Not showing rules after authentication - conditions not met');
        // Clear pending state even if not showing
        this.pendingChatRulesDisplay = {
          groupId: null,
          userType: null,
          timestamp: 0
        };
      }
    } else {
      console.log('🔍 [Widget] [Chat Rules] Rules loaded and stored, no pending authentication trigger');
    }
  }

  handleUpdateChatRules(data) {
    console.log('📋 [Widget] [Chat Rules] Chat rules updated:', data);

    // Refresh the rules display
    if (this.isAuthenticated) {
      this.getChatRules();
    }
  }

  // Load seen rules from localStorage (same as W version)
  loadSeenRules() {
    try {
      const stored = localStorage.getItem('pingbash_widget_seen_rules');
      const result = stored ? JSON.parse(stored) : {};
      console.log('🔍 [Widget] [Chat Rules] Loaded seen rules from localStorage:', result);
      return result;
    } catch (error) {
      console.log('🔍 [Widget] Error loading seen rules:', error);
      return {};
    }
  }

  // Mark rules as seen for a group (same as W version)
  markRulesAsSeen(groupId) {
    if (!groupId) return;

    console.log('🔍 [Widget] [Chat Rules] Marking rules as seen for group:', groupId);
    this.hasSeenRulesForGroup[groupId] = true;

    try {
      localStorage.setItem('pingbash_widget_seen_rules', JSON.stringify(this.hasSeenRulesForGroup));
    } catch (error) {
      console.log('🔍 [Widget] Error saving seen rules:', error);
    }
  }

  // Generate anonymous ID using same method as W version
  getBrowserFingerprint() {
    return [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join('::');
  }

  hashStringToNumber(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash >>> 0); // Unsigned 32-bit number
  }

  getAnonId() {
    const fingerprint = this.getBrowserFingerprint();
    const anonId = this.hashStringToNumber(fingerprint);
    return anonId % 1000000000;
  }

  // Check if there's a pending chat rules trigger waiting for group ID
  checkPendingChatRulesTrigger() {
    console.log('🔍 [Widget] [Chat Rules] Checking pending trigger:', {
      hasPending: !!this.pendingChatRulesDisplay,
      pendingGroupId: this.pendingChatRulesDisplay?.groupId,
      pendingUserType: this.pendingChatRulesDisplay?.userType,
      currentGroupId: this.groupId,
      timeDiff: this.pendingChatRulesDisplay?.timestamp ? Date.now() - this.pendingChatRulesDisplay.timestamp : 'N/A'
    });

    if (this.pendingChatRulesDisplay &&
      this.pendingChatRulesDisplay.groupId === null &&
      this.pendingChatRulesDisplay.userType &&
      this.groupId &&
      Date.now() - this.pendingChatRulesDisplay.timestamp < 30000) { // 30 second timeout

      console.log('🔍 [Widget] [Chat Rules] Found pending trigger, executing now with group:', this.groupId);

      // Update the pending state with the real group ID
      this.pendingChatRulesDisplay.groupId = this.groupId;

      // Load chat rules
      this.getChatRules();
    }
  }

  // Trigger chat rules after authentication (same as W version)
  triggerChatRulesAfterLogin(token, userType) {
    console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after', userType, 'authentication');
    console.log('🔍 [Widget] [Chat Rules] Current group ID:', this.groupId);

    if (!this.groupId) {
      console.log('🔍 [Widget] [Chat Rules] No group available yet, setting up pending trigger...');

      // Set pending state without group ID - will be triggered when group becomes available
      this.pendingChatRulesDisplay = {
        groupId: null, // Will be set when group ID is resolved
        userType: userType,
        timestamp: Date.now()
      };

      // Set up a delayed trigger that waits for group to be available
      const maxAttempts = 10;
      let attempts = 0;

      const checkForGroup = () => {
        attempts++;
        console.log('🔍 [Widget] [Chat Rules] Checking for group (attempt', attempts + '):', this.groupId);

        if (this.groupId) {
          console.log('🔍 [Widget] [Chat Rules] Group now available, loading chat rules for group:', this.groupId);

          // Update pending state with the group ID
          this.pendingChatRulesDisplay.groupId = this.groupId;

          // Load chat rules - display will be handled in handleGetChatRules
          this.getChatRules();
        } else if (attempts < maxAttempts) {
          setTimeout(checkForGroup, 500); // Check every 500ms
        } else {
          console.log('🔍 [Widget] [Chat Rules] Timeout waiting for group to be available');
        }
      };

      setTimeout(checkForGroup, 500); // Start checking after 500ms
      return;
    }

    console.log('🔍 [Widget] [Chat Rules] Loading chat rules for group:', this.groupId);

    // Set pending state to indicate we're waiting for chat rules after authentication
    this.pendingChatRulesDisplay = {
      groupId: this.groupId,
      userType: userType,
      timestamp: Date.now()
    };

    // Load chat rules - display will be handled in handleGetChatRules
    this.getChatRules();
  }

  // Handle groups received from socket events
  handleGroupsReceived(groups) {
    if (!groups || !Array.isArray(groups)) {
      console.log('🔍 [Widget] No groups received or invalid format');
      return;
    }

    console.log('🔍 [Widget] Processing', groups.length, 'groups to find correct ID for:', this.config.groupName);
    console.log('🔍 [Widget] Available groups:', groups.map(g => `${g.name} (ID: ${g.id})`).join(', '));

    // Find the group that matches our group name (case-insensitive)
    const matchingGroup = groups.find(group =>
      group.name && group.name.toLowerCase() === this.config.groupName.toLowerCase()
    );

    if (matchingGroup) {
      console.log('✅ [Widget] Found matching group:', matchingGroup.name, 'with ID:', matchingGroup.id);

      if (matchingGroup.id !== this.groupId) {
        console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to real ID:', matchingGroup.id);

        const oldGroupId = this.groupId;
        this.groupId = matchingGroup.id;

        // Rejoin with the correct ID to ensure proper message sync
        console.log('🔄 [Widget] Rejoining group with correct ID...');
        this.rejoinGroupWithCorrectId();

        // Check if we have a pending chat rules trigger waiting for group ID
        this.checkPendingChatRulesTrigger();
      } else {
        console.log('✅ [Widget] Group ID already correct:', this.groupId);
      }
    } else {
      console.log('❌ [Widget] Group not found in user\'s group list:', this.config.groupName);
      console.log('🔍 [Widget] Available groups:', groups.map(g => g.name).join(', '));

      // For anonymous users or groups not in user's list, try the API as fallback
      if (!this.isAuthenticated) {
        console.log('🔍 [Widget] Anonymous user - trying API fallback for group resolution...');
        this.tryApiGroupResolution();
      }
    }
  }

  // Try socket-based group resolution for anonymous users
  async trySocketGroupResolution() {
    return new Promise((resolve) => {
      console.log('🔍 [Widget] Trying socket-based group resolution for:', this.config.groupName);

      // Set up a one-time listener for group resolution
      const timeout = setTimeout(() => {
        console.log('❌ [Widget] Socket group resolution timed out');
        resolve(false);
      }, 5000);

      // Try to get group info via socket (this might trigger group updated events)
      if (this.socket && this.socket.connected) {
        // For anonymous users, we can try joining with hash ID and see if we get group info back
        console.log('🔍 [Widget] Attempting to get group info via socket events...');

        // The join events might return group information
        const originalGroupId = this.groupId;

        // Listen for group updated event that might contain the real ID
        const groupUpdatedHandler = (group) => {
          if (group && group.name && group.id &&
            group.name.toLowerCase() === this.config.groupName.toLowerCase() &&
            group.id !== originalGroupId) {

            console.log('✅ [Widget] Socket resolved group via group updated:', group);
            clearTimeout(timeout);
            this.socket.off('group updated', groupUpdatedHandler);

            this.groupId = group.id;
            this.rejoinGroupWithCorrectId();
            resolve(true);
          }
        };

        this.socket.on('group updated', groupUpdatedHandler);

        // Clean up after timeout
        setTimeout(() => {
          this.socket.off('group updated', groupUpdatedHandler);
          resolve(false);
        }, 4500);

      } else {
        console.log('❌ [Widget] Socket not connected for group resolution');
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  // Try comprehensive group resolution using multiple approaches
  async tryComprehensiveGroupResolution() {
    console.log('🔍 [Widget] Starting comprehensive group resolution for:', this.config.groupName);

    // Approach 1: Public API (fixed backend)
    let resolved = await this.tryPublicApiResolution();
    if (resolved) return;

    // Approach 2: Socket-based resolution
    resolved = await this.trySocketGroupResolution();
    if (resolved) return;

    // Approach 3: If authenticated, try private API
    if (this.isAuthenticated && this.authenticatedToken) {
      resolved = await this.tryPrivateApiResolution();
      if (resolved) return;
    }

    console.log('❌ [Widget] All group resolution approaches failed, staying with hash ID:', this.groupId);
  }

  // Try public API resolution
  async tryPublicApiResolution() {
    try {
      console.log('🔍 [Widget] Trying public API resolution...');
      const response = await fetch(`${this.config.apiUrl}/api/public/get/group-by-name/${encodeURIComponent(this.config.groupName)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const groupData = await response.json();
        console.log('✅ [Widget] Public API resolved group:', groupData);

        if (groupData.id && groupData.id !== this.groupId) {
          console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to public API ID:', groupData.id);
          this.groupId = groupData.id;
          this.rejoinGroupWithCorrectId();
          return true;
        }
      } else {
        console.log('❌ [Widget] Public API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ [Widget] Public API error:', error.message);
    }
    return false;
  }

  // Try private API resolution
  async tryPrivateApiResolution() {
    try {
      console.log('🔍 [Widget] Trying private API resolution...');
      const response = await fetch(`${this.config.apiUrl}/api/private/get/groups/getGroup`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.authenticatedToken
        },
        body: JSON.stringify({
          groupName: this.config.groupName,
          userId: parseInt(this.currentUserId)
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.group && result.group.id) {
          console.log('✅ [Widget] Private API resolved group:', result.group);

          if (result.group.id !== this.groupId) {
            console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to private API ID:', result.group.id);
            this.groupId = result.group.id;
            this.rejoinGroupWithCorrectId();

            // Check if we have a pending chat rules trigger waiting for group ID
            this.checkPendingChatRulesTrigger();
            return true;
          }
        }
      } else {
        console.log('❌ [Widget] Private API failed:', response.status, response.statusText);
      }
    } catch (error) {
      console.log('❌ [Widget] Private API error:', error.message);
    }
    return false;
  }

  // Try API-based group resolution as fallback
  async tryApiGroupResolution() {
    try {
      console.log('🔍 [Widget] Trying API-based group resolution for:', this.config.groupName);

      const response = await fetch(`${this.config.apiUrl}/api/public/get/group-by-name/${encodeURIComponent(this.config.groupName)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const groupData = await response.json();
        console.log('✅ [Widget] API resolved group:', groupData);

        if (groupData.id && groupData.id !== this.groupId) {
          console.log('🔄 [Widget] Updating from hash-based ID:', this.groupId, 'to API-resolved ID:', groupData.id);
          this.groupId = groupData.id;
          this.rejoinGroupWithCorrectId();

          // Check if we have a pending chat rules trigger waiting for group ID
          this.checkPendingChatRulesTrigger();
        }
      } else {
        console.log('❌ [Widget] API group resolution failed:', response.status, response.statusText);

        // If API fails, try socket-based resolution
        if (!this.isAuthenticated) {
          console.log('🔍 [Widget] Trying socket-based resolution as final fallback...');
          await this.trySocketGroupResolution();
        }
      }
    } catch (error) {
      console.log('❌ [Widget] API group resolution error:', error.message);

      // If API fails, try socket-based resolution
      if (!this.isAuthenticated) {
        console.log('🔍 [Widget] Trying socket-based resolution as final fallback...');
        await this.trySocketGroupResolution();
      }
    }
  }

  // Rejoin group with the correct ID
  async rejoinGroupWithCorrectId() {
    try {
      console.log('🔄 [Widget] Rejoining group with correct ID:', this.groupId);

      if (this.connectAsAuthenticated && this.authenticatedToken) {
        // Join as authenticated user
        console.log('🔐 [Widget] Rejoining as authenticated user');
        this.socket.emit('join to group', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId),
          userId: parseInt(this.currentUserId)
        });
      } else {
        // Join as anonymous user
        console.log('👤 [Widget] Rejoining as anonymous user');
        this.socket.emit('join to group anon', {
          groupId: parseInt(this.groupId),
          anonId: this.anonId
        });
      }

      // Get messages with correct group ID
      const token = this.connectAsAuthenticated ? this.authenticatedToken : `anonuser${this.config.groupName}${this.anonId}`;
      this.socket.emit('get group msg', {
        token: token,
        groupId: parseInt(this.groupId)
      });

    } catch (error) {
      console.error('❌ [Widget] Error rejoining group with correct ID:', error);
    }
  }

  // Reply functionality methods
  escapeForAttribute(text) {
    if (!text) return '';
    return text.replace(/'/g, "\\'").replace(/"/g, "\\'").replace(/\n/g, ' ').replace(/\r/g, '');
  }

  renderReplyIndicator(parentId) {
    // Find the parent message
    const parentMessage = this.messages?.find(msg => msg.Id === parentId);
    if (!parentMessage) return '';

    const parentSender = parentMessage.Sender_Id > 100000
      ? "anon" + String(parentMessage.Sender_Id).slice(-3)
      : (parentMessage.sender_name || 'Anonymous');

    const parentContent = this.getReplyContentPreview(parentMessage.Content);
    if (parentMessage.Content.includes('<img')) {
      return `
      <div class="pingbash-reply-indicator" onclick="window.pingbashWidget.scrollToMessage(${parentId})">
        <div class="pingbash-reply-line"></div>
        <div class="pingbash-reply-content">
          <div class="pingbash-reply-image" style="width:40px; height:40px;">${parentContent.replaceAll('<img', '<img style="width:40px; height:40px;')}</div>
          <div>
          <div class="pingbash-reply-sender">${parentSender}</div>
          <div class="pingbash-reply-text">Photo</div>
          </div>
        </div>
      </div>
    `;
    }

    if (parentMessage.Content.includes('<a')) {
      return `
      <div class="pingbash-reply-indicator" onclick="window.pingbashWidget.scrollToMessage(${parentId})">
        <div class="pingbash-reply-line"></div>
        <div class="pingbash-reply-content">
          <div class="pingbash-reply-image" style="width:0px; height:0px;"></div>
          <div> 
          <div class="pingbash-reply-sender">${parentSender}</div>
          <div class="pingbash-reply-text">${parentContent.replaceAll('<a', '<a style=\'color: #000; text-decoration: none;\'')}</div>
          </div>
        </div>
      </div>
    `;
    }
    return `
      <div class="pingbash-reply-indicator" onclick="window.pingbashWidget.scrollToMessage(${parentId})">
        <div class="pingbash-reply-line"></div>
        <div class="pingbash-reply-content">
          <div class="pingbash-reply-image" style="width:0px; height:0px;"></div>
          <div>
          <div class="pingbash-reply-sender">${parentSender}</div>
          <div class="pingbash-reply-text">${parentContent}</div>
          </div>
        </div>
      </div>
    `;
  }

  getReplyContentPreview(content) {
    if (!content) return '';

    // Handle images
    if (content.includes('<img')) {
      return `<div style="width:40px; height:40px;">${content.replaceAll('<img', '<img style="width:40px; height:40px;')}</div>`;
    }

    // Handle files
    if (content.includes('<a') && content.includes('File Name')) {
      return content;
    }

    // Handle regular text - strip HTML and limit length
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 50 ? textContent.substring(0, 50) + '...' : textContent;
  }

  replyToMessage(messageId, senderName, content) {
    console.log('💬 [Widget] Reply to message:', messageId, 'from:', senderName);

    // Set reply state
    this.replyingTo = {
      id: messageId,
      sender: senderName,
      content: content
    };

    // Show reply preview
    this.showReplyPreview();

    // Focus message input
    const messageInput = this.dialog.querySelector('#pingbash-message-input');
    if (messageInput) {
      messageInput.focus();
    }
  }

  showReplyPreview() {
    if (!this.replyingTo) return;

    const replyPreview = this.dialog.querySelector('.pingbash-reply-preview');
    if (replyPreview) {
      replyPreview.style.display = 'flex';

      const senderEl = replyPreview.querySelector('.pingbash-reply-preview-sender');
      const contentEl = replyPreview.querySelector('.pingbash-reply-preview-content');
      const imageEl = replyPreview.querySelector('.pingbash-reply-preview-image');
      const content = this.getReplyContentPreview(this.replyingTo.content);
      if (senderEl) senderEl.textContent = this.replyingTo.sender;
      if (contentEl) contentEl.textContent = this.getReplyContentPreview(this.replyingTo.content);

      console.log("Showing reply preview", this.replyingTo);
      if (content.includes('<img')) {
        imageEl.innerHTML = content.replaceAll('<img', '<img style="width:40px; height:40px;');
        imageEl.style.display = 'block';
        imageEl.style.width = '40px';
        imageEl.style.height = '40px';
        if (contentEl) contentEl.textContent = "Photo";
      } else {
        imageEl.style.display = 'none';
        if (content.includes('<a')) {
          contentEl.innerHTML = content.replaceAll('<a', '<a style=\'color: #000; text-decoration: none;\'');
        }
        imageEl.style.width = '1px';
      }

    }
  }

  hideReplyPreview() {
    console.log('💬 [Widget] Hiding reply preview');
    const replyPreview = this.dialog.querySelector('.pingbash-reply-preview');
    if (replyPreview) {
      replyPreview.style.display = 'none';
      console.log('💬 [Widget] Reply preview hidden successfully');
    } else {
      console.error('💬 [Widget] Reply preview element not found');
    }
    this.replyingTo = null;
  }

  scrollToMessage(messageId) {
    console.log('📍 [Widget] Scrolling to message:', messageId);
    const messageEl = this.dialog.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
      messageEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Highlight the message briefly
      messageEl.style.backgroundColor = '#ffeb3b33';
      setTimeout(() => {
        messageEl.style.backgroundColor = '';
      }, 2000);
    }
  }

  // Group Creation Modal Methods
  showGroupCreationModal() {
    console.log('🏗️ [Widget] Opening group creation modal');
    console.log('🏗️ [Widget] Authentication state:', {
      isAuthenticated: this.isAuthenticated,
      authenticatedToken: !!this.authenticatedToken,
      currentUserId: this.currentUserId
    });
    
    // Check if user is authenticated
    if (!this.isAuthenticated) {
      console.log('🏗️ [Widget] User not authenticated, showing sign-in modal first');
      this.showSigninModal();
      return;
    }

    const modal = this.dialog.querySelector('.pingbash-group-creation-modal');
    console.log('🏗️ [Widget] Group creation modal element found:', !!modal);
    
    if (!modal) {
      console.error('❌ [Widget] Group creation modal not found in DOM!');
      return;
    }
    
        console.log('🏗️ [Widget] Showing group creation modal');
    
    // Use CSS class to show modal (to override !important in CSS)
    modal.classList.add('show');
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)'; // Normal dark overlay
    
          console.log('🏗️ [Widget] Modal styles applied:', {
        display: modal.style.display,
        position: modal.style.position,
        zIndex: modal.style.zIndex
      });
      
      // Check computed styles and visibility
      const computedStyles = window.getComputedStyle(modal);
      console.log('🏗️ [Widget] Modal computed styles:', {
        display: computedStyles.display,
        position: computedStyles.position,
        zIndex: computedStyles.zIndex,
        visibility: computedStyles.visibility,
        opacity: computedStyles.opacity,
        width: computedStyles.width,
        height: computedStyles.height,
        top: computedStyles.top,
        left: computedStyles.left
      });
      
      // Check if modal content exists
      const modalContent = modal.querySelector('.pingbash-popup-content');
      console.log('🏗️ [Widget] Modal content found:', !!modalContent);
      
      if (modalContent) {
        const contentStyles = window.getComputedStyle(modalContent);
        console.log('🏗️ [Widget] Modal content styles:', {
          display: contentStyles.display,
          visibility: contentStyles.visibility,
          opacity: contentStyles.opacity,
          width: contentStyles.width,
          height: contentStyles.height
        });
      }
      
      // Force some additional styles to ensure visibility
      modal.style.visibility = 'visible';
      modal.style.opacity = '1';
      modal.style.pointerEvents = 'auto';
      
      console.log('🏗️ [Widget] Modal should now be visible - check the screen!');
    
    // Reset form
    this.resetGroupCreationForm();
  }

  hideGroupCreationModal() {
    console.log('🏗️ [Widget] Closing group creation modal');
    const modal = this.dialog.querySelector('.pingbash-group-creation-modal');
    modal.classList.remove('show');
  }

  resetGroupCreationForm() {
    // Reset group name
    const groupNameInput = this.dialog.querySelector('#group-name-input');
    groupNameInput.value = '';
    
    // Reset character counter
    const charCounter = this.dialog.querySelector('.pingbash-char-counter');
    charCounter.textContent = '0/50 characters';
    
    // Reset size mode to fixed
    const fixedRadio = this.dialog.querySelector('input[name="size-mode"][value="fixed"]');
    fixedRadio.checked = true;
    
    // Reset size values
    const widthInput = this.dialog.querySelector('#widget-width');
    const heightInput = this.dialog.querySelector('#widget-height');
    widthInput.value = '500';
    heightInput.value = '400';
    
    // Reset colors to defaults
    const colorInputs = {
      '#bg-color': '#ffffff',
      '#title-color': '#333333',
      '#msg-bg-color': '#f8f9fa',
      '#msg-text-color': '#000000',
      '#owner-msg-color': '#007bff',
      '#input-bg-color': '#ffffff'
    };
    
    Object.entries(colorInputs).forEach(([selector, value]) => {
      const input = this.dialog.querySelector(selector);
      if (input) input.value = value;
    });
    
    // Reset checkboxes
    const checkboxes = {
      '#show-user-images': true,
      '#round-corners': true,
      '#show-chat-rules': false,
      '#custom-font-size': false
    };
    
    Object.entries(checkboxes).forEach(([selector, checked]) => {
      const input = this.dialog.querySelector(selector);
      if (input) input.checked = checked;
    });
    
    // Reset font size and corner radius
    const fontSizeInput = this.dialog.querySelector('#font-size');
    const cornerRadiusInput = this.dialog.querySelector('#corner-radius');
    fontSizeInput.value = '14';
    cornerRadiusInput.value = '8';
    
    // Hide font size group initially
    const fontSizeGroup = this.dialog.querySelector('#font-size-group');
    fontSizeGroup.style.display = 'none';
    
    // Disable create button initially
    const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
    createBtn.disabled = true;
  }

  setupGroupCreationForm() {
    // Group name input with character counter
    const groupNameInput = this.dialog.querySelector('#group-name-input');
    const charCounter = this.dialog.querySelector('.pingbash-char-counter');
    const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
    
    groupNameInput?.addEventListener('input', (e) => {
      const length = e.target.value.length;
      charCounter.textContent = `${length}/50 characters`;
      
      // Update create button state
      createBtn.disabled = length === 0;
    });
    
    // Size mode radio buttons
    const sizeRadios = this.dialog.querySelectorAll('input[name="size-mode"]');
    sizeRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        // Size mode changed
      });
    });
    
    // Size inputs
    const sizeInputs = this.dialog.querySelectorAll('#widget-width, #widget-height');
    sizeInputs.forEach(input => {
      input.addEventListener('input', () => {
        // Size input changed
      });
    });
    
    // Color inputs
    const colorInputs = this.dialog.querySelectorAll('.pingbash-color-input');
    colorInputs.forEach(input => {
      input.addEventListener('input', () => {
        // Color input changed
      });
    });
    
    // Settings checkboxes
    const checkboxes = this.dialog.querySelectorAll('.pingbash-checkbox-option input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        // Show/hide font size group based on custom font size checkbox
        if (checkbox.id === 'custom-font-size') {
          const fontSizeGroup = this.dialog.querySelector('#font-size-group');
          fontSizeGroup.style.display = checkbox.checked ? 'block' : 'none';
        }
        
        // Show/hide corner radius group based on round corners checkbox
        if (checkbox.id === 'round-corners') {
          const cornerRadiusGroup = this.dialog.querySelector('#corner-radius-group');
          cornerRadiusGroup.style.display = checkbox.checked ? 'block' : 'none';
        }
      });
    });
    
    // Font size and corner radius inputs
    const fontSizeInput = this.dialog.querySelector('#font-size');
    const cornerRadiusInput = this.dialog.querySelector('#corner-radius');
    
    fontSizeInput?.addEventListener('input', () => {
      // Font size changed
    });
    
    cornerRadiusInput?.addEventListener('input', () => {
      // Corner radius changed
    });
  }

  updatePreview() {
    const previewWidget = this.dialog.querySelector('.pingbash-preview-widget');
    const previewTitle = this.dialog.querySelector('.pingbash-preview-title');
    const previewMessages = this.dialog.querySelector('.pingbash-preview-messages');
    const previewInput = this.dialog.querySelector('.pingbash-preview-input input');
    const previewButton = this.dialog.querySelector('.pingbash-preview-input button');
    
    if (!previewWidget) return;
    
    // Update title
    const groupNameInput = this.dialog.querySelector('#group-name-input');
    previewTitle.textContent = groupNameInput.value || 'New Group';
    
    // Get current configuration
    const config = this.getCurrentConfig();
    
    // Update preview widget styles
    previewWidget.style.width = config.sizeMode === 'fixed' ? `${config.width}px` : '100%';
    previewWidget.style.height = config.sizeMode === 'fixed' ? `${config.height}px` : '300px';
    previewWidget.style.borderRadius = config.settings.roundCorners ? `${config.settings.cornerRadius}px` : '0px';
    
    // Update colors
    previewWidget.style.background = config.colors.background;
    previewTitle.style.color = config.colors.title;
    previewMessages.style.background = config.colors.msgBg;
    previewInput.style.background = config.colors.inputBg;
    previewInput.style.color = config.colors.msgText;
    previewButton.style.background = config.colors.ownerMsg;
    
    // Update message styles
    const messages = previewWidget.querySelectorAll('.pingbash-preview-message');
    messages.forEach((msg, index) => {
      const content = msg.querySelector('.pingbash-preview-msg-content');
      if (msg.classList.contains('pingbash-preview-own')) {
        content.style.background = config.colors.ownerMsg;
        content.style.color = 'white';
      } else {
        content.style.background = '#f0f0f0';
        content.style.color = config.colors.msgText;
      }
      
      if (config.settings.customFontSize) {
        content.style.fontSize = `${config.settings.fontSize}px`;
      } else {
        content.style.fontSize = '14px';
      }
      
      content.style.borderRadius = config.settings.roundCorners ? '12px' : '4px';
    });
  }

  getCurrentConfig() {
    // Get values from form
    const sizeMode = this.dialog.querySelector('input[name="size-mode"]:checked')?.value || 'fixed';
    const width = parseInt(this.dialog.querySelector('#widget-width')?.value) || 500;
    const height = parseInt(this.dialog.querySelector('#widget-height')?.value) || 400;
    
    const colors = {
      background: this.dialog.querySelector('#bg-color')?.value || '#ffffff',
      title: this.dialog.querySelector('#title-color')?.value || '#333333',
      msgBg: this.dialog.querySelector('#msg-bg-color')?.value || '#f8f9fa',
      msgText: this.dialog.querySelector('#msg-text-color')?.value || '#000000',
      ownerMsg: this.dialog.querySelector('#owner-msg-color')?.value || '#007bff',
      inputBg: this.dialog.querySelector('#input-bg-color')?.value || '#ffffff'
    };
    
    const settings = {
      userImages: this.dialog.querySelector('#show-user-images')?.checked || false,
      roundCorners: this.dialog.querySelector('#round-corners')?.checked || false,
      showChatRules: this.dialog.querySelector('#show-chat-rules')?.checked || false,
      customFontSize: this.dialog.querySelector('#custom-font-size')?.checked || false,
      fontSize: parseInt(this.dialog.querySelector('#font-size')?.value) || 14,
      cornerRadius: parseInt(this.dialog.querySelector('#corner-radius')?.value) || 8
    };
    
    return {
      sizeMode,
      width,
      height,
      colors,
      settings
    };
  }

  makePreviewDraggable() {
    const previewWidget = this.dialog.querySelector('.pingbash-preview-widget');
    const previewContainer = this.dialog.querySelector('.pingbash-preview-container');
    
    if (!previewWidget || !previewContainer) return;
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    previewWidget.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = previewWidget.getBoundingClientRect();
      const containerRect = previewContainer.getBoundingClientRect();
      
      startLeft = rect.left - containerRect.left;
      startTop = rect.top - containerRect.top;
      
      previewWidget.style.position = 'absolute';
      previewWidget.style.left = startLeft + 'px';
      previewWidget.style.top = startTop + 'px';
      
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newLeft = startLeft + deltaX;
      const newTop = startTop + deltaY;
      
      // Keep within container bounds
      const containerRect = previewContainer.getBoundingClientRect();
      const widgetRect = previewWidget.getBoundingClientRect();
      
      const maxLeft = containerRect.width - widgetRect.width;
      const maxTop = containerRect.height - widgetRect.height;
      
      previewWidget.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
      previewWidget.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  async createNewGroup() {
    console.log('🏗️ [Widget] Creating new group');
    
    const groupNameInput = this.dialog.querySelector('#group-name-input');
    const groupName = groupNameInput.value.trim();
    
    if (!groupName) {
      alert('Please enter a group name');
      return;
    }
    
    if (!this.isAuthenticated || !this.authenticatedToken) {
      alert('Please log in to create a group');
      this.showSigninModal();
      return;
    }
    
    const config = this.getCurrentConfig();
    
    // Prepare group data (same structure as W version)
    const groupData = {
      groupName: groupName,
      createrId: parseInt(this.currentUserId),
      size_mode: config.sizeMode === 'fixed' ? 0 : 1,
      frame_width: config.width,
      frame_height: config.height,
      bg_color: config.colors.background,
      title_color: config.colors.title,
      msg_bg_color: config.colors.msgBg,
      msg_txt_color: config.colors.msgText,
      reply_msg_color: config.colors.msgText,
      msg_date_color: config.colors.msgText,
      input_bg_color: config.colors.inputBg,
      show_user_img: config.settings.userImages ? 1 : 0,
      custom_font_size: config.settings.customFontSize ? 1 : 0,
      font_size: config.settings.fontSize,
      round_corners: config.settings.roundCorners ? 1 : 0,
      corner_radius: config.settings.cornerRadius,
      chat_rules: '',
      show_chat_rules: config.settings.showChatRules ? 1 : 0
    };
    
    console.log('🏗️ [Widget] Group data:', groupData);
    
    try {
      // Disable create button during request
      const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
      createBtn.disabled = true;
      createBtn.textContent = 'Creating...';
      
      const response = await fetch(`${this.config.apiUrl}/api/private/add/groups/create`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.authenticatedToken
        },
        body: JSON.stringify(groupData)
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        console.log('🏗️ [Widget] Group created successfully:', result);
        alert(`Group "${groupName}" created successfully!`);
        this.hideGroupCreationModal();
        
        // Optionally switch to the new group
        if (result.groupId) {
          console.log('🏗️ [Widget] Switching to new group:', result.groupId);
          // You could implement group switching here
        }
      } else {
        console.error('🏗️ [Widget] Group creation failed:', result);
        alert(result.message || 'Failed to create group. Please try again.');
      }
    } catch (error) {
      console.error('🏗️ [Widget] Group creation error:', error);
      alert('Failed to create group. Please check your connection and try again.');
    } finally {
      // Re-enable create button
      const createBtn = this.dialog.querySelector('.pingbash-group-create-btn');
      createBtn.disabled = false;
      createBtn.textContent = 'Create Group';
    }
  }
}

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
  // Check for configuration in script tag with improved detection
  let script = document.currentScript;

  // Fallback methods if currentScript is not available
  if (!script) {
    // Try different selectors to find the script
    const selectors = [
      'script[src*="widget"]',
      'script[data-group-name]',
      'script[data-position]',
      'script[data-api-url]'
    ];

    for (const selector of selectors) {
      script = document.querySelector(selector);
      if (script) {
        console.log('🔍 [Widget] Found script using selector:', selector);
        break;
      }
    }
  }

  const config = {};

  console.log('🔍 [Widget] Script detection:', {
    currentScript: !!document.currentScript,
    foundScript: !!script,
    scriptSrc: script?.src,
    hasDataAttributes: script ? Object.keys(script.dataset).length > 0 : false
  });

  if (script && script.dataset) {
    console.log('🔍 [Widget] Available data attributes:', Object.keys(script.dataset));
    console.log('🔍 [Widget] Dataset values:', script.dataset);

    // Get config from data attributes
    const dataset = script.dataset;
    if (dataset.groupName) {
      config.groupName = dataset.groupName;
      console.log('🔍 [Widget] Set groupName:', dataset.groupName);
    }
    if (dataset.apiUrl) {
      config.apiUrl = dataset.apiUrl;
      console.log('🔍 [Widget] Set apiUrl:', dataset.apiUrl);
    } else {
      config.apiUrl = 'https://pingbash.com';
    }
    if (dataset.position) {
      config.position = dataset.position;
      console.log('🔍 [Widget] Set position:', dataset.position);
    } else {
      config.position = 'top-right';
    }

    if (dataset.theme) {
      config.theme = dataset.theme;
      console.log('🔍 [Widget] Set theme:', dataset.theme);
    }

    if (dataset.width) {
      config.width = dataset.width;
      console.log('🔍 [Widget] Set width:', dataset.width);
    }
    if (dataset.height) {
      config.height = dataset.height;
      console.log('🔍 [Widget] Set height:', dataset.height);
    }
    if (dataset.autoOpen) {
      config.autoOpen = dataset.autoOpen === 'true';
      console.log('🔍 [Widget] Set autoOpen:', config.autoOpen);
    }
    if (dataset.customColors) {
      try {
        config.customColors = JSON.parse(dataset.customColors);
        console.log('🔍 [Widget] Set customColors:', config.customColors);
      } catch (e) {
        console.warn('🔍 [Widget] Invalid customColors JSON:', e);
      }
    }
  } else {
    console.log('🔍 [Widget] No script found or no dataset available, using default config');
  }

  console.log('🔍 [Widget] Final config:', config);

  // Create global instance
  window.pingbashWidget = new PingbashChatWidget(config);
});

// Global factory function
window.PingbashChatWidget = PingbashChatWidget;

console.log('🚀 Pingbash Chat Widget loaded successfully'); 