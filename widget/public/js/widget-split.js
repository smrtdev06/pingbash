/**
 * Widget Split Loader
 * Loads all split modules and initializes the widget
 * EXACT functionality from original widget.js
 */
window.isDebugging = true;
(function () {
  'use strict';

  // Define the PingbashChatWidget class first
  window.PingbashChatWidget = class PingbashChatWidget {
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
        minWidth: config.minWidth || '0px',
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
      this.blockedUsers = new Set();
      this.pinnedMessages = [];
      this.unreadCount = 0;
      
      // Inbox unread tracking (from backend)
      this.inboxUnreadCount = 0;
      this.lastSeenMessageId = null;
      
      // Initialize inbox UI to 0 immediately
      setTimeout(() => {
        if (this.updateInboxUnreadCount) {
          this.updateInboxUnreadCount(0);
        }
      }, 100);

      // Authentication state
      this.isAuthenticated = false;
      this.connectAsAuthenticated = false;
      this.authenticatedToken = null;
      this.anonId = null;
      
      // Track if anonymous user has been registered in this session
      this.anonUserRegistered = false;

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
      this.hasSeenRulesForGroup = {}; // Will be loaded in init()

      // UI Elements
      this.widget = null;
      this.button = null;
      this.dialog = null;

      // Add debug methods for testing
      this.clearSeenRules = () => {
        localStorage.removeItem('pingbash_widget_seen_rules');
        this.hasSeenRulesForGroup = {};
        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Cleared all seen rules from localStorage');
      };

      this.clearAllTokens = () => {
        localStorage.removeItem('pingbash_token');
        localStorage.removeItem('pingbash_user_id');
        localStorage.removeItem('anonToken');
        if( window.isDebugging ) console.log('🔍 [Widget] Cleared all authentication tokens from localStorage');
      };

      // Test method for group creation modal
      this.testGroupCreationModal = () => {
        if( window.isDebugging ) console.log('🧪 [Widget] Testing group creation modal...');
        if( window.isDebugging ) console.log('🧪 [Widget] Dialog element:', !!this.dialog);

        if (this.dialog) {
          const modal = this.dialog.querySelector('.pingbash-group-creation-modal');
          if( window.isDebugging ) console.log('🧪 [Widget] Modal element found:', !!modal);

          if (modal) {
            if( window.isDebugging ) console.log('🧪 [Widget] Modal current display:', modal.style.display);
            if( window.isDebugging ) console.log('🧪 [Widget] Forcing modal to show...');
            modal.style.display = 'flex';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '10000';
            modal.style.backgroundColor = 'rgba(0,0,0,0.8)';
            if( window.isDebugging ) console.log('🧪 [Widget] Modal should now be visible');
          }
        }
      };

      // Test method for logo click
      this.testLogoClick = () => {
        if( window.isDebugging ) console.log('🧪 [Widget] Testing logo click...');
        const logo = this.dialog?.querySelector('.pingbash-logo');
        if( window.isDebugging ) console.log('🧪 [Widget] Logo element found:', !!logo);

        if (logo) {
          if( window.isDebugging ) console.log('🧪 [Widget] Logo element:', logo);
          if( window.isDebugging ) console.log('🧪 [Widget] Logo cursor style:', logo.style.cursor);
          logo.click();
        }
      };

      // Test method for chat rules
      this.testChatRules = () => {
        if( window.isDebugging ) console.log('🧪 [Widget] Testing chat rules...');
        if( window.isDebugging ) console.log('🧪 [Widget] Current user ID:', this.currentUserId);
        if( window.isDebugging ) console.log('🧪 [Widget] Group:', this.group);
        if( window.isDebugging ) console.log('🧪 [Widget] Is creator:', this.isCreator);
        if( window.isDebugging ) console.log('🧪 [Widget] Is authenticated:', this.isAuthenticated);

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
          if( window.isDebugging ) console.log('👥 [Widget] Updated online user count badge:', count);
        }
      };
      
      // Update inbox unread count badge
      this.updateInboxUnreadCount = (count) => {
        this.inboxUnreadCount = count || 0;
        const badge = this.dialog?.querySelector('.pingbash-inbox-badge');
        if (badge) {
          badge.textContent = this.inboxUnreadCount;
          if (this.inboxUnreadCount > 0) {
            badge.style.display = 'inline-block';
          } else {
            badge.style.display = 'none';
          }
          if( window.isDebugging ) console.log('📬 [Widget] Updated inbox unread count:', this.inboxUnreadCount);
        }
        
        // Toggle dialog header logo/inbox icon
        this.toggleDialogHeaderIcon(this.inboxUnreadCount);
      };
      
      // Toggle between logo and inbox icon in dialog header
      this.toggleDialogHeaderIcon = (count) => {
        const logo = this.dialog?.querySelector('.pingbash-logo');
        let inboxIcon = this.dialog?.querySelector('.pingbash-header-inbox-icon');
        
        // Create inbox icon if it doesn't exist
        if (!inboxIcon) {
          const logoSection = this.dialog?.querySelector('.pingbash-header-logo-section');
          if (logoSection) {
            const inboxIconHTML = `
              <div class="pingbash-header-inbox-icon" style="display: none; position: absolute; cursor: pointer; touch-action: auto; top: 5px; pointer-events: auto; min-width: 44px; min-height: 44px; align-items: center; justify-content: center;" title="View Inbox">
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path fill="currentColor" d="M19,15H15A3,3 0 0,1 12,18A3,3 0 0,1 9,15H5V5H19M19,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3Z"/>
                </svg>
                <span class="pingbash-header-inbox-badge" style="position: absolute; top: -5px; right: -5px; background: #ff4444; color: white; border-radius: 50%; min-width: 18px; height: 18px; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center; padding: 0 4px; pointer-events: none;">0</span>
              </div>
            `;
            logoSection.insertAdjacentHTML('beforeend', inboxIconHTML);
            inboxIcon = logoSection.querySelector('.pingbash-header-inbox-icon');
            
            // Add click handler to redirect to inbox
            if (inboxIcon) {
              // Add both click and touchend handlers for better mobile support
              const handleInboxClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                if( window.isDebugging ) console.log('📬 [Widget] Dialog inbox icon clicked - redirecting to pingbash.com/inbox');
                window.open('https://pingbash.com/inbox', '_blank');
              };
              
              inboxIcon.addEventListener('click', handleInboxClick);
              inboxIcon.addEventListener('touchend', handleInboxClick);
              
              if( window.isDebugging ) console.log('📬 [Widget] Inbox icon created with click handlers');
            }
          }
        }
        
        const headerInboxBadge = this.dialog?.querySelector('.pingbash-header-inbox-badge');
        
        if (count > 0) {
          // Show inbox icon, hide logo
          if (logo) logo.style.display = 'none';
          if (inboxIcon) inboxIcon.style.display = 'block';
          if (headerInboxBadge) {
            headerInboxBadge.textContent = count > 99 ? '99+' : count;
          }
          if( window.isDebugging ) console.log('📬 [Widget] Showing inbox icon with count:', count);
        } else {
          // Show logo, hide inbox icon
          if (logo) logo.style.display = 'block';
          if (inboxIcon) inboxIcon.style.display = 'none';
          if( window.isDebugging ) console.log('📬 [Widget] Showing logo (no unread messages)');
        }
      };
      

      // Show online users method
      this.showOnlineUsers = () => {
        if( window.isDebugging ) console.log('👥 [Widget] Showing online users');
        if( window.isDebugging ) console.log('👥 [Widget] Online user IDs:', this.onlineUserIds);
        if( window.isDebugging ) console.log('👥 [Widget] Online count:', this.onlineUserIds?.length || 0);

        // For now, just show an alert with the count
        // TODO: Implement online users modal
        const count = this.onlineUserIds?.length || 0;
        //alert(`Online Users: ${count}\n\nUser IDs: ${this.onlineUserIds?.join(', ') || 'None'}`);
      };
    }
  };

  // Configuration for module loading
  const WIDGET_CONFIG = {
    modules: [
      'core.js',       // Core utility methods (loadSeenRules, etc.)
      'styles.js',     // CSS styles
      'ui.js',         // HTML generation and UI methods
      'socket.js',     // Socket.IO and communication
      'auth.js',       // Authentication and user management  
      'chat.js',       // Message handling and chat functionality
      'modals.js',     // Modal dialogs and popups
      'events.js'      // Event listeners
    ],
    baseUrl: ''
  };

  // Get the base URL from the current script
  function getBaseUrl() {
    const scripts = document.querySelectorAll('script[src]');
    for (let script of scripts) {
      if (script.src.includes('widget-split.js')) {
        return script.src.replace('widget-split.js', '');
      }
    }
    return './src/';
  }

  // Load a single module
  function loadModule(url) {
    return new Promise((resolve, reject) => {
      if( window.isDebugging ) console.log('📦 [Widget] Loading module:', url);

      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        if( window.isDebugging ) console.log('✅ [Widget] Module loaded:', url);
        resolve();
      };
      script.onerror = () => {
        console.error('❌ [Widget] Failed to load module:', url);
        reject(new Error(`Failed to load module: ${url}`));
      };

      document.head.appendChild(script);
    });
  }

  // Load all modules sequentially
  async function loadAllModules() {
    if( window.isDebugging ) console.log('📦 [Widget] Starting to load modules...');

    WIDGET_CONFIG.baseUrl = getBaseUrl();
    if( window.isDebugging ) console.log('📦 [Widget] Base URL:', WIDGET_CONFIG.baseUrl);

    try {
      for (const module of WIDGET_CONFIG.modules) {
        const moduleUrl = WIDGET_CONFIG.baseUrl + module;
        await loadModule(moduleUrl);
      }

      if( window.isDebugging ) console.log('✅ [Widget] All modules loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ [Widget] Failed to load modules:', error);
      return false;
    }
  }

  // Initialize widget after all modules are loaded
  async function initializeWidget() {
    if( window.isDebugging ) console.log('🚀 [Widget] Initializing split widget...');

    const modulesLoaded = await loadAllModules();

    if (!modulesLoaded) {
      console.error('❌ [Widget] Cannot initialize - modules failed to load');
      return;
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createWidgetInstance);
    } else {
      createWidgetInstance();
    }
  }

  // Create widget instance with configuration from script tag
  async function createWidgetInstance() {
    if( window.isDebugging ) console.log('🎯 [Widget] Creating widget instance...');

    // Find the script tag that loaded this widget
    let script = document.currentScript;

    // Fallback methods if currentScript is not available
    if (!script) {
      const selectors = [
        'script[src*="widget-split"]',
        'script[data-group-name]',
        'script[data-position]',
        'script[data-api-url]'
      ];

      for (const selector of selectors) {
        script = document.querySelector(selector);
        if (script) {
          if( window.isDebugging ) console.log('🔍 [Widget] Found script using selector:', selector);
          break;
        }
      }
    }

    const config = {};
    
    // Check if we're on *.pingbash.com domain
    const isPingbashDomain = window.location.hostname.match(/^([^.]+)\.pingbash\.com$/);

    if (script && script.dataset) {
      // Extract configuration from data attributes
      if (script.dataset.groupName)
        config.groupName = script.dataset.groupName;
      else {
        // If groupName is not provided, try to extract from window.location if on *.pingbash.com
        if (isPingbashDomain && isPingbashDomain[1]) {
          config.groupName = isPingbashDomain[1];
          if( window.isDebugging ) console.log('🌐 [Widget] Extracted groupName from hostname:', config.groupName);
        } else {
          config.groupName = 'testgroup6';
        }
      }
      if (script.dataset.apiUrl) config.apiUrl = script.dataset.apiUrl;
      if (script.dataset.position) config.position = script.dataset.position;
      if (script.dataset.theme) config.theme = script.dataset.theme;
      if (script.dataset.width) config.width = script.dataset.width;
      if (script.dataset.height) config.height = script.dataset.height;
      if (script.dataset.autoOpen) config.autoOpen = script.dataset.autoOpen === 'true';
    }
    
    // If on *.pingbash.com domain, automatically set fullscreen mode
    if (isPingbashDomain) {
      if( window.isDebugging ) console.log('🌐 [Widget] Detected *.pingbash.com domain - enabling fullscreen mode');
      
      // Create layout element if it doesn't exist
      let layoutElement = document.getElementById('pingbash-chat-layout');
      if (!layoutElement) {
        layoutElement = document.createElement('div');
        layoutElement.id = 'pingbash-chat-layout';
        document.body.appendChild(layoutElement);
        if( window.isDebugging ) console.log('🌐 [Widget] Created layout element for fullscreen mode');
      }
      
      // Set fullscreen styles on body and layout element
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'hidden';
      
      layoutElement.style.width = '100vw';
      layoutElement.style.height = '100vh';
      layoutElement.style.position = 'fixed';
      layoutElement.style.top = '0';
      layoutElement.style.left = '0';
      layoutElement.style.boxSizing = 'border-box';
      
      // Override config for fullscreen
      config.width = '100vw';
      config.height = '100vh';
      config.autoOpen = true;
      
      if( window.isDebugging ) console.log('🌐 [Widget] Fullscreen mode configured');
    }

    if( window.isDebugging ) console.log('🔍 [Widget] Final config:', config);

    // Create and initialize the widget
    try {
      const widget = new PingbashChatWidget(config);

      // Debug: Check available methods
      if( window.isDebugging ) console.log('🔍 [Widget] Available methods:', Object.getOwnPropertyNames(PingbashChatWidget.prototype));
      if( window.isDebugging ) console.log('🔍 [Widget] createWidget available:', typeof widget.createWidget);
      if( window.isDebugging ) console.log('🔍 [Widget] applyStyles available:', typeof widget.applyStyles);

      // Initialize the widget after all modules are loaded
      if (widget.init) {
        await widget.init();
        if( window.isDebugging ) console.log('🎯 [Widget] Widget initialized after module loading');
      }

      // Make it globally accessible for debugging
      window.pingbashWidget = widget;

      if( window.isDebugging ) console.log('✅ [Widget] Split widget instance created successfully');
    } catch (error) {
      console.error('❌ [Widget] Failed to create widget instance:', error);
    }
  }

  // Start the initialization process
  initializeWidget();
})();

