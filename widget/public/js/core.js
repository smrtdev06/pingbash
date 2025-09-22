/**
 * Core utility methods
 * EXACT COPY from widget.js - Utility methods only
 */

// Add core utility methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
    console.log('✅ [Core] Adding core utility methods to prototype');
    Object.assign(window.PingbashChatWidget.prototype, {

        // EXACT COPY from widget.js - init method
        async init() {
            console.log('🚀 Initializing Pingbash Chat Widget...');

            // Load seen rules first
            this.hasSeenRulesForGroup = this.loadSeenRules();

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

                // Check for persisted timeout state
                setTimeout(() => {
                    if (this.groupId) {
                        this.checkPersistedTimeout(this.groupId);
                    }
                }, 1000);

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

                // Check for persisted timeout state
                setTimeout(() => {
                    if (this.groupId) {
                        this.checkPersistedTimeout(this.groupId);
                    }
                }, 1000);

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
        },

        // EXACT COPY from widget.js - loadSeenRules method
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
        },

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
        },

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
        },

        hashStringToNumber(str) {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = (hash * 33) ^ str.charCodeAt(i);
            }
            return Math.abs(hash >>> 0); // Unsigned 32-bit number
        },

        getAnonId() {
            const fingerprint = this.getBrowserFingerprint();
            const anonId = this.hashStringToNumber(fingerprint);
            return anonId % 1000000000;
        },

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
        },

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
                console.log('🔍 [Widget] applyGroupSettingsToChatDialog method not available yet');
            }
        },

    });
}