/**
 * UI functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add ui methods to the prototype
if( window.isDebugging ) console.log('🔍 [UI] Checking PingbashChatWidget:', !!window.PingbashChatWidget, !!window.PingbashChatWidget?.prototype);
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
  if( window.isDebugging ) console.log('✅ [UI] Adding UI methods to prototype');
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
      
      // Setup drag functionality for dialog only
      this.setupDragFunctionality();
      
      // Set initial state: dialog will be opened by default, button hidden
      this.isOpen = false; // Will be set to true when dialog opens
      this.updateButtonVisibility();
    },

    // NEW METHOD - Setup drag and drop functionality for dialog only
    setupDragFunctionality() {
      if (!this.dialog) return;
      
      // Check if device is mobile (disable drag on mobile)
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        if( window.isDebugging ) console.log('📱 [Widget] Mobile device detected - disabling drag functionality');
        return;
      }
      
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };
      
      // Make header draggable (only when dialog is open and not on mobile)
      const header = this.dialog.querySelector('.pingbash-header');
      if (header) {
        header.style.cursor = 'move';
        header.style.userSelect = 'none';
        
        const handleMouseDown = (e) => {
          // Only drag when dialog is open and clicking on header elements, not buttons
          if (!this.isOpen || e.target.closest('button')) {
            return;
          }
          
          // Double-check mobile status at interaction time
          if (window.innerWidth <= 768) {
            return;
          }
          
          isDragging = true;
          const rect = this.dialog.getBoundingClientRect();
          dragOffset.x = e.clientX - rect.left;
          dragOffset.y = e.clientY - rect.top;
          
          header.style.cursor = 'grabbing';
          this.dialog.classList.add('dragging');
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
          e.preventDefault();
        };
        
        const handleMouseMove = (e) => {
          if (!isDragging || window.innerWidth <= 768) return;
          
          const newX = e.clientX - dragOffset.x;
          const newY = e.clientY - dragOffset.y;
          
          // Keep dialog within viewport bounds
          const maxX = window.innerWidth - this.dialog.offsetWidth;
          const maxY = window.innerHeight - this.dialog.offsetHeight;
          
          const constrainedX = Math.max(0, Math.min(newX, maxX));
          const constrainedY = Math.max(0, Math.min(newY, maxY));
          
          this.dialog.style.left = constrainedX + 'px';
          this.dialog.style.top = constrainedY + 'px';
          this.dialog.style.position = 'fixed';
          this.dialog.style.transform = 'none';
        };
        
        const handleMouseUp = () => {
          isDragging = false;
          header.style.cursor = window.innerWidth <= 768 ? 'default' : 'move';
          this.dialog.classList.remove('dragging');
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };
        
        header.addEventListener('mousedown', handleMouseDown);
        
        // Update cursor on window resize
        window.addEventListener('resize', () => {
          if (window.innerWidth <= 768) {
            header.style.cursor = 'default';
          } else if (!isDragging) {
            header.style.cursor = 'move';
          }
        });
      }
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

      this.button.style.display = 'none';
  
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
                
                              <div class="pingbash-menu-item pingbash-favorites-toggle" data-action="toggle-favorites" style="display: none;">
                <svg viewBox="0 0 24 24" width="16" height="16" class="pingbash-favorites-icon">
                  <path fill="currentColor" d="M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z"/>
                  </svg>
                <span class="pingbash-favorites-text">Add to Favorites</span>
                </div>
                <div class="pingbash-menu-item" data-action="hide-chat">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.36,7 12,7Z"/>
                  </svg>
                  Hide Chat
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
                    <path fill="currentColor" d="M10,17V14H3V10H10V7L15,12L10,17M10,2H19A2,2 0 0,1 21,4V20A2,2 0 0,1 19,22H10A2,2 0 0,1 8,20V18H10V6H8V4A2,2 0 0,1 10,2Z"/>
                  </svg>
                  Log in
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
        <!-- First Bottom Bar: Input and Send Button Only -->
        <nav class="pingbash-input-bar">
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
        
        <!-- Second Bottom Bar: Controls Only -->
        <nav class="pingbash-controls-bar">
          <!-- Left side: Media controls -->
          <div class="pingbash-controls-left">
            <button class="pingbash-control-btn pingbash-image-btn" title="Send image">
              <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                </svg>
              </button>
            <button class="pingbash-control-btn pingbash-file-btn" title="Attach file">
              <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M16.5,6V17.5A4,4 0 0,1 12.5,21.5A4,4 0 0,1 8.5,17.5V5A2.5,2.5 0 0,1 11,2.5A2.5,2.5 0 0,1 13.5,5V15.5A1,1 0 0,1 12.5,16.5A1,1 0 0,1 11.5,15.5V6H10V15.5A2.5,2.5 0 0,0 12.5,18A2.5,2.5 0 0,0 15,15.5V5A4,4 0 0,0 11,1A4,4 0 0,0 7,5V17.5A5.5,5.5 0 0,0 12.5,23A5.5,5.5 0 0,0 18,17.5V6H16.5Z"/>
                </svg>
              </button>
            <button class="pingbash-control-btn pingbash-emoji-btn" title="Add emoji">
              <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M12,2C6.486,2,2,6.486,2,12s4.486,10,10,10s10-4.486,10-10S17.514,2,12,2z M8.5,9C9.328,9,10,9.672,10,10.5 S9.328,12,8.5,12S7,11.328,7,10.5S7.672,9,8.5,9z M12,18c-4,0-5-3-5-3h10C17,15,16,18,12,18z M15.5,12C14.672,12,14,11.328,14,10.5 S14.672,9,15.5,9S17,9.672,17,10.5S16.328,12,15.5,12z"/>
                </svg>
              </button>
            <button class="pingbash-control-btn pingbash-sound-btn" title="Sound settings">
              <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.85 14,18.71V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"/>
                </svg>
              </button>
          </div>
          
          <!-- Right side: Chat controls -->
          <div class="pingbash-controls-right">
            <!-- Chat Mode Filter -->
            <div class="pingbash-filter-container pingbash-control-btn" style="display: none;">
              <div class="pingbash-filter-icon" title="Chat Mode">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M6,13H18V11H6M3,6V8H21V6M10,18H14V16H10V18Z"/>
                </svg>
              </div>
              <div class="pingbash-filter-dropdown" style="display: none;">
                <div class="pingbash-filter-widget">
                  <div class="pingbash-filter-option" style="display: block;">
                    <input type="radio" id="filter-public" name="filter-mode" value="0" checked>
                    <label for="filter-public">Public Mode</label>
                  </div>
                  <div class="pingbash-filter-option" style="display: block;">
                    <input type="radio" id="filter-oneone" name="filter-mode" value="1">
                    <label for="filter-oneone">1 on 1 Mode</label>
                  </div>
                  <div class="pingbash-filter-option pingbash-mods-option" style="display: none;">
                    <input type="radio" id="filter-mods" name="filter-mode" value="2">
                    <label for="filter-mods">Mods Mode</label>
                  </div>
                </div>
            </div>
          </div>
          
            <!-- Online Users Badge -->
            <div class="pingbash-online-users-container">
              <button class="pingbash-control-btn pingbash-online-users-icon" title="Online Users">
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="currentColor" d="M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6C7.11,6 8,6.89 8,8C8,9.11 7.11,10 6,10C4.89,10 4,9.11 4,8C4,6.89 4.89,6 6,6M6,12C8.67,12 12,13.34 12,16V18H0V16C0,13.34 3.33,12 6,12Z"/>
                </svg>
                <span class="pingbash-online-count-badge">0</span>
              </button>
            </div>
            
            <!-- Settings Menu (Admin Tools) -->
            <div class="pingbash-settings-container" style="display: none;">
              <button class="pingbash-control-btn pingbash-settings-btn" title="Settings">
                <svg viewBox="0 0 24 24" width="18" height="18">
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
                <div class="pingbash-menu-item" data-action="edit-chat-style" style="display: none;">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7A1,1 0 0,0 14,8H18A1,1 0 0,0 19,7V5.73C18.4,5.39 18,4.74 18,4A2,2 0 0,1 20,2A2,2 0 0,1 22,4C22,4.74 21.6,5.39 21,5.73V7A3,3 0 0,1 18,10H14A3,3 0 0,1 11,7V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2Z"/>
                  </svg>
                  Edit Chat Style
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
                <div class="pingbash-menu-item" data-action="send-notification" style="display: none;">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M21,19V20H3V19L5,17V11C5,7.9 7.03,5.17 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V17L21,19M17,11A5,5 0 0,0 12,6A5,5 0 0,0 7,11V18H17V11Z"/>
                  </svg>
                  Send Notification
                </div>
              </div>
            </div>
          </div>
        </nav>
        
        <!-- Sign In Modal -->
        <div class="pingbash-signin-modal" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content" style="height:410px">
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
                <div class="pingbash-auth-footer">
                  <p>Don't have an account? <button class="pingbash-show-signup-btn">Sign Up</button></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Signup Modal -->
        <div class="pingbash-signup-modal" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content" style="height:576px">
            <div class="pingbash-popup-header">
              <h3>Sign Up for ${this.config.groupName}</h3>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <div class="pingbash-signup-form">
                <div class="pingbash-form-group">
                  <label for="signup-email">Email:</label>
                  <input type="email" id="signup-email" class="pingbash-form-input" placeholder="Enter your email">
                </div>
                <div class="pingbash-form-group">
                  <label for="signup-name">Full Name:</label>
                  <input type="text" id="signup-name" class="pingbash-form-input" placeholder="Enter your full name">
                </div>
                <div class="pingbash-form-group">
                  <label for="signup-password">Password:</label>
                  <input type="password" id="signup-password" class="pingbash-form-input" placeholder="Enter your password">
                </div>
                <div class="pingbash-form-group">
                  <label for="signup-confirm-password">Confirm Password:</label>
                  <input type="password" id="signup-confirm-password" class="pingbash-form-input" placeholder="Confirm your password">
                </div>
                <div class="pingbash-signup-options">
                  <button class="pingbash-signup-submit-btn">Sign Up</button>
                  <button class="pingbash-continue-anon-btn">Continue as Guest</button>
                </div>
                <div class="pingbash-auth-footer">
                  <p>Already have an account? <button class="pingbash-show-signin-btn">Sign In</button></p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Email Verification Modal -->
        <div class="pingbash-verification-modal" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content" style="height:auto; max-height:90vh; width:400px; max-width:90vw;">
            <div class="pingbash-popup-header">
              <h3>Verify Your Email</h3>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <div class="pingbash-verification-form">
                <div class="pingbash-verification-icon">
                  <svg viewBox="0 0 24 24" width="48" height="48" style="color: #28a745;">
                    <path fill="currentColor" d="M20,8L12,13L4,8V6L12,11L20,6M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.11,4 20,4Z"/>
                  </svg>
                </div>
                <p class="pingbash-verification-text">
                  We've sent a verification code to <span class="pingbash-verification-email"></span>
                </p>
                <div class="pingbash-otp-container">
                  <input type="text" class="pingbash-otp-input" maxlength="1" data-index="0">
                  <input type="text" class="pingbash-otp-input" maxlength="1" data-index="1">
                  <input type="text" class="pingbash-otp-input" maxlength="1" data-index="2">
                  <input type="text" class="pingbash-otp-input" maxlength="1" data-index="3">
                  <input type="text" class="pingbash-otp-input" maxlength="1" data-index="4">
                  <input type="text" class="pingbash-otp-input" maxlength="1" data-index="5">
                </div>
                <div class="pingbash-verification-timer">
                  Code expires in <span class="pingbash-timer-display">05:00</span>
                </div>
                <div class="pingbash-verification-actions">
                  <button class="pingbash-verify-btn">Verify</button>
                  <button class="pingbash-resend-btn">Resend Code</button>
                </div>
                <div class="pingbash-verification-footer">
                  <p>Wrong email? <button class="pingbash-back-to-signin-btn">Back to Sign In</button></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Search Modal -->
        <div class="pingbash-user-search-modal" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content" style="height:auto; max-height:80vh; width:500px; max-width:90vw;">
            <div class="pingbash-popup-header">
              <h3>Select User for 1-on-1 Chat</h3>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <div class="pingbash-user-search-form">
                <div class="pingbash-search-input-container">
                  <input type="text" class="pingbash-user-search-modal-input" placeholder="Search users...">
                  <svg class="pingbash-search-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                  </svg>
                </div>
                <div class="pingbash-user-search-results">
                  <div class="pingbash-loading-users" style="text-align: center; padding: 20px; color: #666;">
                    Loading users...
                  </div>
                </div>
              </div>
            </div>
            <div class="pingbash-popup-footer">
              <button class="pingbash-user-search-cancel-btn">Cancel</button>
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
                <label for="sound-all">All Sounds</label>
              </div>
              <div class="pingbash-sound-option">
                <input type="radio" id="sound-mention" name="sound" value="mention">
                <label for="sound-mention">Only Mention</label>
              </div>
              <div class="pingbash-sound-option">
                <input type="radio" id="sound-off" name="sound" value="off">
                <label for="sound-off">No sounds</label>
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
        
                  <!-- Enhanced Emoji & GIF Picker Modal -->
            <div class="pingbash-emoji-modal" style="display: none;">
              <div class="pingbash-popup-overlay"></div>
              <div class="pingbash-popup-content pingbash-emoji-popup-content">
                <div class="pingbash-emoji-picker">
                  <!-- Header with Search and Close -->
                  <div class="pingbash-emoji-header">
                    <input type="text" class="pingbash-emoji-search" placeholder="Search emojis and GIFs..." />
                    <button class="pingbash-emoji-close">×</button>
                  </div>
                  
                  <!-- Category Tabs -->
                  <div class="pingbash-emoji-tabs">
                    <button class="pingbash-emoji-tab active" data-category="smileys">😀</button>
                    <button class="pingbash-emoji-tab" data-category="people">👋</button>
                    <button class="pingbash-emoji-tab" data-category="nature">🌿</button>
                    <button class="pingbash-emoji-tab" data-category="food">🍕</button>
                    <button class="pingbash-emoji-tab" data-category="activities">⚽</button>
                    <button class="pingbash-emoji-tab" data-category="travel">🚗</button>
                    <button class="pingbash-emoji-tab" data-category="objects">💡</button>
                    <button class="pingbash-emoji-tab" data-category="symbols">❤️</button>
                    <button class="pingbash-emoji-tab" data-category="flags">🏁</button>
                    <button class="pingbash-emoji-tab" data-category="gifs">GIF</button>
                </div>
                  
                  <!-- Emoji/GIF Content Area -->
                  <div class="pingbash-emoji-content">
                    <!-- Emoji Grid -->
                    <div class="pingbash-emoji-grid">
                      <!-- Smileys & Emotion -->
                      <span class="pingbash-emoji" data-emoji="😀" data-keywords="grinning face happy smile" data-category="smileys">😀</span>
                      <span class="pingbash-emoji" data-emoji="😃" data-keywords="grinning face with big eyes happy smile">😃</span>
                      <span class="pingbash-emoji" data-emoji="😄" data-keywords="grinning face with smiling eyes happy laugh">😄</span>
                      <span class="pingbash-emoji" data-emoji="😁" data-keywords="beaming face with smiling eyes happy laugh">😁</span>
                      <span class="pingbash-emoji" data-emoji="😆" data-keywords="grinning squinting face happy laugh">😆</span>
                      <span class="pingbash-emoji" data-emoji="😅" data-keywords="grinning face with sweat happy laugh nervous">😅</span>
                      <span class="pingbash-emoji" data-emoji="🤣" data-keywords="rolling on the floor laughing rofl lol">🤣</span>
                      <span class="pingbash-emoji" data-emoji="😂" data-keywords="face with tears of joy laugh lol crying">😂</span>
                      <span class="pingbash-emoji" data-emoji="🙂" data-keywords="slightly smiling face happy">🙂</span>
                      <span class="pingbash-emoji" data-emoji="🙃" data-keywords="upside-down face silly sarcasm">🙃</span>
                      <span class="pingbash-emoji" data-emoji="😊" data-keywords="smiling face with smiling eyes happy blush">😊</span>
                      <span class="pingbash-emoji" data-emoji="😇" data-keywords="smiling face with halo angel innocent">😇</span>
                      <span class="pingbash-emoji" data-emoji="🥰" data-keywords="smiling face with hearts love adore">🥰</span>
                      <span class="pingbash-emoji" data-emoji="😍" data-keywords="smiling face with heart-eyes love">😍</span>
                      <span class="pingbash-emoji" data-emoji="🤩" data-keywords="star-struck starstruck amazing wow">🤩</span>
                      <span class="pingbash-emoji" data-emoji="😘" data-keywords="face blowing a kiss love">😘</span>
                      <span class="pingbash-emoji" data-emoji="😗" data-keywords="kissing face kiss">😗</span>
                      <span class="pingbash-emoji" data-emoji="☺️" data-keywords="smiling face happy relaxed">☺️</span>
                      <span class="pingbash-emoji" data-emoji="😚" data-keywords="kissing face with closed eyes kiss">😚</span>
                      <span class="pingbash-emoji" data-emoji="😙" data-keywords="kissing face with smiling eyes kiss">😙</span>
                      <span class="pingbash-emoji" data-emoji="🥲" data-keywords="smiling face with tear happy cry">🥲</span>
                      <span class="pingbash-emoji" data-emoji="😋" data-keywords="face savoring food yum delicious">😋</span>
                      <span class="pingbash-emoji" data-emoji="😛" data-keywords="face with tongue silly playful">😛</span>
                      <span class="pingbash-emoji" data-emoji="😜" data-keywords="winking face with tongue playful">😜</span>
                      <span class="pingbash-emoji" data-emoji="🤪" data-keywords="zany face crazy silly">🤪</span>
                      <span class="pingbash-emoji" data-emoji="😝" data-keywords="squinting face with tongue silly">😝</span>
                      <span class="pingbash-emoji" data-emoji="🤑" data-keywords="money-mouth face greedy rich">🤑</span>
                      <span class="pingbash-emoji" data-emoji="🤗" data-keywords="hugging face hug love">🤗</span>
                      <span class="pingbash-emoji" data-emoji="🤭" data-keywords="face with hand over mouth oops">🤭</span>
                      <span class="pingbash-emoji" data-emoji="🤫" data-keywords="shushing face quiet secret">🤫</span>
                      <span class="pingbash-emoji" data-emoji="🤔" data-keywords="thinking face hmm ponder">🤔</span>
                      <span class="pingbash-emoji" data-emoji="🤐" data-keywords="zipper-mouth face quiet">🤐</span>
                      <span class="pingbash-emoji" data-emoji="🤨" data-keywords="face with raised eyebrow skeptical">🤨</span>
                      <span class="pingbash-emoji" data-emoji="😐" data-keywords="neutral face meh">😐</span>
                      <span class="pingbash-emoji" data-emoji="😑" data-keywords="expressionless face blank">😑</span>
                      <span class="pingbash-emoji" data-emoji="😶" data-keywords="face without mouth silent">😶</span>
                      <span class="pingbash-emoji" data-emoji="😏" data-keywords="smirking face smug">😏</span>
                      <span class="pingbash-emoji" data-emoji="😒" data-keywords="unamused face meh bored">😒</span>
                      <span class="pingbash-emoji" data-emoji="🙄" data-keywords="face with rolling eyes annoyed">🙄</span>
                      <span class="pingbash-emoji" data-emoji="😬" data-keywords="grimacing face awkward">😬</span>
                      <span class="pingbash-emoji" data-emoji="🤥" data-keywords="lying face pinocchio dishonest">🤥</span>
                      <span class="pingbash-emoji" data-emoji="😔" data-keywords="pensive face sad thoughtful">😔</span>
                      <span class="pingbash-emoji" data-emoji="😕" data-keywords="confused face puzzled">😕</span>
                      <span class="pingbash-emoji" data-emoji="🙁" data-keywords="slightly frowning face sad">🙁</span>
                      <span class="pingbash-emoji" data-emoji="☹️" data-keywords="frowning face sad">☹️</span>
                      <span class="pingbash-emoji" data-emoji="😣" data-keywords="persevering face struggle">😣</span>
                      <span class="pingbash-emoji" data-emoji="😞" data-keywords="disappointed face sad">😞</span>
                      <span class="pingbash-emoji" data-emoji="😖" data-keywords="confounded face frustrated">😖</span>
                      <span class="pingbash-emoji" data-emoji="😤" data-keywords="face with steam from nose angry huffing">😤</span>
                      <span class="pingbash-emoji" data-emoji="😢" data-keywords="crying face sad tear">😢</span>
                      <span class="pingbash-emoji" data-emoji="😭" data-keywords="loudly crying face bawling">😭</span>
                      <span class="pingbash-emoji" data-emoji="😪" data-keywords="sleepy face tired">😪</span>
                      <span class="pingbash-emoji" data-emoji="😥" data-keywords="sad but relieved face disappointed">😥</span>
                      <span class="pingbash-emoji" data-emoji="😰" data-keywords="anxious face with sweat nervous">😰</span>
                      <span class="pingbash-emoji" data-emoji="😅" data-keywords="grinning face with sweat nervous laugh">😅</span>
                      <span class="pingbash-emoji" data-emoji="😓" data-keywords="downcast face with sweat tired">😓</span>
                      <span class="pingbash-emoji" data-emoji="🤯" data-keywords="exploding head mind blown shocked">🤯</span>
                      <span class="pingbash-emoji" data-emoji="😳" data-keywords="flushed face embarrassed blush">😳</span>
                      <span class="pingbash-emoji" data-emoji="🥵" data-keywords="hot face sweating burning">🥵</span>
                      <span class="pingbash-emoji" data-emoji="🥶" data-keywords="cold face freezing">🥶</span>
                      <span class="pingbash-emoji" data-emoji="😱" data-keywords="face screaming in fear scared">😱</span>
                      <span class="pingbash-emoji" data-emoji="😨" data-keywords="fearful face scared afraid">😨</span>
                      <span class="pingbash-emoji" data-emoji="😰" data-keywords="anxious face with sweat worried">😰</span>
                      <span class="pingbash-emoji" data-emoji="😯" data-keywords="hushed face surprised">😯</span>
                      <span class="pingbash-emoji" data-emoji="😦" data-keywords="frowning face with open mouth shocked">😦</span>
                      <span class="pingbash-emoji" data-emoji="😧" data-keywords="anguished face distressed">😧</span>
                      <span class="pingbash-emoji" data-emoji="😮" data-keywords="face with open mouth surprised">😮</span>
                      <span class="pingbash-emoji" data-emoji="😲" data-keywords="astonished face amazed">😲</span>
                      <span class="pingbash-emoji" data-emoji="🥱" data-keywords="yawning face tired sleepy">🥱</span>
                      <span class="pingbash-emoji" data-emoji="😴" data-keywords="sleeping face zzz">😴</span>
                      <span class="pingbash-emoji" data-emoji="🤤" data-keywords="drooling face">🤤</span>
                      <span class="pingbash-emoji" data-emoji="😪" data-keywords="sleepy face tired">😪</span>
                      <span class="pingbash-emoji" data-emoji="😵" data-keywords="dizzy face knockout">😵</span>
                      <span class="pingbash-emoji" data-emoji="🤐" data-keywords="zipper-mouth face quiet">🤐</span>
                      <span class="pingbash-emoji" data-emoji="🥴" data-keywords="woozy face drunk dizzy">🥴</span>
                      <span class="pingbash-emoji" data-emoji="🤢" data-keywords="nauseated face sick">🤢</span>
                      <span class="pingbash-emoji" data-emoji="🤮" data-keywords="face vomiting sick">🤮</span>
                      <span class="pingbash-emoji" data-emoji="🤧" data-keywords="sneezing face sick">🤧</span>
                      <span class="pingbash-emoji" data-emoji="😷" data-keywords="face with medical mask sick">😷</span>
                      <span class="pingbash-emoji" data-emoji="🤒" data-keywords="face with thermometer sick fever">🤒</span>
                      <span class="pingbash-emoji" data-emoji="🤕" data-keywords="face with head-bandage hurt injured" data-category="smileys">🤕</span>
                      
                      <!-- People & Body -->
                      <span class="pingbash-emoji" data-emoji="👋" data-keywords="waving hand hello hi bye" data-category="people">👋</span>
                      <span class="pingbash-emoji" data-emoji="🤚" data-keywords="raised back of hand" data-category="people">🤚</span>
                      <span class="pingbash-emoji" data-emoji="🖐️" data-keywords="hand with fingers splayed" data-category="people">🖐️</span>
                      <span class="pingbash-emoji" data-emoji="✋" data-keywords="raised hand stop" data-category="people">✋</span>
                      <span class="pingbash-emoji" data-emoji="🖖" data-keywords="vulcan salute spock" data-category="people">🖖</span>
                      <span class="pingbash-emoji" data-emoji="👌" data-keywords="ok hand okay" data-category="people">👌</span>
                      <span class="pingbash-emoji" data-emoji="🤏" data-keywords="pinching hand small" data-category="people">🤏</span>
                      <span class="pingbash-emoji" data-emoji="✌️" data-keywords="victory hand peace" data-category="people">✌️</span>
                      <span class="pingbash-emoji" data-emoji="🤞" data-keywords="crossed fingers luck" data-category="people">🤞</span>
                      <span class="pingbash-emoji" data-emoji="🤟" data-keywords="love-you gesture" data-category="people">🤟</span>
                      <span class="pingbash-emoji" data-emoji="🤘" data-keywords="sign of the horns rock" data-category="people">🤘</span>
                      <span class="pingbash-emoji" data-emoji="🤙" data-keywords="call me hand" data-category="people">🤙</span>
                      <span class="pingbash-emoji" data-emoji="👈" data-keywords="backhand index pointing left" data-category="people">👈</span>
                      <span class="pingbash-emoji" data-emoji="👉" data-keywords="backhand index pointing right" data-category="people">👉</span>
                      <span class="pingbash-emoji" data-emoji="👆" data-keywords="backhand index pointing up" data-category="people">👆</span>
                      <span class="pingbash-emoji" data-emoji="👇" data-keywords="backhand index pointing down" data-category="people">👇</span>
                      <span class="pingbash-emoji" data-emoji="☝️" data-keywords="index pointing up" data-category="people">☝️</span>
                      <span class="pingbash-emoji" data-emoji="👍" data-keywords="thumbs up yes good like" data-category="people">👍</span>
                      <span class="pingbash-emoji" data-emoji="👎" data-keywords="thumbs down no bad dislike" data-category="people">👎</span>
                      <span class="pingbash-emoji" data-emoji="✊" data-keywords="raised fist power" data-category="people">✊</span>
                      <span class="pingbash-emoji" data-emoji="👊" data-keywords="oncoming fist punch" data-category="people">👊</span>
                      <span class="pingbash-emoji" data-emoji="🤛" data-keywords="left-facing fist" data-category="people">🤛</span>
                      <span class="pingbash-emoji" data-emoji="🤜" data-keywords="right-facing fist" data-category="people">🤜</span>
                      <span class="pingbash-emoji" data-emoji="👏" data-keywords="clapping hands applause" data-category="people">👏</span>
                      <span class="pingbash-emoji" data-emoji="🙌" data-keywords="raising hands celebration" data-category="people">🙌</span>
                      <span class="pingbash-emoji" data-emoji="👐" data-keywords="open hands" data-category="people">👐</span>
                      <span class="pingbash-emoji" data-emoji="🤲" data-keywords="palms up together" data-category="people">🤲</span>
                      <span class="pingbash-emoji" data-emoji="🙏" data-keywords="folded hands please thanks prayer" data-category="people">🙏</span>
                      <span class="pingbash-emoji" data-emoji="💪" data-keywords="flexed biceps strong muscle" data-category="people">💪</span>
                      
                      <!-- Nature & Animals -->
                      <span class="pingbash-emoji" data-emoji="🌿" data-keywords="herb plant" data-category="nature">🌿</span>
                      <span class="pingbash-emoji" data-emoji="☘️" data-keywords="shamrock clover" data-category="nature">☘️</span>
                      <span class="pingbash-emoji" data-emoji="🍀" data-keywords="four leaf clover luck" data-category="nature">🍀</span>
                      <span class="pingbash-emoji" data-emoji="🌱" data-keywords="seedling plant grow" data-category="nature">🌱</span>
                      <span class="pingbash-emoji" data-emoji="🌲" data-keywords="evergreen tree pine" data-category="nature">🌲</span>
                      <span class="pingbash-emoji" data-emoji="🌳" data-keywords="deciduous tree" data-category="nature">🌳</span>
                      <span class="pingbash-emoji" data-emoji="🌴" data-keywords="palm tree tropical" data-category="nature">🌴</span>
                      <span class="pingbash-emoji" data-emoji="🌵" data-keywords="cactus desert" data-category="nature">🌵</span>
                      <span class="pingbash-emoji" data-emoji="🌾" data-keywords="sheaf of rice grain" data-category="nature">🌾</span>
                      <span class="pingbash-emoji" data-emoji="🌸" data-keywords="cherry blossom flower" data-category="nature">🌸</span>
                      <span class="pingbash-emoji" data-emoji="🌺" data-keywords="hibiscus flower" data-category="nature">🌺</span>
                      <span class="pingbash-emoji" data-emoji="🌻" data-keywords="sunflower" data-category="nature">🌻</span>
                      <span class="pingbash-emoji" data-emoji="🌹" data-keywords="rose flower love" data-category="nature">🌹</span>
                      <span class="pingbash-emoji" data-emoji="🌷" data-keywords="tulip flower" data-category="nature">🌷</span>
                      <span class="pingbash-emoji" data-emoji="🐶" data-keywords="dog face puppy" data-category="nature">🐶</span>
                      <span class="pingbash-emoji" data-emoji="🐱" data-keywords="cat face kitty" data-category="nature">🐱</span>
                      <span class="pingbash-emoji" data-emoji="🐭" data-keywords="mouse face" data-category="nature">🐭</span>
                      <span class="pingbash-emoji" data-emoji="🐹" data-keywords="hamster face" data-category="nature">🐹</span>
                      <span class="pingbash-emoji" data-emoji="🐰" data-keywords="rabbit face bunny" data-category="nature">🐰</span>
                      <span class="pingbash-emoji" data-emoji="🦊" data-keywords="fox face" data-category="nature">🦊</span>
                      <span class="pingbash-emoji" data-emoji="🐻" data-keywords="bear face" data-category="nature">🐻</span>
                      <span class="pingbash-emoji" data-emoji="🐼" data-keywords="panda face" data-category="nature">🐼</span>
                      <span class="pingbash-emoji" data-emoji="🐨" data-keywords="koala face" data-category="nature">🐨</span>
                      <span class="pingbash-emoji" data-emoji="🐯" data-keywords="tiger face" data-category="nature">🐯</span>
                      <span class="pingbash-emoji" data-emoji="🦁" data-keywords="lion face" data-category="nature">🦁</span>
                      
                      <!-- Food & Drink -->
                      <span class="pingbash-emoji" data-emoji="🍕" data-keywords="pizza food" data-category="food">🍕</span>
                      <span class="pingbash-emoji" data-emoji="🍔" data-keywords="hamburger burger food" data-category="food">🍔</span>
                      <span class="pingbash-emoji" data-emoji="🍟" data-keywords="french fries food" data-category="food">🍟</span>
                      <span class="pingbash-emoji" data-emoji="🌭" data-keywords="hot dog food" data-category="food">🌭</span>
                      <span class="pingbash-emoji" data-emoji="🍿" data-keywords="popcorn snack" data-category="food">🍿</span>
                      <span class="pingbash-emoji" data-emoji="🥓" data-keywords="bacon food" data-category="food">🥓</span>
                      <span class="pingbash-emoji" data-emoji="🥚" data-keywords="egg food" data-category="food">🥚</span>
                      <span class="pingbash-emoji" data-emoji="🍳" data-keywords="cooking fried egg" data-category="food">🍳</span>
                      <span class="pingbash-emoji" data-emoji="🥐" data-keywords="croissant bread" data-category="food">🥐</span>
                      <span class="pingbash-emoji" data-emoji="🍞" data-keywords="bread food" data-category="food">🍞</span>
                      <span class="pingbash-emoji" data-emoji="🥖" data-keywords="baguette bread" data-category="food">🥖</span>
                      <span class="pingbash-emoji" data-emoji="🥨" data-keywords="pretzel food" data-category="food">🥨</span>
                      <span class="pingbash-emoji" data-emoji="🧀" data-keywords="cheese wedge food" data-category="food">🧀</span>
                      <span class="pingbash-emoji" data-emoji="🍗" data-keywords="poultry leg chicken" data-category="food">🍗</span>
                      <span class="pingbash-emoji" data-emoji="🍖" data-keywords="meat on bone food" data-category="food">🍖</span>
                      <span class="pingbash-emoji" data-emoji="🌮" data-keywords="taco food mexican" data-category="food">🌮</span>
                      <span class="pingbash-emoji" data-emoji="🌯" data-keywords="burrito food mexican" data-category="food">🌯</span>
                      <span class="pingbash-emoji" data-emoji="🥙" data-keywords="stuffed flatbread food" data-category="food">🥙</span>
                      <span class="pingbash-emoji" data-emoji="🍝" data-keywords="spaghetti pasta food" data-category="food">🍝</span>
                      <span class="pingbash-emoji" data-emoji="🍕" data-keywords="pizza food" data-category="food">🍕</span>
                      <span class="pingbash-emoji" data-emoji="🍰" data-keywords="shortcake cake dessert" data-category="food">🍰</span>
                      <span class="pingbash-emoji" data-emoji="🎂" data-keywords="birthday cake celebration" data-category="food">🎂</span>
                      <span class="pingbash-emoji" data-emoji="🍦" data-keywords="soft ice cream" data-category="food">🍦</span>
                      <span class="pingbash-emoji" data-emoji="🍧" data-keywords="shaved ice" data-category="food">🍧</span>
                      <span class="pingbash-emoji" data-emoji="🍨" data-keywords="ice cream dessert" data-category="food">🍨</span>
                      <span class="pingbash-emoji" data-emoji="🍩" data-keywords="doughnut donut dessert" data-category="food">🍩</span>
                      <span class="pingbash-emoji" data-emoji="🍪" data-keywords="cookie dessert" data-category="food">🍪</span>
                      <span class="pingbash-emoji" data-emoji="🍫" data-keywords="chocolate bar dessert" data-category="food">🍫</span>
                      <span class="pingbash-emoji" data-emoji="🍬" data-keywords="candy sweet" data-category="food">🍬</span>
                      <span class="pingbash-emoji" data-emoji="🍭" data-keywords="lollipop candy" data-category="food">🍭</span>
                      
                      <!-- Activities & Sports -->
                      <span class="pingbash-emoji" data-emoji="⚽" data-keywords="soccer ball football sport" data-category="activities">⚽</span>
                      <span class="pingbash-emoji" data-emoji="🏀" data-keywords="basketball sport" data-category="activities">🏀</span>
                      <span class="pingbash-emoji" data-emoji="🏈" data-keywords="american football sport" data-category="activities">🏈</span>
                      <span class="pingbash-emoji" data-emoji="⚾" data-keywords="baseball sport" data-category="activities">⚾</span>
                      <span class="pingbash-emoji" data-emoji="🥎" data-keywords="softball sport" data-category="activities">🥎</span>
                      <span class="pingbash-emoji" data-emoji="🎾" data-keywords="tennis sport" data-category="activities">🎾</span>
                      <span class="pingbash-emoji" data-emoji="🏐" data-keywords="volleyball sport" data-category="activities">🏐</span>
                      <span class="pingbash-emoji" data-emoji="🏉" data-keywords="rugby football sport" data-category="activities">🏉</span>
                      <span class="pingbash-emoji" data-emoji="🎱" data-keywords="pool 8 ball billiards" data-category="activities">🎱</span>
                      <span class="pingbash-emoji" data-emoji="🏓" data-keywords="ping pong table tennis" data-category="activities">🏓</span>
                      <span class="pingbash-emoji" data-emoji="🏸" data-keywords="badminton sport" data-category="activities">🏸</span>
                      <span class="pingbash-emoji" data-emoji="🥅" data-keywords="goal net sport" data-category="activities">🥅</span>
                      <span class="pingbash-emoji" data-emoji="🏒" data-keywords="ice hockey stick sport" data-category="activities">🏒</span>
                      <span class="pingbash-emoji" data-emoji="🏏" data-keywords="cricket game sport" data-category="activities">🏏</span>
                      <span class="pingbash-emoji" data-emoji="🥊" data-keywords="boxing glove sport" data-category="activities">🥊</span>
                      <span class="pingbash-emoji" data-emoji="🥋" data-keywords="martial arts uniform sport" data-category="activities">🥋</span>
                      <span class="pingbash-emoji" data-emoji="⛳" data-keywords="flag in hole golf" data-category="activities">⛳</span>
                      <span class="pingbash-emoji" data-emoji="🏹" data-keywords="bow and arrow archery" data-category="activities">🏹</span>
                      <span class="pingbash-emoji" data-emoji="🎣" data-keywords="fishing pole" data-category="activities">🎣</span>
                      <span class="pingbash-emoji" data-emoji="🎮" data-keywords="video game controller gaming" data-category="activities">🎮</span>
                      <span class="pingbash-emoji" data-emoji="🎯" data-keywords="direct hit target bullseye" data-category="activities">🎯</span>
                      <span class="pingbash-emoji" data-emoji="🎲" data-keywords="game die dice" data-category="activities">🎲</span>
                      <span class="pingbash-emoji" data-emoji="🎰" data-keywords="slot machine gambling" data-category="activities">🎰</span>
                      <span class="pingbash-emoji" data-emoji="🎳" data-keywords="bowling sport" data-category="activities">🎳</span>
                      
                      <!-- Travel & Places -->
                      <span class="pingbash-emoji" data-emoji="🚗" data-keywords="automobile car vehicle" data-category="travel">🚗</span>
                      <span class="pingbash-emoji" data-emoji="🚕" data-keywords="taxi cab vehicle" data-category="travel">🚕</span>
                      <span class="pingbash-emoji" data-emoji="🚙" data-keywords="sport utility vehicle suv" data-category="travel">🚙</span>
                      <span class="pingbash-emoji" data-emoji="🚌" data-keywords="bus vehicle" data-category="travel">🚌</span>
                      <span class="pingbash-emoji" data-emoji="🚎" data-keywords="trolleybus vehicle" data-category="travel">🚎</span>
                      <span class="pingbash-emoji" data-emoji="🏎️" data-keywords="racing car fast" data-category="travel">🏎️</span>
                      <span class="pingbash-emoji" data-emoji="🚓" data-keywords="police car" data-category="travel">🚓</span>
                      <span class="pingbash-emoji" data-emoji="🚑" data-keywords="ambulance emergency" data-category="travel">🚑</span>
                      <span class="pingbash-emoji" data-emoji="🚒" data-keywords="fire engine truck" data-category="travel">🚒</span>
                      <span class="pingbash-emoji" data-emoji="🚐" data-keywords="minibus vehicle" data-category="travel">🚐</span>
                      <span class="pingbash-emoji" data-emoji="🚚" data-keywords="delivery truck vehicle" data-category="travel">🚚</span>
                      <span class="pingbash-emoji" data-emoji="🚛" data-keywords="articulated lorry truck" data-category="travel">🚛</span>
                      <span class="pingbash-emoji" data-emoji="🚜" data-keywords="tractor vehicle farm" data-category="travel">🚜</span>
                      <span class="pingbash-emoji" data-emoji="🏍️" data-keywords="motorcycle vehicle" data-category="travel">🏍️</span>
                      <span class="pingbash-emoji" data-emoji="🛵" data-keywords="motor scooter vehicle" data-category="travel">🛵</span>
                      <span class="pingbash-emoji" data-emoji="🚲" data-keywords="bicycle bike" data-category="travel">🚲</span>
                      <span class="pingbash-emoji" data-emoji="🛴" data-keywords="kick scooter" data-category="travel">🛴</span>
                      <span class="pingbash-emoji" data-emoji="✈️" data-keywords="airplane plane flight" data-category="travel">✈️</span>
                      <span class="pingbash-emoji" data-emoji="🚁" data-keywords="helicopter" data-category="travel">🚁</span>
                      <span class="pingbash-emoji" data-emoji="🚂" data-keywords="locomotive train" data-category="travel">🚂</span>
                      <span class="pingbash-emoji" data-emoji="🚆" data-keywords="train vehicle" data-category="travel">🚆</span>
                      <span class="pingbash-emoji" data-emoji="🚇" data-keywords="metro subway" data-category="travel">🚇</span>
                      <span class="pingbash-emoji" data-emoji="🚊" data-keywords="tram vehicle" data-category="travel">🚊</span>
                      <span class="pingbash-emoji" data-emoji="🚝" data-keywords="monorail train" data-category="travel">🚝</span>
                      <span class="pingbash-emoji" data-emoji="🚄" data-keywords="high-speed train" data-category="travel">🚄</span>
                      <span class="pingbash-emoji" data-emoji="🚅" data-keywords="bullet train" data-category="travel">🚅</span>
                      <span class="pingbash-emoji" data-emoji="🚢" data-keywords="ship boat" data-category="travel">🚢</span>
                      <span class="pingbash-emoji" data-emoji="⛵" data-keywords="sailboat boat" data-category="travel">⛵</span>
                      <span class="pingbash-emoji" data-emoji="🚤" data-keywords="speedboat boat" data-category="travel">🚤</span>
                      <span class="pingbash-emoji" data-emoji="🛳️" data-keywords="passenger ship cruise" data-category="travel">🛳️</span>
                      
                      <!-- Objects -->
                      <span class="pingbash-emoji" data-emoji="💡" data-keywords="light bulb idea" data-category="objects">💡</span>
                      <span class="pingbash-emoji" data-emoji="🔦" data-keywords="flashlight torch" data-category="objects">🔦</span>
                      <span class="pingbash-emoji" data-emoji="🕯️" data-keywords="candle light" data-category="objects">🕯️</span>
                      <span class="pingbash-emoji" data-emoji="💻" data-keywords="laptop computer" data-category="objects">💻</span>
                      <span class="pingbash-emoji" data-emoji="⌨️" data-keywords="keyboard computer" data-category="objects">⌨️</span>
                      <span class="pingbash-emoji" data-emoji="🖥️" data-keywords="desktop computer" data-category="objects">🖥️</span>
                      <span class="pingbash-emoji" data-emoji="🖨️" data-keywords="printer" data-category="objects">🖨️</span>
                      <span class="pingbash-emoji" data-emoji="🖱️" data-keywords="computer mouse" data-category="objects">🖱️</span>
                      <span class="pingbash-emoji" data-emoji="📱" data-keywords="mobile phone smartphone" data-category="objects">📱</span>
                      <span class="pingbash-emoji" data-emoji="📞" data-keywords="telephone receiver phone" data-category="objects">📞</span>
                      <span class="pingbash-emoji" data-emoji="☎️" data-keywords="telephone phone" data-category="objects">☎️</span>
                      <span class="pingbash-emoji" data-emoji="📟" data-keywords="pager beeper" data-category="objects">📟</span>
                      <span class="pingbash-emoji" data-emoji="📠" data-keywords="fax machine" data-category="objects">📠</span>
                      <span class="pingbash-emoji" data-emoji="📺" data-keywords="television tv" data-category="objects">📺</span>
                      <span class="pingbash-emoji" data-emoji="📻" data-keywords="radio" data-category="objects">📻</span>
                      <span class="pingbash-emoji" data-emoji="🔔" data-keywords="bell notification" data-category="objects">🔔</span>
                      <span class="pingbash-emoji" data-emoji="🔕" data-keywords="bell with slash mute" data-category="objects">🔕</span>
                      <span class="pingbash-emoji" data-emoji="📢" data-keywords="loudspeaker announcement" data-category="objects">📢</span>
                      <span class="pingbash-emoji" data-emoji="📣" data-keywords="megaphone announcement" data-category="objects">📣</span>
                      <span class="pingbash-emoji" data-emoji="📯" data-keywords="postal horn" data-category="objects">📯</span>
                      <span class="pingbash-emoji" data-emoji="🔋" data-keywords="battery power" data-category="objects">🔋</span>
                      <span class="pingbash-emoji" data-emoji="🔌" data-keywords="electric plug power" data-category="objects">🔌</span>
                      <span class="pingbash-emoji" data-emoji="💰" data-keywords="money bag cash" data-category="objects">💰</span>
                      <span class="pingbash-emoji" data-emoji="💵" data-keywords="dollar banknote money" data-category="objects">💵</span>
                      <span class="pingbash-emoji" data-emoji="💳" data-keywords="credit card payment" data-category="objects">💳</span>
                      <span class="pingbash-emoji" data-emoji="💎" data-keywords="gem stone diamond" data-category="objects">💎</span>
                      <span class="pingbash-emoji" data-emoji="🔨" data-keywords="hammer tool" data-category="objects">🔨</span>
                      <span class="pingbash-emoji" data-emoji="🔧" data-keywords="wrench tool" data-category="objects">🔧</span>
                      <span class="pingbash-emoji" data-emoji="🔩" data-keywords="nut and bolt tool" data-category="objects">🔩</span>
                      <span class="pingbash-emoji" data-emoji="⚙️" data-keywords="gear settings" data-category="objects">⚙️</span>
                      
                      <!-- Symbols -->
                      <span class="pingbash-emoji" data-emoji="❤️" data-keywords="red heart love" data-category="symbols">❤️</span>
                      <span class="pingbash-emoji" data-emoji="🧡" data-keywords="orange heart love" data-category="symbols">🧡</span>
                      <span class="pingbash-emoji" data-emoji="💛" data-keywords="yellow heart love" data-category="symbols">💛</span>
                      <span class="pingbash-emoji" data-emoji="💚" data-keywords="green heart love" data-category="symbols">💚</span>
                      <span class="pingbash-emoji" data-emoji="💙" data-keywords="blue heart love" data-category="symbols">💙</span>
                      <span class="pingbash-emoji" data-emoji="💜" data-keywords="purple heart love" data-category="symbols">💜</span>
                      <span class="pingbash-emoji" data-emoji="🖤" data-keywords="black heart love" data-category="symbols">🖤</span>
                      <span class="pingbash-emoji" data-emoji="🤍" data-keywords="white heart love" data-category="symbols">🤍</span>
                      <span class="pingbash-emoji" data-emoji="🤎" data-keywords="brown heart love" data-category="symbols">🤎</span>
                      <span class="pingbash-emoji" data-emoji="💔" data-keywords="broken heart sad" data-category="symbols">💔</span>
                      <span class="pingbash-emoji" data-emoji="❣️" data-keywords="heart exclamation love" data-category="symbols">❣️</span>
                      <span class="pingbash-emoji" data-emoji="💕" data-keywords="two hearts love" data-category="symbols">💕</span>
                      <span class="pingbash-emoji" data-emoji="💞" data-keywords="revolving hearts love" data-category="symbols">💞</span>
                      <span class="pingbash-emoji" data-emoji="💓" data-keywords="beating heart love" data-category="symbols">💓</span>
                      <span class="pingbash-emoji" data-emoji="💗" data-keywords="growing heart love" data-category="symbols">💗</span>
                      <span class="pingbash-emoji" data-emoji="💖" data-keywords="sparkling heart love" data-category="symbols">💖</span>
                      <span class="pingbash-emoji" data-emoji="💘" data-keywords="heart with arrow love cupid" data-category="symbols">💘</span>
                      <span class="pingbash-emoji" data-emoji="💝" data-keywords="heart with ribbon love gift" data-category="symbols">💝</span>
                      <span class="pingbash-emoji" data-emoji="⭐" data-keywords="star favorite" data-category="symbols">⭐</span>
                      <span class="pingbash-emoji" data-emoji="🌟" data-keywords="glowing star favorite" data-category="symbols">🌟</span>
                      <span class="pingbash-emoji" data-emoji="✨" data-keywords="sparkles shine" data-category="symbols">✨</span>
                      <span class="pingbash-emoji" data-emoji="⚡" data-keywords="high voltage lightning fast" data-category="symbols">⚡</span>
                      <span class="pingbash-emoji" data-emoji="🔥" data-keywords="fire hot flame" data-category="symbols">🔥</span>
                      <span class="pingbash-emoji" data-emoji="💯" data-keywords="hundred points perfect" data-category="symbols">💯</span>
                      <span class="pingbash-emoji" data-emoji="✔️" data-keywords="check mark correct" data-category="symbols">✔️</span>
                      <span class="pingbash-emoji" data-emoji="✅" data-keywords="check mark button correct done" data-category="symbols">✅</span>
                      <span class="pingbash-emoji" data-emoji="❌" data-keywords="cross mark wrong" data-category="symbols">❌</span>
                      <span class="pingbash-emoji" data-emoji="❎" data-keywords="cross mark button wrong" data-category="symbols">❎</span>
                      <span class="pingbash-emoji" data-emoji="➕" data-keywords="plus add" data-category="symbols">➕</span>
                      <span class="pingbash-emoji" data-emoji="➖" data-keywords="minus subtract" data-category="symbols">➖</span>
                      
                      <!-- Flags -->
                      <span class="pingbash-emoji" data-emoji="🏁" data-keywords="chequered flag racing finish" data-category="flags">🏁</span>
                      <span class="pingbash-emoji" data-emoji="🚩" data-keywords="triangular flag" data-category="flags">🚩</span>
                      <span class="pingbash-emoji" data-emoji="🎌" data-keywords="crossed flags celebration" data-category="flags">🎌</span>
                      <span class="pingbash-emoji" data-emoji="🏴" data-keywords="black flag" data-category="flags">🏴</span>
                      <span class="pingbash-emoji" data-emoji="🏳️" data-keywords="white flag surrender" data-category="flags">🏳️</span>
                      <span class="pingbash-emoji" data-emoji="🏳️‍🌈" data-keywords="rainbow flag pride lgbtq" data-category="flags">🏳️‍🌈</span>
                      <span class="pingbash-emoji" data-emoji="🇺🇸" data-keywords="flag united states america usa" data-category="flags">🇺🇸</span>
                      <span class="pingbash-emoji" data-emoji="🇬🇧" data-keywords="flag united kingdom uk britain" data-category="flags">🇬🇧</span>
                      <span class="pingbash-emoji" data-emoji="🇨🇦" data-keywords="flag canada" data-category="flags">🇨🇦</span>
                      <span class="pingbash-emoji" data-emoji="🇦🇺" data-keywords="flag australia" data-category="flags">🇦🇺</span>
                      <span class="pingbash-emoji" data-emoji="🇫🇷" data-keywords="flag france" data-category="flags">🇫🇷</span>
                      <span class="pingbash-emoji" data-emoji="🇩🇪" data-keywords="flag germany" data-category="flags">🇩🇪</span>
                      <span class="pingbash-emoji" data-emoji="🇮🇹" data-keywords="flag italy" data-category="flags">🇮🇹</span>
                      <span class="pingbash-emoji" data-emoji="🇪🇸" data-keywords="flag spain" data-category="flags">🇪🇸</span>
                      <span class="pingbash-emoji" data-emoji="🇯🇵" data-keywords="flag japan" data-category="flags">🇯🇵</span>
                      <span class="pingbash-emoji" data-emoji="🇨🇳" data-keywords="flag china" data-category="flags">🇨🇳</span>
                      <span class="pingbash-emoji" data-emoji="🇰🇷" data-keywords="flag south korea" data-category="flags">🇰🇷</span>
                      <span class="pingbash-emoji" data-emoji="🇮🇳" data-keywords="flag india" data-category="flags">🇮🇳</span>
                      <span class="pingbash-emoji" data-emoji="🇧🇷" data-keywords="flag brazil" data-category="flags">🇧🇷</span>
                      <span class="pingbash-emoji" data-emoji="🇲🇽" data-keywords="flag mexico" data-category="flags">🇲🇽</span>
                    </div>
                    
                    <!-- GIF Grid (placeholder) -->
                    <div class="pingbash-gif-grid" data-category="gifs" style="display: none;">
                      <div class="pingbash-gif-placeholder">
                        <p>🔄 Loading GIFs...</p>
                        <p>Popular GIF categories coming soon!</p>
                      </div>
                    </div>
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

            <!-- Send Notification Modal -->
            <div class="pingbash-notification-modal" style="display: none;">
              <div class="pingbash-popup-overlay"></div>
              <div class="pingbash-popup-content">
                <div class="pingbash-popup-header">
                  <h3>📢 Send Group Notification</h3>
                  <button class="pingbash-popup-close">×</button>
                </div>
                <div class="pingbash-popup-body">
                  <div class="pingbash-notification-form">
                    <div class="pingbash-form-group">
                      <label for="notification-message">Notification Message:</label>
                      <textarea 
                        id="notification-message" 
                        class="pingbash-notification-textarea" 
                        placeholder="Enter your notification message for all group members..."
                        maxlength="500"
                        rows="4"
                      ></textarea>
                      <div class="pingbash-char-counter">
                        <span class="pingbash-char-count">0</span>/500 characters
                      </div>
                    </div>
                    <div class="pingbash-notification-preview">
                      <h4>Preview:</h4>
                      <div class="pingbash-notification-preview-content">
                        <div class="pingbash-notification-preview-message">
                          Your notification will appear here...
                        </div>
                      </div>
                    </div>
                    <div class="pingbash-notification-buttons">
                      <button class="pingbash-notification-cancel-btn">Cancel</button>
                      <button class="pingbash-notification-send-btn" disabled>Send Notification</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
  
      this.widget.appendChild(this.dialog);
    
    // Store reference to messages container for DOM operations
    this.messagesContainer = this.dialog.querySelector('.pingbash-messages-list');
    if( window.isDebugging ) console.log('🔍 [Widget] Messages container reference stored:', !!this.messagesContainer);
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
  
      if( window.isDebugging ) console.log('🔄 [Widget] Position updated to:', position);
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

      if( window.isDebugging ) console.log('🏗️ [Widget] Group creation modal created and attached to body');
      return modal;
    },

  });
}