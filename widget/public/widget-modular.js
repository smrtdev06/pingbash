/**
 * Pingbash Chat Widget - Modular Version
 * Main entry point that loads all modules
 */

(function() {
  'use strict';

  // Configuration for module loading
  const WIDGET_CONFIG = {
    baseUrl: '', // Will be determined from script src
    modules: [
      'core.js',      // Core class and basic functionality
      'styles.js',    // CSS styling
      'ui.js',        // HTML generation and UI methods
      'socket.js',    // Socket.IO communication
      'auth.js',      // Authentication and user management
      'chat.js',      // Chat functionality and message handling
      'modals.js',    // Modals and popups
      'events.js'     // Event listeners and interactions
    ]
  };

  // Determine base URL from current script
  function getBaseUrl() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const scriptSrc = currentScript.src;
    
    if (scriptSrc) {
      const lastSlash = scriptSrc.lastIndexOf('/');
      return lastSlash !== -1 ? scriptSrc.substring(0, lastSlash + 1) : '';
    }
    
    return '';
  }

  // Load a JavaScript module
  function loadModule(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.onload = () => {
        console.log('📦 [Widget] Loaded module:', url);
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
    console.log('🚀 [Widget] Initializing modular widget...');
    
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
  function createWidgetInstance() {
    console.log('🎯 [Widget] Creating widget instance...');
    
    // Check for configuration in script tag
    let script = document.currentScript;

    // Fallback methods if currentScript is not available
    if (!script) {
      // First try to find the modular widget script specifically
      const scripts = document.querySelectorAll('script[src]');
      for (const s of scripts) {
        if (s.src.includes('widget-modular.js')) {
          script = s;
          console.log('🔍 [Widget] Found modular widget script:', s.src);
          break;
        }
      }
      
      // If still not found, try other selectors
      if (!script) {
        const selectors = [
          'script[data-group-name]',
          'script[data-position]',
          'script[data-api-url]',
          'script[src*="widget"]'
        ];

        for (const selector of selectors) {
          script = document.querySelector(selector);
          if (script) {
            console.log('🔍 [Widget] Found script using selector:', selector);
            break;
          }
        }
      }
    }

    const config = {};

    console.log('🔍 [Widget] Script detection:', {
      currentScript: !!document.currentScript,
      foundScript: !!script,
      scriptSrc: script?.src,
      hasDataAttributes: !!(script?.dataset && Object.keys(script.dataset).length > 0)
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

    // Verify that PingbashChatWidget class is available
    if (typeof PingbashChatWidget === 'undefined') {
      console.error('❌ [Widget] PingbashChatWidget class not found! Modules may not have loaded correctly.');
      return;
    }

    // Create global instance
    try {
      window.pingbashWidget = new PingbashChatWidget(config);
      console.log('✅ [Widget] Widget instance created successfully');
    } catch (error) {
      console.error('❌ [Widget] Failed to create widget instance:', error);
    }
  }

  // Global factory function
  window.PingbashChatWidget = window.PingbashChatWidget || class {
    constructor() {
      console.warn('⚠️ [Widget] PingbashChatWidget called before modules loaded');
    }
  };

  // Start initialization
  initializeWidget();

})(); 