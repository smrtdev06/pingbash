/**
 * Widget Split Loader
 * Loads all split modules and initializes the widget
 * EXACT functionality from original widget.js
 */

(function() {
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
      this.blockedUsers = new Set();
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
      this.hasSeenRulesForGroup = {}; // Will be loaded in init()

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
      console.log('📦 [Widget] Loading module:', url);
      
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        console.log('✅ [Widget] Module loaded:', url);
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
    console.log('📦 [Widget] Starting to load modules...');
    
    WIDGET_CONFIG.baseUrl = getBaseUrl();
    console.log('📦 [Widget] Base URL:', WIDGET_CONFIG.baseUrl);
    
    try {
      for (const module of WIDGET_CONFIG.modules) {
        const moduleUrl = WIDGET_CONFIG.baseUrl + module;
        await loadModule(moduleUrl);
      }
      
      console.log('✅ [Widget] All modules loaded successfully');
      return true;
    } catch (error) {
      console.error('❌ [Widget] Failed to load modules:', error);
      return false;
    }
  }

  // Initialize widget after all modules are loaded
  async function initializeWidget() {
    console.log('🚀 [Widget] Initializing split widget...');
    
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
    console.log('🎯 [Widget] Creating widget instance...');
    
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
          console.log('🔍 [Widget] Found script using selector:', selector);
          break;
        }
      }
    }

    const config = {};

    if (script && script.dataset) {
      // Extract configuration from data attributes
      if (script.dataset.groupName) config.groupName = script.dataset.groupName;
      if (script.dataset.apiUrl) config.apiUrl = script.dataset.apiUrl;
      if (script.dataset.position) config.position = script.dataset.position;
      if (script.dataset.theme) config.theme = script.dataset.theme;
      if (script.dataset.width) config.width = script.dataset.width;
      if (script.dataset.height) config.height = script.dataset.height;
      if (script.dataset.autoOpen) config.autoOpen = script.dataset.autoOpen === 'true';
    }

    console.log('🔍 [Widget] Final config:', config);

    // Create and initialize the widget
    try {
      const widget = new PingbashChatWidget(config);
      
      // Debug: Check available methods
      console.log('🔍 [Widget] Available methods:', Object.getOwnPropertyNames(PingbashChatWidget.prototype));
      console.log('🔍 [Widget] createWidget available:', typeof widget.createWidget);
      console.log('🔍 [Widget] applyStyles available:', typeof widget.applyStyles);
      
      // Initialize the widget after all modules are loaded
      if (widget.init) {
        await widget.init();
        console.log('🎯 [Widget] Widget initialized after module loading');
      }
      
      // Make it globally accessible for debugging
      window.pingbashWidget = widget;
      
      console.log('✅ [Widget] Split widget instance created successfully');
    } catch (error) {
      console.error('❌ [Widget] Failed to create widget instance:', error);
    }
  }

  // Start the initialization process
  initializeWidget();
})();