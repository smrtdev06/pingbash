/**
 * Core utility methods
 * EXACT COPY from widget.js - Utility methods only
 */

// Add core utility methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
    if( window.isDebugging ) console.log('✅ [Core] Adding core utility methods to prototype');
    Object.assign(window.PingbashChatWidget.prototype, {

        // EXACT COPY from widget.js - init method
        async init() {
            if( window.isDebugging ) console.log('🚀 Initializing Pingbash Chat Widget...');

            // Load seen rules first
            this.hasSeenRulesForGroup = this.loadSeenRules();

            this.createWidget();
            this.applyStyles();
            
            // Initialize dark mode preference
            this.initializeDarkMode();
            
            // Initialize sound settings
            this.initializeSoundSettings();
            
            // Initialize Google AdSense
            this.initializeGoogleAds();
            
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
                if( window.isDebugging ) console.log('🔐 [Widget] Found saved token, auto-signing in...');
                this.initializeSocket();

                // Check for persisted timeout state
                setTimeout(() => {
                    if (this.groupId) {
                        this.checkPersistedTimeout(this.groupId);
                    }
                }, 1000);

                // Trigger chat rules for auto-signed in users (same as W version)
                setTimeout(() => {
                    if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Triggering chat rules for auto-signed in user');
                    if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Auto-signin state - groupId:', this.groupId, 'socket connected:', this.socket?.connected);
                    this.triggerChatRulesAfterLogin(savedToken, 'logged-in');
                }, 2000); // Longer delay to ensure socket and group are ready
            } else if (savedAnonToken) {
                // Auto-signin with anonymous user (same as W version)
                if( window.isDebugging ) console.log('👤 [Widget] Found saved anonymous token, auto-signing in as anonymous...');

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

                // Check for persisted timeout state
                setTimeout(() => {
                    if (this.groupId) {
                        this.checkPersistedTimeout(this.groupId);
                    }
                }, 1000);

                // Register as anonymous user after socket connection (same as W version)
                setTimeout(() => {
                    if (this.socket && this.socket.connected) {
                        if( window.isDebugging ) console.log('👤 [Widget] Auto-registering as anonymous user with ID:', anonId);
                        this.socket.emit('user logged as annon', { userId: anonId });
                    }
                }, 1000);

                // Trigger chat rules for auto-anonymous users (same as W version)
                setTimeout(() => {
                    if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Triggering chat rules for auto-anonymous user');
                    this.triggerChatRulesAfterLogin(savedAnonToken, 'anonymous');
                }, 2000); // Longer delay to ensure socket and group are ready
            } else {
                // Show sign-in modal for first-time users
                if( window.isDebugging ) console.log('👤 [Widget] New user detected, showing sign-in options...');
                setTimeout(() => this.showSigninModal(), 500);
            }

            // Check if on mobile device
            const isMobile = this.isMobileDevice();
            if( window.isDebugging ) console.log('📱 [Widget] Device detection - isMobile:', isMobile);

            // On mobile: keep dialog closed, show only bubble icon
            // On desktop: open dialog by default
            setTimeout(() => {
                if (!isMobile) {
                    this.openDialog();
                }
                this.updateButtonVisibility();
            }, 1000);
        },

        // EXACT COPY from widget.js - loadSeenRules method
        loadSeenRules() {
            try {
                const stored = localStorage.getItem('pingbash_widget_seen_rules');
                const result = stored ? JSON.parse(stored) : {};
                if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Loaded seen rules from localStorage:', result);
                return result;
            } catch (error) {
                if( window.isDebugging ) console.log('🔍 [Widget] Error loading seen rules:', error);
                return {};
            }
        },

        // Mark rules as seen for a group (same as W version)
        markRulesAsSeen(groupId) {
            if (!groupId) return;

            if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Marking rules as seen for group:', groupId);
            this.hasSeenRulesForGroup[groupId] = true;

            try {
                localStorage.setItem('pingbash_widget_seen_rules', JSON.stringify(this.hasSeenRulesForGroup));
            } catch (error) {
                if( window.isDebugging ) console.log('🔍 [Widget] Error saving seen rules:', error);
            }
        },

        // Generate anonymous ID using persistent localStorage-based approach
        getBrowserFingerprint() {
            return [
                navigator.userAgent,
                navigator.language,
                screen.width,
                screen.height,
                screen.colorDepth,
                Intl.DateTimeFormat().resolvedOptions().timeZone
            ].join('::');
        },

        hashStringToNumber(str) {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = (hash * 33) ^ str.charCodeAt(i);
            }
            return Math.abs(hash >>> 0); // Unsigned 32-bit number
        },

        // Generate a random anonymous ID between 10000000 and 999999999
        generateRandomAnonId() {
            // Generate a random 8-9 digit number
            return Math.floor(Math.random() * 990000000) + 10000000;
        },

        getAnonId() {
            // First, try to get existing anonymous ID from localStorage (persistent storage)
            const storedAnonId = localStorage.getItem('pingbash_anon_id');
            if (storedAnonId) {
                const parsedId = parseInt(storedAnonId);
                if (parsedId && !isNaN(parsedId) && parsedId > 0) {
                    if( window.isDebugging ) console.log('👤 [Widget] Using stored anonymous ID:', parsedId);
                    return parsedId;
                }
            }

            // If no stored ID, generate a new one
            // We'll use fingerprint as a seed, but add randomness to avoid collisions
            const fingerprint = this.getBrowserFingerprint();
            const fingerprintHash = this.hashStringToNumber(fingerprint);
            
            // Combine fingerprint with random number for uniqueness
            const randomComponent = Math.floor(Math.random() * 1000);
            const timestamp = Date.now() % 100000; // Last 5 digits of timestamp
            
            // Create ID from fingerprint + timestamp + random
            const combinedString = `${fingerprintHash}_${timestamp}_${randomComponent}`;
            const anonId = this.hashStringToNumber(combinedString) % 900000000 + 100000000;
            
            // Store for future use
            localStorage.setItem('pingbash_anon_id', anonId.toString());
            if( window.isDebugging ) console.log('👤 [Widget] Generated new anonymous ID:', anonId);
            
            return anonId;
        },

        // Check if there's a pending chat rules trigger waiting for group ID
        checkPendingChatRulesTrigger() {
            if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Checking pending trigger:', {
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

                if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Found pending trigger, executing now with group:', this.groupId);

                // Update the pending state with the real group ID
                this.pendingChatRulesDisplay.groupId = this.groupId;

                // Load chat rules
                this.getChatRules();
            }
        },

        // Trigger chat rules after authentication (same as W version)
        triggerChatRulesAfterLogin(token, userType) {
            if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Triggering chat rules after', userType, 'authentication');
            if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Current group ID:', this.groupId);

            if (!this.groupId) {
                if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] No group available yet, setting up pending trigger...');

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
                    if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Checking for group (attempt', attempts + '):', this.groupId);

                    if (this.groupId) {
                        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Group now available, loading chat rules for group:', this.groupId);

                        // Update pending state with the group ID
                        this.pendingChatRulesDisplay.groupId = this.groupId;

                        // Load chat rules - display will be handled in handleGetChatRules
                        this.getChatRules();
                    } else if (attempts < maxAttempts) {
                        setTimeout(checkForGroup, 500); // Check every 500ms
                    } else {
                        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Timeout waiting for group to be available');
                    }
                };

                setTimeout(checkForGroup, 500); // Start checking after 500ms
                return;
            }

            if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Loading chat rules for group:', this.groupId);

            // Set pending state to indicate we're waiting for chat rules after authentication
            this.pendingChatRulesDisplay = {
                groupId: this.groupId,
                userType: userType,
                timestamp: Date.now()
            };

            // Load chat rules - display will be handled in handleGetChatRules
            this.getChatRules();
        },


        // EXACT COPY from widget.js - dispatchEvent method
        dispatchEvent(eventName, detail = {}) {
            const event = new CustomEvent(eventName, { detail });
            document.dispatchEvent(event);
        },

        // EXACT COPY from widget.js - destroy method
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
        },

        // UPDATED METHOD - Apply saved group settings to chat dialog (delegates to events.js)
        applyGroupSettingsToChat(groupData) {
            // Delegate to the events.js method for consistency
            if (this.applyGroupSettingsToChatDialog) {
                this.applyGroupSettingsToChatDialog(groupData);
            } else {
                if( window.isDebugging ) console.log('🔍 [Widget] applyGroupSettingsToChatDialog method not available yet');
            }
        },

        // Handle unban notification
        handleUnbanNotification(data) {
            if( window.isDebugging ) console.log('✅ [Widget] Processing unban notification:', data);
            
            // Display unban notification as a temporary message in the chat
            this.displayUnbanNotification(data.message);
            
            // Clear any timeout-related state since they're now unbanned
            if (data.groupId && this.groupId == data.groupId) {
                try {
                    const timeoutKey = `timeout_${data.groupId}`;
                    localStorage.removeItem(timeoutKey);
                    if( window.isDebugging ) console.log('✅ [Widget] Cleared timeout state after unban');
                } catch (error) {
                    if( window.isDebugging ) console.log('⚠️ [Widget] Error clearing timeout state:', error);
                }
                
                // Clear any active timeout monitoring
                if (this.timeoutExpiryInterval) {
                    clearInterval(this.timeoutExpiryInterval);
                    this.timeoutExpiryInterval = null;
                    if( window.isDebugging ) console.log('✅ [Widget] Cleared timeout expiry monitoring after unban');
                }
                
                // Hide timeout notification if it's showing
                if (this.hideTimeoutNotification) {
                    this.hideTimeoutNotification();
                }
                
                // Re-enable message input if it was disabled
                const messageInput = this.dialog?.querySelector('.pingbash-message-input');
                if (messageInput) {
                    messageInput.disabled = false;
                    messageInput.placeholder = 'Type your message...';
                    if( window.isDebugging ) console.log('✅ [Widget] Re-enabled message input after unban');
                }
                
                // Refresh messages to get latest state
                setTimeout(() => {
                    if (this.socket && this.socket.connected) {
                        this.socket.emit('get group msg', {
                            groupId: parseInt(this.groupId),
                            token: this.isAuthenticated ? this.authenticatedToken : `anonusermemine${this.anonId}`
                        });
                    }
                }, 500);
            }
        },

        // Display unban notification in chat interface
        displayUnbanNotification(message) {
            if( window.isDebugging ) console.log('✅ [Widget] Displaying unban notification:', message);
            this.displayNotification(message, 'unban', '#d4edda', '#155724', '#c3e6cb', '✅');
        },

        // Display timeout notification in chat interface
        displayTimeoutNotification(message) {
            if( window.isDebugging ) console.log('⏰ [Widget] Displaying timeout notification:', message);
            this.displayNotification(message, 'timeout', '#f8d7da', '#721c24', '#f5c6cb', '⏰');
        },

        // Display untimeout notification in chat interface
        displayUntimeoutNotification(message) {
            if( window.isDebugging ) console.log('🔓 [Widget] Displaying untimeout notification:', message);
            this.displayNotification(message, 'untimeout', '#d1ecf1', '#0c5460', '#bee5eb', '🔓');
        },

        // Display ban notification in chat interface
        displayBanNotification(message) {
            if( window.isDebugging ) console.log('🚫 [Widget] Displaying ban notification:', message);
            this.displayNotification(message, 'ban', '#f8d7da', '#721c24', '#f5c6cb', '🚫');
        },

        // Generic notification display method
        displayNotification(message, type, bgColor, textColor, borderColor, icon) {
            if( window.isDebugging ) console.log(`📢 [Widget] Displaying ${type} notification:`, message);
            
            const messagesArea = this.dialog?.querySelector('.pingbash-messages-list');
            if (!messagesArea) {
                if( window.isDebugging ) console.log('⚠️ [Widget] Messages area not found for notification');
                return;
            }
            
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `pingbash-${type}-notification`;
            notification.innerHTML = `
                <div style="
                    background: ${bgColor};
                    color: ${textColor};
                    border: 1px solid ${borderColor};
                    border-radius: 8px;
                    padding: 12px;
                    margin: 10px 0;
                    text-align: center;
                    font-size: 14px;
                    font-weight: 500;
                    animation: fadeInUp 0.3s ease;
                ">
                    ${icon} ${message}
                </div>
            `;
            
            // Add to messages area
            // Only append if the last message is not a notification of the same type
            const lastChild = messagesArea.lastElementChild;
            if (
                !lastChild ||
                !lastChild.classList ||
                !lastChild.classList.contains(`pingbash-${type}-notification`)
            ) {
                messagesArea.appendChild(notification);
                // Scroll to bottom to show the notification
                messagesArea.scrollTop = messagesArea.scrollHeight;
            }
            
            if( window.isDebugging ) console.log(`📢 [Widget] ${type} notification displayed successfully`);
        },

        // Set up timeout expiry monitoring
        setupTimeoutExpiryCheck(groupId, expiresAt) {
            if( window.isDebugging ) console.log('⏰ [Widget] Setting up timeout expiry check for group:', groupId, 'expires:', expiresAt);
            
            // Clear any existing timeout check
            if (this.timeoutExpiryInterval) {
                clearInterval(this.timeoutExpiryInterval);
            }
            
            this.timeoutExpiryInterval = setInterval(() => {
                const now = new Date().getTime();
                const expiry = new Date(expiresAt).getTime();
                
                if (now >= expiry) {
                    if( window.isDebugging ) console.log('🔓 [Widget] Timeout expired for group:', groupId);
                    
                    // Clear the interval
                    clearInterval(this.timeoutExpiryInterval);
                    this.timeoutExpiryInterval = null;
                    
                    // Show untimeout notification
                    this.displayUntimeoutNotification('Your timeout has expired. You can now send messages again!');
                    
                    // Re-enable input
                    this.updateTimeoutUI(false, null);
                    
                    // Clear timeout from localStorage
                    try {
                        localStorage.removeItem(`timeout_${groupId}`);
                        if( window.isDebugging ) console.log('🔓 [Widget] Cleared timeout state from localStorage');
                    } catch (error) {
                        if( window.isDebugging ) console.log('⚠️ [Widget] Error clearing timeout state:', error);
                    }
                }
            }, 1000); // Check every second
        },

        // Update timeout UI state
        updateTimeoutUI(isTimedOut, expiresAt) {
            const input = this.dialog?.querySelector('.pingbash-message-input');
            const sendBtn = this.dialog?.querySelector('.pingbash-send-btn');
            
            if (input) {
                input.disabled = isTimedOut;
                if (isTimedOut && expiresAt) {
                    const expiry = new Date(expiresAt);
                    const now = new Date();
                    const minutesLeft = Math.ceil((expiry - now) / (1000 * 60));
                    input.placeholder = `You are timed out for ${minutesLeft} more minutes`;
                } else {
                    input.placeholder = 'Type your message...';
                }
            }
            
            if (sendBtn) {
                sendBtn.disabled = isTimedOut;
            }
            
            if( window.isDebugging ) console.log('⏰ [Widget] Timeout UI updated:', { isTimedOut, expiresAt });
        },

        // Check for persisted timeout state on page load
        checkPersistedTimeout(groupId) {
            try {
                const timeoutKey = `timeout_${groupId}`;
                const timeoutInfo = localStorage.getItem(timeoutKey);
                
                if (timeoutInfo) {
                    const parsed = JSON.parse(timeoutInfo);
                    const now = new Date().getTime();
                    const expiry = new Date(parsed.expiresAt).getTime();
                    
                    if (expiry > now) {
                        // Timeout is still active
                        if( window.isDebugging ) console.log(`⏰ [Widget] Restored timeout state for group ${groupId}, expires at ${parsed.expiresAt}`);
                        
                        // Update UI to show timeout state
                        this.updateTimeoutUI(true, parsed.expiresAt);
                        
                        // Set up expiry monitoring
                        this.setupTimeoutExpiryCheck(groupId, parsed.expiresAt);
                        
                        return true;
                    } else {
                        // Timeout has expired, clean up
                        if( window.isDebugging ) console.log(`⏰ [Widget] Timeout expired for group ${groupId}, cleaning up`);
                        localStorage.removeItem(timeoutKey);
                        return false;
                    }
                }
                return false;
            } catch (error) {
                console.error(`⏰ [Widget] Error checking persisted timeout:`, error);
                return false;
            }
        },

        // Initialize sound settings
        initializeSoundSettings() {
            try {
                const savedSetting = localStorage.getItem('pingbash_sound_setting');
                if (savedSetting) {
                    this.soundSetting = savedSetting;
                    if( window.isDebugging ) console.log('🔊 [Widget] Sound setting loaded from localStorage:', this.soundSetting);
                } else {
                    this.soundSetting = 'all'; // Default
                    // Save default setting to localStorage for new users
                    localStorage.setItem('pingbash_sound_setting', 'all');
                    if( window.isDebugging ) console.log('🔊 [Widget] Using default sound setting and saved to localStorage:', this.soundSetting);
                }
            } catch (error) {
                this.soundSetting = 'all'; // Fallback
                if( window.isDebugging ) console.log('🔊 [Widget] Error loading sound setting, using default:', error);
            }
        },

        // Initialize Google AdSense
        initializeGoogleAds() {
            try {
                if( window.isDebugging ) console.log('📢 [Widget] Initializing Google AdSense...');
                
                // Check if AdSense script is already loaded
                if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
                    if( window.isDebugging ) console.log('📢 [Widget] AdSense script already loaded');
                    this.pushGoogleAd();
                    return;
                }
                
                // Load AdSense script if not already loaded
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
                script.crossOrigin = 'anonymous';
                script.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXXXXXXXX'); // Replace with your publisher ID
                
                script.onload = () => {
                    if( window.isDebugging ) console.log('📢 [Widget] AdSense script loaded successfully');
                    this.pushGoogleAd();
                };
                
                script.onerror = (error) => {
                    if( window.isDebugging ) console.log('📢 [Widget] Error loading AdSense script:', error);
                };
                
                document.head.appendChild(script);
            } catch (error) {
                if( window.isDebugging ) console.log('📢 [Widget] Error initializing Google AdSense:', error);
            }
        },

        // Push Google Ad to display
        pushGoogleAd() {
            try {
                // Wait for the dialog to be created
                setTimeout(() => {
                    const adContainer = document.querySelector('.pingbash-adsense-banner');
                    if (adContainer && window.adsbygoogle) {
                        // Check if ad has already been pushed
                        if (adContainer.getAttribute('data-ad-status') === 'filled') {
                            if( window.isDebugging ) console.log('📢 [Widget] Ad already loaded');
                            return;
                        }
                        
                        if( window.isDebugging ) console.log('📢 [Widget] Pushing ad to AdSense...');
                        (window.adsbygoogle = window.adsbygoogle || []).push({});
                        if( window.isDebugging ) console.log('📢 [Widget] Ad pushed successfully');
                    } else {
                        if( window.isDebugging ) console.log('📢 [Widget] Ad container not found or AdSense not ready');
                    }
                }, 1000);
            } catch (error) {
                if( window.isDebugging ) console.log('📢 [Widget] Error pushing Google Ad:', error);
            }
        },

        // Update button and dialog visibility
        updateButtonVisibility() {
            if (this.button && this.dialog) {
                if (this.isOpen) {
                    // Dialog is open, hide button
                    this.button.style.display = 'none';
                    this.dialog.style.display = 'flex';
                    if( window.isDebugging ) console.log('💬 [Widget] Dialog open - hiding chat button');
                } else {
                    // Dialog is closed, show button
                    this.button.style.display = 'flex';
                    this.dialog.style.display = 'none';
                    if( window.isDebugging ) console.log('💬 [Widget] Dialog closed - showing chat button');
                }
            }
        },

        // Get the base URL for widget assets (sounds, etc.)
        getWidgetBaseUrl() {
            // Try to get base URL from the widget script
            const scripts = document.querySelectorAll('script[src]');
            for (let script of scripts) {
                if (script.src.includes('widget-split.js') || script.src.includes('widget.js')) {
                    const baseUrl = script.src.replace(/[^/]*\.js$/, '');
                    if( window.isDebugging ) console.log('🔊 [Widget] Found base URL:', baseUrl);
                    return baseUrl;
                }
            }
            
            // Fallback to current domain + path
            const fallbackUrl = window.location.origin + '/';
            if( window.isDebugging ) console.log('🔊 [Widget] Using fallback URL:', fallbackUrl);
            return fallbackUrl;
        },

        // Detect if device is mobile
        isMobileDevice() {
            // Check screen size (tablets and phones)
            const isMobileScreen = window.innerWidth <= 768;
            
            // Check user agent for mobile devices
            const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            // Check for touch capability
            const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
            
            // Consider it mobile if screen is small OR it's a mobile user agent with touch
            const isMobile = isMobileScreen || (isMobileUserAgent && isTouchDevice);
            
            if( window.isDebugging ) console.log('📱 [Widget] Mobile detection:', {
                isMobileScreen,
                isMobileUserAgent,
                isTouchDevice,
                isMobile,
                screenWidth: window.innerWidth
            });
            
            return isMobile;
        },

    });
}



