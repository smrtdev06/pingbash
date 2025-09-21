/**
 * Pingbash Chat Widget - Core Module
 * Basic widget class with configuration and state management
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
    this.onlineUserIds = [];

    // Authentication state
    this.isAuthenticated = false;
    this.connectAsAuthenticated = false;
    this.authenticatedToken = null;
    this.anonId = null;
    this.currentUserId = null;

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

    // Reply state
    this.replyingTo = null;

    // UI Elements
    this.widget = null;
    this.button = null;
    this.dialog = null;

    // Auto-scroll observers
    this.resizeObserver = null;
    this.mutationObserver = null;

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
      this.initializeSocket();
      setTimeout(() => {
        this.showSigninModal();
      }, 1000);
      // DO NOT trigger chat rules here - only after successful authentication
    }

    this.attachEventListeners();
    this.setupAutoScroll();
    
    // Initialize online user count badge
    this.updateOnlineUserCount(0);
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

  // Show connection error
  showConnectionError() {
    const messagesList = this.dialog?.querySelector('.pingbash-messages-list');
    if (messagesList) {
      messagesList.innerHTML = `
        <div class="pingbash-connection-error">
          <div class="pingbash-error-icon">⚠️</div>
          <div class="pingbash-error-title">Connection Failed</div>
          <div class="pingbash-error-message">
            Unable to connect to the chat server. Please check your internet connection and try again.
          </div>
          <button class="pingbash-retry-btn" onclick="window.pingbashWidget.retryConnection()">
            Retry Connection
          </button>
        </div>
      `;
    }
  }

  // Retry connection
  retryConnection() {
    console.log('🔄 [Widget] Retrying connection...');
    const messagesList = this.dialog?.querySelector('.pingbash-messages-list');
    if (messagesList) {
      messagesList.innerHTML = '<div class="pingbash-loading">Connecting...</div>';
    }
    
    // Disconnect existing socket
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    
    // Reinitialize socket
    setTimeout(() => {
      this.initializeSocket();
    }, 1000);
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

// Export for module loading
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PingbashChatWidget;
} else if (typeof window !== 'undefined') {
  window.PingbashChatWidget = PingbashChatWidget;
} 