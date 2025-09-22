/**
 * UI functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add ui methods to the prototype
console.log('🔍 [UI] Checking PingbashChatWidget:', !!window.PingbashChatWidget, !!window.PingbashChatWidget?.prototype);
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
  console.log('✅ [UI] Adding UI methods to prototype');
  Object.assign(window.PingbashChatWidget.prototype, {

  // EXACT COPY from widget.js - createWidget method
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
    },

  // EXACT COPY from widget.js - createChatButton method
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
    },

  // EXACT COPY from widget.js - createChatDialog method
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
            <div class="pingbash-filter-container">
              <div class="pingbash-filter-icon" title="Chat Mode">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M6,13H18V11H6M3,6V8H21V6M10,18H14V16H10V18Z"/>
                </svg>
              </div>
              <div class="pingbash-filter-dropdown" style="display: none;">
                <div class="pingbash-filter-widget">
                  <div class="pingbash-filter-option">
                    <input type="radio" id="filter-public" name="filter-mode" value="0" checked>
                    <label for="filter-public">Public Mode</label>
                  </div>
                  <div class="pingbash-filter-option">
                    <input type="radio" id="filter-oneone" name="filter-mode" value="1">
                    <label for="filter-oneone">1 on 1 Mode</label>
                    <div class="pingbash-user-search" style="display: none;">
                      <input type="text" class="pingbash-user-search-input" placeholder="Search user...">
                      <div class="pingbash-user-dropdown" style="display: none;"></div>
                    </div>
                  </div>
                  <div class="pingbash-filter-option pingbash-mods-option" style="display: none;">
                    <input type="radio" id="filter-mods" name="filter-mode" value="2">
                    <label for="filter-mods">Mods Mode</label>
                  </div>
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
                <div class="pingbash-menu-item" data-action="chat-rules">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                  Chat Rules
                </div>
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
                  Moderator Management
                </div>
                <div class="pingbash-menu-item" data-action="censored-content" style="display: none;">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M11,7H13A1,1 0 0,1 14,8V16A1,1 0 0,1 13,17H11A1,1 0 0,1 10,16V8A1,1 0 0,1 11,7M11,2A1,1 0 0,1 12,1A1,1 0 0,1 13,2V5H11V2M17.5,7A4.5,4.5 0 0,1 22,11.5A4.5,4.5 0 0,1 17.5,16H16V14H17.5A2.5,2.5 0 0,0 20,11.5A2.5,2.5 0 0,0 17.5,9H16V7H17.5M8,7V9H6.5A2.5,2.5 0 0,0 4,11.5A2.5,2.5 0 0,0 6.5,14H8V16H6.5A4.5,4.5 0 0,1 2,11.5A4.5,4.5 0 0,1 6.5,7H8Z"/>
                  </svg>
                  Censored Content
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
          <div class="pingbash-popup-content" style="width:250px;height:265px">
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
        
        <!-- Chat Limitations Popup -->
        <div class="pingbash-chat-limitations-popup" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content">
            <div class="pingbash-popup-header">
              <h3>Chat Limitations</h3>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <div class="pingbash-limitations-content">
                
                <!-- Section 1: Who Can Post -->
                <div class="pingbash-limitation-section">
                  <h4>Who Can Post</h4>
                  <div class="pingbash-radio-group">
                    <label class="pingbash-radio-option">
                      <input type="radio" name="post-level" value="0" checked>
                      <span class="pingbash-radio-dot"></span>
                      <span>Anyone</span>
                    </label>
                    <label class="pingbash-radio-option">
                      <input type="radio" name="post-level" value="1">
                      <span class="pingbash-radio-dot"></span>
                      <span>Verified Users</span>
                    </label>
                    <label class="pingbash-radio-option">
                      <input type="radio" name="post-level" value="2">
                      <span class="pingbash-radio-dot"></span>
                      <span>Admin & Mods</span>
                    </label>
                  </div>
                </div>

                <!-- Divider -->
                <div class="pingbash-limitation-divider"></div>

                <!-- Section 2: Who Can Post URLs -->
                <div class="pingbash-limitation-section">
                  <h4>Who can post URLs</h4>
                  <div class="pingbash-radio-group">
                    <label class="pingbash-radio-option">
                      <input type="radio" name="url-level" value="0" checked>
                      <span class="pingbash-radio-dot"></span>
                      <span>Everyone</span>
                    </label>
                    <label class="pingbash-radio-option">
                      <input type="radio" name="url-level" value="1">
                      <span class="pingbash-radio-dot"></span>
                      <span>Admin & Mods</span>
                    </label>
                  </div>
                </div>

                <!-- Divider -->
                <div class="pingbash-limitation-divider"></div>

                <!-- Section 3: Slow Mode -->
                <div class="pingbash-limitation-section">
                  <label class="pingbash-checkbox-option">
                    <input type="checkbox" id="slow-mode-checkbox">
                    <span class="pingbash-checkbox-mark"></span>
                    <span>Turn on Slow Mode</span>
                  </label>

                  <!-- Slow Mode Options (hidden by default) -->
                  <div class="pingbash-slow-mode-options" style="display: none;">
                    <div class="pingbash-radio-group">
                      <label class="pingbash-radio-option">
                        <input type="radio" name="slow-speed" value="5" checked>
                        <span class="pingbash-radio-dot"></span>
                        <span>Every 5 seconds</span>
                      </label>
                      <label class="pingbash-radio-option">
                        <input type="radio" name="slow-speed" value="10">
                        <span class="pingbash-radio-dot"></span>
                        <span>Every 10 Seconds</span>
                      </label>
                      <label class="pingbash-radio-option">
                        <input type="radio" name="slow-speed" value="15">
                        <span class="pingbash-radio-dot"></span>
                        <span>Every 15 Seconds</span>
                      </label>
                      <label class="pingbash-radio-option">
                        <input type="radio" name="slow-speed" value="custom">
                        <span class="pingbash-radio-dot"></span>
                        <span>Custom</span>
                      </label>
                    </div>

                    <!-- Custom Seconds Input (hidden by default) -->
                    <div class="pingbash-custom-seconds" style="display: none;">
                      <div class="pingbash-form-group">
                        <input type="number" id="custom-seconds" class="pingbash-form-input" min="1" placeholder="Seconds">
                        <span>seconds</span>
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
            <div class="pingbash-popup-footer">
              <button class="pingbash-limitations-cancel-btn">Cancel</button>
              <button class="pingbash-limitations-ok-btn">OK</button>
            </div>
          </div>
        </div>
        
        <!-- Manage Chat Popup -->
        <div class="pingbash-manage-chat-popup" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content">
            <div class="pingbash-popup-header">
              <h3>Manage Chat</h3>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <div class="pingbash-manage-chat-content">
                
                <!-- Main Menu View -->
                <div class="pingbash-manage-chat-menu">
                  <div class="pingbash-manage-chat-options">
                    <button class="pingbash-manage-chat-option" data-action="pinned-messages">
                      📌 Pinned Messages
                    </button>
                    <button class="pingbash-manage-chat-option" data-action="clear-chat">
                      🧹 Clear Chat
                    </button>
                  </div>
                </div>

                <!-- Pinned Messages View -->
                <div class="pingbash-pinned-messages-view" style="display: none;">
                  <div class="pingbash-pinned-messages-header">
                    <h4>Pinned Messages</h4>
                    <button class="pingbash-back-to-menu" title="Back to menu">←</button>
                  </div>
                  <div class="pingbash-pinned-messages-list">
                    <!-- Pinned messages will be populated here -->
                    <div class="pingbash-no-pinned-messages">
                      No pinned messages found.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
        
        <!-- Moderator Management Popup -->
        <div class="pingbash-moderator-management-popup" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content">
            <div class="pingbash-popup-header">
              <h3>Moderator Management</h3>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <div class="pingbash-moderator-management-content">
                
                <!-- Current Moderators Section -->
                <div class="pingbash-moderators-section">
                  <h4>Current Moderators</h4>
                  <div class="pingbash-moderators-list">
                    <!-- Moderators will be populated here -->
                  </div>
                </div>

                <!-- Add Moderator Section -->
                <div class="pingbash-add-moderator-section">
                  <h4>Add Moderator</h4>
                  <div class="pingbash-member-search">
                    <input type="text" class="pingbash-member-search-input" placeholder="Search members to add as moderator...">
                    <div class="pingbash-member-search-results" style="display: none;">
                      <!-- Search results will be populated here -->
                    </div>
                  </div>
                </div>

                <!-- Moderator Permissions Popup (shown when editing a moderator) -->
                <div class="pingbash-mod-permissions-popup" style="display: none;">
                  <div class="pingbash-mod-permissions-overlay"></div>
                  <div class="pingbash-mod-permissions-content" style="height:500px">
                    <div class="pingbash-mod-permissions-header">
                      <h4>Edit Moderator Permissions</h4>
                      <button class="pingbash-mod-permissions-close">×</button>
                    </div>
                    <div class="pingbash-mod-permissions-body">
                      <div class="pingbash-moderator-info">
                        <div class="pingbash-moderator-avatar"></div>
                        <div class="pingbash-moderator-name"></div>
                      </div>
                      <div class="pingbash-permissions-list">
                        <label class="pingbash-permission-item">
                          <input type="checkbox" class="pingbash-permission-checkbox" data-permission="chat_limit">
                          <span class="pingbash-permission-label">Chat Limitations</span>
                          <small class="pingbash-permission-description">Can manage chat limitations (post level, URL level, slow mode)</small>
                        </label>
                        <label class="pingbash-permission-item">
                          <input type="checkbox" class="pingbash-permission-checkbox" data-permission="manage_mods">
                          <span class="pingbash-permission-label">Manage Moderators</span>
                          <small class="pingbash-permission-description">Can add/remove moderators and edit their permissions</small>
                        </label>
                        <label class="pingbash-permission-item">
                          <input type="checkbox" class="pingbash-permission-checkbox" data-permission="manage_chat">
                          <span class="pingbash-permission-label">Manage Chat</span>
                          <small class="pingbash-permission-description">Can clear chat and manage pinned messages</small>
                        </label>
                        <label class="pingbash-permission-item">
                          <input type="checkbox" class="pingbash-permission-checkbox" data-permission="manage_censored">
                          <span class="pingbash-permission-label">Manage Censored Content</span>
                          <small class="pingbash-permission-description">Can manage censored words and content filtering</small>
                        </label>
                        <label class="pingbash-permission-item">
                          <input type="checkbox" class="pingbash-permission-checkbox" data-permission="ban_user">
                          <span class="pingbash-permission-label">Ban Users</span>
                          <small class="pingbash-permission-description">Can ban and timeout users</small>
                        </label>
                      </div>
                    </div>
                    <div class="pingbash-mod-permissions-footer">
                      <button class="pingbash-mod-permissions-cancel">Cancel</button>
                      <button class="pingbash-mod-permissions-save">Save Permissions</button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
            <div class="pingbash-popup-footer">
              <button class="pingbash-moderators-cancel-btn">Cancel</button>
              <button class="pingbash-moderators-save-btn">Save Changes</button>
            </div>
          </div>
        </div>
        
        <!-- Censored Content Popup -->
        <div class="pingbash-censored-content-popup" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content">
            <div class="pingbash-popup-header">
              <h3>Censored Content List</h3>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <div class="pingbash-censored-content-content">
                
                <!-- Censored Words List -->
                <div class="pingbash-censored-words-list">
                  <!-- Words will be populated here -->
                </div>
                
                <!-- Add New Word Section -->
                <div class="pingbash-add-word-section">
                  <div class="pingbash-word-input-container">
                    <input type="text" class="pingbash-censored-word-input" placeholder="Enter censored word" maxlength="50">
                    <button class="pingbash-add-word-btn">Add</button>
                  </div>
                </div>

              </div>
            </div>
            <div class="pingbash-popup-footer">
              <button class="pingbash-censored-close-btn">Close</button>
              <button class="pingbash-censored-save-btn" style="display: none;">Save Changes</button>
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
    },

  // EXACT COPY from widget.js - updatePosition method
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
    },

  // EXACT COPY from widget.js - minimizeDialog method
    minimizeDialog() {
      this.closeDialog();
    },

    // NEW METHOD - Create group creation modal as body child for larger size
    createGroupCreationModalInBody() {
      // Check if modal already exists in body
      let existingModal = document.body.querySelector('.pingbash-group-creation-modal-body');
      if (existingModal) {
        return existingModal;
      }

      // Create the modal HTML - W Version Style
      const modalHTML = `
        <div class="pingbash-group-creation-modal-body" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content pingbash-group-creation-content">
            <div class="pingbash-popup-header">
              <h2 class="pingbash-modal-title">Create New Group</h2>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <!-- Group Name Input (W Version Style) -->
              <div class="pingbash-group-name-section">
                <label class="pingbash-input-label">Group Name *</label>
                <input 
                  type="text" 
                  id="group-name-input-body" 
                  class="pingbash-group-name-input" 
                  placeholder="Enter group name..." 
                  maxlength="50"
                />
                <div class="pingbash-char-counter" style="display: none;">0/50 characters</div>
              </div>

              <!-- Group Configuration Widget (W Version Style) -->
              <div class="pingbash-group-config-widget">
                <!-- Toggle Button -->
                <button class="pingbash-config-toggle" title="Toggle Configuration Panel">
                  <span class="pingbash-toggle-icon">‹</span>
                </button>
                
                <div class="pingbash-config-container">
                  <!-- Configuration Panel -->
                  <div class="pingbash-config-panel" id="config-panel-body">
                    <div class="pingbash-config-section">
                      <h3 class="pingbash-config-title">Size</h3>
                      <div class="pingbash-radio-group">
                        <label class="pingbash-radio-option">
                          <input type="radio" name="size-mode-body" value="fixed" checked />
                          <span class="pingbash-radio-dot"></span>
                          Fixed
                        </label>
                        <label class="pingbash-radio-option">
                          <input type="radio" name="size-mode-body" value="responsive" />
                          <span class="pingbash-radio-dot"></span>
                          Responsive
                        </label>
                      </div>
                      
                      <div class="pingbash-size-inputs">
                        <div class="pingbash-input-group">
                          <input type="number" id="width-input-body" class="pingbash-size-input" value="500" />
                          <label>Width (px)</label>
                        </div>
                        <div class="pingbash-input-group">
                          <input type="number" id="height-input-body" class="pingbash-size-input" value="400" />
                          <label>Height (px)</label>
                        </div>
                      </div>
                    </div>

                    <div class="pingbash-config-section">
                      <h3 class="pingbash-config-title">Colors</h3>
                      <div class="pingbash-color-grid">
                        <div class="pingbash-color-item">
                          <label>Background</label>
                          <input type="color" id="bg-color-body" value="#FFFFFF" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Titles and icons</label>
                          <input type="color" id="title-color-body" value="#333333" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Messages bg</label>
                          <input type="color" id="msg-bg-color-body" value="#F5F5F5" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Messages text</label>
                          <input type="color" id="msg-text-color-body" value="#000000" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Reply message</label>
                          <input type="color" id="reply-color-body" value="#1E81B0" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Date text</label>
                          <input type="color" id="date-color-body" value="#666666" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Input bg</label>
                          <input type="color" id="input-bg-color-body" value="#FFFFFF" />
                        </div>
                      </div>
                    </div>

                    <div class="pingbash-config-section">
                      <h3 class="pingbash-config-title">Settings</h3>
                      <div class="pingbash-settings-grid">
                        <label class="pingbash-checkbox-option">
                          <input type="checkbox" id="user-images-body" checked />
                          <span class="pingbash-checkbox-mark"></span>
                          Show user images
                        </label>
                        <label class="pingbash-checkbox-option">
                          <input type="checkbox" id="custom-font-size-body" />
                          <span class="pingbash-checkbox-mark"></span>
                          Custom font size
                        </label>
                        <label class="pingbash-checkbox-option">
                          <input type="checkbox" id="round-corners-body" checked />
                          <span class="pingbash-checkbox-mark"></span>
                          Round corners
                        </label>
                        <label class="pingbash-checkbox-option">
                          <input type="checkbox" id="show-chat-rules-body" />
                          <span class="pingbash-checkbox-mark"></span>
                          Show chat rules
                        </label>
                      </div>
                      
                      <div class="pingbash-font-size-section" style="display: none;">
                        <label>Font Size</label>
                        <input type="range" id="font-size-slider-body" min="12" max="20" value="14" />
                        <span class="pingbash-font-size-value">14px</span>
                      </div>
                      
                      <div class="pingbash-corner-radius-section">
                        <label>Corner Radius</label>
                        <input type="range" id="corner-radius-slider-body" min="0" max="20" value="8" />
                        <span class="pingbash-corner-radius-value">8px</span>
                      </div>
                    </div>
                  </div>

                  <!-- Chat Preview -->
                  <div class="pingbash-chat-preview">
                    <!-- Draggable Chat Container (EXACT SAME HTML as actual chat) -->
                    <div class="pingbash-preview-container" id="draggable-chat-preview">
                      <!-- Header (EXACT SAME as actual chat header) -->
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
                              <div class="pingbash-menu-item" data-action="chat-rules">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                                </svg>
                                Chat Rules
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
                      
                      <!-- Messages Area (EXACT SAME HTML as actual chat) -->
                      <article class="pingbash-messages-area">
                        <div class="pingbash-messages-container">
                          <div class="pingbash-messages-list" id="preview-messages-list">
                            <!-- This will be populated with exact same content as actual chat -->
                          </div>
                        </div>
                      </article>
                      
                      <!-- Reply Preview (EXACT SAME as actual chat) -->
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
                      
                      <!-- Bottom Bar (EXACT SAME HTML as actual chat) -->
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
                          <div class="pingbash-input-row">
                            <input 
                              type="text" 
                              id="preview-message-input"
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
                      
                      <!-- Resize Handle -->
                      <div class="pingbash-resize-handle" title="Drag to resize">↘</div>
                    </div>
                    
                    <!-- Demo Background Text -->
                    <div class="pingbash-preview-demo-text">
                      <h2>PingBash Group Creating</h2>
                      <p>Drag the chat box around and resize it!</p>
                      <p>Configure colors and settings in the left panel</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Create Button (W Version Style) -->
              <button class="pingbash-create-group-btn" disabled>Create Group</button>
            </div>
          </div>
        </div>
      `;

      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = modalHTML;
      const modal = tempDiv.firstElementChild;

      // Append to body
      document.body.appendChild(modal);

      // Ensure modal is on top with maximum z-index
      modal.style.zIndex = '2147483648';
      modal.style.position = 'fixed';

      console.log('🏗️ [Widget] Group creation modal created and attached to body');
      return modal;
    },

  });
}