/**
 * MODALS functionality
 * EXACT COPY from widget.js - Auto-extracted methods
 */

// Add modals methods to the prototype
if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) 
  if (window.PingbashChatWidget && window.PingbashChatWidget.prototype) {
  Object.assign(window.PingbashChatWidget.prototype, {

  // EXACT COPY from widget.js - showGroupInfo method
    showGroupInfo() {
      if( window.isDebugging ) console.log('ℹ️ [Widget] Showing group info for:', this.config.groupName);
      // TODO: Implement group info modal
    },

  // EXACT COPY from widget.js - showMembers method
    showMembers() {
      if( window.isDebugging ) console.log('👥 [Widget] Showing group members');
      // TODO: Implement members modal
    },

  // Show My Profile popup (same style as chat rules)
    async showMyProfile() {
      if( window.isDebugging ) console.log('👤 [Widget] Showing My Profile popup');
      
      if (!this.isAuthenticated) {
        this.showErrorToast('Access Denied', 'Please sign in to view your profile');
        return;
      }

      // Load user profile data
      const profileData = await this.loadUserProfile();
      if (!profileData) return;

      // Create popup if it doesn't exist
      let popup = this.dialog.querySelector('.pingbash-profile-popup');
      if (!popup) {
        const popupHTML = `
          <div class="pingbash-profile-popup" style="display: none;">
            <div class="pingbash-popup-overlay"></div>
            <div class="pingbash-popup-content pingbash-profile-content">
              <div class="pingbash-popup-header">
                <h2>My Profile</h2>
                <button class="pingbash-popup-close">&times;</button>
              </div>
              <div class="pingbash-popup-body">
                <!-- Avatar Section -->
                <div class="pingbash-profile-avatar-section">
                  <div class="pingbash-profile-avatar-container">
                    <img src="" alt="Avatar" class="pingbash-profile-avatar" />
                    <input type="file" id="pingbash-avatar-upload" accept="image/*" style="display: none;" />
                    <button class="pingbash-avatar-upload-btn" type="button">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path fill="currentColor" d="M9,16V10H5L12,3L19,10H15V16H9M5,20V18H19V20H5Z"/>
                      </svg>
                      Upload
                    </button>
                  </div>
                </div>

                <!-- Profile Form -->
                <div class="pingbash-profile-form">
                  <div class="pingbash-form-group">
                    <label>User Name *</label>
                    <input type="text" id="pingbash-profile-username" placeholder="User Name" readonly style="background-color: #f3f4f6; cursor: not-allowed;" />
                  </div>

                  <div class="pingbash-form-group">
                    <label>Email *</label>
                    <input type="email" id="pingbash-profile-email" placeholder="email@example.com" readonly style="background-color: #f3f4f6; cursor: not-allowed;" />
                  </div>

                  <div class="pingbash-form-group">
                    <label>Bio / Profession</label>
                    <input type="text" id="pingbash-profile-bio" placeholder="Tell us about yourself..." />
                  </div>

                  <div class="pingbash-form-row">
                    <div class="pingbash-form-group">
                      <label>Country (Optional)</label>
                      <input type="text" id="pingbash-profile-country" placeholder="Country" />
                    </div>
                    <div class="pingbash-form-group">
                      <label>Gender (Optional)</label>
                      <select id="pingbash-profile-gender">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div class="pingbash-form-group">
                    <label>Birthday (Optional)</label>
                    <input type="date" id="pingbash-profile-birthday" />
                  </div>
                </div>
              </div>
              <div class="pingbash-popup-footer">
                <button class="pingbash-profile-cancel-btn">Cancel</button>
                <button class="pingbash-profile-save-btn">Save Changes</button>
              </div>
            </div>
          </div>
        `;
        this.dialog.insertAdjacentHTML('beforeend', popupHTML);
        popup = this.dialog.querySelector('.pingbash-profile-popup');

        // Attach event listeners
        const overlay = popup.querySelector('.pingbash-popup-overlay');
        const closeBtn = popup.querySelector('.pingbash-popup-close');
        const cancelBtn = popup.querySelector('.pingbash-profile-cancel-btn');
        const avatarUploadBtn = popup.querySelector('.pingbash-avatar-upload-btn');
        const avatarInput = popup.querySelector('#pingbash-avatar-upload');

        overlay.addEventListener('click', () => {
          popup.style.display = 'none';
        });
        
        closeBtn.addEventListener('click', () => {
          popup.style.display = 'none';
        });
        
        cancelBtn.addEventListener('click', () => {
          popup.style.display = 'none';
        });

        // Avatar upload button handler
        avatarUploadBtn.addEventListener('click', () => {
          avatarInput.click();
        });

        // Avatar upload handler
        avatarInput.addEventListener('change', async (e) => {
          const file = e.target.files[0];
          if (file) {
            await this.uploadProfileAvatar(file);
            // Refresh profile data
            const newData = await this.loadUserProfile();
            if (newData && newData.avatar) {
              popup.querySelector('.pingbash-profile-avatar').src = newData.avatar;
            }
          }
        });
      }

      // Save profile handler (attach every time to ensure it has access to current popup)
      const saveBtn = popup.querySelector('.pingbash-profile-save-btn');
      // Remove old listener by cloning
      const newSaveBtn = saveBtn.cloneNode(true);
      saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
      
      newSaveBtn.addEventListener('click', async () => {
        const userName = popup.querySelector('#pingbash-profile-username').value.trim();
        const email = popup.querySelector('#pingbash-profile-email').value.trim();
        const bio = popup.querySelector('#pingbash-profile-bio').value.trim();
        const country = popup.querySelector('#pingbash-profile-country').value.trim();
        const gender = popup.querySelector('#pingbash-profile-gender').value;
        const birthday = popup.querySelector('#pingbash-profile-birthday').value;

        // Only username and email are required, birthday/gender are optional
        if (!userName) {
          this.showErrorToast('Validation Error', 'User name is required');
          return;
        }

        if (!email) {
          this.showErrorToast('Validation Error', 'Email is required');
          return;
        }

        const success = await this.updateUserProfile({
          userName,
          email,
          bio,
          country: country || null,
          gender: gender || null,
          birthday: birthday || null
        });

        if (success) {
          this.showSuccessToast('Success', 'Profile updated successfully');
          popup.style.display = 'none';
        }
      });

      // Populate form with profile data
      popup.querySelector('.pingbash-profile-avatar').src = profileData.avatar || 'https://pingbash.com/logo-orange.png';
      popup.querySelector('#pingbash-profile-username').value = profileData.userName || '';
      popup.querySelector('#pingbash-profile-email').value = profileData.email || '';
      popup.querySelector('#pingbash-profile-bio').value = profileData.bio || '';
      popup.querySelector('#pingbash-profile-country').value = profileData.country || '';
      popup.querySelector('#pingbash-profile-gender').value = profileData.gender || '';
      popup.querySelector('#pingbash-profile-birthday').value = profileData.birthday || '';

      // Show the popup
      popup.style.display = 'flex';
    },

    // Load user profile data
    async loadUserProfile() {
      try {
        const token = localStorage.getItem('pingbash_token');
        const apiUrl = this.config.apiUrl || this.config.serverUrl || 'https://pingbash.com';
        const response = await fetch(`${apiUrl}/api/private/get/myProfile/detail`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const data = await response.json();
        const personal = data.personal[0];

        // Format birthday for HTML date input (YYYY-MM-DD)
        let formattedBirthday = '';
        if (personal.birthday) {
          try {
            const date = new Date(personal.birthday);
            if (!isNaN(date.getTime())) {
              formattedBirthday = date.toISOString().split('T')[0];
            }
          } catch (e) {
            console.error('Error parsing birthday:', e);
          }
        }

        return {
          userName: personal.Name || '',
          email: personal.Email || '',
          bio: personal.Profession || '',
          country: personal.country || '',
          gender: personal.gender || '',
          birthday: formattedBirthday,
          avatar: personal.Photo_Name ? `${apiUrl}/uploads/users/${personal.Photo_Name}` : null
        };
      } catch (error) {
        console.error('Error loading profile:', error);
        this.showErrorToast('Error', 'Failed to load profile data');
        return null;
      }
    },

    // Upload profile avatar
    async uploadProfileAvatar(file) {
      try {
        const token = localStorage.getItem('pingbash_token');
        const apiUrl = this.config.apiUrl || this.config.serverUrl || 'https://pingbash.com';
        const formData = new FormData();
        formData.append('Image', file);

        const response = await fetch(`${apiUrl}/api/private/update/users/photo`, {
          method: 'POST',
          headers: {
            'Authorization': token
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Failed to upload avatar');
        }

        this.showSuccessToast('Success', 'Avatar updated successfully');
        return true;
      } catch (error) {
        console.error('Error uploading avatar:', error);
        this.showErrorToast('Error', 'Failed to upload avatar');
        return false;
      }
    },

    // Update user profile
    async updateUserProfile(profileData) {
      try {
        const token = localStorage.getItem('pingbash_token');
        const apiUrl = this.config.apiUrl || this.config.serverUrl || 'https://pingbash.com';

        const response = await fetch(`${apiUrl}/api/private/update/customer/detail`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            FirstName: profileData.userName,
            LastName: '', // Don't use LastName
            Email: profileData.email,
            description: profileData.bio || '',
            country: profileData.country || '',
            gender: profileData.gender || '',
            birthday: profileData.birthday || ''
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Profile update failed:', errorText);
          throw new Error('Failed to update profile');
        }

        return true;
      } catch (error) {
        console.error('Error updating profile:', error);
        this.showErrorToast('Error', 'Failed to update profile');
        return false;
      }
    },

  // EXACT COPY from widget.js - showBannedUsers method
    // 🔄 Show banned users dialog ONLY (separate from IP bans)
    showBannedUsers() {
      if( window.isDebugging ) console.log('🚫 [Widget] Showing banned users dialog only');
      if (!this.socket || !this.isConnected) return;
  
      if (!this.isAuthenticated) {
        this.showError('Please sign in to access admin features');
        return;
      }
  
      // Get ONLY banned users (IP bans have separate menu/dialog)
      if( window.isDebugging ) console.log('🚫 [Widget] Requesting banned users with token:', this.authenticatedToken ? 'present' : 'missing');
      
      this.socket.emit('get banned users', {
        groupId: parseInt(this.groupId),
        token: this.authenticatedToken
      });
    },

    // 🆕 Unban IP address
    unbanIpAddress(ipAddress) {
      if( window.isDebugging ) console.log('✅ [Widget] Unbanning IP address:', ipAddress);
      
      if (!this.canManageCensoredContent()) {
        //alert('You do not have permission to unban IP addresses');
        return;
      }

      if (confirm(`Are you sure you want to unban IP address ${ipAddress}?`)) {
        if( window.isDebugging ) console.log('📤 [Widget] Sending IP unban request');
        
        this.socket.emit('unban ip address', {
          token: this.authenticatedToken,
          groupId: parseInt(this.groupId),
          ipAddress: ipAddress
        });
      }
    },

  // EXACT COPY from widget.js - showIpBans method
    showIpBans() {
      if( window.isDebugging ) console.log('🌐 [Widget] Showing IP bans');
      if (!this.socket || !this.isConnected) return;
  
      if (!this.isAuthenticated) {
        this.showError('Please sign in to access admin features');
        return;
      }
  
      // Emit socket event to get IP bans (same as W version)
      if( window.isDebugging ) console.log('🌐 [Widget] Requesting IP bans with token:', this.authenticatedToken ? 'present' : 'missing');
      this.socket.emit('get ip bans', {
        groupId: parseInt(this.groupId),
        token: this.authenticatedToken
      });
    },

  // EXACT COPY from widget.js - showSettings method
    showSettings() {
      if( window.isDebugging ) console.log('⚙️ [Widget] Showing settings');
      // TODO: Implement settings modal
    },

  // EXACT COPY from widget.js - getChatRules method
    getChatRules() {
      if (!this.socket || !this.isConnected) return;
  
      if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] getChatRules called with groupId:', this.groupId, 'token:', this.isAuthenticated ? 'Authenticated' : 'Anonymous');
  
      // Support both authenticated and anonymous users
      let token = null;
      if (this.isAuthenticated && this.authenticatedToken) {
        token = this.authenticatedToken;
      } else if (!this.isAuthenticated && this.userId) {
        // Use anonymous token for anonymous users
        token = this.userId;
      }

      if (token && this.groupId) {
        this.socket.emit('get chat rules', {
          token: token,
          groupId: parseInt(this.groupId)
        });
        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Emitted get chat rules event with token type:', this.isAuthenticated ? 'authenticated' : 'anonymous');
      } else {
        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Cannot emit get chat rules - missing token or groupId:', {
          hasToken: !!token,
          groupId: this.groupId,
          isAuthenticated: this.isAuthenticated,
          hasAuthToken: !!this.authenticatedToken,
          hasUserId: !!this.userId
        });
      }
    },

  // EXACT COPY from widget.js - updateChatRules method
    updateChatRules(chatRules, showChatRules = true) {
      if (!this.socket || !this.isConnected) return;
  
      if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] updateChatRules called with:', {
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
        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Emitted update chat rules event');
      } else {
        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Cannot emit update chat rules - missing token or groupId');
      }
    },

  // EXACT COPY from widget.js - showChatRules method
    showChatRules() {
      if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Showing chat rules');
  
      // Set group name in popup
      const groupNameDisplay = this.dialog.querySelector('.pingbash-group-name-display');
      if (groupNameDisplay) {
        groupNameDisplay.textContent = this.config.groupName || 'Group';
      }
  
      // Check if user is creator (same logic as W version)
      this.isCreator = this.currentUserId && this.group && (this.currentUserId == this.group.creater_id);
      
      if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Creator check:', {
        currentUserId: this.currentUserId,
        groupCreatorId: this.group?.creater_id,
        isCreator: this.isCreator,
        group: this.group
      });
  
      // Show/hide edit button based on creator status
      const editBtn = this.dialog.querySelector('.pingbash-rules-edit-btn');
      if (editBtn) {
        editBtn.style.display = this.isCreator ? 'block' : 'none';
        if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Edit button display:', editBtn.style.display);
      } else {
        console.error('📋 [Widget] [Chat Rules] Edit button not found in DOM');
      }
  
      // Load current rules for both authenticated and anonymous users
        this.getChatRules();
  
      // Show the popup
      const popup = this.dialog.querySelector('.pingbash-chat-rules-popup');
      popup.style.display = 'flex';
    },

  // EXACT COPY from widget.js - hideChatRules method
    hideChatRules() {
      const popup = this.dialog.querySelector('.pingbash-chat-rules-popup');
      popup.style.display = 'none';
  
      // Mark rules as seen when popup is closed (same as W version)
      if (this.groupId) {
        this.markRulesAsSeen(this.groupId);
      }
    },

  // EXACT COPY from widget.js - displayChatRules method
    displayChatRules(rules) {
      if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Displaying rules:', rules?.length || 0, 'characters');
  
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
    },

  // EXACT COPY from widget.js - editChatRules method
    editChatRules() {
      if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Entering edit mode');
  
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
    },

  // EXACT COPY from widget.js - cancelEditChatRules method
    cancelEditChatRules() {
      if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Cancelling edit mode');
  
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
    },

  // EXACT COPY from widget.js - saveChatRules method
    saveChatRules() {
      if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Saving chat rules');
  
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
    },

  // EXACT COPY from widget.js - handleGetChatRules method
    handleGetChatRules(data) {
      if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Received chat rules data:', data);
  
      const rules = data.chatRules || '';
      this.displayChatRules(rules);
  
      // Check if we have a pending display request after authentication (same as W version)
      if (this.pendingChatRulesDisplay.groupId === this.groupId &&
        this.pendingChatRulesDisplay.userType &&
        Date.now() - this.pendingChatRulesDisplay.timestamp < 10000) { // 10 second timeout
  
        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Checking pending display after authentication');
  
        const isCreator = this.pendingChatRulesDisplay.userType === 'logged-in' &&
          this.currentUserId &&
          parseInt(this.currentUserId) === (this.group?.creater_id || this.group?.creator_id);
        const hasSeenRules = this.groupId ? this.hasSeenRulesForGroup[this.groupId] : false;
  
        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Post-auth display conditions:', {
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
  
          if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Auto-showing rules after', this.pendingChatRulesDisplay.userType, 'authentication');
  
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
          if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Not showing rules after authentication - conditions not met');
          // Clear pending state even if not showing
          this.pendingChatRulesDisplay = {
            groupId: null,
            userType: null,
            timestamp: 0
          };
        }
      } else {
        if( window.isDebugging ) console.log('🔍 [Widget] [Chat Rules] Rules loaded and stored, no pending authentication trigger');
      }
    },

  // EXACT COPY from widget.js - handleUpdateChatRules method
    handleUpdateChatRules(data) {
      if( window.isDebugging ) console.log('📋 [Widget] [Chat Rules] Chat rules updated:', data);
  
      // Refresh the rules display
      if (this.isAuthenticated) {
        this.getChatRules();
      }
    },

  // EXACT COPY from widget.js - showUploadProgress method
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
    },

  // EXACT COPY from widget.js - hideUploadProgress method
    hideUploadProgress() {
      const progress = this.dialog.querySelector('.pingbash-upload-progress');
      if (progress) {
        progress.remove();
      }
    },

  // EXACT COPY from widget.js - showSoundSettings method
    showSoundSettings() {
      const popup = this.dialog.querySelector('.pingbash-sound-popup');
      
      // Load current setting and pre-select the correct radio button
      const currentSetting = this.getSoundSetting();
      if( window.isDebugging ) console.log('🔊 [Widget] Loading sound setting for popup:', currentSetting);
      
      // Find and check the correct radio button
      const radioButtons = popup.querySelectorAll('input[name="sound"]');
      radioButtons.forEach(radio => {
        radio.checked = (radio.value === currentSetting);
        if( window.isDebugging && radio.checked ) {
          console.log('🔊 [Widget] Pre-selected radio button:', radio.value);
        }
      });
      
      popup.style.display = 'flex';
    },

  // EXACT COPY from widget.js - hideSoundSettings method
    hideSoundSettings() {
      const popup = this.dialog.querySelector('.pingbash-sound-popup');
      popup.style.display = 'none';
    },

  // EXACT COPY from widget.js - saveSoundSettings method
    saveSoundSettings() {
      const selectedOption = this.dialog.querySelector('input[name="sound"]:checked');
      if (selectedOption) {
        this.soundSetting = selectedOption.value;
        
        // Save to localStorage
        try {
          localStorage.setItem('pingbash_sound_setting', this.soundSetting);
          if( window.isDebugging ) console.log('🔊 [Widget] Sound setting saved to localStorage:', this.soundSetting);
        } catch (error) {
          if( window.isDebugging ) console.log('🔊 [Widget] Error saving sound setting to localStorage:', error);
        }
        
        if( window.isDebugging ) console.log('🔊 [Widget] Sound setting saved:', this.soundSetting);
      }
      this.hideSoundSettings();
    },

  // MODIFIED - showGroupCreationModal method to use body-attached modal
    showGroupCreationModal() {
      if( window.isDebugging ) console.log('🏗️ [Widget] Opening group creation modal');
      if( window.isDebugging ) console.log('🏗️ [Widget] Authentication state:', {
        isAuthenticated: this.isAuthenticated,
        authenticatedToken: !!this.authenticatedToken,
        currentUserId: this.currentUserId
      });
      
      // Check if user is authenticated
      if (!this.isAuthenticated) {
        if( window.isDebugging ) console.log('🏗️ [Widget] User not authenticated, showing sign-in modal first');
        this.showSigninModal();
        return;
      }
  
      // Create or get the body-attached modal
      const modal = this.createGroupCreationModalInBody();
      if( window.isDebugging ) console.log('🏗️ [Widget] Group creation modal element found:', !!modal);
      
      if (!modal) {
        console.error('❌ [Widget] Group creation modal not found in DOM!');
        return;
      }
      
      if( window.isDebugging ) console.log('🏗️ [Widget] Showing group creation modal');
      
      // Show the body modal with proper display
      modal.style.display = 'flex';
      modal.style.zIndex = '2147483648'; // Ensure it's on top
      modal.classList.add('show');
      
                  if( window.isDebugging ) console.log('🏗️ [Widget] Modal styles applied:', {
        display: modal.style.display,
        position: modal.style.position,
        zIndex: modal.style.zIndex
      });

      // Check if modal is actually on top
      const chatDialog = document.querySelector('.pingbash-dialog');
      if (chatDialog) {
        const dialogZIndex = window.getComputedStyle(chatDialog).zIndex;
        const modalZIndex = window.getComputedStyle(modal).zIndex;
        if( window.isDebugging ) console.log('🔢 [Widget] Z-Index comparison:', {
          dialog: dialogZIndex,
          modal: modalZIndex,
          modalIsHigher: parseInt(modalZIndex) > parseInt(dialogZIndex)
        });
      }
        
        // Check computed styles and visibility
        const computedStyles = window.getComputedStyle(modal);
        if( window.isDebugging ) console.log('🏗️ [Widget] Modal computed styles:', {
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
        if( window.isDebugging ) console.log('🏗️ [Widget] Modal content found:', !!modalContent);
        
        if (modalContent) {
          const contentStyles = window.getComputedStyle(modalContent);
          if( window.isDebugging ) console.log('🏗️ [Widget] Modal content styles:', {
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
        
        if( window.isDebugging ) console.log('🏗️ [Widget] Modal should now be visible - check the screen!');
      
      // Set up event listeners for the body modal
      this.setupBodyModalEventListeners();
      
      // Reset form
      this.resetGroupCreationForm();
    },

  // MODIFIED - hideGroupCreationModal method to use body-attached modal
    hideGroupCreationModal() {
      if( window.isDebugging ) console.log('🏗️ [Widget] Closing group creation modal');
      const modal = document.body.querySelector('.pingbash-group-creation-modal-body');
      if (modal) {
        // Clean up content sync observer
        if (modal._contentSyncObserver) {
          modal._contentSyncObserver.disconnect();
          delete modal._contentSyncObserver;
        }
        
        modal.style.display = 'none';
        modal.classList.remove('show');
      }
    },

  // EXACT COPY from widget.js - resetGroupCreationForm method
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
    },

  // EXACT COPY from widget.js - setupGroupCreationForm method
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
    },

  // EXACT COPY from widget.js - updatePreview method
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
    },

  // EXACT COPY from widget.js - getCurrentConfig method
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
    },

  // EXACT COPY from widget.js - makePreviewDraggable method
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
    },

  // EXACT COPY from widget.js - createNewGroup method
    async createNewGroup() {
      if( window.isDebugging ) console.log('🏗️ [Widget] Creating new group');
      
      // Look for group name input in the body modal (W version uses body-attached modal)
      const bodyModal = document.body.querySelector('.pingbash-group-creation-modal-body');
      const groupNameInput = bodyModal ? 
        bodyModal.querySelector('#group-name-input-body') : 
        this.dialog.querySelector('#group-name-input');
      
      if (!groupNameInput) {
        console.error('🏗️ [Widget] Group name input not found');
        //alert('Group name input not found');
        return;
      }
      
      const groupName = groupNameInput.value.trim();
      if( window.isDebugging ) console.log('🏗️ [Widget] Group name from input:', groupName);
      
      if (!groupName) {
        //alert('Please enter a group name');
        return;
      }
      
      if (!this.isAuthenticated || !this.authenticatedToken) {
        //alert('Please log in to create a group');
        this.showSigninModal();
        return;
      }
      
      // Get config from body modal (W version)
      const config = this.getCurrentConfigFromBodyModal();
      
      // Prepare group data (EXACT same structure as F version)
      const groupData = {
        groupName: groupName,
        createrId: parseInt(this.currentUserId),
        size_mode: config.sizeMode, // String: 'fixed' or 'responsive' (F version format)
        frame_width: config.width,
        frame_height: config.height,
        bg_color: config.colors.background,
        title_color: config.colors.title,
        msg_bg_color: config.colors.msgBg,
        msg_txt_color: config.colors.msgText,
        reply_msg_color: config.colors.replyText || config.colors.msgText, // Separate field (F version format)
        msg_date_color: config.colors.dateText || config.colors.msgText, // Separate field (F version format)
        input_bg_color: config.colors.inputBg,
        show_user_img: config.settings.userImages, // Boolean (F version format)
        custom_font_size: config.settings.customFontSize, // Boolean (F version format)
        font_size: config.settings.fontSize,
        round_corners: config.settings.roundCorners, // Boolean (F version format)
        corner_radius: config.settings.cornerRadius,
        chat_rules: '',
        show_chat_rules: config.settings.showChatRules // Boolean (F version format)
      };
      
      // Validate group data - ensure no undefined values
      Object.keys(groupData).forEach(key => {
        if (groupData[key] === undefined) {
          console.error(`🏗️ [Widget] ERROR: ${key} is undefined!`);
          // Set default values for undefined fields
          if (key === 'font_size') groupData[key] = 14;
          else if (key === 'corner_radius') groupData[key] = 12;
          else if (key === 'frame_width') groupData[key] = 500;
          else if (key === 'frame_height') groupData[key] = 400;
          else if (typeof groupData[key] === 'boolean') groupData[key] = false;
          else if (typeof groupData[key] === 'string') groupData[key] = '';
          else groupData[key] = 0;
        }
      });
      
      if( window.isDebugging ) console.log('🏗️ [Widget] Group data (validated):', groupData);
      
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
          if( window.isDebugging ) console.log('🏗️ [Widget] Group created successfully:', result);
          //alert(`Group "${groupName}" created successfully!`);
          this.hideGroupCreationModal();
          
          // Optionally switch to the new group
          if (result.groupId) {
            if( window.isDebugging ) console.log('🏗️ [Widget] Switching to new group:', result.groupId);
            // You could implement group switching here
          }
        } else {
          console.error('🏗️ [Widget] Group creation failed:', result);
          //alert(result.message || 'Failed to create group. Please try again.');
        }
      } catch (error) {
        console.error('🏗️ [Widget] Group creation error:', error);
        //alert('Failed to create group. Please check your connection and try again.');
      } finally {
        // Re-enable create button
        const createBtn = bodyModal ? 
          bodyModal.querySelector('.pingbash-create-group-btn') : 
          this.dialog.querySelector('.pingbash-group-create-btn');
        if (createBtn) {
          createBtn.disabled = false;
          createBtn.textContent = 'Create Group';
        }
      }
    },

    // NEW METHOD - Get current configuration from body modal
    getCurrentConfigFromBodyModal() {
      const bodyModal = document.body.querySelector('.pingbash-group-creation-modal-body');
      if (!bodyModal) {
        console.error('🏗️ [Widget] Body modal not found for config');
        return this.getDefaultConfig();
      }

      // Use the same logic as events.js getCurrentConfiguration but for body modal
      return {
        // Color settings (EXACT same as W version)
        colors: {
          background: bodyModal.querySelector('#bg-color-body')?.value || '#FFFFFF',
          title: bodyModal.querySelector('#title-color-body')?.value || '#333333',
          msgBg: bodyModal.querySelector('#msg-bg-color-body')?.value || '#F5F5F5',
          msgText: bodyModal.querySelector('#msg-text-color-body')?.value || '#333333',
          replyText: bodyModal.querySelector('#reply-text-color-body')?.value || bodyModal.querySelector('#msg-text-color-body')?.value || '#333333',
          dateText: bodyModal.querySelector('#date-text-color-body')?.value || bodyModal.querySelector('#msg-text-color-body')?.value || '#333333',
          inputBg: bodyModal.querySelector('#input-bg-color-body')?.value || '#FFFFFF'
        },
        // Settings
        settings: {
          userImages: bodyModal.querySelector('#show-avatars-body')?.checked ?? true,
          customFontSize: bodyModal.querySelector('#custom-font-size-body')?.checked ?? false,
          roundCorners: bodyModal.querySelector('#round-corners-body')?.checked ?? true,
          showChatRules: bodyModal.querySelector('#show-chat-rules-body')?.checked ?? false
        },
        // Font size (with debugging)
        fontSize: (() => {
          const fontSizeElement = bodyModal.querySelector('#font-size-slider-body');
          const value = fontSizeElement?.value;
          if( window.isDebugging ) console.log('🔍 [Widget] Font size element:', fontSizeElement, 'value:', value);
          return parseInt(value) || 14;
        })(),
        cornerRadius: (() => {
          const cornerRadiusElement = bodyModal.querySelector('#corner-radius-slider-body');
          const value = cornerRadiusElement?.value;
          if( window.isDebugging ) console.log('🔍 [Widget] Corner radius element:', cornerRadiusElement, 'value:', value);
          return parseInt(value) || 12;
        })(),
        // Size settings
        sizeMode: bodyModal.querySelector('input[name="size-mode-body"]:checked')?.value || 'responsive',
        width: parseInt(bodyModal.querySelector('#width-input-body')?.value) || 500,
        height: parseInt(bodyModal.querySelector('#height-input-body')?.value) || 400,
        // Group name
        groupName: bodyModal.querySelector('#group-name-input-body')?.value || 'Group Name'
      };
    },

    // NEW METHOD - Get default configuration
    getDefaultConfig() {
      return {
        colors: {
          background: '#FFFFFF',
          title: '#333333',
          msgBg: '#F5F5F5',
          msgText: '#333333',
          replyText: '#333333',
          dateText: '#333333',
          inputBg: '#FFFFFF'
        },
        settings: {
          userImages: true,
          customFontSize: false,
          roundCorners: true,
          showChatRules: false
        },
        fontSize: 14,
        cornerRadius: 12,
        sizeMode: 'responsive',
        width: 500,
        height: 400,
        groupName: 'New Group'
      };
    },

    // Chat Limitations functionality (same as W version)
    showChatLimitations() {
      if( window.isDebugging ) console.log('🔒 [Widget] Showing chat limitations');
      
      // Debug info
      if( window.isDebugging ) console.log('🔒 [Widget] Current user ID:', this.getCurrentUserId());
      if( window.isDebugging ) console.log('🔒 [Widget] Group data:', this.group);
      if( window.isDebugging ) console.log('🔒 [Widget] Can manage limitations:', this.canManageChatLimitations());
      
      // Check permissions - only group creator or mods with chat_limit permission can access
      if (!this.canManageChatLimitations()) {
        // Temporarily bypass for testing
        console.warn('🔒 [Widget] Permission check failed, but showing dialog anyway for testing');
        // //alert('You do not have permission to manage chat limitations');
        // return;
      }
      
      // Load current limitations from group data
      this.loadCurrentLimitations();
      
      // Show the popup
      const popup = this.dialog.querySelector('.pingbash-chat-limitations-popup');
      if (popup) {
        if( window.isDebugging ) console.log('🔒 [Widget] Found popup element, setting display to flex');
      popup.style.display = 'flex';
        
        if( window.isDebugging ) console.log('🔒 [Widget] Chat limitations popup displayed');
        if( window.isDebugging ) console.log('🔒 [Widget] Popup computed styles:', {
          display: getComputedStyle(popup).display,
          visibility: getComputedStyle(popup).visibility,
          opacity: getComputedStyle(popup).opacity,
          zIndex: getComputedStyle(popup).zIndex
        });
      } else {
        console.error('🔒 [Widget] Chat limitations popup element not found');
      }
    },

    hideChatLimitations() {
      const popup = this.dialog.querySelector('.pingbash-chat-limitations-popup');
      if (popup) {
      popup.style.display = 'none';
      }
    },

    showManageChat() {
      if( window.isDebugging ) console.log('🔧 [Widget] Opening Manage Chat popup');

      // Check permissions - only group creator or mods can access
      if (!this.canManageChatLimitations()) {
        //alert('You do not have permission to manage chat');
        return;
      }

      // Show the popup
      const popup = this.dialog.querySelector('.pingbash-manage-chat-popup');
      if (popup) {
        if( window.isDebugging ) console.log('🔧 [Widget] Found manage chat popup element, setting display to flex');
        popup.style.display = 'flex';

        // Reset to menu view
        this.showManageChatMenu();

        // Ensure we have the latest pinned messages
        this.getPinnedMessages();

        if( window.isDebugging ) console.log('🔧 [Widget] Manage Chat popup displayed');
      } else {
        console.error('🔧 [Widget] Manage Chat popup element not found');
      }
    },

    hideManageChat() {
      const popup = this.dialog.querySelector('.pingbash-manage-chat-popup');
      if (popup) {
        popup.style.display = 'none';
      }
    },

    // Show delete message modal with options
    showDeleteMessageModal(messageId, senderId) {
      if( window.isDebugging ) console.log('🗑️ [Widget] Opening delete message modal', { messageId, senderId });
      
      const modal = this.dialog.querySelector('.pingbash-delete-message-modal');
      if (!modal) {
        console.error('Delete message modal not found');
        return;
      }
      
      // Store message and sender IDs for deletion
      modal.dataset.messageId = messageId;
      modal.dataset.senderId = senderId;
      
      modal.style.display = 'flex';
    },

    hideDeleteMessageModal() {
      const modal = this.dialog.querySelector('.pingbash-delete-message-modal');
      if (modal) {
        modal.style.display = 'none';
        delete modal.dataset.messageId;
        delete modal.dataset.senderId;
      }
    },

    showModeratorManagement() {
      if( window.isDebugging ) console.log('👥 [Widget] Opening Moderator Management popup');

      // Debug authentication status
      if( window.isDebugging ) console.log('👥 [Widget] Authentication status:', {
        isAuthenticated: this.isAuthenticated,
        hasAuthenticatedToken: !!this.authenticatedToken,
        hasConfigToken: !!this.config?.token,
        hasLocalStorageToken: !!localStorage.getItem('pingbash_token')
      });

      // Check permissions - only group creator or mods with manage_mods permission can access
      const hasPermission = this.canManageModerators();
      if (!hasPermission) {
        console.warn('👥 [Widget] No permission to manage moderators, but proceeding for debugging');
        // Temporarily allow for debugging - uncomment next line to enforce
        // //alert('You do not have permission to manage moderators'); return;
      }

      // Show the popup
      const popup = this.dialog.querySelector('.pingbash-moderator-management-popup');
      if (popup) {
        if( window.isDebugging ) console.log('👥 [Widget] Found moderator management popup element, setting display to flex');
        popup.style.display = 'flex';

        // Load current moderators
        this.loadModerators();

        if( window.isDebugging ) console.log('👥 [Widget] Moderator Management popup displayed');
      } else {
        console.error('👥 [Widget] Moderator Management popup element not found');
      }
    },

    hideModeratorManagement() {
      const popup = this.dialog.querySelector('.pingbash-moderator-management-popup');
      if (popup) {
        popup.style.display = 'none';
      }
    },

    canManageModerators() {
      // ONLY group creator (admin) can manage moderator permissions - moderators cannot manage other moderators
      const currentUserId = this.getCurrentUserId();
      
      if( window.isDebugging ) console.log('🔍 [Debug] canManageModerators:', {
        currentUserId,
        groupCreaterId: this.group?.creater_id,
        isAuthenticated: !!this.config?.token
      });
      
      // Only group creator can manage moderators
      const groupCreatorId = this.group?.creater_id != null ? parseInt(this.group.creater_id) : null;
      const isGroupCreator = groupCreatorId === currentUserId;
      
      if( window.isDebugging ) console.log('🔍 [Debug] User is group creator - moderator management allowed:', isGroupCreator);
      
      return !!isGroupCreator;
    },

    canManageChatLimitations() {
      // Check if user is group creator or mod with chat_limit permission
      const currentUserId = this.getCurrentUserId();
      
      if( window.isDebugging ) console.log('🔍 [Debug] canManageChatLimitations:', {
        currentUserId,
        groupCreaterId: this.group?.creater_id,
        groupMembers: this.group?.members?.map(m => ({ id: m.id, role_id: m.role_id, chat_limit: m.chat_limit }))
      });
      
      // Group creator can always manage chat limitations
      const groupCreatorId = this.group?.creater_id != null ? parseInt(this.group.creater_id) : null;
      if (groupCreatorId === currentUserId) {
        if( window.isDebugging ) console.log('🔍 [Debug] User is group creator - chat limitations allowed');
        return true;
      }
      
      // Check if user is a moderator with chat_limit permission
      const userMember = this.group?.members?.find(member => {
        const memberId = member?.id != null ? parseInt(member.id) : null;
        return memberId === currentUserId;
      });
      const hasPermission = userMember && userMember.role_id === 2 && userMember.chat_limit === true;
      
      if( window.isDebugging ) console.log('🔍 [Debug] Chat limitations check:', {
        userMember,
        hasPermission,
        roleId: userMember?.role_id,
        chatLimit: userMember?.chat_limit,
        chatLimitType: typeof userMember?.chat_limit,
        strictCheck: !!(userMember && userMember.role_id === 2 && userMember.chat_limit === true)
      });
      
      return !!hasPermission;
    },

    canManageChat() {
      // Check if user is group creator or mod with manage_chat permission
      const currentUserId = this.getCurrentUserId();
      
      if( window.isDebugging ) console.log('🔍 [Debug] canManageChat:', {
        currentUserId,
        groupCreaterId: this.group?.creater_id,
        groupMembers: this.group?.members?.map(m => ({ id: m.id, role_id: m.role_id, manage_chat: m.manage_chat }))
      });
      
      // Group creator can always manage chat
      const groupCreatorId = this.group?.creater_id != null ? parseInt(this.group.creater_id) : null;
      if (groupCreatorId === currentUserId) {
        if( window.isDebugging ) console.log('🔍 [Debug] User is group creator - manage chat allowed');
        return true;
      }
      
      // Check if user is a moderator with manage_chat permission
      const userMember = this.group?.members?.find(member => {
        const memberId = member?.id != null ? parseInt(member.id) : null;
        return memberId === currentUserId;
      });
      const hasPermission = userMember && userMember.role_id === 2 && userMember.manage_chat === true;
      
      if( window.isDebugging ) console.log('🔍 [Debug] Manage chat check:', {
        userMember,
        hasPermission,
        roleId: userMember?.role_id,
        manageChat: userMember?.manage_chat,
        manageChatType: typeof userMember?.manage_chat,
        strictCheck: !!(userMember && userMember.role_id === 2 && userMember.manage_chat === true)
      });
      
      return !!hasPermission;
    },

    canManageCensoredContent() {
      // Check if user is group creator or mod with manage_censored permission
      const currentUserId = this.getCurrentUserId();
      
      if( window.isDebugging ) console.log('🔍 [Debug] canManageCensoredContent:', {
        currentUserId,
        groupCreaterId: this.group?.creater_id,
        groupMembers: this.group?.members?.map(m => ({ id: m.id, role_id: m.role_id, manage_censored: m.manage_censored }))
      });
      
      // Group creator can always manage censored content
      const groupCreatorId = this.group?.creater_id != null ? parseInt(this.group.creater_id) : null;
      if (groupCreatorId === currentUserId) {
        if( window.isDebugging ) console.log('🔍 [Debug] User is group creator - censored content allowed');
        return true;
      }
      
      // Check if user is a moderator with manage_censored permission
      const userMember = this.group?.members?.find(member => {
        const memberId = member?.id != null ? parseInt(member.id) : null;
        return memberId === currentUserId;
      });
      const hasPermission = userMember && userMember.role_id === 2 && userMember.manage_censored === true;
      
      if( window.isDebugging ) console.log('🔍 [Debug] Censored content check:', {
        userMember,
        hasPermission,
        roleId: userMember?.role_id,
        manageCensored: userMember?.manage_censored,
        manageCensoredType: typeof userMember?.manage_censored,
        strictCheck: !!(userMember && userMember.role_id === 2 && userMember.manage_censored === true)
      });
      
      return !!hasPermission;
    },

    updateMenuVisibility() {
      if( window.isDebugging ) console.log('🔍 [Debug] ===== UPDATING MENU VISIBILITY =====');
      
      // Update auth menu items (My Profile, Login, Logout)
      if (this.updateAuthMenuVisibility) {
        this.updateAuthMenuVisibility();
      }
      
      if( window.isDebugging ) console.log('🔍 [Debug] Current user data:', {
        currentUserId: this.getCurrentUserId(),
        isAuthenticated: this.isAuthenticated,
        anonId: this.anonId,
        currentUserId_raw: this.currentUserId,
        groupData: this.group ? { creater_id: this.group.creater_id, members_count: this.group.members?.length } : null
      });
      
      // Get permission checks
      const canManageModeratorPermission = this.canManageModerators();
      const canManageChatLimitations = this.canManageChatLimitations();
      const canManageChat = this.canManageChat();
      const canManageCensoredContent = this.canManageCensoredContent();
      
      if( window.isDebugging ) console.log('🔍 [Debug] Final permission results:', {
        canManageModeratorPermission,
        canManageChatLimitations,
        canManageChat,
        canManageCensoredContent
      });
      
      // Debug mods option visibility
      const modsOption = this.dialog.querySelector('.pingbash-mods-option');
      if( window.isDebugging ) console.log('🔍 [Debug] Mods option element:', {
        found: !!modsOption,
        display: modsOption?.style?.display,
        isAuthenticated: this.isAuthenticated
      });
      
      // Update Chat Mode filter container - only show for authenticated users
      const filterContainer = this.dialog.querySelector('.pingbash-filter-container');
      if (filterContainer) {
        if (this.isAuthenticated) {
          filterContainer.style.display = 'flex';
          if( window.isDebugging ) console.log('🔍 [Widget] Showing Chat Mode filter for authenticated user');
          
          // Show mods option only for admins/moderators
          const modsOption = this.dialog.querySelector('.pingbash-mods-option');
          if (modsOption) {
            if (this.isModeratorOrAdmin()) {
            modsOption.style.display = 'block';
              if( window.isDebugging ) console.log('🔍 [Widget] Enabling mods option for admin/moderator');
            } else {
              modsOption.style.display = 'none';
              if( window.isDebugging ) console.log('🔍 [Widget] Hiding mods option for regular user');
            }
          }
        } else {
          filterContainer.style.display = 'none';
          if( window.isDebugging ) console.log('🔍 [Widget] Hiding Chat Mode filter for anonymous user');
        }
      }
      
      // Update Moderator Management menu item
      const moderatorMgmtItem = this.dialog.querySelector('.pingbash-menu-item[data-action="moderator-management"]');
      if (moderatorMgmtItem) {
        if (canManageModeratorPermission) {
          moderatorMgmtItem.style.display = 'flex';
          if( window.isDebugging ) console.log('👥 [Widget] Showing Moderator Management menu item');
        } else {
          moderatorMgmtItem.style.display = 'none';
          if( window.isDebugging ) console.log('👥 [Widget] Hiding Moderator Management menu item');
        }
      }
      
      // Update Chat Limitations menu item
      const chatLimitationsItem = this.dialog.querySelector('.pingbash-menu-item[data-action="chat-limitations"]');
      if (chatLimitationsItem) {
        if (canManageChatLimitations) {
          chatLimitationsItem.style.display = 'flex';
          if( window.isDebugging ) console.log('👥 [Widget] Showing Chat Limitations menu item');
        } else {
          chatLimitationsItem.style.display = 'none';
          if( window.isDebugging ) console.log('👥 [Widget] Hiding Chat Limitations menu item');
        }
      }
      
      // Update Manage Chat menu item
      const manageChatItem = this.dialog.querySelector('.pingbash-menu-item[data-action="manage-chat"]');
      if (manageChatItem) {
        if (canManageChat) {
          manageChatItem.style.display = 'flex';
          if( window.isDebugging ) console.log('👥 [Widget] Showing Manage Chat menu item');
        } else {
          manageChatItem.style.display = 'none';
          if( window.isDebugging ) console.log('👥 [Widget] Hiding Manage Chat menu item');
        }
      }
      
      // Update Censored Content menu item
      const censoredContentItem = this.dialog.querySelector('.pingbash-menu-item[data-action="censored-content"]');
      if (censoredContentItem) {
        if (canManageCensoredContent) {
          censoredContentItem.style.display = 'flex';
          if( window.isDebugging ) console.log('👥 [Widget] Showing Censored Content menu item');
        } else {
          censoredContentItem.style.display = 'none';
          if( window.isDebugging ) console.log('👥 [Widget] Hiding Censored Content menu item');
        }
      }
      
      // Update Banned Users menu item (group owner OR moderators with ban permission can access)
      const bannedUsersItem = this.dialog.querySelector('.pingbash-menu-item[data-action="banned-users"]');
      if (bannedUsersItem) {
        const currentUserId = this.getCurrentUserId();
        const isGroupOwner = this.group && currentUserId === this.group.creater_id;
        
        // Check if user is moderator with ban permission
        const myMemInfo = this.group?.members?.find(user => {
          const userId = user?.id != null ? parseInt(user.id) : null;
          return userId === currentUserId;
        });
        const canBanUsers = (myMemInfo?.role_id === 2 && myMemInfo?.ban_user === true);
        const hasAccessToBannedUsers = isGroupOwner || canBanUsers;
        
        if( window.isDebugging ) console.log('👥 [Widget] Banned Users visibility check:', {
          bannedUsersItem: !!bannedUsersItem,
          currentUserId: currentUserId,
          groupCreatorId: this.group?.creater_id,
          isGroupOwner: isGroupOwner,
          canBanUsers: canBanUsers,
          hasAccessToBannedUsers: hasAccessToBannedUsers,
          myMemInfo: myMemInfo,
          hasGroup: !!this.group
        });
        
        if (hasAccessToBannedUsers) {
          bannedUsersItem.style.display = 'flex';
          if( window.isDebugging ) console.log('👥 [Widget] ✅ Showing Banned Users menu item (has ban permissions)');
        } else {
          bannedUsersItem.style.display = 'none';
          if( window.isDebugging ) console.log('👥 [Widget] ❌ Hiding Banned Users menu item (no ban permissions)');
        }
      } else {
        if( window.isDebugging ) console.log('👥 [Widget] ❌ Banned Users menu item not found in DOM');
      }
      
      // Update IP Bans menu item (group owner OR moderators with ban permission can access)
      const ipBansItem = this.dialog.querySelector('.pingbash-menu-item[data-action="ip-bans"]');
      if (ipBansItem) {
        const currentUserId = this.getCurrentUserId();
        const isGroupOwner = this.group && currentUserId === this.group.creater_id;
        
        // Check if user is moderator with ban permission (reuse same logic as banned users)
        const myMemInfo = this.group?.members?.find(user => {
          const userId = user?.id != null ? parseInt(user.id) : null;
          return userId === currentUserId;
        });
        const canBanUsers = (myMemInfo?.role_id === 2 && myMemInfo?.ban_user === true);
        const hasAccessToIpBans = isGroupOwner || canBanUsers;
        
        if( window.isDebugging ) console.log('🌐 [Widget] IP Bans visibility check:', {
          ipBansItem: !!ipBansItem,
          currentUserId: currentUserId,
          groupCreatorId: this.group?.creater_id,
          isGroupOwner: isGroupOwner,
          canBanUsers: canBanUsers,
          hasAccessToIpBans: hasAccessToIpBans,
          myMemInfo: myMemInfo,
          hasGroup: !!this.group
        });
        
        if (hasAccessToIpBans) {
          ipBansItem.style.display = 'flex';
          if( window.isDebugging ) console.log('🌐 [Widget] ✅ Showing IP Bans menu item (has ban permissions)');
        } else {
          ipBansItem.style.display = 'none';
          if( window.isDebugging ) console.log('🌐 [Widget] ❌ Hiding IP Bans menu item (no ban permissions)');
        }
      } else {
        if( window.isDebugging ) console.log('🌐 [Widget] ❌ IP Bans menu item not found in DOM');
      }
      
      // Show/hide send notification option (group creators only)
      const sendNotificationItem = this.dialog.querySelector('[data-action="send-notification"]');
      if (sendNotificationItem) {
        const isGroupCreator = this.group && this.getCurrentUserId() === this.group.creater_id;
        if (isGroupCreator) {
          sendNotificationItem.style.display = 'flex';
          if( window.isDebugging ) console.log('📢 [Widget] Showing send notification option for group creator');
        } else {
          sendNotificationItem.style.display = 'none';
          if( window.isDebugging ) console.log('📢 [Widget] Hiding send notification option (not group creator)');
        }
      }

      // Show/hide settings container based on permissions
      const settingsContainer = this.dialog.querySelector('.pingbash-settings-container');
      if (settingsContainer) {
        const isGroupCreator = this.group && this.getCurrentUserId() === this.group.creater_id;
        const hasAnyPermission = canManageModeratorPermission || canManageChatLimitations || 
                                 canManageChat || canManageCensoredContent || isGroupCreator;
        
        if( window.isDebugging ) console.log('⚙️ [Widget] Settings container visibility check:', {
          settingsContainer: !!settingsContainer,
          currentUserId: this.getCurrentUserId(),
          groupCreatorId: this.group?.creater_id,
          isGroupCreator: isGroupCreator,
          canManageModeratorPermission: canManageModeratorPermission,
          canManageChatLimitations: canManageChatLimitations,
          canManageChat: canManageChat,
          canManageCensoredContent: canManageCensoredContent,
          hasAnyPermission: hasAnyPermission,
          currentDisplay: settingsContainer.style.display
        });
        
        if (hasAnyPermission) {
          settingsContainer.style.display = 'flex';
          if( window.isDebugging ) console.log('⚙️ [Widget] ✅ Showing settings container (user has admin permissions)');
        } else {
          settingsContainer.style.display = 'none';
          if( window.isDebugging ) console.log('⚙️ [Widget] ❌ Hiding settings container (no admin permissions)');
        }
      } else {
        if( window.isDebugging ) console.log('⚙️ [Widget] ❌ Settings container not found in DOM');
      }
      
      // Update hamburger menu items based on user state
      this.updateHamburgerMenuItems();
    },
    
    updateHamburgerMenuItems() {
      if( window.isDebugging ) console.log('🍔 [Widget] Updating hamburger menu items based on user state');
      
      // Favorites toggle
      const favoritesToggle = this.dialog.querySelector('.pingbash-favorites-toggle');
      const favoritesText = this.dialog.querySelector('.pingbash-favorites-text');
      const favoritesIcon = this.dialog.querySelector('.pingbash-favorites-icon path');
      
      if (this.isAuthenticated && favoritesToggle) {
        favoritesToggle.style.display = 'flex';
        
        // Check if current group is in favorites and update text/icon accordingly
        const isCurrentlyFavorite = this.isGroupInFavorites();
        
        if (favoritesText) {
          favoritesText.textContent = isCurrentlyFavorite ? 'Remove from Favorites' : 'Add to Favorites';
        }
        
        // Update icon - filled heart for favorites, outline for not favorites
        if (favoritesIcon) {
          if (isCurrentlyFavorite) {
            // Filled heart icon
            favoritesIcon.setAttribute('d', 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z');
          } else {
            // Outline heart icon  
            favoritesIcon.setAttribute('d', 'M12.1,18.55L12,18.65L11.89,18.55C7.14,14.24 4,11.39 4,8.5C4,6.5 5.5,5 7.5,5C9.04,5 10.54,6 11.07,7.36H12.93C13.46,6 14.96,5 16.5,5C18.5,5 20,6.5 20,8.5C20,11.39 16.86,14.24 12.1,18.55M16.5,3C14.76,3 13.09,3.81 12,5.08C10.91,3.81 9.24,3 7.5,3C4.42,3 2,5.41 2,8.5C2,12.27 5.4,15.36 10.55,20.03L12,21.35L13.45,20.03C18.6,15.36 22,12.27 22,8.5C22,5.41 19.58,3 16.5,3Z');
          }
        }
        
        if( window.isDebugging ) console.log(`⭐ [Widget] Updated favorites toggle: ${isCurrentlyFavorite ? 'Remove' : 'Add'} for authenticated user`);
      } else {
        // Hide favorites for anonymous users
        if (favoritesToggle) favoritesToggle.style.display = 'none';
        if( window.isDebugging ) console.log('⭐ [Widget] Hiding favorites option for anonymous user');
      }
      
      // Edit Chat Style (only for group creators)
      const editChatStyleItem = this.dialog.querySelector('.pingbash-menu-item[data-action="edit-chat-style"]');
      if (editChatStyleItem) {
        const currentUserId = this.getCurrentUserId();
        const isGroupCreator = this.group && currentUserId === this.group.creater_id;
        
        if (isGroupCreator) {
          editChatStyleItem.style.display = 'flex';
          if( window.isDebugging ) console.log('🎨 [Widget] Showing Edit Chat Style menu item for group creator');
        } else {
          editChatStyleItem.style.display = 'none';
          if( window.isDebugging ) console.log('🎨 [Widget] Hiding Edit Chat Style menu item (not group creator)');
        }
      }
      
      // Login / Logout buttons
      const loginItem = this.dialog.querySelector('.pingbash-menu-item[data-action="login"]');
      const logoutItem = this.dialog.querySelector('.pingbash-menu-item[data-action="logout"]');
      
      if (this.isAuthenticated) {
        // Show logout for authenticated users
        if (loginItem) loginItem.style.display = 'none';
        if (logoutItem) logoutItem.style.display = 'flex';
        if( window.isDebugging ) console.log('🚪 [Widget] Showing logout option for authenticated user');
      } else {
        // Show login for anonymous users
        if (loginItem) loginItem.style.display = 'flex';
        if (logoutItem) logoutItem.style.display = 'none';
        if( window.isDebugging ) console.log('🚪 [Widget] Showing login option for anonymous user');
      }
      
      // Hide Chat (which closes the dialog)
      const hideChatItem = this.dialog.querySelector('.pingbash-menu-item[data-action="hide-chat"]');
      
      // Always show "Hide Chat" option
      if (hideChatItem) hideChatItem.style.display = 'flex';
    },

    isGroupInFavorites() {
      if (!this.group || !this.favoriteGroups) {
        return false;
      }
      return this.favoriteGroups.some(favGroup => favGroup.id === this.group.id);
    },

    // Debug function to manually test menu visibility
    debugMenuPermissions() {
      if( window.isDebugging ) console.log('🔍 [Debug] Manual menu permission check triggered');
      this.updateMenuVisibility();
      
      // Also manually check each permission
      if( window.isDebugging ) console.log('🔍 [Debug] Manual individual checks:');
      if( window.isDebugging ) console.log('  - canManageModerators():', this.canManageModerators());
      if( window.isDebugging ) console.log('  - canManageChatLimitations():', this.canManageChatLimitations());
      if( window.isDebugging ) console.log('  - canManageChat():', this.canManageChat());
      
      // Check menu item visibility
      const modItem = this.dialog.querySelector('.pingbash-menu-item[data-action="moderator-management"]');
      const chatLimitItem = this.dialog.querySelector('.pingbash-menu-item[data-action="chat-limitations"]');
      const manageChatItem = this.dialog.querySelector('.pingbash-menu-item[data-action="manage-chat"]');
      
      if( window.isDebugging ) console.log('🔍 [Debug] Current menu item display styles:');
      if( window.isDebugging ) console.log('  - Moderator Management:', modItem?.style.display);
      if( window.isDebugging ) console.log('  - Chat Limitations:', chatLimitItem?.style.display);
      if( window.isDebugging ) console.log('  - Manage Chat:', manageChatItem?.style.display);
      
      // Make this accessible globally for testing
      window.debugMenuPermissions = () => this.debugMenuPermissions();
    },

    // Censored Content Management
    showCensoredContent() {
      if( window.isDebugging ) console.log('🔍 [Widget] Showing Censored Content dialog');
      
      // Check permissions
      if (!this.canManageCensoredContent()) {
        if( window.isDebugging ) console.log('🔍 [Widget] User does not have permission to manage censored content');
        this.showErrorToast('Access Denied', 'You do not have permission to manage censored content.');
        return;
      }

      const popup = this.dialog.querySelector('.pingbash-censored-content-popup');
      if (popup) {
        popup.style.display = 'flex';
        this.loadCensoredWords();
      }
    },

    hideCensoredContent() {
      if( window.isDebugging ) console.log('🔍 [Widget] Hiding Censored Content dialog');
      const popup = this.dialog.querySelector('.pingbash-censored-content-popup');
      if (popup) {
        popup.style.display = 'none';
        // Reset form state
        this.resetCensoredContentForm();
      }
    },

    loadCensoredWords() {
      if( window.isDebugging ) console.log('🔍 [Widget] Loading censored words');
      
      // Get censored words from group data
      const censoredWordsStr = this.group?.censored_words || '';
      if( window.isDebugging ) console.log('🔍 [Widget] Raw censored words string:', censoredWordsStr);
      
      // Parse censored words (comma-separated)
      this.censoredWords = this.parseCensoredWords(censoredWordsStr);
      this.originalCensoredWords = [...this.censoredWords]; // Keep original for comparison
      
      if( window.isDebugging ) console.log('🔍 [Widget] Parsed censored words:', this.censoredWords);
      
      this.renderCensoredWords();
      this.updateSaveButtonVisibility();
    },

    parseCensoredWords(censoredWordsStr) {
      if (!censoredWordsStr || typeof censoredWordsStr !== 'string') {
        return [];
      }
      
      // Split by comma, trim whitespace, and filter out empty strings
      return censoredWordsStr
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0);
    },

    renderCensoredWords() {
      const wordsList = this.dialog.querySelector('.pingbash-censored-words-list');
      if (!wordsList) return;

      if (this.censoredWords.length === 0) {
        wordsList.innerHTML = '<div class="pingbash-no-censored-words">No censored words defined</div>';
        return;
      }

      const wordsHTML = this.censoredWords.map((word, index) => `
        <div class="pingbash-censored-word-item" data-index="${index}">
          <span class="pingbash-censored-word-text">${this.escapeHtml(word)}</span>
          <div class="pingbash-censored-word-actions">
            <button class="pingbash-edit-word-btn" data-index="${index}">Edit</button>
            <button class="pingbash-delete-word-btn" data-index="${index}">Delete</button>
          </div>
        </div>
      `).join('');

      wordsList.innerHTML = wordsHTML;
    },

    addCensoredWord() {
      const input = this.dialog.querySelector('.pingbash-censored-word-input');
      if (!input) return;

      const word = input.value.trim();
      if (!word) {
        this.showWarningToast('Invalid Input', 'Please enter a word to censor.');
        return;
      }

      // Check for duplicates
      if (this.censoredWords.some(existingWord => existingWord.toLowerCase() === word.toLowerCase())) {
        this.showWarningToast('Duplicate Word', 'This word is already in the censored list.');
        return;
      }

      // Add word
      this.censoredWords.push(word);
      input.value = '';
      
      if( window.isDebugging ) console.log('🔍 [Widget] Added censored word:', word);
      this.renderCensoredWords();
      this.updateSaveButtonVisibility();
    },

    editCensoredWord(index) {
      const wordItem = this.dialog.querySelector(`.pingbash-censored-word-item[data-index="${index}"]`);
      if (!wordItem) return;

      const currentWord = this.censoredWords[index];
      
      // Create edit interface
      wordItem.classList.add('editing');
      wordItem.innerHTML = `
        <input type="text" class="pingbash-edit-word-input" value="${this.escapeHtml(currentWord)}" maxlength="50">
        <button class="pingbash-save-edit-btn" data-index="${index}">Save</button>
        <button class="pingbash-cancel-edit-btn" data-index="${index}">Cancel</button>
      `;

      // Focus the input
      const editInput = wordItem.querySelector('.pingbash-edit-word-input');
      if (editInput) {
        editInput.focus();
        editInput.select();
      }
    },

    saveEditCensoredWord(index) {
      const wordItem = this.dialog.querySelector(`.pingbash-censored-word-item[data-index="${index}"]`);
      if (!wordItem) return;

      const editInput = wordItem.querySelector('.pingbash-edit-word-input');
      if (!editInput) return;

      const newWord = editInput.value.trim();
      if (!newWord) {
        this.showWarningToast('Invalid Input', 'Word cannot be empty.');
        return;
      }

      // Check for duplicates (excluding current word)
      if (this.censoredWords.some((existingWord, i) => i !== index && existingWord.toLowerCase() === newWord.toLowerCase())) {
        this.showWarningToast('Duplicate Word', 'This word is already in the censored list.');
        return;
      }

      // Update word
      this.censoredWords[index] = newWord;
      
      if( window.isDebugging ) console.log('🔍 [Widget] Updated censored word:', { old: this.originalCensoredWords[index], new: newWord });
      this.renderCensoredWords();
      this.updateSaveButtonVisibility();
    },

    cancelEditCensoredWord() {
      // Simply re-render to cancel edit mode
      this.renderCensoredWords();
    },

    deleteCensoredWord(index) {
      const word = this.censoredWords[index];
      
      // Show confirmation
      this.showConfirm(
        'Delete Censored Word',
        `Are you sure you want to remove "${word}" from the censored words list?`,
        { destructive: true }
      ).then(confirmed => {
        if (confirmed) {
          this.censoredWords.splice(index, 1);
          if( window.isDebugging ) console.log('🔍 [Widget] Deleted censored word:', word);
          this.renderCensoredWords();
          this.updateSaveButtonVisibility();
        }
      });
    },

    updateSaveButtonVisibility() {
      const saveBtn = this.dialog.querySelector('.pingbash-censored-save-btn');
      const closeBtn = this.dialog.querySelector('.pingbash-censored-close-btn');
      
      if (!saveBtn || !closeBtn) return;

      const hasChanges = JSON.stringify(this.censoredWords.sort()) !== JSON.stringify(this.originalCensoredWords.sort());
      
      if (hasChanges) {
        saveBtn.style.display = 'inline-block';
        closeBtn.textContent = 'Cancel';
      } else {
        saveBtn.style.display = 'none';
        closeBtn.textContent = 'Close';
      }
    },

    async saveCensoredWords() {
      if( window.isDebugging ) console.log('🔍 [Widget] Saving censored words');
      
      try {
        // Show loading state
        const saveBtn = this.dialog.querySelector('.pingbash-censored-save-btn');
        if (saveBtn) {
          this.setButtonLoading(saveBtn, true);
        }

        // Get authentication token
        const token = this.authenticatedToken || 
                     this.config?.token || 
                     window.pingbashWidget?.config?.token || 
                     window.pingbashWidget?.authenticatedToken || 
                     localStorage.getItem('pingbash_token');

        if (!token) {
          throw new Error('Authentication token not found');
        }

        if (!this.groupId) {
          throw new Error('Group ID not found');
        }

        // Convert words array to comma-separated string
        const censoredWordsStr = this.censoredWords.join(',');
        
        if( window.isDebugging ) console.log('🔍 [Widget] Sending censored words update:', {
          groupId: this.groupId,
          contents: censoredWordsStr,
          tokenPresent: !!token
        });

        // Emit socket event
        const socket = this.socket || window.pingbashWidget?.socket;
        if (!socket) {
          throw new Error('Socket connection not available');
        }

        socket.emit('update censored contents', {
          token: token,
          groupId: this.groupId,
          contents: censoredWordsStr
        });

        // Set timeout for response
        this.censoredWordsTimeoutId = setTimeout(() => {
          if( window.isDebugging ) console.log('🔍 [Widget] Censored words update timeout');
          this.setButtonLoading(saveBtn, false);
          this.showErrorToast('Timeout', 'No response from server. Please try again.');
        }, 10000);

      } catch (error) {
        console.error('🔍 [Widget] Error saving censored words:', error);
        const saveBtn = this.dialog.querySelector('.pingbash-censored-save-btn');
        if (saveBtn) {
          this.setButtonLoading(saveBtn, false);
        }
        this.showErrorToast('Error', error.message || 'Failed to save censored words');
      }
    },

    resetCensoredContentForm() {
      // Clear input
      const input = this.dialog.querySelector('.pingbash-censored-word-input');
      if (input) {
        input.value = '';
      }

      // Reset arrays
      this.censoredWords = [];
      this.originalCensoredWords = [];

      // Clear any timeouts
      if (this.censoredWordsTimeoutId) {
        clearTimeout(this.censoredWordsTimeoutId);
        this.censoredWordsTimeoutId = null;
      }
    },

    loadModerators() {
      if( window.isDebugging ) console.log('👥 [Widget] Loading moderators');
      if( window.isDebugging ) console.log('👥 [Widget] Group data:', this.group);
      if( window.isDebugging ) console.log('👥 [Widget] Group members:', this.group?.members);
      if( window.isDebugging ) console.log('👥 [Widget] Total members count:', this.group?.members?.length);
      
      const container = this.dialog.querySelector('.pingbash-moderators-list');
      if (!container) {
        console.error('👥 [Widget] Moderators list container not found');
        return;
      }

      // Clear the container first
      container.innerHTML = '';

      // Get moderators from group members (role_id === 2)
      const moderators = this.group?.members?.filter(member => member.role_id === 2) || [];
      
      if( window.isDebugging ) console.log('👥 [Widget] Found moderators:', moderators.length);
      
      if (moderators.length === 0) {
        container.innerHTML = '<div class="pingbash-no-moderators">No moderators found</div>';
        return;
      }

      if( window.isDebugging ) console.log('👥 [Widget] Rendering moderators:', moderators);

      container.innerHTML = moderators.map(mod => {
        const permissions = [];
        if (mod.chat_limit) permissions.push('Chat Limit');
        if (mod.manage_mods) permissions.push('Manage Mods');
        if (mod.manage_chat) permissions.push('Manage Chat');
        if (mod.manage_censored) permissions.push('Censored');
        if (mod.ban_user) permissions.push('Ban Users');

        const avatarText = this.getUserInitials(mod.name || `User ${mod.id}`);
        
        return `
          <div class="pingbash-moderator-item" data-moderator-id="${mod.id}">
            <div class="pingbash-moderator-info">
              <div class="pingbash-moderator-avatar">${avatarText}</div>
              <div class="pingbash-moderator-details">
                <div class="pingbash-moderator-name">${mod.name || `User ${mod.id}`}</div>
                <div class="pingbash-moderator-permissions">
                  ${permissions.map(perm => `<span class="pingbash-permission-badge">${perm}</span>`).join('')}
                </div>
              </div>
            </div>
            <div class="pingbash-moderator-actions">
              <button class="pingbash-moderator-edit-btn" data-moderator-id="${mod.id}">Edit</button>
              <button class="pingbash-moderator-remove-btn" data-moderator-id="${mod.id}">Remove</button>
            </div>
          </div>
        `;
      }).join('');

      if( window.isDebugging ) console.log('👥 [Widget] Moderators HTML rendered');
      
      // Clear search cache when moderators are loaded
      this.cachedModeratorIds = null;
    },

    getUserInitials(name) {
      if (!name) return '?';
      const words = name.split(' ');
      if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    editModeratorPermissions(moderatorId) {
      if( window.isDebugging ) console.log('👥 [Widget] Edit moderator permissions:', moderatorId);
      
      // Find the moderator
      const moderator = this.group?.members?.find(member => member.id === parseInt(moderatorId));
      if (!moderator) {
        console.error('👥 [Widget] Moderator not found:', moderatorId);
        return;
      }

      if( window.isDebugging ) console.log('👥 [Widget] Found moderator:', moderator);

      // Show permissions popup
      this.showModeratorPermissionsPopup(moderator);
    },

    showModeratorPermissionsPopup(moderator) {
      if( window.isDebugging ) console.log('👥 [Widget] Showing permissions popup for:', moderator);

      const popup = this.dialog.querySelector('.pingbash-mod-permissions-popup');
      if (!popup) {
        console.error('👥 [Widget] Permissions popup not found');
        return;
      }

      // Set moderator info
      const avatarEl = popup.querySelector('.pingbash-moderator-avatar');
      const nameEl = popup.querySelector('.pingbash-moderator-name');
      
      if (avatarEl) avatarEl.textContent = this.getUserInitials(moderator.name || `User ${moderator.id}`);
      if (nameEl) nameEl.textContent = moderator.name || `User ${moderator.id}`;

      // Set permission checkboxes
      const permissions = {
        'chat_limit': moderator.chat_limit || false,
        'manage_mods': moderator.manage_mods || false,
        'manage_chat': moderator.manage_chat || false,
        'manage_censored': moderator.manage_censored || false,
        'ban_user': moderator.ban_user || false
      };

      if( window.isDebugging ) console.log('👥 [Widget] Setting permissions:', permissions);

      Object.keys(permissions).forEach(permission => {
        const checkbox = popup.querySelector(`input[data-permission="${permission}"]`);
        if (checkbox) {
          checkbox.checked = permissions[permission];
          if( window.isDebugging ) console.log('👥 [Widget] Setting checkbox:', permission, 'to', permissions[permission]);
        } else {
          console.warn('👥 [Widget] Checkbox not found for permission:', permission);
        }
      });

      // Store current moderator ID for saving
      popup.dataset.moderatorId = moderator.id;

      // Show the popup
      popup.style.display = 'flex';
      if( window.isDebugging ) console.log('👥 [Widget] Permissions popup displayed');
    },

    hideModeratorPermissionsPopup() {
      const popup = this.dialog.querySelector('.pingbash-mod-permissions-popup');
      if (popup) {
        popup.style.display = 'none';
        delete popup.dataset.moderatorId;
      }
    },

    saveModeratorPermissions() {
      if( window.isDebugging ) console.log('👥 [Widget] Saving moderator permissions');

      const popup = this.dialog.querySelector('.pingbash-mod-permissions-popup');
      const moderatorId = popup?.dataset.moderatorId;

      if (!moderatorId) {
        console.error('👥 [Widget] No moderator ID found');
        return;
      }

      // Get updated permissions from checkboxes
      const permissions = {};
      const checkboxes = popup.querySelectorAll('input[data-permission]');
      
      checkboxes.forEach(checkbox => {
        const permission = checkbox.dataset.permission;
        permissions[permission] = checkbox.checked;
      });

      if( window.isDebugging ) console.log('👥 [Widget] Updated permissions:', permissions);

      // Show loading state on save button
      const saveBtn = popup.querySelector('.pingbash-mod-permissions-save');
      this.setButtonLoading(saveBtn, true);

      // Prepare the payload using the correct backend format for mod permissions
      // Get token from multiple possible sources
      const token = this.authenticatedToken || this.config?.token || window.pingbashWidget?.config?.token || window.pingbashWidget?.authenticatedToken || localStorage.getItem('pingbash_token');
      
      const payload = {
        token: token,
        groupId: this.group.id,
        modId: parseInt(moderatorId),
        chat_limit: permissions.chat_limit,
        manage_mods: permissions.manage_mods,
        manage_chat: permissions.manage_chat,
        manage_censored: permissions.manage_censored,
        ban_user: permissions.ban_user
      };

      if( window.isDebugging ) console.log('👥 [Widget] Sending update moderator permissions payload:', payload);

      // Send to server using correct backend event name
      this.socket.emit('update mod permissions', payload);

      // Note: popup will be hidden in response handler

      if( window.isDebugging ) console.log('👥 [Widget] Moderator permissions update sent to server');
    },

    searchMembers(query) {
      if( window.isDebugging ) console.log('👥 [Widget] Searching members:', query);
      
      const resultsContainer = this.dialog.querySelector('.pingbash-member-search-results');
      if (!resultsContainer) {
        console.error('👥 [Widget] Search results container not found');
        return;
      }

      if (!query || query.length < 2) {
        resultsContainer.style.display = 'none';
        return;
      }

      // Clear previous timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // Debounce search for better performance
      this.searchTimeout = setTimeout(() => {
        // Check if we have group members data, if not request it
        if (!this.group?.members || this.group.members.length === 0) {
          if( window.isDebugging ) console.log('👥 [Widget] No group members found, requesting from server...');
          this.requestGroupMembersForSearch(query, resultsContainer);
        } else {
          this.performMemberSearch(query, resultsContainer);
        }
      }, 300);
    },

    requestGroupMembersForSearch(query, resultsContainer) {
      // Show loading in search results
      resultsContainer.innerHTML = '<div class="pingbash-member-result-item">Loading members...</div>';
      resultsContainer.style.display = 'block';

      // Request all group members from server
      if( window.isDebugging ) console.log('👥 [Widget] Requesting group members for search');
      
      // Try primary event first
      this.socket.emit('get group members', {
        groupId: this.group.id,
        token: this.config.token
      });
      
      // Also try alternative event names as fallback
      setTimeout(() => {
        if (this.pendingSearchQuery) {
          if( window.isDebugging ) console.log('👥 [Widget] Trying alternative group data request');
          this.socket.emit('get group data', {
            groupId: this.group.id,
            token: this.config.token
          });
        }
      }, 1000);

      // Store the search query to perform search once we get the data
      this.pendingSearchQuery = query;
      this.pendingSearchContainer = resultsContainer;
    },

    performMemberSearch(query, resultsContainer) {
      if( window.isDebugging ) console.log('👥 [Widget] Performing member search for:', query);
      if( window.isDebugging ) console.log('👥 [Widget] Available group members:', this.group?.members?.length);
      
      const queryLower = query.toLowerCase();
      
      // Cache moderator IDs for performance
      if (!this.cachedModeratorIds || this.cachedModeratorIds.timestamp < Date.now() - 30000) {
        const currentModerators = this.group?.members?.filter(member => member.role_id === 2) || [];
        if( window.isDebugging ) console.log('👥 [Widget] Current moderators:', currentModerators.length);
        this.cachedModeratorIds = {
          ids: new Set(currentModerators.map(mod => mod.id)),
          timestamp: Date.now()
        };
      }

      // Efficient filtering with early returns
      const availableMembers = [];
      const members = this.group?.members || [];
      
      if( window.isDebugging ) console.log('👥 [Widget] Searching through', members.length, 'members');
      
      for (let i = 0; i < members.length && availableMembers.length < 5; i++) {
        const member = members[i];
        
        // More lenient role check - accept role_id 1 (regular) or 3 (member) or even undefined
        const isRegularMember = member.role_id === 1 || member.role_id === 3 || !member.role_id;
        
        // Skip if already a moderator
        if (this.cachedModeratorIds.ids.has(member.id)) {
          continue;
        }
        
        // Skip if not a regular member (only skip actual moderators/admins)
        if (member.role_id === 2) { // Skip moderators
          continue;
        }
        
        // Check if name or ID matches query
        const name = member.name || '';
        const userName = member.username || '';
        
        if (name.toLowerCase().includes(queryLower) || 
            userName.toLowerCase().includes(queryLower) ||
            member.id.toString().includes(query)) {
          availableMembers.push(member);
          if( window.isDebugging ) console.log('👥 [Widget] Found matching member:', member.name || member.username || `User ${member.id}`);
        }
      }

      if( window.isDebugging ) console.log('👥 [Widget] Available members:', availableMembers.length);

      if (availableMembers.length === 0) {
        resultsContainer.innerHTML = '<div class="pingbash-member-result-item">No members found</div>';
        resultsContainer.style.display = 'block';
        return;
      }

      // Use DocumentFragment for better performance
      const fragment = document.createDocumentFragment();
      
      availableMembers.forEach(member => {
        const item = document.createElement('div');
        item.className = 'pingbash-member-result-item';
        item.dataset.memberId = member.id;
        
        const displayName = member.name || member.username || `User ${member.id}`;
        const avatarText = this.getUserInitials(displayName);
        item.innerHTML = `
          <div class="pingbash-member-result-avatar">${avatarText}</div>
          <div class="pingbash-member-result-name">${displayName}</div>
        `;
        
        fragment.appendChild(item);
      });

      resultsContainer.innerHTML = '';
      resultsContainer.appendChild(fragment);
      resultsContainer.style.display = 'block';
    },

    async addModerator(memberId) {
      if( window.isDebugging ) console.log('👥 [Widget] Adding moderator:', memberId);
      
      // Find the member
      const member = this.group?.members?.find(m => m.id === parseInt(memberId));
      if (!member) {
        console.error('👥 [Widget] Member not found:', memberId);
        return;
      }

      const memberName = member.name || `User ${member.id}`;
      
      const confirmed = await this.showConfirm(
        'Add Moderator',
        `Are you sure you want to add ${memberName} as a moderator? They will be given default permissions which you can customize later.`,
        { 
          okText: 'Add Moderator',
          destructive: false
        }
      );

      if (confirmed) {
        if( window.isDebugging ) console.log('👥 [Widget] Adding moderator:', memberName);
        
        // Show loading state
        this.showModeratorLoading('Adding moderator...');
        
        // Get current moderator IDs and add the new one
        const currentModerators = this.group?.members?.filter(member => member.role_id === 2) || [];
        const currentModIds = currentModerators.map(mod => mod.id);
        const newModIds = [...currentModIds, parseInt(memberId)];

        // Get token from multiple possible sources
        const token = this.authenticatedToken || this.config?.token || window.pingbashWidget?.config?.token || window.pingbashWidget?.authenticatedToken || localStorage.getItem('pingbash_token');
        
        if( window.isDebugging ) console.log('👥 [Widget] Token sources check:', {
          authenticatedToken: !!this.authenticatedToken,
          configToken: !!this.config?.token,
          widgetToken: !!window.pingbashWidget?.config?.token,
          widgetAuthToken: !!window.pingbashWidget?.authenticatedToken,
          localStorageToken: !!localStorage.getItem('pingbash_token'),
          finalToken: !!token
        });
        
        // Prepare the payload using the correct backend format
        const payload = {
          token: token,
          groupId: this.group.id,
          modIds: newModIds  // Array of ALL moderator IDs (existing + new)
        };
        
        if( window.isDebugging ) console.log('👥 [Widget] Sending add moderator payload:', payload);
        if( window.isDebugging ) console.log('👥 [Widget] Current moderators:', currentModIds);
        if( window.isDebugging ) console.log('👥 [Widget] New moderators array:', newModIds);
        if( window.isDebugging ) console.log('👥 [Widget] Socket connected:', this.socket?.connected);
        if( window.isDebugging ) console.log('👥 [Widget] Group ID:', this.group?.id);
        if( window.isDebugging ) console.log('👥 [Widget] Token:', token?.substring(0, 20) + '...');
        
        // Send to server using correct backend event name
        if( window.isDebugging ) console.log('👥 [Widget] 🚀 Emitting "update group moderators" event...');
        
        // Try multiple ways to access the socket
        const socket = this.socket || window.pingbashWidget?.socket;
        if( window.isDebugging ) console.log('👥 [Widget] Socket instance:', socket);
        
        if (!socket) {
          console.error('👥 [Widget] No socket instance available!');
          this.hideModeratorLoading();
          this.showErrorToast('Error', 'Socket connection not available');
          return;
        }
        
        socket.emit('update group moderators', payload);
        
        // Also emit debug events to check connectivity
        setTimeout(() => {
          if( window.isDebugging ) console.log('👥 [Widget] 🔍 Testing socket with ping event');
          socket.emit('ping', { test: true });
        }, 1000);

        // Set a timeout to hide loading if no response within 10 seconds
        setTimeout(() => {
          if (this.dialog.querySelector('.pingbash-loading-overlay')) {
            console.warn('👥 [Widget] Add moderator timeout - no response from server');
            this.hideModeratorLoading();
            this.showErrorToast('Timeout', 'No response from server. Please try again.');
          }
        }, 10000);

        // Clear search
        const searchInput = this.dialog.querySelector('.pingbash-member-search-input');
        const searchResults = this.dialog.querySelector('.pingbash-member-search-results');
        
        if (searchInput) searchInput.value = '';
        if (searchResults) searchResults.style.display = 'none';

        if( window.isDebugging ) console.log('👥 [Widget] Add moderator sent to server');
      }
    },

    // Loading state management
    showModeratorLoading(message = 'Loading...') {
      const popup = this.dialog.querySelector('.pingbash-moderator-management-popup .pingbash-popup-content');
      if (!popup) return;

      // Remove existing overlay
      this.hideModeratorLoading();

      // Create loading overlay
      const overlay = document.createElement('div');
      overlay.className = 'pingbash-loading-overlay';
      overlay.innerHTML = `
        <div class="pingbash-spinner"></div>
        <div class="pingbash-loading-text">${message}</div>
      `;

      popup.style.position = 'relative';
      popup.appendChild(overlay);
    },

    hideModeratorLoading() {
      const overlay = this.dialog.querySelector('.pingbash-loading-overlay');
      if (overlay) {
        overlay.remove();
      }
    },

    setButtonLoading(button, loading) {
      if (!button) return;
      
      if (loading) {
        button.classList.add('pingbash-btn-loading');
        button.disabled = true;
      } else {
        button.classList.remove('pingbash-btn-loading');
        button.disabled = false;
      }
    },

    // Toast notification system
    showToast(title, message, type = 'info', duration = 4000) {
      const toast = document.createElement('div');
      toast.className = `pingbash-toast ${type}`;
      toast.innerHTML = `
        <div class="pingbash-toast-header">
          <h6 class="pingbash-toast-title">${title}</h6>
          <button class="pingbash-toast-close">&times;</button>
        </div>
        <p class="pingbash-toast-message">${message}</p>
      `;

      document.body.appendChild(toast);

      // Close button
      const closeBtn = toast.querySelector('.pingbash-toast-close');
      closeBtn.addEventListener('click', () => this.hideToast(toast));

      // Auto-hide after duration
      setTimeout(() => this.hideToast(toast), duration);

      return toast;
    },

    hideToast(toast) {
      if (!toast || !toast.parentNode) return;
      
      toast.classList.add('removing');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    },

    showSuccessToast(title, message) {
      return this.showToast(title, message, 'success');
    },

    showErrorToast(title, message) {
      return this.showToast(title, message, 'error', 6000);
    },

    showWarningToast(title, message) {
      return this.showToast(title, message, 'warning');
    },

    // Custom confirmation dialog
    showConfirm(title, message, options = {}) {
      return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'pingbash-confirm-modal';
        
        const okButtonClass = options.destructive ? 'pingbash-confirm-ok' : 'pingbash-confirm-ok primary';
        const okButtonText = options.okText || 'OK';
        const cancelButtonText = options.cancelText || 'Cancel';
        
        modal.innerHTML = `
          <div class="pingbash-confirm-content">
            <div class="pingbash-confirm-header">
              <h4 class="pingbash-confirm-title">${title}</h4>
            </div>
            <div class="pingbash-confirm-body">
              <p class="pingbash-confirm-message">${message}</p>
            </div>
            <div class="pingbash-confirm-footer">
              <button class="pingbash-confirm-btn pingbash-confirm-cancel">${cancelButtonText}</button>
              <button class="pingbash-confirm-btn ${okButtonClass}">${okButtonText}</button>
            </div>
          </div>
        `;

        document.body.appendChild(modal);

        const cancelBtn = modal.querySelector('.pingbash-confirm-cancel');
        const okBtn = modal.querySelector('.pingbash-confirm-ok');

        const cleanup = () => {
          document.body.removeChild(modal);
        };

        cancelBtn.addEventListener('click', () => {
          cleanup();
          resolve(false);
        });

        okBtn.addEventListener('click', () => {
          cleanup();
          resolve(true);
        });

        // Close on overlay click
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            cleanup();
            resolve(false);
          }
        });

        // Focus OK button for keyboard navigation
        setTimeout(() => okBtn.focus(), 100);
      });
    },

    async removeModerator(moderatorId) {
      if( window.isDebugging ) console.log('👥 [Widget] Remove moderator:', moderatorId);
      
      // Find the moderator
      const moderator = this.group?.members?.find(member => member.id === parseInt(moderatorId));
      if (!moderator) {
        console.error('👥 [Widget] Moderator not found:', moderatorId);
        return;
      }

      const moderatorName = moderator.name || `User ${moderator.id}`;
      
      const confirmed = await this.showConfirm(
        'Remove Moderator',
        `Are you sure you want to remove ${moderatorName} as a moderator? This action cannot be undone and they will lose all moderator permissions.`,
        { 
          okText: 'Remove Moderator',
          destructive: true
        }
      );

      if (confirmed) {
        if( window.isDebugging ) console.log('👥 [Widget] Removing moderator:', moderatorName);
        
        // Show loading state
        this.showModeratorLoading('Removing moderator...');
        
        // Get current moderator IDs and remove the selected one
        const currentModerators = this.group?.members?.filter(member => member.role_id === 2) || [];
        const currentModIds = currentModerators.map(mod => mod.id);
        const newModIds = currentModIds.filter(id => id !== parseInt(moderatorId));

        // Get token from multiple possible sources
        const token = this.authenticatedToken || this.config?.token || window.pingbashWidget?.config?.token || window.pingbashWidget?.authenticatedToken || localStorage.getItem('pingbash_token');
        
        // Prepare the payload using the correct backend format
        const payload = {
          token: token,
          groupId: this.group.id,
          modIds: newModIds  // Array of remaining moderator IDs
        };

        // Special handling for removing the last moderator
        if (newModIds.length === 0) {
          console.warn('👥 [Widget] Removing last moderator - this will leave the group with no moderators!');
          const confirmLastModerator = await this.showConfirm(
            'Remove Last Moderator',
            'This will remove the last moderator from the group. The group will have no moderators. Are you sure?',
            {
              okText: 'Yes, Remove All Moderators',
              destructive: true
            }
          );
          
          if (!confirmLastModerator) {
            this.hideModeratorLoading();
            return;
          }
        }

        if( window.isDebugging ) console.log('👥 [Widget] Sending remove moderator payload:', payload);
        if( window.isDebugging ) console.log('👥 [Widget] Current moderators:', currentModIds);
        if( window.isDebugging ) console.log('👥 [Widget] Remaining moderators array:', newModIds);
        if( window.isDebugging ) console.log('👥 [Widget] Removing moderator ID:', moderatorId);
        if( window.isDebugging ) console.log('👥 [Widget] Group ID:', this.group?.id);
        if( window.isDebugging ) console.log('👥 [Widget] Token available:', !!token);
        
        // Validate payload before sending
        if (!token) {
          console.error('👥 [Widget] No token available for remove moderator request');
          this.hideModeratorLoading();
          this.showErrorToast('Error', 'Authentication token not available');
          return;
        }
        
        if (!this.group?.id) {
          console.error('👥 [Widget] No group ID available for remove moderator request');
          this.hideModeratorLoading();
          this.showErrorToast('Error', 'Group ID not available');
          return;
        }
        
        // Send to server using correct backend event name
        if( window.isDebugging ) console.log('👥 [Widget] 🚀 Emitting "update group moderators" for removal...');
        
        // Try multiple ways to access the socket
        const socket = this.socket || window.pingbashWidget?.socket;
        if( window.isDebugging ) console.log('👥 [Widget] Socket instance for removal:', socket);
        if( window.isDebugging ) console.log('👥 [Widget] Socket connected for removal:', socket?.connected);
        
        if (!socket) {
          console.error('👥 [Widget] No socket instance available for remove moderator!');
          this.hideModeratorLoading();
          this.showErrorToast('Error', 'Socket connection not available');
          return;
        }
        
        socket.emit('update group moderators', payload);

        if( window.isDebugging ) console.log('👥 [Widget] Moderator removal sent to server');

        // Set a timeout to hide loading if no response within 10 seconds
        const timeoutId = setTimeout(() => {
          console.warn('👥 [Widget] Remove moderator request timed out');
          this.hideModeratorLoading();
          this.showErrorToast('Timeout', 'No response from server. Please try again.');
        }, 10000);

        // Store timeout ID for cleanup if response comes back
        this.removeModeratorTimeoutId = timeoutId;
      }
    },

    saveModerators() {
      if( window.isDebugging ) console.log('👥 [Widget] Save moderators');
      // TODO: Implement saving moderator changes
      //alert('Save moderators functionality coming soon!');
      this.hideModeratorManagement();
    },

    showManageChatMenu() {
      const menuView = this.dialog.querySelector('.pingbash-manage-chat-menu');
      const pinnedView = this.dialog.querySelector('.pingbash-pinned-messages-view');
      
      if (menuView) menuView.style.display = 'block';
      if (pinnedView) pinnedView.style.display = 'none';
    },

    showPinnedMessagesView() {
      const menuView = this.dialog.querySelector('.pingbash-manage-chat-menu');
      const pinnedView = this.dialog.querySelector('.pingbash-pinned-messages-view');
      
      if (menuView) menuView.style.display = 'none';
      if (pinnedView) pinnedView.style.display = 'block';

      // Load pinned messages
      this.loadPinnedMessages();
    },

    loadPinnedMessages() {
      if( window.isDebugging ) console.log('📌 [Widget] Loading pinned messages');
      if( window.isDebugging ) console.log('📌 [Widget] Pinned message IDs:', this.pinnedMessageIds);
      if( window.isDebugging ) console.log('📌 [Widget] Total messages:', this.messages?.length || 0);
      
      const container = this.dialog.querySelector('.pingbash-pinned-messages-list');
      if (!container) {
        console.error('📌 [Widget] Pinned messages list container not found');
        return;
      }

      // Clear the container first
      container.innerHTML = '';

      // Get pinned messages using the pinnedMessageIds array
      const pinnedMessages = this.messages?.filter(msg => 
        this.pinnedMessageIds && this.pinnedMessageIds.includes(msg.Id)
      ) || [];
      
      if( window.isDebugging ) console.log('📌 [Widget] Found pinned messages:', pinnedMessages.length);
      if( window.isDebugging ) console.log('📌 [Widget] Sample message structure:', this.messages?.[0]);
      
      if (pinnedMessages.length === 0) {
        if( window.isDebugging ) console.log('📌 [Widget] No pinned messages found - auto-closing view');
        
        // Auto-close the pinned messages view when no messages are left
        const pinnedView = this.dialog.querySelector('.pingbash-pinned-messages-view');
        const menuView = this.dialog.querySelector('.pingbash-manage-chat-menu');
        if (pinnedView && menuView) {
          pinnedView.style.display = 'none';
          menuView.style.display = 'block';
          if( window.isDebugging ) console.log('📌 [Widget] Pinned messages view closed automatically, returned to menu');
        } else {
          // Fallback: show empty state if we can't close the view
        container.innerHTML = '<div class="pingbash-no-pinned">No pinned messages found</div>';
          if( window.isDebugging ) console.log('📌 [Widget] Could not auto-close view, showing empty state instead');
        }
        
        return;
      }

      if( window.isDebugging ) console.log('📌 [Widget] Rendering pinned messages:', pinnedMessages);

      container.innerHTML = pinnedMessages.map(msg => `
        <div class="pingbash-pinned-message-item" data-message-id="${msg.Id}">
          <div class="pingbash-pinned-message-content">
            <div class="pingbash-pinned-message-author">${this.getUserDisplayName(msg)}</div>
            <div class="pingbash-pinned-message-text">${this.renderMessageContent(msg.Content || msg.message || '')}</div>
            <div class="pingbash-pinned-message-time">${this.formatMessageTime(msg.Send_Time || msg.timestamp)}</div>
          </div>
          <button class="pingbash-unpin-btn" data-message-id="${msg.Id}" title="Unpin message">
            📌
          </button>
        </div>
      `).join('');

      if( window.isDebugging ) console.log('📌 [Widget] Pinned messages HTML rendered');
    },

    clearChat() {
      if( window.isDebugging ) console.log('🧹 [Widget] Clear chat button clicked');
      if( window.isDebugging ) console.log('🧹 [Widget] Socket connected:', this.socket && this.isConnected);
      if( window.isDebugging ) console.log('🧹 [Widget] Group ID:', this.groupId);
      if( window.isDebugging ) console.log('🧹 [Widget] User ID:', this.userId);
      
      if (!confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
        if( window.isDebugging ) console.log('🧹 [Widget] Clear chat cancelled by user');
        return;
      }

      // Emit clear chat event to server
      if (this.socket && this.isConnected) {
        if( window.isDebugging ) console.log('🧹 [Widget] Emitting clear chat event to server');
        
        // Set up a timeout in case server doesn't respond
        const clearChatTimeout = setTimeout(() => {
          console.warn('🧹 [Widget] Clear chat request timed out - no response from server');
          //alert('Clear chat request timed out. The server may not support this feature or there was a network issue.');
        }, 10000); // 10 second timeout

        // Store timeout so we can clear it if we get a response
        this.clearChatTimeout = clearChatTimeout;

        // Use the correct backend socket event: CLEAR_GROUP_CHAT
        this.socket.emit('clear group chat', {
          groupId: parseInt(this.groupId),
          token: this.isAuthenticated ? this.authenticatedToken : `anonusermemine${this.anonId}`
        });
        
        if( window.isDebugging ) console.log('🧹 [Widget] Clear group chat request sent to server with data:', {
          groupId: parseInt(this.groupId),
          token: this.isAuthenticated ? 'authenticated' : 'anonymous',
          isAuthenticated: this.isAuthenticated
        });

        // Optimistically clear messages locally (in case server doesn't respond)
        setTimeout(() => {
          if( window.isDebugging ) console.log('🧹 [Widget] Optimistically clearing messages locally after 2 seconds');
          this.messages = [];
          this.pinnedMessageIds = [];
          this.displayMessages([]);
          this.updatePinnedMessagesWidget();
          if( window.isDebugging ) console.log('🧹 [Widget] Local messages cleared');
        }, 2000);
        
        // Close the manage chat popup
        this.hideManageChat();
      } else {
        console.error('🧹 [Widget] Cannot clear chat - socket not connected');
        console.error('🧹 [Widget] Socket status:', {
          socket: !!this.socket,
          isConnected: this.isConnected
        });
        //alert('Cannot clear chat - not connected to server');
      }
    },

    unpinMessage(messageId) {
      if( window.isDebugging ) console.log('📌 [Widget] Unpinning message:', messageId);
      
      if (!this.socket || !this.isConnected) {
        console.error('📌 [Widget] Cannot unpin message - socket not connected');
        //alert('Cannot unpin message - not connected to server');
        return;
      }

      if (!this.isAuthenticated || !this.authenticatedToken) {
        console.error('📌 [Widget] Cannot unpin message - not authenticated');
        //alert('Please log in to unpin messages');
        return;
      }

      // Use correct backend payload format (same as chat.js)
      const payload = {
        token: this.authenticatedToken?.trim(),
        groupId: parseInt(this.groupId),
        msgId: parseInt(messageId)
      };

      if( window.isDebugging ) console.log('📌 [Widget] Unpin payload:', payload);
      if( window.isDebugging ) console.log('📌 [Widget] Token length:', payload.token?.length);

      // Emit unpin message event to server
      this.socket.emit('unpin message', payload);

      if( window.isDebugging ) console.log('📌 [Widget] Unpin message request sent to server');
    },

    getPinnedMessages() {
      if (!this.socket || !this.isConnected) {
        console.error('📌 [Widget] Cannot get pinned messages - socket not connected');
        return;
      }
      if (!this.isAuthenticated || !this.authenticatedToken) {
        if( window.isDebugging ) console.log('📌 [Widget] Cannot get pinned messages - not authenticated');
        return;
      }
      
      if( window.isDebugging ) console.log('📌 [Widget] Requesting pinned messages for group:', this.groupId);
      
      // Request pinned messages
      this.socket.emit('get pinned messages', {
        token: this.authenticatedToken?.trim(),
        groupId: parseInt(this.groupId)
      });
    },

    // Helper method to get display name for a user
    getUserDisplayName(message) {
      if (message.Sender_Id && message.Sender_Id > 100000) {
        // Anonymous user - show as anon + last 3 digits
        return "anon" + String(message.Sender_Id).slice(-3);
      } else {
        // Regular user - use sender_name or fallback
        return message.sender_name || 'Anonymous';
      }
    },

    // Helper method to render message content (basic HTML rendering)

    /*
    renderMessageContent(content) {
      if (!content) return '';
      
      // Escape HTML but preserve some basic formatting
      const escaped = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');

      // Convert URLs to links
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      return escaped.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #000000; text-decoration: underline;">$1</a>');
    },
    */
    // Helper method to format message time
    formatMessageTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    canManageChatLimitations() {
      // Check if user is group creator or mod with chat_limit permission
      const currentUserId = this.getCurrentUserId();
      if (!currentUserId || !this.group) return false;
      
      // Group creator can always manage limitations
      if (this.group.creater_id === currentUserId) return true;
      
      // Check if user is mod/admin with chat_limit permission
      const userMember = this.group.members?.find(member => {
        const memberId = member?.id != null ? parseInt(member.id) : null;
        return memberId === currentUserId;
      });
      return userMember && (userMember.role_id === 1 || userMember.role_id === 2) && userMember.chat_limit;
    },

    getCurrentUserId() {
      if (this.isAuthenticated && this.currentUserId) {
        return parseInt(this.currentUserId);
      } else if (this.anonId) {
        return parseInt(this.anonId);
      }
      return null;
    },

    loadCurrentLimitations() {
      if( window.isDebugging ) console.log('🔒 [Widget] Loading current chat limitations from group data:', this.group);
      
      if (!this.group) return;
      
      // Set post level (who can post)
      const postLevel = this.group.post_level || 0;
      const postRadios = this.dialog.querySelectorAll('input[name="post-level"]');
      postRadios.forEach(radio => {
        radio.checked = (parseInt(radio.value) === postLevel);
      });
      
      // Set URL level (who can post URLs)
      const urlLevel = this.group.url_level || 0;
      const urlRadios = this.dialog.querySelectorAll('input[name="url-level"]');
      urlRadios.forEach(radio => {
        radio.checked = (parseInt(radio.value) === urlLevel);
      });
      
      // Set slow mode
      const slowMode = this.group.slow_mode || false;
      const slowModeCheckbox = this.dialog.querySelector('#slow-mode-checkbox');
      if (slowModeCheckbox) {
        slowModeCheckbox.checked = slowMode;
        this.toggleSlowModeOptions(slowMode);
      }
      
      // Set slow time
      const slowTime = this.group.slow_time || 5;
      this.setSlowTimeOptions(slowTime);
    },

    toggleSlowModeOptions(show) {
      const slowModeOptions = this.dialog.querySelector('.pingbash-slow-mode-options');
      if (slowModeOptions) {
        slowModeOptions.style.display = show ? 'block' : 'none';
      }
    },

    setSlowTimeOptions(slowTime) {
      const speedRadios = this.dialog.querySelectorAll('input[name="slow-speed"]');
      const customSecondsDiv = this.dialog.querySelector('.pingbash-custom-seconds');
      const customSecondsInput = this.dialog.querySelector('#custom-seconds');
      
      if (slowTime === 5 || slowTime === 10 || slowTime === 15) {
        // Standard option
        speedRadios.forEach(radio => {
          radio.checked = (radio.value === slowTime.toString());
        });
        if (customSecondsDiv) customSecondsDiv.style.display = 'none';
      } else {
        // Custom option
        speedRadios.forEach(radio => {
          radio.checked = (radio.value === 'custom');
        });
        if (customSecondsDiv) customSecondsDiv.style.display = 'flex';
        if (customSecondsInput) customSecondsInput.value = slowTime.toString();
      }
    },

    updateChatLimitations() {
      if( window.isDebugging ) console.log('🔒 [Widget] Updating chat limitations');
      
      // Get form values
      const postLevel = parseInt(this.dialog.querySelector('input[name="post-level"]:checked')?.value || '0');
      const urlLevel = parseInt(this.dialog.querySelector('input[name="url-level"]:checked')?.value || '0');
      const slowMode = this.dialog.querySelector('#slow-mode-checkbox')?.checked || false;
      
      let slowTime = 5;
      const selectedSpeed = this.dialog.querySelector('input[name="slow-speed"]:checked')?.value;
      if (selectedSpeed === 'custom') {
        const customSeconds = parseInt(this.dialog.querySelector('#custom-seconds')?.value || '5');
        slowTime = customSeconds > 0 ? customSeconds : 5;
      } else {
        slowTime = parseInt(selectedSpeed || '5');
      }
      
      if( window.isDebugging ) console.log('🔒 [Widget] Chat limitations settings:', {
        postLevel,
        urlLevel,
        slowMode,
        slowTime
      });
      
      // Send to server (same as W version)
      if (this.isAuthenticated && this.authenticatedToken && this.groupId) {
        this.socket.emit('udpate group post level', {
          token: this.authenticatedToken.trim(),
          groupId: parseInt(this.groupId),
          post_level: postLevel,
          url_level: urlLevel,
          slow_mode: slowMode,
          slow_time: slowTime
        });
        
        if( window.isDebugging ) console.log('🔒 [Widget] Chat limitations update sent to server');
        this.hideChatLimitations();
      } else {
        console.error('🔒 [Widget] Cannot update chat limitations - missing authentication or group ID');
        //alert('Please sign in to update chat limitations');
      }
    },

    // Chat Limitations Validation Methods
    canUserPost() {
      if (!this.group) return true; // Allow if no group data
      
      const postLevel = this.group.post_level || 0;
      const currentUserId = this.getCurrentUserId();
      
      // 0 = Anyone can post
      if (postLevel === 0) return true;
      
      // 1 = Verified users only  
      if (postLevel === 1) {
        return this.isAuthenticated; // Only authenticated users can post
      }
      
      // 2 = Admin & Mods only
      if (postLevel === 2) {
        if (!currentUserId) return false;
        
        // Group creator can always post
        if (this.group.creater_id === currentUserId) return true;
        
        // Check if user is mod/admin
        const userMember = this.group.members?.find(member => {
          const memberId = member?.id != null ? parseInt(member.id) : null;
          return memberId === currentUserId;
        });
        return userMember && (userMember.role_id === 1 || userMember.role_id === 2);
      }
      
      return true;
    },

    canUserPostUrls(message) {
      if (!this.group) return true; // Allow if no group data
      
      const urlLevel = this.group.url_level || 0;
      const currentUserId = this.getCurrentUserId();
      
      // Check if message contains URLs
      const urlRegex = /(https?:\/\/[^\s]+)/gi;
      const hasUrls = urlRegex.test(message);
      
      if (!hasUrls) return true; // No URLs, so no restriction
      
      // 0 = Everyone can post URLs
      if (urlLevel === 0) return true;
      
      // 1 = Admin & Mods only can post URLs
      if (urlLevel === 1) {
        if (!currentUserId) return false;
        
        // Group creator can always post URLs
        if (this.group.creater_id === currentUserId) return true;
        
        // Check if user is mod/admin
        const userMember = this.group.members?.find(member => {
          const memberId = member?.id != null ? parseInt(member.id) : null;
          return memberId === currentUserId;
        });
        return userMember && (userMember.role_id === 1 || userMember.role_id === 2);
      }
      
      return true;
    },

    isSlowModeActive() {
      return this.group?.slow_mode || false;
    },

    getSlowModeTime() {
      return this.group?.slow_time || 5;
    },

    canUserSendMessage() {
      // Track last message time for slow mode
      if (!this.lastMessageTime) this.lastMessageTime = 0;
      
      const now = Date.now();
      const slowModeTime = this.getSlowModeTime() * 1000; // Convert to milliseconds
      
      if (this.isSlowModeActive()) {
        // 🆕 Check if user is admin or moderator (exempt from slow mode)
        const currentUserId = this.getCurrentUserId();
        const isAdminOrMod = this.group?.creater_id === currentUserId || 
          this.group?.members?.find(member => {
          const memberId = member?.id != null ? parseInt(member.id) : null;
          return memberId === currentUserId && (member.role_id === 1 || member.role_id === 2);
        });
        
        if (isAdminOrMod) {
          if( window.isDebugging ) console.log('⚡ [Widget] Admin/Moderator exempt from slow mode');
          return { canSend: true };
        }
        
        const timeSinceLastMessage = now - this.lastMessageTime;
        if (timeSinceLastMessage < slowModeTime) {
          const remainingTime = Math.ceil((slowModeTime - timeSinceLastMessage) / 1000);
          return { canSend: false, reason: `Slow mode: Wait ${remainingTime} seconds before sending another message` };
        }
      }
      
      return { canSend: true };
    },

    validateMessageBeforeSending(message) {
      if( window.isDebugging ) console.log('🔒 [Widget] Validating message before sending:', message);
      
      // Check if user can post at all
      if (!this.canUserPost()) {
        const postLevel = this.group?.post_level || 0;
        let errorMessage = 'You are not allowed to post messages.';
        
        if (postLevel === 1) {
          errorMessage = 'Only verified users can post messages. Please sign in.';
        } else if (postLevel === 2) {
          errorMessage = 'Only admins and moderators can post messages.';
        }
        
        return { valid: false, error: errorMessage };
      }
      
      // Check if user can post URLs
      if (!this.canUserPostUrls(message)) {
        return { valid: false, error: 'Only admins and moderators can post URLs.' };
      }
      
      // Check slow mode
      const slowModeCheck = this.canUserSendMessage();
      if (!slowModeCheck.canSend) {
        return { valid: false, error: slowModeCheck.reason };
      }
      
      if( window.isDebugging ) console.log('🔒 [Widget] Message validation passed');
      return { valid: true };
    },

    updateLastMessageTime() {
      this.lastMessageTime = Date.now();
    },

    // Update UI to reflect current chat limitations
    updateChatLimitationUI() {
      const input = this.dialog.querySelector('.pingbash-message-input');
      const sendBtn = this.dialog.querySelector('.pingbash-send-btn');
      const mediaButtons = this.dialog.querySelectorAll('.pingbash-media-btn');
      
      if (!input || !sendBtn) return;

      // Check if user can post at all
      const canPost = this.canUserPost();
      if (!canPost) {
        const postLevel = this.group?.post_level || 0;
        let placeholder = 'You cannot post messages.';
        
        if (postLevel === 1) {
          placeholder = 'Only verified users can post. Please sign in.';
        } else if (postLevel === 2) {
          placeholder = 'Only admins and moderators can post.';
        }
        
        input.disabled = true;
        input.placeholder = placeholder;
        sendBtn.disabled = true;
        mediaButtons.forEach(btn => btn.disabled = true);
        return;
      }

      // Check slow mode
      const slowModeCheck = this.canUserSendMessage();
      if (!slowModeCheck.canSend) {
        input.disabled = true;
        input.placeholder = slowModeCheck.reason;
        sendBtn.disabled = true;
        mediaButtons.forEach(btn => btn.disabled = true);
        
        // Set up timer to re-enable when slow mode period is over
        const slowModeTime = this.getSlowModeTime() * 1000;
        const timeSinceLastMessage = Date.now() - (this.lastMessageTime || 0);
        const remainingTime = slowModeTime - timeSinceLastMessage;
        
        if (remainingTime > 0) {
          setTimeout(() => {
            this.updateChatLimitationUI();
          }, remainingTime);
        }
        return;
      }

      // User can post - enable everything
      input.disabled = false;
      input.placeholder = 'Write a message';
      sendBtn.disabled = false;
      mediaButtons.forEach(btn => btn.disabled = false);

      // Add warning for URL restrictions if applicable
      const urlLevel = this.group?.url_level || 0;
      if (urlLevel === 1) {
        const currentUserId = this.getCurrentUserId();
        const isAdminOrMod = this.group?.creater_id === currentUserId || 
          this.group?.members?.find(member => {
          const memberId = member?.id != null ? parseInt(member.id) : null;
          return memberId === currentUserId && (member.role_id === 1 || member.role_id === 2);
        });
        
        if (!isAdminOrMod) {
          input.placeholder = 'Write a message (URLs not allowed)';
        }
      }
    },

    // Call this method when group data is updated
    onGroupDataUpdated() {
      if( window.isDebugging ) console.log('🔒 [Widget] Group data updated, refreshing chat limitation UI');
      this.updateChatLimitationUI();
    },

    // NEW METHOD - Show edit chat style modal (based on group creation modal)
    showEditChatStyleModal() {
      if( window.isDebugging ) console.log('🎨 [Widget] Opening Edit Chat Style modal');
      
      // Check permissions - only group creator can edit style
      const currentUserId = this.getCurrentUserId();
      const isGroupCreator = this.group && currentUserId === this.group.creater_id;
      
      if (!isGroupCreator) {
        if( window.isDebugging ) console.log('🎨 [Widget] User does not have permission to edit chat style (not group creator)');
        return;
      }
      
      // Create or get the modal
      const modal = this.createEditChatStyleModalInBody();
      if (!modal) {
        console.error('🎨 [Widget] Failed to create edit chat style modal');
        return;
      }
      
      // Populate with current group data
      this.populateEditChatStyleModal(modal);
      
      // Show the modal
      modal.style.display = 'flex';
      
      // Set up event listeners
      this.setupEditChatStyleEventListeners();
      
      if( window.isDebugging ) console.log('🎨 [Widget] Edit Chat Style modal displayed');
    },

    // NEW METHOD - Create edit chat style modal in body
    createEditChatStyleModalInBody() {
      // Check if modal already exists in body
      let existingModal = document.body.querySelector('.pingbash-edit-style-modal-body');
      if (existingModal) {
        return existingModal;
      }

      // Create the modal HTML - based on group creation modal
      const modalHTML = `
        <div class="pingbash-edit-style-modal-body" style="display: none;">
          <div class="pingbash-popup-overlay"></div>
          <div class="pingbash-popup-content pingbash-group-creation-content">
            <div class="pingbash-popup-header">
              <h2 class="pingbash-modal-title">Edit Chat Style</h2>
              <button class="pingbash-popup-close">×</button>
            </div>
            <div class="pingbash-popup-body">
              <!-- Group Name Input (Disabled for editing) -->
              <div class="pingbash-group-name-section">
                <label class="pingbash-input-label">Group Name</label>
                <input 
                  type="text" 
                  id="edit-group-name-input-body" 
                  class="pingbash-group-name-input" 
                  placeholder="Group name..." 
                  readonly
                  disabled
                  style="background: #f5f5f5; cursor: not-allowed;"
                />
              </div>

              <!-- Group Configuration Widget (Same as create group) -->
              <div class="pingbash-group-config-widget">
                <!-- Toggle Button -->
                <button class="pingbash-config-toggle" title="Toggle Configuration Panel">
                  <span class="pingbash-toggle-icon">‹</span>
                </button>
                
                <div class="pingbash-config-container">
                  <!-- Configuration Panel -->
                  <div class="pingbash-config-panel" id="edit-config-panel-body">
                    <div class="pingbash-config-section">
                      <h3 class="pingbash-config-title">Size</h3>
                      <div class="pingbash-radio-group">
                        <label class="pingbash-radio-option">
                          <input type="radio" name="edit-size-mode-body" value="fixed" checked />
                          <span class="pingbash-radio-dot"></span>
                          Fixed
                        </label>
                        <label class="pingbash-radio-option">
                          <input type="radio" name="edit-size-mode-body" value="responsive" />
                          <span class="pingbash-radio-dot"></span>
                          Responsive
                        </label>
                      </div>
                      
                      <div class="pingbash-size-inputs">
                        <div class="pingbash-input-group">
                          <input type="number" id="edit-width-input-body" class="pingbash-size-input" value="500" />
                          <label>Width (px)</label>
                        </div>
                        <div class="pingbash-input-group">
                          <input type="number" id="edit-height-input-body" class="pingbash-size-input" value="400" />
                          <label>Height (px)</label>
                        </div>
                      </div>
                    </div>

                    <div class="pingbash-config-section">
                      <h3 class="pingbash-config-title">Colors</h3>
                      <div class="pingbash-color-grid">
                        <div class="pingbash-color-item">
                          <label>Background</label>
                          <input type="color" id="edit-bg-color-body" value="#FFFFFF" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Titles and icons</label>
                          <input type="color" id="edit-title-color-body" value="#333333" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Messages bg</label>
                          <input type="color" id="edit-msg-bg-color-body" value="#F5F5F5" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Messages text</label>
                          <input type="color" id="edit-msg-text-color-body" value="#000000" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Reply message</label>
                          <input type="color" id="edit-reply-color-body" value="#1E81B0" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Date text</label>
                          <input type="color" id="edit-date-color-body" value="#666666" />
                        </div>
                        <div class="pingbash-color-item">
                          <label>Input bg</label>
                          <input type="color" id="edit-input-bg-color-body" value="#FFFFFF" />
                        </div>
                      </div>
                    </div>

                    <div class="pingbash-config-section">
                      <h3 class="pingbash-config-title">Settings</h3>
                      <div class="pingbash-settings-grid">
                        <label class="pingbash-checkbox-option">
                          <input type="checkbox" id="edit-user-images-body" checked />
                          <span class="pingbash-checkbox-mark"></span>
                          Show user images
                        </label>
                        <label class="pingbash-checkbox-option">
                          <input type="checkbox" id="edit-custom-font-size-body" />
                          <span class="pingbash-checkbox-mark"></span>
                          Custom font size
                        </label>
                        <label class="pingbash-checkbox-option">
                          <input type="checkbox" id="edit-round-corners-body" checked />
                          <span class="pingbash-checkbox-mark"></span>
                          Round corners
                        </label>
                        <label class="pingbash-checkbox-option">
                          <input type="checkbox" id="edit-show-chat-rules-body" />
                          <span class="pingbash-checkbox-mark"></span>
                          Show chat rules
                        </label>
                      </div>
                      
                      <div class="pingbash-font-size-section" style="display: none;">
                        <label>Font Size</label>
                        <input type="range" id="edit-font-size-slider-body" min="12" max="20" value="14" />
                        <span class="pingbash-font-size-value">14px</span>
                      </div>
                      
                      <div class="pingbash-corner-radius-section">
                        <label>Corner Radius</label>
                        <input type="range" id="edit-corner-radius-slider-body" min="0" max="20" value="8" />
                        <span class="pingbash-corner-radius-value">8px</span>
                      </div>
                    </div>
                  </div>

                  <!-- Chat Preview (Same as create group) -->
                  <div class="pingbash-chat-preview">
                    <!-- Chat preview content same as create group modal -->
                    <div class="pingbash-preview-container" id="edit-draggable-chat-preview">
                      <!-- Header -->
                      <nav class="pingbash-header">
                        <div class="pingbash-header-left">
                          <div class="pingbash-header-logo-section">
                            <img class="pingbash-logo" src="https://pingbash.com/logo-orange.png" alt="Pingbash" />
                          </div>
                        </div>
                        <div class="pingbash-header-right">
                          <div class="pingbash-hamburger-container">
                            <button class="pingbash-hamburger-btn">
                              <svg viewBox="0 0 24 24" width="22" height="22">
                                <path fill="currentColor" d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </nav>
                      
                      <!-- Messages Area -->
                      <article class="pingbash-messages-area">
                        <div class="pingbash-messages-container">
                          <div class="pingbash-messages-list" id="edit-preview-messages-list">
                            <!-- Preview messages -->
                          </div>
                        </div>
                      </article>
                      
                      <!-- Bottom Bar -->
                      <nav class="pingbash-input-bar">
                        <div class="pingbash-input-wrapper">
                          <div class="pingbash-input-row">
                            <input 
                              type="text" 
                              id="edit-preview-message-input"
                              class="pingbash-message-input" 
                              placeholder="Write a message"
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
                      
                      <!-- Controls Bar -->
                      <nav class="pingbash-controls-bar">
                        <div class="pingbash-controls-left">
                          <button class="pingbash-control-btn" disabled>
                            <svg viewBox="0 0 24 24" width="18" height="18">
                              <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z"/>
                            </svg>
                          </button>
                        </div>
                        <div class="pingbash-controls-right">
                          <button class="pingbash-control-btn" disabled>
                            <svg viewBox="0 0 24 24" width="18" height="18">
                              <path fill="currentColor" d="M16,4C18.21,4 20,5.79 20,8C20,10.21 18.21,12 16,12C13.79,12 12,10.21 12,8C12,5.79 13.79,4 16,4M16,14C20.42,14 24,15.79 24,18V20H8V18C8,15.79 11.58,14 16,14M6,6C7.11,6 8,6.89 8,8C8,9.11 7.11,10 6,10C4.89,10 4,9.11 4,8C4,6.89 4.89,6 6,6M6,12C8.67,12 12,13.34 12,16V18H0V16C0,13.34 3.33,12 6,12Z"/>
                            </svg>
                          </button>
                        </div>
                      </nav>
                    </div>
                    
                    <!-- Demo Background Text -->
                  </div>
                </div>
              </div>

              <!-- Update Button -->
              <button class="pingbash-update-chat-style-btn">Update Chat Style</button>
            </div>
          </div>
        </div>
      `;

      // Create and append to body
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = modalHTML;
      const modal = tempDiv.firstElementChild;
      document.body.appendChild(modal);

      // Ensure modal is on top
      modal.style.zIndex = '2147483648';
      modal.style.position = 'fixed';

      if( window.isDebugging ) console.log('🎨 [Widget] Edit Chat Style modal created and attached to body');
      return modal;
    },

    // NEW METHOD - Populate edit modal with current group data
    populateEditChatStyleModal(modal) {
      if (!this.group || !modal) return;
      
      if( window.isDebugging ) console.log('🎨 [Widget] Populating edit modal with group data:', this.group);
      
      // Set group name (readonly)
      const groupNameInput = modal.querySelector('#edit-group-name-input-body');
      if (groupNameInput) {
        groupNameInput.value = this.group.name || '';
      }
      
      // Set current values from group data
      const setIfExists = (selector, value, type = 'value') => {
        const element = modal.querySelector(selector);
        if (element && value !== undefined && value !== null) {
          if (type === 'checked') {
            element.checked = Boolean(value);
          } else {
            element[type] = value;
          }
        }
      };
      
      // Size settings
      setIfExists('input[name="edit-size-mode-body"][value="' + (this.group.size_mode || 'fixed') + '"]', true, 'checked');
      setIfExists('#edit-width-input-body', this.group.frame_width || 500);
      setIfExists('#edit-height-input-body', this.group.frame_height || 400);
      
      // Colors
      setIfExists('#edit-bg-color-body', this.group.bg_color || '#FFFFFF');
      setIfExists('#edit-title-color-body', this.group.title_color || '#333333');
      setIfExists('#edit-msg-bg-color-body', this.group.msg_bg_color || '#F5F5F5');
      setIfExists('#edit-msg-text-color-body', this.group.msg_txt_color || '#000000');
      setIfExists('#edit-reply-color-body', this.group.reply_msg_color || '#1E81B0');
      setIfExists('#edit-date-color-body', this.group.msg_date_color || '#666666');
      setIfExists('#edit-input-bg-color-body', this.group.input_bg_color || '#FFFFFF');
      
      // Settings
      setIfExists('#edit-user-images-body', this.group.show_user_img, 'checked');
      setIfExists('#edit-custom-font-size-body', this.group.custom_font_size, 'checked');
      setIfExists('#edit-round-corners-body', this.group.round_corners, 'checked');
      setIfExists('#edit-show-chat-rules-body', this.group.show_chat_rules, 'checked');
      
      // Sliders
      setIfExists('#edit-font-size-slider-body', this.group.font_size || 14);
      setIfExists('#edit-corner-radius-slider-body', this.group.corner_radius || 8);
      
      // Update slider value displays
      const fontSizeValue = modal.querySelector('.pingbash-font-size-value');
      if (fontSizeValue) fontSizeValue.textContent = (this.group.font_size || 14) + 'px';
      
      const cornerRadiusValue = modal.querySelector('.pingbash-corner-radius-value');
      if (cornerRadiusValue) cornerRadiusValue.textContent = (this.group.corner_radius || 8) + 'px';
      
      // Show/hide font size section based on custom font size setting
      const fontSizeSection = modal.querySelector('.pingbash-font-size-section');
      if (fontSizeSection) {
        fontSizeSection.style.display = this.group.custom_font_size ? 'block' : 'none';
      }
    },

    // NEW METHOD - Setup event listeners for edit chat style modal
    setupEditChatStyleEventListeners() {
      const modal = document.body.querySelector('.pingbash-edit-style-modal-body');
      if (!modal) return;

      if( window.isDebugging ) console.log('🎨 [Widget] Setting up edit chat style event listeners');

      // Close button
      const closeBtn = modal.querySelector('.pingbash-popup-close');
      const overlay = modal.querySelector('.pingbash-popup-overlay');
      const updateBtn = modal.querySelector('.pingbash-update-chat-style-btn');

      // Remove existing listeners to prevent duplicates
      closeBtn?.removeEventListener('click', this.hideEditChatStyleModal);
      overlay?.removeEventListener('click', this.hideEditChatStyleModal);
      updateBtn?.removeEventListener('click', this.updateChatStyle);

      // Add new listeners
      closeBtn?.addEventListener('click', () => this.hideEditChatStyleModal());
      overlay?.addEventListener('click', () => this.hideEditChatStyleModal());
      updateBtn?.addEventListener('click', () => this.updateChatStyle());

      // Set up form interactions (reuse existing methods with edit prefixes)
      this.setupEditChatStyleForm();

      if( window.isDebugging ) console.log('🎨 [Widget] Edit chat style event listeners set up successfully');
    },

    // NEW METHOD - Setup form interactions for edit modal
    setupEditChatStyleForm() {
      const modal = document.body.querySelector('.pingbash-edit-style-modal-body');
      if (!modal) return;
      
      // Set up all the interactive elements (similar to group creation form)
      // Font size toggle
      const customFontCheckbox = modal.querySelector('#edit-custom-font-size-body');
      const fontSizeSection = modal.querySelector('.pingbash-font-size-section');
      
      if (customFontCheckbox && fontSizeSection) {
        customFontCheckbox.addEventListener('change', () => {
          fontSizeSection.style.display = customFontCheckbox.checked ? 'block' : 'none';
        });
      }
      
      // Font size slider
      const fontSizeSlider = modal.querySelector('#edit-font-size-slider-body');
      const fontSizeValue = modal.querySelector('.pingbash-font-size-value');
      
      if (fontSizeSlider && fontSizeValue) {
        fontSizeSlider.addEventListener('input', () => {
          fontSizeValue.textContent = fontSizeSlider.value + 'px';
        });
      }
      
      // Corner radius slider
      const cornerRadiusSlider = modal.querySelector('#edit-corner-radius-slider-body');
      const cornerRadiusValue = modal.querySelector('.pingbash-corner-radius-value');
      
      if (cornerRadiusSlider && cornerRadiusValue) {
        cornerRadiusSlider.addEventListener('input', () => {
          cornerRadiusValue.textContent = cornerRadiusSlider.value + 'px';
        });
      }
      
      // Width and Height inputs - validation
      const widthInput = modal.querySelector('#edit-width-input-body');
      const heightInput = modal.querySelector('#edit-height-input-body');
      
      if (widthInput) {
        widthInput.addEventListener('input', (e) => {
          let value = parseInt(e.target.value);
          if (value < 400) e.target.value = 400;
          if (value > 800) e.target.value = 800;
          this.updateEditStylePreview();
        });
        widthInput.addEventListener('change', (e) => {
          let value = parseInt(e.target.value);
          if (value < 400) e.target.value = 400;
          if (value > 800) e.target.value = 800;
          this.updateEditStylePreview();
        });
      }
      
      if (heightInput) {
        heightInput.addEventListener('input', (e) => {
          let value = parseInt(e.target.value);
          if (value < 300) e.target.value = 300;
          if (value > 900) e.target.value = 900;
          this.updateEditStylePreview();
        });
        heightInput.addEventListener('change', (e) => {
          let value = parseInt(e.target.value);
          if (value < 300) e.target.value = 300;
          if (value > 900) e.target.value = 900;
          this.updateEditStylePreview();
        });
      }
      
      // Color inputs - add real-time preview updates
      const colorInputs = modal.querySelectorAll('input[type="color"]');
      colorInputs.forEach(input => {
        input.addEventListener('input', () => {
          this.updateEditStylePreview();
        });
      });
      
      // Other inputs for real-time preview
      const allInputs = modal.querySelectorAll('input, select');
      allInputs.forEach(input => {
        input.addEventListener('input', () => {
          this.updateEditStylePreview();
        });
        input.addEventListener('change', () => {
          this.updateEditStylePreview();
        });
      });
    },

    // NEW METHOD - Update preview in edit modal
    updateEditStylePreview() {
      const modal = document.body.querySelector('.pingbash-edit-style-modal-body');
      if (!modal) return;
      
      const preview = modal.querySelector('#edit-draggable-chat-preview');
      if (!preview) return;
      
      // Get current values and apply to preview (similar to group creation)
      const config = this.getCurrentEditConfigFromModal();
      this.applySettingsToEditPreview(modal, config);
    },

    // NEW METHOD - Get current configuration from edit modal
    getCurrentEditConfigFromModal() {
      const modal = document.body.querySelector('.pingbash-edit-style-modal-body');
      if (!modal) return {};
      
      return {
        sizeMode: modal.querySelector('input[name="edit-size-mode-body"]:checked')?.value || 'fixed',
        width: Math.max(400, Math.min(800, parseInt(modal.querySelector('#edit-width-input-body')?.value) || 500)),
        height: Math.max(300, Math.min(900, parseInt(modal.querySelector('#edit-height-input-body')?.value) || 400)),
        colors: {
          background: modal.querySelector('#edit-bg-color-body')?.value || '#FFFFFF',
          title: modal.querySelector('#edit-title-color-body')?.value || '#333333',
          msgBg: modal.querySelector('#edit-msg-bg-color-body')?.value || '#F5F5F5',
          msgText: modal.querySelector('#edit-msg-text-color-body')?.value || '#000000',
          replyText: modal.querySelector('#edit-reply-color-body')?.value || '#1E81B0',
          dateText: modal.querySelector('#edit-date-color-body')?.value || '#666666',
          inputBg: modal.querySelector('#edit-input-bg-color-body')?.value || '#FFFFFF'
        },
        settings: {
          userImages: modal.querySelector('#edit-user-images-body')?.checked || false,
          customFontSize: modal.querySelector('#edit-custom-font-size-body')?.checked || false,
          fontSize: parseInt(modal.querySelector('#edit-font-size-slider-body')?.value) || 14,
          roundCorners: modal.querySelector('#edit-round-corners-body')?.checked || false,
          cornerRadius: parseInt(modal.querySelector('#edit-corner-radius-slider-body')?.value) || 8,
          showChatRules: modal.querySelector('#edit-show-chat-rules-body')?.checked || false
        }
      };
    },

    // NEW METHOD - Apply settings to edit preview
    applySettingsToEditPreview(modal, config) {
      const preview = modal.querySelector('#edit-draggable-chat-preview');
      if (!preview) return;
      
      // Apply same logic as group creation preview
      const cssVars = {
        '--title-bg-color': config.colors.background,
        '--title-color': config.colors.title,
        '--msg-bg-color': config.colors.msgBg,
        '--msg-text-color': config.colors.msgText,
        '--date-color': config.colors.dateText,
        '--owner-msg-bg-color': config.colors.replyText,
        '--input-bg-color': config.colors.inputBg,
        '--font-size': (config.settings.customFontSize ? config.settings.fontSize : 14) + 'px',
        '--corner-radius': (config.settings.roundCorners ? config.settings.cornerRadius : 12) + 'px'
      };
      
      Object.entries(cssVars).forEach(([property, value]) => {
        preview.style.setProperty(property, value);
      });
      
      if (config.sizeMode === 'fixed') {
        preview.style.width = config.width + 'px';
        preview.style.height = config.height + 'px';
      }
    },

    // NEW METHOD - Hide edit chat style modal
    hideEditChatStyleModal() {
      const modal = document.body.querySelector('.pingbash-edit-style-modal-body');
      if (modal) {
        modal.style.display = 'none';
        if( window.isDebugging ) console.log('🎨 [Widget] Edit Chat Style modal hidden');
      }
    },

        // NEW METHOD - Update chat style (Socket event - same as F version)
    updateChatStyle() {
      if( window.isDebugging ) console.log('🎨 [Widget] Updating chat style');
      
      if (!this.group || !this.group.id) {
        console.error('🎨 [Widget] No group data available for update');
        return;
      }
      
      if (!this.socket || !this.socket.connected) {
        console.error('🎨 [Widget] Socket not connected');
        this.showNotification('Connection error. Please try again.', 'error');
        return;
      }
      
      // Get config from edit modal
      const config = this.getCurrentEditConfigFromModal();
      
      // Prepare update data (same structure as F version)
      const updateData = {
        token: this.authenticatedToken,
        groupId: this.group.id,
        size_mode: config.sizeMode,
        frame_width: config.width,
        frame_height: config.height,
        bg_color: config.colors.background,
        title_color: config.colors.title,
        msg_bg_color: config.colors.msgBg,
        msg_txt_color: config.colors.msgText,
        reply_msg_color: config.colors.replyText,
        msg_date_color: config.colors.dateText,
        input_bg_color: config.colors.inputBg,
        show_user_img: config.settings.userImages,
        custom_font_size: config.settings.customFontSize,
        font_size: config.settings.fontSize,
        round_corners: config.settings.roundCorners,
        corner_radius: config.settings.cornerRadius
      };
      
      if( window.isDebugging ) console.log('🎨 [Widget] Update data:', updateData);
      
      // Disable update button during request
      const updateBtn = document.body.querySelector('.pingbash-update-chat-style-btn');
      if (updateBtn) {
        updateBtn.disabled = true;
        updateBtn.textContent = 'Updating...';
      }
      
      // Set up one-time listener for the response
      const handleStyleUpdate = (updatedGroup) => {
        if( window.isDebugging ) console.log('🎨 [Widget] Chat style updated successfully:', updatedGroup);
        
        // Update local group data
        Object.assign(this.group, updatedGroup);
        
        // Apply changes to current chat dialog
        this.applyGroupSettingsToChatDialog(this.group);
        
        // Hide modal
        this.hideEditChatStyleModal();
        
        // Show success message
        this.showNotification('Chat style updated successfully!', 'success');
        
        // Re-enable update button
        if (updateBtn) {
          updateBtn.disabled = false;
          updateBtn.textContent = 'Update Chat Style';
        }
        
        // Remove the listener
        this.socket.off('group updated', handleStyleUpdate);
      };
      
      // Listen for group updated event
      this.socket.on('group updated', handleStyleUpdate);
      
      // Set timeout for the operation
      setTimeout(() => {
        this.socket.off('group updated', handleStyleUpdate);
        if (updateBtn && updateBtn.disabled) {
          updateBtn.disabled = false;
          updateBtn.textContent = 'Update Chat Style';
          this.showNotification('Update timeout. Please try again.', 'error');
        }
      }, 10000); // 10 second timeout
      
      // Emit the socket event (same as F version)
      this.socket.emit('udpate group chatbox style', updateData);
      if( window.isDebugging ) console.log('🎨 [Widget] Chat style update event emitted');
    },

     // NEW METHOD - Show notification message
     showNotification(message, type = 'info') {
       if( window.isDebugging ) console.log(`📢 [Widget] Showing ${type} notification:`, message);
       
       // Remove any existing notification
       const existingNotification = document.body.querySelector('.pingbash-notification');
       if (existingNotification) {
         existingNotification.remove();
       }
       
       // Create notification element
       const notification = document.createElement('div');
       notification.className = `pingbash-notification pingbash-notification-${type}`;
       notification.innerHTML = `
         <div class="pingbash-notification-content">
           <span class="pingbash-notification-icon">
             ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
           </span>
           <span class="pingbash-notification-message">${message}</span>
           <button class="pingbash-notification-close">×</button>
         </div>
       `;
       
       // Style the notification
       notification.style.cssText = `
         position: fixed;
         top: 20px;
         right: 20px;
         z-index: 2147483649;
         max-width: 400px;
         background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
         color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
         border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
         border-radius: 8px;
         padding: 12px;
         box-shadow: 0 4px 12px rgba(0,0,0,0.15);
         animation: slideInRight 0.3s ease;
         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         font-size: 14px;
       `;
       
       // Style notification content
       const content = notification.querySelector('.pingbash-notification-content');
       content.style.cssText = `
         display: flex;
         align-items: center;
         gap: 8px;
       `;
       
       // Style close button
       const closeBtn = notification.querySelector('.pingbash-notification-close');
       closeBtn.style.cssText = `
         background: none;
         border: none;
         color: inherit;
         cursor: pointer;
         font-size: 18px;
         margin-left: auto;
         padding: 0;
         width: 20px;
         height: 20px;
         display: flex;
         align-items: center;
         justify-content: center;
       `;
       
       // Add CSS animation
       if (!document.getElementById('pingbash-notification-styles')) {
         const style = document.createElement('style');
         style.id = 'pingbash-notification-styles';
         style.textContent = `
           @keyframes slideInRight {
             from {
               transform: translateX(100%);
               opacity: 0;
             }
             to {
               transform: translateX(0);
               opacity: 1;
             }
           }
         `;
         document.head.appendChild(style);
       }
       
       // Add to page
       document.body.appendChild(notification);
       
       // Close button functionality
       closeBtn.addEventListener('click', () => {
         notification.remove();
       });
       
              // Auto-hide after 5 seconds
       setTimeout(() => {
         if (notification.parentNode) {
           notification.remove();
         }
       }, 5000);
     },

     // User Search Modal Methods
     showUserSearchModal() {
       if( window.isDebugging ) console.log('🔍 [Widget] Opening user search modal');
       
       const modal = this.dialog.querySelector('.pingbash-user-search-modal');
       if (!modal) {
         console.error('🔍 [Widget] User search modal not found');
         return;
       }
       
       // Show the modal
       modal.style.display = 'flex';
       
       // Load all group members
       this.loadUsersForModal();
       
       // Setup event listeners if not already done
       this.setupUserSearchModalEventListeners();
       
       // Focus on search input
       const searchInput = modal.querySelector('.pingbash-user-search-modal-input');
       if (searchInput) {
         setTimeout(() => searchInput.focus(), 100);
       }
     },

     hideUserSearchModal() {
       if( window.isDebugging ) console.log('🔍 [Widget] Closing user search modal');
       
       const modal = this.dialog.querySelector('.pingbash-user-search-modal');
       if (modal) {
         modal.style.display = 'none';
         
         // Clear search input
         const searchInput = modal.querySelector('.pingbash-user-search-modal-input');
         if (searchInput) {
           searchInput.value = '';
         }
         
         // Reset filter mode to public if no user was selected
         if (!this.filteredUser) {
           const publicRadio = this.dialog.querySelector('#filter-public');
           if (publicRadio) {
             publicRadio.checked = true;
             this.filterMode = 0;
             this.applyMessageFilter();
             this.showModeStatus(0);
           }
         }
       }
     },

     setupUserSearchModalEventListeners() {
       if (this.userSearchModalListenersAdded) return;
       this.userSearchModalListenersAdded = true;
       
       const modal = this.dialog.querySelector('.pingbash-user-search-modal');
       if (!modal) return;
       
       // Search input listener
       const searchInput = modal.querySelector('.pingbash-user-search-modal-input');
       if (searchInput) {
         searchInput.addEventListener('input', (e) => {
           this.handleUserSearchModal(e.target.value);
         });
       }
       
       // Cancel button
       const cancelBtn = modal.querySelector('.pingbash-user-search-cancel-btn');
       if (cancelBtn) {
         cancelBtn.addEventListener('click', () => {
           this.hideUserSearchModal();
         });
       }
       
       // Close button
       const closeBtn = modal.querySelector('.pingbash-popup-close');
       if (closeBtn) {
         closeBtn.addEventListener('click', () => {
           this.hideUserSearchModal();
         });
       }
       
       // Overlay click to close
       const overlay = modal.querySelector('.pingbash-popup-overlay');
       if (overlay) {
         overlay.addEventListener('click', () => {
           this.hideUserSearchModal();
         });
       }
     },

     loadUsersForModal() {
       if( window.isDebugging ) console.log('🔍 [Widget] Loading users for modal');
       
       const resultsContainer = this.dialog.querySelector('.pingbash-user-search-results');
       if (!resultsContainer) return;
       
       // Show loading state
       resultsContainer.innerHTML = '<div class="pingbash-loading-users">Loading users...</div>';
       
       // Get all group members
       const allGroupMembers = this.getGroupMembers();
       const onlineUserIds = this.onlineUserIds || [];
       
       if (allGroupMembers.length === 0) {
         resultsContainer.innerHTML = '<div class="pingbash-no-users-found">No users found</div>';
         return;
       }
       
       this.renderUsersInModal(allGroupMembers, onlineUserIds);
     },

     renderUsersInModal(users, onlineUserIds, searchTerm = '') {
       const resultsContainer = this.dialog.querySelector('.pingbash-user-search-results');
       if (!resultsContainer) return;
       
       // Filter users by search term if provided
       let filteredUsers = users;
       if (searchTerm.trim()) {
         filteredUsers = users.filter(user => 
           user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())
         );
       }
       
       if (filteredUsers.length === 0) {
         resultsContainer.innerHTML = '<div class="pingbash-no-users-found">No users found</div>';
         return;
       }
       
       // Render users
       resultsContainer.innerHTML = filteredUsers.map(user => {
         const isOnline = onlineUserIds.includes(user.id);
         const avatarLetter = user.name ? user.name.charAt(0).toUpperCase() : '?';
         
         return `
           <div class="pingbash-user-result-item" data-user-id="${user.id}" data-user-name="${user.name}">
             <div class="pingbash-user-result-avatar">${avatarLetter}</div>
             <div class="pingbash-user-result-info">
               <div class="pingbash-user-result-name">${user.name || 'Unknown User'}</div>
               <div class="pingbash-user-result-status">
                 <div class="pingbash-status-dot ${isOnline ? 'online' : 'offline'}"></div>
                 ${isOnline ? 'Online' : 'Offline'}
               </div>
             </div>
           </div>
         `;
       }).join('');
       
       // Add click listeners to user items
       resultsContainer.querySelectorAll('.pingbash-user-result-item').forEach(item => {
         item.addEventListener('click', () => {
           const userId = parseInt(item.dataset.userId);
           const userName = item.dataset.userName;
           const user = users.find(u => u.id === userId);
           if (user) {
             this.selectUserFromModal(user);
           }
         });
       });
     },

     handleUserSearchModal(searchTerm) {
       if( window.isDebugging ) console.log('🔍 [Widget] User search in modal:', searchTerm);
       
       const allGroupMembers = this.getGroupMembers();
       const onlineUserIds = this.onlineUserIds || [];
       
       this.renderUsersInModal(allGroupMembers, onlineUserIds, searchTerm);
     },

     selectUserFromModal(user) {
       if( window.isDebugging ) console.log('🔍 [Widget] User selected from modal:', user);
       
       // Set the filtered user
       this.filteredUser = user;
       
       // Hide the modal
       this.hideUserSearchModal();
       
       // Apply message filter
       this.applyMessageFilter();
       
       // Update input placeholder
       this.updateInputPlaceholder(1);
       
       // Show mode status feedback
       this.showModeStatus(1);
       
       if( window.isDebugging ) console.log('🔍 [Widget] 1-on-1 mode activated with user:', user.name);
    },

  });
}



