'use client'

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import EmojiPicker from "@/components/chats/EmojiPicker";
import Message from "@/components/chats/message";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  getGroupHistory,
  getGroupHistoryAnon,
  sendGroupMsg,
  socket,
  deleteGroupMsg,
  banGroupUser,
  unbanGroupUser,
  registerAsAnon,
  loginAsReal,
  updateGroupFavInfo,
  updateGroupChatLimitations,
  pinChatmessage,
  unpinChatmessage,
  clearGroupChat,
  getPinnedMessages,
  updateGroupModerators,
  updateGroupModPermissions,
  updateCensoredWords,
  unbanGroupUsers,
  sendGroupNotify,
  updateGroupChatboxConfig,
  timeoutGroupUser,
  blockUser,

  getGroupMessages,
  userLoggedIn,
  userLoggedOut,
  getGroupOnlineUsers,
  getBannedUsers,
  getChatRules,
  updateChatRules
} from "@/resource/utils/chat";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import ChatConst from "@/resource/const/chat_const";
import {
  CHAT_BOX_HEIGHT,
  CHAT_BOX_WIDTH,
  SELECTED_GROUP_ID,
  SERVER_URL,
  TOKEN_KEY,
  USER_ID_KEY
} from "@/resource/const/const";
import { useDispatch, useSelector } from "react-redux";
import { chatDate, containsURL, getCensoredMessage, getCensoredWordArray, isTimedout } from "@/resource/utils/helpers";
import { MessageUnit, User, ChatOption, ChatGroup, ChatUser } from "@/interface/chatInterface";
import toast from "react-hot-toast";
import messages from "@/resource/const/messages";
import axios from "axios";
import PreLoading from "@/components/mask/preLoading";
import { setIsLoading } from "@/redux/slices/stateSlice";
import ConfirmPopup from "@/components/ConfirmPopup";
import { SigninPopup } from "@/components/SigninPopup";
import Lottie from "lottie-react"
import { stickers } from '../components/chats/LottiesStickers';
import { useSound } from "@/components/chats/useSound";
import "./globals.css";
import httpCode from "@/resource/const/httpCode";
import {
  faPaperPlane,
  faBars,
  faClose,
  faReply,
  faPaperclip,
  faVolumeUp,
  faFilter,
  faUser,
  faSliders,
  faL
} from "@fortawesome/free-solid-svg-icons";
import {
  faImages,
  faFaceSmile,
} from "@fortawesome/free-regular-svg-icons";
import {
  ALLOW_USER_MSG_STYLE,
  BG_COLOR,
  BORDER_COLOR,
  CORNOR_RADIUS,
  FONT_SIZE,
  INPUT_BG_COLOR,
  MSG_BG_COLOR,
  MSG_COLOR,
  MSG_DATE_COLOR,
  OWNER_MSG_COLOR,
  REPLY_MGS_COLOR,
  ROUND_CORNORS,
  SCROLLBAR_COLOR,
  SHOW_USER_IMG,
  TITLE_COLOR
} from '@/resource/const/const';
import { darkenColor } from "@/resource/utils/colors";
import SwitchButton from "@/components/SwitchButton";
import { v4 as uuidv4 } from 'uuid';
import TimeoutNotification from '../components/TimeoutNotification';
import { VerificationPopup } from '../components/VerificationPopup';
import FilterWidget from "@/components/groupAdmin/FilterWidget";
import ChatLimitPopup from "@/components/groupAdmin/ChatLimitPopup";
import ManageChatPopup from "@/components/groupAdmin/ManageChatPopup";
import ModeratorsPopup from "@/components/groupAdmin/ModeratorsPopup";
import CensoredContentsPopup from "@/components/groupAdmin/CensoredContentsPopup";
import BannedUsersPopup from "@/components/groupAdmin/BannedUsersPopup";
import PinnedMessagesWidget from "@/components/chats/PinnedMessagesWidget";
import SendNotificationPopup from "@/components/groupAdmin/SendNotificationPopup";
import GroupCreatPopup from "@/components/groupAdmin/groupCreatPopup";
import { GroupPropsEditWidget } from "@/components/chats/GroupPropsEditWidget";
import { SignupPopup } from "@/components/SignupPopup";
import GroupOnlineUsersPopup from "@/components/groupAdmin/GroupOnlineUsersPopup";
import ChatRulesPopup from "@/components/groupAdmin/ChatRulesPopup";
import { Gruppo } from "next/font/google";


interface Attachment {
  type: string | null;
  url: string | null;
}

interface ChatWidgetConfig {
  sizeMode: 'fixed' | 'responsive';
  width: number;
  height: number;
  colors: {
    background: string;
    border: string;
    title: string;
    ownerMsg: string;
    msgBg: string;
    msgText: string;
    replyText: string;
    scrollbar: string;
    inputBg: string;
    inputText: string;
    dateText: string;
    innerBorder: string;
  };
  settings: {
    userImages: boolean;
    allowUserMessageStyles: boolean;
    customFontSize: boolean;
    fontSize: number;
    showTimestamp: boolean;
    showUrl: boolean;
    privateMessaging: boolean;
    roundCorners: boolean;
    cornerRadius: number;
    showChatRules: boolean;
  };
}

const ChatsContent: React.FC = () => {
  // Auth Params
  const [showSigninPopup, setShowSigninPopup] = useState<boolean>(false);
  const [showSignupPopup, setShowSignupPopup] = useState<boolean>(false);

  const [inputMsg, setInputMsg] = useState("")
  const [lastChatDate, setLastChatDate] = useState(1)
  const [showEmoji, setShowEmoji] = useState(false)
  const [attachment, setAttachment] = useState<Attachment>()

  const [groupMsgList, setGroupMsgList] = useState<MessageUnit[]>([])

  // Debug groupMsgList changes
  useEffect(() => {
    console.log("🔍 [W] groupMsgList state updated:", groupMsgList?.length, "messages");
    if (groupMsgList?.length > 0) {
      console.log("🔍 [W] Latest message:", groupMsgList[groupMsgList.length - 1]);
    }
  }, [groupMsgList]);

  const [group, setGroup] = useState<ChatGroup>();
  const [socketConnected, setSocketConnected] = useState(false);

  // Debug socketConnected changes with user info
  useEffect(() => {
    const currentUserId = getCurrentUserId();
    const currentUserName = localStorage.getItem('userName') || 'Unknown';
    console.log("🔍 [W] socketConnected state updated:", socketConnected, "for user:", currentUserId, currentUserName);
    
    // Add periodic socket health check for debugging
    if (socketConnected) {
      const healthCheck = setInterval(() => {
        console.log("🔍 [W] Socket health check - Connected:", socket.connected, "User:", currentUserName);
        if (!socket.connected) {
          console.log("🔍 [W] Socket disconnected unexpectedly for user:", currentUserName);
        }
      }, 15000); // Check every 15 seconds
      
      return () => clearInterval(healthCheck);
    }
  }, [socketConnected]);
  const [pageVisible, setPageVisible] = useState(true);
  const reloadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debug pageVisible changes
  useEffect(() => {
    console.log("🔍 [W] pageVisible state updated:", pageVisible);
  }, [pageVisible]);
  const [pendingMessages, setPendingMessages] = useState<MessageUnit[]>([]);

  // Debug pendingMessages changes
  useEffect(() => {
    console.log("🔍 [W] pendingMessages state updated:", pendingMessages?.length, "messages");
    if (pendingMessages?.length > 0) {
      console.log("🔍 [W] Pending messages:", pendingMessages);
    }
  }, [pendingMessages]);
  const [showTimeoutNotification, setShowTimeoutNotification] = useState(false);
  const [timeoutData, setTimeoutData] = useState<{timeoutMinutes: number; expiresAt: string} | null>(null);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  // Debug group changes
  useEffect(() => {
    console.log("🔍 [W] group changed to:", group?.id, group?.name);
    console.log("🔍 [W] group full object:", group);
    console.log("🔍 [W] current user ID:", getCurrentUserId());
    console.log("🔍 [W] hasSeenRulesForGroup state:", hasSeenRulesForGroup);

    // When group changes, load messages (but NOT chat rules automatically)
    if (group?.id) {
      const token = localStorage.getItem(TOKEN_KEY);
      const currentUserId = getCurrentUserId();

      console.log("🔍 [W] Group loaded for user type:", currentUserId > 0 ? 'Logged-in' : 'Anonymous');

      if (token) {
        console.log("🔍 [W] Group loaded - requesting messages for logged-in user");
        getGroupMessages(token, group.id);

        // Check if current user is in the group members list
        const currentUser = getCurrentUserId();
        const isUserInGroup = group.members?.find(member => member.id === currentUser);
        console.log("🔍 [W] Is user in group members?", !!isUserInGroup, "User ID:", currentUser);

        // If user is not in group, add them temporarily for message filtering
        if (!isUserInGroup && currentUser && currentUser > 0) {
          console.log("🔍 [W] Adding current user to group members list");
          const updatedGroup = {
            ...group,
            members: [
              ...(group.members || []),
              {
                id: currentUser,
                name: "Current User", // This would normally come from user data
                email: "",
                avatar: "",
                gender: "",
                birthday: "",
                country: "",
                Socket: false,
                banned: 0,
                unban_request: null,
                is_member: 1,
                role_id: 0, // Regular user
                chat_limit: null,
                manage_mods: null,
                manage_chat: null,
                manage_censored: null,
                ban_user: null,
                filter_mode: 0,
                to_time: null
              }
            ]
          };
          setGroup(updatedGroup);
        }
      } else {
        console.log("🔍 [W] Group loaded - no token found, waiting for authentication");
      }
    }
  }, [group?.id]); // Only depend on group.id to avoid infinite loops
  const [favGroups, setFavGroups] = useState<ChatGroup[]>([]);

  const dispatch = useDispatch()
  const imageUploadRef = useRef<HTMLInputElement | null>(null)
  const fileUploadRef = useRef<HTMLInputElement | null>(null)
  const inputMsgRef = useRef<HTMLInputElement | null>(null)
  const [isMobile, setIsMobile] = useState(false);

  const [openUnbanReqConfirmPopup, setOpenUnbanReqConfirmPopup] = useState(false);

  const [deleteMsgId, setDeleteMsgId] = useState<number | null>(null);
  const [openMsgDeleteConfirmPopup, setOpenMsgDeleteConfirmPopup] = useState(false);

  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [openBanUserConfirmPopup, setOpenBanUserConfirmPopup] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const groupMemuPopoverRef = useRef<HTMLDivElement>(null);
  const msgItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [replyMsg, setReplyMsg] = useState<MessageUnit | null | undefined>();
  const [showMsgReplyView, setShowMsgReplyView] = useState<boolean | null>(null);
  const playBell = useSound("/sounds/sound_bell.wav");
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [groupMenuOptions, setGroupMenuOptions] = useState<{ id: number; name: string }[]>([])

  const [anonToken, setAnonToken] = useState<string | null>(null)

  const soundMenuPopoverRef = useRef<HTMLImageElement>(null);
  const filterPopoverRef = useRef<HTMLImageElement>(null);

  const [stayAsAnon, setStayAsAnon] = useState(false)
  const [showSigninView, setShowSigninView] = useState(false)

  const [mySoundOptionId, setMySoundOptionId] = useState<number | null | undefined>(null);
  const [soundSelectedOption, setSoundSelectedOption] = useState<string | null | undefined>(null);
  const soundSettingOptions = [
    { val: "every", name: "On every message", option_id: 1 },
    { val: "reply", name: "Only on @replies", option_id: 2 },
    { val: "never", name: "Never", option_id: 0 }
  ];



  const [groupConfig, setGroupConfig] = useState<ChatWidgetConfig>({
    sizeMode: 'fixed',
    width: CHAT_BOX_WIDTH,
    height: CHAT_BOX_HEIGHT,
    colors: {
      background: BG_COLOR,
      border: BORDER_COLOR,
      title: TITLE_COLOR,
      ownerMsg: OWNER_MSG_COLOR,
      msgBg: MSG_BG_COLOR,
      replyText: REPLY_MGS_COLOR,
      msgText: MSG_COLOR,
      scrollbar: SCROLLBAR_COLOR,
      inputBg: INPUT_BG_COLOR,
      inputText: '#000000',
      dateText: MSG_DATE_COLOR,
      innerBorder: '#CC0000'
    },
    settings: {
      userImages: SHOW_USER_IMG,
      allowUserMessageStyles: ALLOW_USER_MSG_STYLE,
      customFontSize: false,
      fontSize: FONT_SIZE,
      showTimestamp: false,
      showUrl: false,
      privateMessaging: false,
      roundCorners: ROUND_CORNORS,
      cornerRadius: CORNOR_RADIUS,
      showChatRules: false
    }
  });

  const [groupEditConfig, setGroupEditConfig] = useState<ChatWidgetConfig>({
    sizeMode: 'fixed',
    width: CHAT_BOX_WIDTH,
    height: CHAT_BOX_HEIGHT,
    colors: {
      background: BG_COLOR,
      border: BORDER_COLOR,
      title: TITLE_COLOR,
      ownerMsg: OWNER_MSG_COLOR,
      msgBg: MSG_BG_COLOR,
      replyText: REPLY_MGS_COLOR,
      msgText: MSG_COLOR,
      scrollbar: SCROLLBAR_COLOR,
      inputBg: INPUT_BG_COLOR,
      inputText: '#000000',
      dateText: MSG_DATE_COLOR,
      innerBorder: '#CC0000'
    },
    settings: {
      userImages: SHOW_USER_IMG,
      allowUserMessageStyles: ALLOW_USER_MSG_STYLE,
      customFontSize: false,
      fontSize: FONT_SIZE,
      showTimestamp: false,
      showUrl: false,
      privateMessaging: false,
      roundCorners: ROUND_CORNORS,
      cornerRadius: CORNOR_RADIUS,
      showChatRules: false
    }
  });

  const [isDarkMode, setDarkMode] = useState(false);
  const [hideChat, setHideChat] = useState(false)
  // Parameters for the Admin Tools
  const adminManagePopoverRef = useRef<HTMLImageElement>(null);
  const [openChatLimitationPopup, setOpenChatLimitationPopup] = useState(false);
  const [openBannedUsersWidget, setOpenBannedUsersWidget] = useState(false);
  const [openModeratorsWidget, setOpenModeratorsWidget] = useState(false);
  const [openCensoredPopup, setOpenCensoredPopup] = useState(false);
  const [openManageChatPopup, setOpenManageChatPopup] = useState(false);
  const [showPinnedMessagesView, setShowPinnedMessageView] = useState(false);
  const [groupBannedUsers, setGroupBannedUsers] = useState<ChatUser[]>([]);
  const [pinnedMsgIds, setPinnedMsgIds] = useState<number[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<MessageUnit[]>([]);
  const [tabbedPinMsgId, setTabbedPinMsgId] = useState<number | null>(null);
  const [adminManageOptions, setAdminManageOptions] = useState<{ id: string; name: string }[]>([]);
  const [filterOptions, setFilterOption] = useState<{ id: number; name: string }[]>([]);
  const [filterMode, setFilterMode] = useState(0)
  const [filteredUser, setFilteredUser] = useState<ChatUser | null>(null)  // For the user selected in Filter mode for 1 on 1 Mode
  const [openSendGroupNotification, setOpenSendGroupNotification] = useState(false)

  const [filteredMsgList, setFilteredMsgList] = useState<MessageUnit[]>([])
  const [filteredPrevMsgList, setFilteredPrevMsgList] = useState<MessageUnit[]>([])
  const [blockedUserIds, setBlockedUserIds] = useState<number[]>([])

  // Debug blockedUserIds changes
  useEffect(() => {
    console.log("🔍 [W] blockedUserIds state updated:", blockedUserIds);
  }, [blockedUserIds]);

  // Debug filteredMsgList changes
  useEffect(() => {
    console.log("🔍 [W] filteredMsgList state updated:", filteredMsgList?.length, "messages");
  }, [filteredMsgList]);

  const [openEditGroupPop, setOpenEditGroupPop] = useState(false);
  const [openNewGroupPop, setOpenNewGroupPop] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [openChatRules, setOpenChatRules] = useState(false);
  const [chatRules, setChatRules] = useState("");
  const [hasSeenRulesForGroup, setHasSeenRulesForGroup] = useState<{ [groupId: number]: boolean }>(() => {
    // Load seen rules from localStorage
    try {
      const stored = localStorage.getItem('seenChatRules');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Track when we're waiting for chat rules after authentication
  const [pendingChatRulesDisplay, setPendingChatRulesDisplay] = useState<{
    groupId: number | null,
    userType: 'logged-in' | 'anonymous' | null,
    timestamp: number
  }>({
    groupId: null,
    userType: null,
    timestamp: 0
  });

  // Debug chat rules state changes
  useEffect(() => {
    console.log("🔍 [W] [Chat Rules] chatRules state changed:", {
      length: chatRules?.length,
      content: chatRules?.substring(0, 50) + (chatRules?.length > 50 ? "..." : ""),
      groupId: group?.id
    });
  }, [chatRules, group?.id]);

  // Debug openChatRules state changes
  useEffect(() => {
    console.log("🔍 [W] [Chat Rules] openChatRules state changed:", openChatRules);
  }, [openChatRules]);

  // Debug pending chat rules display state
  useEffect(() => {
    console.log("🔍 [W] [Chat Rules] pendingChatRulesDisplay state changed:", pendingChatRulesDisplay);
  }, [pendingChatRulesDisplay]);

  // Removed automatic fallback - chat rules now only load after successful authentication
  const [openGroupOnlineUsersPopup, setOpenGroupOnlineUsersPopup] = useState(false)
  const [showOnlineUserCount, setShowOnlineUserCount] = useState(false)

  const [isBannedUser, setIsBanneduser] = useState(false);
  const [canPost, setCanPost] = useState(true)
  const [canPinMessage, setCanPinMessage] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [canSend, setCanSend] = useState(true);

  // Helper function to mark rules as seen and persist to localStorage
  const markRulesAsSeen = (groupId: number) => {
    setHasSeenRulesForGroup(prev => {
      const updated = { ...prev, [groupId]: true };
      try {
        localStorage.setItem('seenChatRules', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save seen rules to localStorage:', error);
      }
      return updated;
    });
  };

  // Helper function to reset seen rules for testing (can be called from browser console)
  const resetSeenRules = () => {
    setHasSeenRulesForGroup({});
    try {
      localStorage.removeItem('seenChatRules');
      console.log("🔍 [W] [Chat Rules] Seen rules cleared for testing");
    } catch (error) {
      console.error('Failed to clear seen rules from localStorage:', error);
    }
  };

  // Helper function to force show chat rules for testing
  const forceShowChatRules = () => {
    console.log("🔍 [W] [Chat Rules] Force showing chat rules for testing");
    setOpenChatRules(true);
  };

  // Function to trigger chat rules after successful authentication
  const triggerChatRulesAfterLogin = useCallback((token: string, userType: 'logged-in' | 'anonymous') => {
    if (!group?.id) {
      console.log("🔍 [W] [Chat Rules] No group available for chat rules loading");
      return;
    }

    console.log("🔍 [W] [Chat Rules] Triggering chat rules after", userType, "authentication");
    console.log("🔍 [W] [Chat Rules] Loading chat rules for group:", group.id);

    // Set pending state to indicate we're waiting for chat rules after authentication
    setPendingChatRulesDisplay({
      groupId: group.id,
      userType: userType,
      timestamp: Date.now()
    });

    // Load chat rules - display will be handled in handleGetChatRules
    getChatRules(token, group.id);
  }, [group?.id]);

  // Function to create a new group
  const createNewGroup = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const token = localStorage.getItem(TOKEN_KEY);

      if (!token) {
        toast.error("Please log in to create a group");
        return;
      }

      const groupData = {
        groupName: newGroupName.trim(),
        createrId: getCurrentUserId(),
        size_mode: groupConfig.sizeMode,
        frame_width: groupConfig.width,
        frame_height: groupConfig.height,
        bg_color: groupConfig.colors.background,
        title_color: groupConfig.colors.title,
        msg_bg_color: groupConfig.colors.msgBg,
        msg_txt_color: groupConfig.colors.msgText,
        reply_msg_color: groupConfig.colors.replyText,
        msg_date_color: groupConfig.colors.dateText,
        input_bg_color: groupConfig.colors.inputBg,
        show_user_img: groupConfig.settings.userImages,
        custom_font_size: groupConfig.settings.customFontSize,
        font_size: groupConfig.settings.fontSize,
        round_corners: groupConfig.settings.roundCorners,
        corner_radius: groupConfig.settings.cornerRadius,
        chat_rules: '',
        show_chat_rules: groupConfig.settings.showChatRules
      };

      console.log("🔍 [W] Creating group with data:", groupData);

      const res = await axios.post(`${SERVER_URL}/api/private/add/groups/create`, groupData, {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          Authorization: token,
        },
      });

      console.log("🔍 [W] Group created successfully:", res.data);
      toast.success(messages.group.createSuccess);
      setOpenNewGroupPop(false);
      setNewGroupName(""); // Reset group name

      // Refresh the groups list if available
      // Note: MayaIQ_W-main doesn't seem to have a groups list, but we can add this for future use
      console.log("🔍 [W] Group creation completed");

    } catch (error: any) {
      console.error("🔍 [W] Group creation error:", error);
      toast.error(error.response?.data?.message || messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  }, [dispatch, newGroupName, groupConfig]);

  // Helper function to manually trigger chat rules check for testing
  const triggerChatRulesCheck = () => {
    console.log("🔍 [W] [Chat Rules] Manual trigger - checking conditions");
    console.log("🔍 [W] [Chat Rules] Current state:", {
      group: group?.id,
      chatRules: chatRules?.length,
      currentUserId,
      hasSeenRules: group?.id ? hasSeenRulesForGroup[group.id] : undefined,
      isCreator: currentUserId === group?.creater_id
    });

    if (group?.id && chatRules && chatRules.trim().length > 0) {
      const shouldShow = !hasSeenRulesForGroup[group.id] &&
        currentUserId !== group.creater_id;
      if (shouldShow) {
        console.log("🔍 [W] [Chat Rules] Manual trigger - showing rules");
        setOpenChatRules(true);
        markRulesAsSeen(group.id);
      } else {
        console.log("🔍 [W] [Chat Rules] Manual trigger - conditions not met");
      }
    } else {
      console.log("🔍 [W] [Chat Rules] Manual trigger - no group or rules");
    }
  };

  // Helper function to test backend API directly
  const testBackendChatRules = async () => {
    if (!group?.id) {
      console.log("🔍 [W] [Chat Rules] No group selected for backend test");
      return;
    }

    try {
      console.log("🔍 [W] [Chat Rules] Testing backend API directly...");
      const token = localStorage.getItem(TOKEN_KEY);
      const anonToken = localStorage.getItem('anonToken');
      const testToken = token || anonToken;

      console.log("🔍 [W] [Chat Rules] Using token:", testToken?.substring(0, 20) + "...");
      console.log("🔍 [W] [Chat Rules] Token type:", token ? 'JWT' : 'Anonymous');

      const response = await axios.post(`${SERVER_URL}/api/private/get/groups/getChatRules`,
        { groupId: group.id },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: testToken,
          },
        }
      );
      console.log("🔍 [W] [Chat Rules] Backend API response:", response.data);
    } catch (error: any) {
      console.error("🔍 [W] [Chat Rules] Backend API error:", error);
      if (error.response) {
        console.error("🔍 [W] [Chat Rules] Error response:", error.response.status, error.response.data);
      }
    }
  };

  // Helper function to test socket connection
  const testSocketConnection = () => {
    console.log("🔍 [W] [Chat Rules] Testing socket connection...");
    console.log("🔍 [W] [Chat Rules] Socket connected:", socket.connected);
    console.log("🔍 [W] [Chat Rules] Socket ID:", socket.id);

    // Test with a simple socket event
    if (group?.id) {
      const token = localStorage.getItem(TOKEN_KEY);
      console.log("🔍 [W] [Chat Rules] Manually emitting GET_CHAT_RULES...");
      socket.emit(ChatConst.GET_CHAT_RULES, { token, groupId: group.id });
    }
  };

  // Make functions available globally for testing
  if (typeof window !== 'undefined') {
    (window as any).resetSeenRulesW = resetSeenRules;
    (window as any).forceShowChatRulesW = forceShowChatRules;
    (window as any).triggerChatRulesCheckW = triggerChatRulesCheck;
    (window as any).testBackendChatRulesW = testBackendChatRules;
    (window as any).testSocketConnectionW = testSocketConnection;
    (window as any).triggerChatRulesAfterLoginW = triggerChatRulesAfterLogin;
  }
  const [cooldown, setCooldown] = useState(0);
  const hasShownGroupNotify = useRef(false);
  const [groupOnlineUserIds, setGroupOnlineUserIds] = useState<number[]>([])
  //--------------------------


  const getSubDomain = () => {
    let hostname = window.location.hostname; // e.g., "blog.example.com"
    const parts = hostname.split('.');
    console.log("🔍 [W] getSubDomain - hostname:", hostname, "parts:", parts);

    // Handle cases like "blog.example.com" vs "localhost" vs "co.uk"
    let subdomain = '';
    if (parts.length > 1) {
      subdomain = parts.slice(0, 1).join('.'); // e.g., "blog"
    } else {
      subdomain = ''; // No subdomain, e.g., "example.com" or "localhost"
    }
    subdomain = 'testgroup3';
    console.log("🔍 [W] getSubDomain result:", subdomain);
    return subdomain;
  }

  const getBrowserFingerprint = (): string => {
    return [
      navigator.userAgent,
      navigator.language,
      screen.width,
      screen.height,
      screen.colorDepth,
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join('::');
  };

  const hashStringToNumber = (str: string): number => {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash >>> 0); // Unsigned 32-bit number
  };

  const getAnonId = () => {
    const fingerprint = getBrowserFingerprint();
    const anonId = hashStringToNumber(fingerprint);
    return anonId % 1000000000;
  }

  // Function to find group by name (for logged-in users)
  // Function to ensure user is a member and refresh group data
  const ensureGroupMembership = useCallback(async (groupId: number, token: string) => {
    console.log("🔍 [W] ensureGroupMembership called for group:", groupId);
    try {
      // Ensure user is joined to the group
      await axios.post(`${SERVER_URL}/api/private/update/groups/join`, {
        groupId: groupId,
        userId: getCurrentUserId()
      }, {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json", 
          Authorization: token,
        },
      });
      console.log("🔍 [W] User successfully joined group, refreshing group data");
      
      // Refresh group data to get updated member list
      const updatedGroupRes = await axios.get(`${SERVER_URL}/api/private/get/groups/${groupId}`, {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          Authorization: token,
        },
      });
      
      if (updatedGroupRes.data) {
        console.log("🔍 [W] Updated group data with members:", updatedGroupRes.data);
        console.log("🔍 [W] Updated members array:", updatedGroupRes.data.members);
        console.log("🔍 [W] Current user ID:", getCurrentUserId());
        const myMember = updatedGroupRes.data.members?.find((m: any) => m.id == getCurrentUserId());
        console.log("🔍 [W] My member info after refresh:", myMember);
        setGroup(updatedGroupRes.data);
        return updatedGroupRes.data;
      }
    } catch (error) {
      console.error("🔍 [W] Error ensuring group membership:", error);
    }
    return null;
  }, []);

  const findGroupByName = useCallback(async (token: string, groupName: string) => {
    console.log("🔍 [W] findGroupByName called with:", { token, groupName });
    try {
      dispatch(setIsLoading(true));
      // Try to get group info by name from the backend
      const res = await axios.get(`${SERVER_URL}/api/private/get/groups/byname/${groupName}`, {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          Authorization: token,
        },
      });
      console.log("🔍 [W] findGroupByName response:", res.data);

      if (res.data && res.data.id) {
        console.log("🔍 [W] Group found, setting group:", res.data);
        localStorage.setItem(SELECTED_GROUP_ID, res.data.id.toString());
        setGroup(res.data);
        
        // Ensure user is joined to the group and then load messages
        console.log("🔍 [W] Joining user to group:", res.data.id);
        try {
          await axios.post(`${SERVER_URL}/api/private/update/groups/join`, {
            groupId: res.data.id,
            userId: getCurrentUserId()
          }, {
            headers: {
              "Accept": "application/json",
              "Content-type": "application/json", 
              Authorization: token,
            },
          });
          console.log("🔍 [W] User successfully joined group, refreshing group data");
          
          // Refresh group data to get updated member list
          const updatedGroupRes = await axios.get(`${SERVER_URL}/api/private/get/groups/byname/${groupName}`, {
            headers: {
              "Accept": "application/json",
              "Content-type": "application/json",
              Authorization: token,
            },
          });
          
          if (updatedGroupRes.data) {
            console.log("🔍 [W] Updated group data with members:", updatedGroupRes.data);
            console.log("🔍 [W] Updated members array:", updatedGroupRes.data.members);
            console.log("🔍 [W] Current user ID:", getCurrentUserId());
            const myMember = updatedGroupRes.data.members?.find((m: any) => m.id == getCurrentUserId());
            console.log("🔍 [W] My member info after refresh:", myMember);
            setGroup(updatedGroupRes.data);
          }
        } catch (joinError) {
          console.error("🔍 [W] Error joining group:", joinError);
          // Continue anyway - user might already be in group
        }
        
        // Check for persisted timeout state when switching groups
        checkPersistedTimeout(res.data.id);
        
        // Load messages for this group
        console.log("🔍 [W] Calling getGroupMessages for group:", res.data.id);
        getGroupMessages(token, res.data.id);
      } else {
        console.log("🔍 [W] Group not found:", groupName);
        toast.error(`Group "${groupName}" not found.`);
      }
    } catch (error) {
      console.error("🔍 [W] findGroupByName error:", error);
      // Fallback: try the anonymous registration approach
      console.log("🔍 [W] Falling back to anonymous registration");
      const getBrowserUUID = () => {
        let uuid = localStorage.getItem("browser_uuid");
        if (!uuid) {
          uuid = Math.random().toString(36).substring(2, 15);
          localStorage.setItem("browser_uuid", uuid);
        }
        return uuid;
      }
      const browserUUid = getBrowserUUID();
      const anontoken = "anonuser" + groupName + browserUUid;
      setAnonToken(anontoken);
      registerAnon(anontoken, getAnonId(), groupName);
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const initializeApp = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const groupId = getChatGroupID();
      const userId = getCurrentUserId();
      const groupName = getSubDomain();
      console.log("🔍 [W] Initialization:", { token, groupId, userId, groupName });
      setCurrentUserId(userId);

      // Try to restore session if token exists
      if (token && !token.includes('anonuser')) {
        console.log("🔍 [W] Attempting to restore user session");
        try {
          const { restoreUserSession } = await import('../resource/utils/auth');
          const sessionRestored = await restoreUserSession();
          
          if (sessionRestored) {
            console.log("🔍 [W] Session restored - user remains logged in");
            
            // Start periodic token refresh for logged-in users
            const { startTokenRefreshInterval } = await import('../resource/utils/auth');
            const refreshInterval = startTokenRefreshInterval();
            
            // Store interval ID for cleanup
            if (refreshInterval) {
              (window as any).tokenRefreshInterval = refreshInterval;
            }
            
            // Continue with logged-in user flow
            userLoggedIn(token);
            if (groupName) {
              findGroupByName(token, groupName);
            } else if (groupId && groupId !== 0) {
              loginAsReal(token, groupId, getAnonId());
              getGroupMessages(token, groupId);
              // Check for persisted timeout state after loading group
              setTimeout(() => checkPersistedTimeout(groupId), 500);
            }
            return; // Exit early since user is logged in
          } else {
            console.log("🔍 [W] Session restoration failed - proceeding as anonymous");
            // Clear invalid session data
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_ID_KEY);
          }
        } catch (error) {
          console.error("🔍 [W] Session restoration error:", error);
        }
      }

      // Continue with existing logic for users without valid session
      const currentToken = localStorage.getItem(TOKEN_KEY);
      const currentUserId = getCurrentUserId();
      
      // For logged-in users, try to find the group by subdomain name
      if (currentToken && currentUserId != 0) {
        console.log("🔍 [W] User is logged in - finding group by subdomain");
        // Notify backend that user is logged in
        userLoggedIn(currentToken);
        if (groupName) {
          console.log("🔍 [W] Looking for group with name:", groupName);
          // Find group by name via API call (similar to MayaIQ_F-main)
          findGroupByName(currentToken, groupName);
        } else if (groupId && groupId !== 0) {
          console.log("🔍 [W] Using stored group ID:", groupId);
          loginAsReal(currentToken, groupId, getAnonId());
          getGroupMessages(currentToken, groupId);
          // Check for persisted timeout state after loading group
          setTimeout(() => checkPersistedTimeout(groupId), 500);
        } else {
          console.log("🔍 [W] No group specified - user needs to select a group");
        }
      } else {
        console.log("🔍 [W] User not logged in - registering as anonymous");
        registerAsAnon(getAnonId());

        // For anonymous users, still try to load group by subdomain
        if (groupName) {
          console.log("🔍 [W] Anonymous user - calling registerAnon for group:", groupName);
          const getBrowserUUID = () => {
            let uuid = localStorage.getItem("browser_uuid");
            if (!uuid) {
              uuid = Math.random().toString(36).substring(2, 15);
              localStorage.setItem("browser_uuid", uuid);
            }
            return uuid;
          }
          const browserUUid = getBrowserUUID();
          const anontoken = "anonuser" + groupName + browserUUid;
          localStorage.setItem('anonToken', anontoken); // Store for later use
          setAnonToken(anontoken);
          registerAnon(anontoken, getAnonId(), groupName);
        }
      }
    };

    initializeApp();
    checkScreenSize();
    const interval = setInterval(getCurrentGroupOnlineUsers, 1 * 60 * 1000);
    window.addEventListener('resize', checkScreenSize);
    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', checkScreenSize);
    }
  }, [dispatch]);

  useEffect(() => {
    const getBrowserUUID = () => {
      let uuid = localStorage.getItem("browser_uuid");
      if (!uuid) {
        uuid = uuidv4();
        localStorage.setItem("browser_uuid", uuid);
      }
      return uuid;
    }

    const getAnonToken = () => {
      const groupName = getSubDomain();
      const browserUUid = getBrowserUUID();
      const anontoken = "anonuser" + groupName + browserUUid;
      setAnonToken(anontoken)
      return anontoken
    }

    const handleLogginAsAnon = (data: any) => {
      console.log("== handleLogginAsAnon ===")
      if (data.success == "success") {
        registerAnon(getAnonToken(), getAnonId(), getSubDomain());
      }
    };

    const handleGetGroupHistory = (data: MessageUnit[]) => {
      // dispatch(setMessageList([...data]));
      setGroupMsgList([...data])
    }

    const handleSendGroupNotify = (msg: string | null) => {
      if (!hasShownGroupNotify.current) {
        toast.success("Sent notifications successfully")
        hasShownGroupNotify.current = true
      }
    }

    // Register socket listener
    socket.on(ChatConst.USER_LOGGED_AS_ANNON, handleLogginAsAnon);
    socket.on(ChatConst.SEND_GROUP_NOTIFY, handleSendGroupNotify)

    socket.on(ChatConst.GET_GROUP_HISTORY, handleGetGroupHistory)

    // Cleanup to avoid memory leaks and invalid state updates
    return () => {
      socket.off(ChatConst.USER_LOGGED_AS_ANNON, handleLogginAsAnon);
      socket.off(ChatConst.GET_GROUP_HISTORY, handleGetGroupHistory)
      socket.off(ChatConst.SEND_GROUP_NOTIFY, handleSendGroupNotify)
    };
  }, []);

  useEffect(() => {
    if (!isDarkMode) {
      setGroupConfig({
        ...groupConfig,
        sizeMode: group?.size_mode ?? "fixed",
        width: group?.frame_width ?? CHAT_BOX_WIDTH,
        height: group?.frame_height ?? CHAT_BOX_HEIGHT,
        colors: {
          ...groupConfig.colors,
          background: group?.bg_color ?? BG_COLOR,
          title: group?.title_color ?? TITLE_COLOR,
          msgBg: group?.msg_bg_color ?? MSG_BG_COLOR,
          replyText: group?.reply_msg_color ?? REPLY_MGS_COLOR,
          msgText: group?.msg_txt_color ?? MSG_COLOR,
          dateText: group?.msg_date_color ?? MSG_DATE_COLOR,
          inputBg: group?.input_bg_color ?? INPUT_BG_COLOR,
        },
        settings: {
          ...groupConfig.settings,
          userImages: group?.show_user_img ?? SHOW_USER_IMG,
          customFontSize: group?.custom_font_size ?? false,
          fontSize: group?.font_size ?? FONT_SIZE,
          roundCorners: group?.round_corners ?? false,
          cornerRadius: group?.corner_radius ?? CORNOR_RADIUS
        }
      });
    } else {
      setGroupConfig({
        ...groupConfig,
        sizeMode: group?.size_mode ?? "fixed",
        width: group?.frame_width ?? CHAT_BOX_WIDTH,
        height: group?.frame_height ?? CHAT_BOX_HEIGHT,
        colors: {
          ...groupConfig.colors,
          background: darkenColor(group?.bg_color ?? BG_COLOR),
          title: darkenColor(group?.title_color ?? TITLE_COLOR),
          msgBg: darkenColor(group?.msg_bg_color ?? MSG_BG_COLOR),
          replyText: darkenColor(group?.reply_msg_color ?? REPLY_MGS_COLOR),
          msgText: darkenColor(group?.msg_txt_color ?? MSG_COLOR),
          dateText: darkenColor(group?.msg_date_color ?? MSG_DATE_COLOR),
          inputBg: darkenColor(group?.input_bg_color ?? INPUT_BG_COLOR),
        },
        settings: {
          ...groupConfig.settings,
          userImages: group?.show_user_img ?? SHOW_USER_IMG,
          customFontSize: group?.custom_font_size ?? false,
          fontSize: group?.font_size ?? FONT_SIZE,
          roundCorners: group?.round_corners ?? false,
          cornerRadius: group?.corner_radius ?? CORNOR_RADIUS
        }
      });
    }
    getCurrentGroupOnlineUsers()
  }, [group, isDarkMode]);

  useEffect(() => {
    dispatch(setIsLoading(false));
    let token = localStorage.getItem(TOKEN_KEY);
    if (!token) token = anonToken
    if (token && group) {
      setPinnedMsgIds([]);
      getPinnedMessages(token, group?.id)
    }
    setShowMsgReplyView(false);
    setFilterMode(0)
    // Reset blocked users when switching groups - personal blocks should not affect group chats
    console.log("🔍 [W] Resetting blockedUserIds to empty array");
    setBlockedUserIds([]);
  }, [group?.id, currentUserId]);

  useEffect(() => {
    dispatch(setIsLoading(false));
    setGroupBannedUsers(group?.members?.filter(mem => mem.banned == 1) ?? [])
    if (group) {
      const myMemInfo = group?.members?.find(mem => mem.id == getCurrentUserId());

      // Set Admin / Mod tools list
      const options: { id: string; name: string }[] = [];
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.chat_limit) {
        options.push({ id: "1", name: "Chat Limitations" });
      }
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_chat) {
        options.push({ id: "2", name: "Manage Chat" });
      }
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_mods) {
        options.push({ id: "3", name: "Manage Moderators" });
      }
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_censored) {
        options.push({ id: "4", name: "Censored Content" });
      }
      // Only Group Master can access ban management
      if (myMemInfo?.id == group?.creater_id) {
        options.push({ id: "5", name: "Banned Users" });
        options.push({ id: "6", name: "IP Bans" });
      }
      setAdminManageOptions(options);

      // Set filter option based on user role
      const filterOptions: { id: number; name: string }[] = [];
      filterOptions.push({ id: 0, name: "Public Mode" });
      filterOptions.push({ id: 1, name: "1 on 1 Mode" });
      if (myMemInfo?.id == group?.creater_id || myMemInfo?.role_id == 2) {
        filterOptions.push({ id: 2, name: "Mods Mode" });
      }
      setFilterOption(filterOptions)

      // Is Banner init
      setIsBanneduser(myMemInfo?.banned == 1)

      // Init Addmin tools variables
      if (group.post_level == null || group.post_level == 0) {
        setCanPost(true)
      } else if (group.post_level == 1) {
        if (myMemInfo?.id && myMemInfo?.id < 1000000) {
          setCanPost(true)
        } else {
          setCanPost(false)
        }
      } else if (group.post_level == 2) {
        if (myMemInfo?.role_id == 1 || myMemInfo?.role_id == 2) {
          setCanPost(true)
        } else {
          setCanPost(false)
        }
      }

      if (myMemInfo?.role_id == 1 || myMemInfo?.role_id == 2) {
        setCanPinMessage(true)
      } else {
        setCanPinMessage(false)
      }
    }

  }, [group, currentUserId])

  useEffect(() => {
    const pinnedMsgs = filteredMsgList.filter(msg => pinnedMsgIds.includes(msg.Id ?? -1))
    setPinnedMessages(pinnedMsgs);
  }, [filteredMsgList, pinnedMsgIds]);

  useEffect(() => {
    console.log("🔍 [W] Filtering messages - groupMsgList:", groupMsgList?.length, "currentUserId:", currentUserId);
    console.log("🔍 [W] Group members:", group?.members?.length, group?.members?.map(m => ({ id: m.id, name: m.name })));
    const myMemInfo = group?.members?.find(mem => mem.id == currentUserId)
    console.log("🔍 [W] My member info:", myMemInfo);
    setFilteredPrevMsgList(filteredMsgList)
    let newMsgs = []
    if (currentUserId == null) {
      console.log("🔍 [W] No currentUserId - showing public messages only");
      newMsgs = groupMsgList.filter(msg => msg.Receiver_Id === null)
    } else {
      if (myMemInfo?.role_id == 1 || myMemInfo?.role_id == 2) {
        console.log("🔍 [W] User is moderator/admin - showing all messages");
        newMsgs = groupMsgList.filter(msg => msg.Receiver_Id == null || msg.Receiver_Id == 1 || msg.Receiver_Id == currentUserId || msg.Sender_Id == currentUserId)
      } else {
        console.log("🔍 [W] Regular user - showing public + own messages");
        newMsgs = groupMsgList.filter(msg => msg.Receiver_Id == null || msg.Receiver_Id == currentUserId || msg.Sender_Id == currentUserId)
      }
    }

    if (myMemInfo?.role_id != 1 && myMemInfo?.role_id != 2 && group?.creater_id != getCurrentUserId()) {
      if (blockedUserIds?.length > 0) {
        console.log("🔍 [W] Applying blocked user filter - blockedUserIds:", blockedUserIds);
        newMsgs = newMsgs.filter(msg => {
          const senderInfo = group?.members?.find(u => u.id === msg.Sender_Id)
          if (senderInfo?.role_id == 1 || senderInfo?.role_id == 2) return true
          return !blockedUserIds.includes(msg.Sender_Id ?? -1)
        })
      } else {
        console.log("🔍 [W] No blocked users - showing all messages");
      }
    } else {
      console.log("🔍 [W] User is admin/moderator/creator - no blocked user filtering");
    }
    console.log("🔍 [W] Filtered messages:", newMsgs?.length, "from", groupMsgList?.length);
    console.log("🔍 [W] Sample filtered message:", newMsgs?.[0]);
    setFilteredMsgList(newMsgs)

    const prevLength = filteredMsgList.length;
    const newLength = newMsgs.length;
    if (prevLength + 1 == newLength) {
      if (newMsgs[newLength - 1].Sender_Id != currentUserId) {
        if (mySoundOptionId == 1) {
          console.log(" === Played Bell ==== ")
          playBell();
        } else if (mySoundOptionId == 2) {
          if (newMsgs[newLength - 1].parent_id != null) {
            const toMsgId = newMsgs[newLength - 1].parent_id;
            const toMsg = filteredMsgList.find(msg => msg.Id == toMsgId);
            if (toMsg?.Sender_Id == getCurrentUserId()) {
              console.log(" === Played Bell ==== ")
              playBell();
            }
          }
        }
      }
    }
  }, [groupMsgList, currentUserId, blockedUserIds, group])

  useEffect(() => {
    let isMounted = true;

    const handleGetFavGroups = (data: ChatGroup[]) => {
      if (!isMounted) return;
      setFavGroups(data);
    };

    if (currentUserId == 0 || currentUserId < 0) {
      setStayAsAnon(false)
      setShowSigninView(true)
    }


    // Register handlers
    socket.on(ChatConst.GET_FAV_GROUPS, handleGetFavGroups);

    // Receive updated message afer delete group message.
    socket.on(ChatConst.GET_PINNED_MESSAGES, handleGetPinnedMesssages)
    socket.on(ChatConst.USER_LOGGED_WILD_SUB, handleLoginAsWildSub)
    // Removed blocked users socket handler - not needed for group chats

    // Cleanup
    return () => {
      isMounted = false;
      socket.off(ChatConst.GET_FAV_GROUPS, handleGetFavGroups);
      socket.off(ChatConst.GET_PINNED_MESSAGES, handleGetPinnedMesssages)
      socket.off(ChatConst.USER_LOGGED_WILD_SUB, handleLoginAsWildSub)
      // Removed blocked users socket cleanup - not needed for group chats
    };
  }, [currentUserId]);

  const handleLoginAsWildSub = (group: ChatGroup) => {
    if (group) {
      localStorage.setItem(SELECTED_GROUP_ID, group?.id?.toString())
      setGroup(group)
    }
  }

  const handleGetGroupOnlineUsers = (data: number[]) => {
    console.log("==== Online Users === ", data)
    console.log("=== Group ==", group)
    setGroupOnlineUserIds(data)
  }

  const handleGetGroupMessages = (data: MessageUnit[]) => {
    console.log("🔍 [W] handleGetGroupMessages received:", data?.length, "messages");
    console.log("🔍 [W] Sample message:", data?.[0]);
    setGroupMsgList(data)
    console.log("🔍 [W] groupMsgList updated with", data?.length, "messages");
  }

  const handleGetPinnedMesssages = (msgIds: number[]) => {
    setPinnedMsgIds(msgIds);
  }

  const handleBanGroupUser = (userId: number) => {
    console.log(`🚫 [W] User ${userId} banned - updating UI`);
    
    // Remove messages from banned user
    const updateMsgList = groupMsgList.filter(msg => msg.Sender_Id != userId);
    setGroupMsgList(updateMsgList);
    
    // Update banned users list immediately
    if (group?.members) {
      const updatedMembers = group.members.map(member => 
        member.id === userId ? { ...member, banned: 1 } : member
      );
      const updatedGroup = { ...group, members: updatedMembers };
      setGroup(updatedGroup);
      
      // Update banned users list
      setGroupBannedUsers(updatedMembers.filter(mem => mem.banned == 1));
      console.log(`🚫 [W] Banned users list updated - now ${updatedMembers.filter(mem => mem.banned == 1).length} banned users`);
    }
  }

  const handleUnbanGroupUser = (userId: number) => {
    console.log(`✅ [W] User ${userId} unbanned - updating UI`);
    
    // Restore messages from unbanned user
    const updateMsgList = groupMsgList.map(msg => msg.Sender_Id == userId ? { ...msg, sender_banned: 0 } : msg);
    setGroupMsgList(updateMsgList);
    
    // Update banned users list immediately
    if (group?.members) {
      const updatedMembers = group.members.map(member => 
        member.id === userId ? { ...member, banned: 0 } : member
      );
      const updatedGroup = { ...group, members: updatedMembers };
      setGroup(updatedGroup);
      
      // Update banned users list
      setGroupBannedUsers(updatedMembers.filter(mem => mem.banned == 1));
      console.log(`✅ [W] Banned users list updated - now ${updatedMembers.filter(mem => mem.banned == 1).length} banned users`);
    }
  }

  const handleUnbanGroupUsers = (userIds: number[] | null) => {
    console.log(`✅ [W] Users ${userIds} unbanned - updating UI`);
    
    // Restore messages from unbanned users
    const updateMsgList = groupMsgList.map(msg => userIds?.includes(msg.Sender_Id ?? -1) ? { ...msg, sender_banned: 0 } : msg);
    setGroupMsgList(updateMsgList);
    
    // Update banned users list immediately
    if (group?.members && userIds) {
      const updatedMembers = group.members.map(member => 
        userIds.includes(member.id) ? { ...member, banned: 0 } : member
      );
      const updatedGroup = { ...group, members: updatedMembers };
      setGroup(updatedGroup);
      
      // Update banned users list
      setGroupBannedUsers(updatedMembers.filter(mem => mem.banned == 1));
      console.log(`✅ [W] Banned users list updated - now ${updatedMembers.filter(mem => mem.banned == 1).length} banned users`);
    }
  }

  const handleGetBannedUsers = (bannedUsers: ChatUser[]) => {
    console.log(`🚫 [W] Received banned users:`, bannedUsers.length, "users");
    setGroupBannedUsers(bannedUsers);
  }

  const handleGroupUpdated = (updatedGroup: ChatGroup) => {
    dispatch(setIsLoading(false));
    if (group?.id == updatedGroup.id) {
      localStorage.setItem(SELECTED_GROUP_ID, updatedGroup.id.toString());
      setGroup(updatedGroup);
      // Update banned users list when group is updated
      setGroupBannedUsers(updatedGroup?.members?.filter(mem => mem.banned == 1) ?? []);
      console.log(`🔄 [W] Group updated - banned users: ${updatedGroup?.members?.filter(mem => mem.banned == 1).length}`);
    }
    if (favGroups.find(grp => grp.id == updatedGroup.id)) {
      setFavGroups(favGroups.map(grp => grp.id == updatedGroup.id ? updatedGroup : grp));
    }
  }

  const handleDeleteGroupMsg = (data: number) => {
    const updateMsgList = groupMsgList.filter(msg => msg.Id != data);
    // dispatch(setMessageList([...updateMsgList]))
    setGroupMsgList(updateMsgList)
  }

  const handleSendGroupMsg = useCallback((data: MessageUnit[]) => {
    const currentUserId = getCurrentUserId();
    const currentUserName = localStorage.getItem('userName') || 'Unknown';
    
    console.log("🔍 [W] handleSendGroupMsg received:", data?.length, "messages");
    console.log("🔍 [W] Current user:", currentUserId, currentUserName);
    console.log("🔍 [W] Socket connected:", socketConnected);
    
    // Check if this is a single new message or bulk update
    const isBulkUpdate = data?.length > 10;
    const isNewMessage = data?.length === 1 || (data?.length <= 5 && data?.length > 0);
    console.log("🔍 [W] Message type:", isBulkUpdate ? "BULK_UPDATE" : isNewMessage ? "NEW_MESSAGE" : "UNKNOWN", "Count:", data?.length);
    
    if (isNewMessage && data?.length > 0) {
      console.log("🔍 [W] New message details:", {
        sender: data[data.length - 1].sender_name,
        content: data[data.length - 1].Content,
        time: data[data.length - 1].Send_Time
      });
    }
    
    console.log("🔍 [W] New messages:", data);
    
    const groupId = data?.length && data[data.length - 1].group_id;
    console.log("🔍 [W] Message group ID:", groupId, "Selected group ID:", group?.id);
    console.log("🔍 [W] Current groupMsgList length:", groupMsgList?.length);
    console.log("🔍 [W] Page visible:", pageVisible);
    
    if (groupId === group?.id) {
      if (pageVisible) {
        console.log("🔍 [W] Page visible - adding messages immediately");
        const newList = mergeArrays(groupMsgList, data);
        console.log("🔍 [W] Merged list length:", newList?.length);
        console.log("🔍 [W] Setting groupMsgList to:", newList?.length, "messages");
        setGroupMsgList(newList);
      } else {
        console.log("🔍 [W] Page hidden - queuing messages for later");
        setPendingMessages(prev => mergeArrays(prev, data));
      }
    } else {
      console.log("🔍 [W] Message not for current group, ignoring");
    }
  }, [group, groupMsgList, pageVisible, socketConnected]); // Add dependencies so it updates when these change

  // Removed handleGetGroupBlockedUsers - group blocks should not affect message filtering

  // Removed handleGetBlockedUsers - personal blocks should not affect group chat filtering

  const handleClearGroupChat = (groupId: number) => {
    if (groupId == group?.id) {
      // dispatch(setMessageList([]));
      setGroupMsgList([])
    }
    dispatch(setIsLoading(false));
  }

  const handleGetChatRules = useCallback((data: any) => {
    console.log("🔍 [W] [Chat Rules] Received chat rules:", data);
    console.log("🔍 [W] [Chat Rules] Current group:", group);
    console.log("🔍 [W] [Chat Rules] Current userId:", currentUserId);
    console.log("🔍 [W] [Chat Rules] hasSeenRulesForGroup:", hasSeenRulesForGroup);

    setChatRules(data.chatRules || '');

    // Update the config if needed
    if (data.showChatRules !== undefined) {
      setGroupConfig(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          showChatRules: data.showChatRules
        }
      }));
    }

    // Check if we have a pending display request after authentication
    if (pendingChatRulesDisplay.groupId === group?.id &&
      pendingChatRulesDisplay.userType &&
      Date.now() - pendingChatRulesDisplay.timestamp < 10000) { // 10 second timeout

      console.log("🔍 [W] [Chat Rules] Checking pending display after authentication");

      const currentUserId = getCurrentUserId();
      const isCreator = pendingChatRulesDisplay.userType === 'logged-in' && currentUserId === group.creater_id;
      const hasSeenRules = group?.id ? hasSeenRulesForGroup[group.id] : false;

      console.log("🔍 [W] [Chat Rules] Post-auth display conditions:", {
        userType: pendingChatRulesDisplay.userType,
        currentUserId,
        isCreator,
        hasSeenRules,
        groupId: group?.id,
        showChatRules: data.showChatRules,
        hasRules: data.chatRules && data.chatRules.trim().length > 0
      });

      // Check if we should show rules
      if (data.showChatRules &&
        data.chatRules &&
        data.chatRules.trim().length > 0 &&
        !hasSeenRules &&
        !isCreator) {

        console.log("🔍 [W] [Chat Rules] Auto-showing rules after", pendingChatRulesDisplay.userType, "authentication");
        setOpenChatRules(true);
        markRulesAsSeen(group.id);

        // Clear pending state
        setPendingChatRulesDisplay({
          groupId: null,
          userType: null,
          timestamp: 0
        });
      } else {
        console.log("🔍 [W] [Chat Rules] Not showing rules after authentication - conditions not met");
        // Clear pending state even if not showing
        setPendingChatRulesDisplay({
          groupId: null,
          userType: null,
          timestamp: 0
        });
      }
    } else {
      console.log("🔍 [W] [Chat Rules] Rules loaded and stored, no pending authentication trigger");
    }
  }, [group, currentUserId, hasSeenRulesForGroup, markRulesAsSeen, pendingChatRulesDisplay]);

  // Load messages when socket connects and group is available
  useEffect(() => {
    if (socketConnected && group?.id) {
      const token = localStorage.getItem(TOKEN_KEY);
      const currentUserId = getCurrentUserId();
      
      console.log("🔍 [W] Socket connected and group available - ensuring membership and loading messages");
      console.log("🔍 [W] Group ID:", group.id, "User ID:", currentUserId, "Socket connected:", socketConnected);
      
      if (token && currentUserId > 0) {
        // Add a small delay to ensure socket is fully ready
        setTimeout(async () => {
          console.log("🔍 [W] Ensuring group membership and loading messages after socket connection");
          
          // First ensure the user is a member of the group
          await ensureGroupMembership(group.id, token);
          
          // Then load messages
          getGroupMessages(token, group.id);
        }, 100);
      }
    }
  }, [socketConnected, group?.id, ensureGroupMembership]);

  const handleUpdateChatRules = (data: any) => {
    console.log("🔍 [W] [Chat Rules] Chat rules updated:", data);
    if (data.success) {
      setChatRules(data.chatRules || '');
      toast.success("Chat rules updated successfully!");
    } else if (data.groupId && data.groupId === group?.id) {
      // Real-time update from another user
      setChatRules(data.chatRules || '');
    }
  };

  const handleExpired = () => {
    localStorage.clear()
    dispatch(setIsLoading(false));
    setShowSigninPopup(true);
  }

  const handleForbidden = (message: string | number) => {
    dispatch(setIsLoading(false));
    if (typeof message === 'string') {
      toast.error(message);
    } else {
      toast.error("Access forbidden");
    }
  }

  const handleJoinToGroupAnon = (data: any) => {
    console.log(`🔍 [W] Anonymous join response:`, data);
    if (data.success) {
      toast.success(`Successfully joined group ${data.groupId} as anonymous user`);
    }
  }

  // Check for persisted timeout state
  const checkPersistedTimeout = useCallback((groupId: number) => {
    try {
      const timeoutKey = `timeout_${groupId}`;
      const timeoutInfo = localStorage.getItem(timeoutKey);
      
      if (timeoutInfo) {
        const parsed = JSON.parse(timeoutInfo);
        const now = new Date().getTime();
        const expiry = new Date(parsed.expiresAt).getTime();
        
        if (expiry > now) {
          // Timeout is still active
          console.log(`⏰ [W] Restored timeout state for group ${groupId}, expires at ${parsed.expiresAt}`);
          setTimeoutData({ timeoutMinutes: parsed.timeoutMinutes, expiresAt: parsed.expiresAt });
          setShowTimeoutNotification(true);
          return true;
        } else {
          // Timeout has expired, clean up
          console.log(`⏰ [W] Timeout expired for group ${groupId}, cleaning up`);
          localStorage.removeItem(timeoutKey);
          return false;
        }
      }
      return false;
    } catch (error) {
      console.error(`⏰ [W] Error checking persisted timeout:`, error);
      return false;
    }
  }, []);

  const handleTimeoutNotification = (data: any) => {
    console.log(`⏰ [W] Timeout notification received:`, data);
    const { timeoutMinutes, expiresAt, message, groupId } = data;
    
    setTimeoutData({ timeoutMinutes, expiresAt });
    setShowTimeoutNotification(true);
    
    // Persist timeout state in localStorage for page refresh persistence
    const timeoutInfo = {
      groupId: groupId,
      expiresAt: expiresAt,
      timeoutMinutes: timeoutMinutes
    };
    localStorage.setItem(`timeout_${groupId}`, JSON.stringify(timeoutInfo));
    
    // Show toast message as well
    toast.error(message, {
      duration: 5000,
      position: 'top-center'
    });
  }

  // Setup socket listeners with proper cleanup
  useEffect(() => {
    // Track socket connection state
    const handleConnect = () => {
      console.log("🔍 [W] Socket connected");
      setSocketConnected(true);
    };
    
    const handleDisconnect = () => {
      console.log("🔍 [W] Socket disconnected");
      setSocketConnected(false);
    };

    // Track page visibility for real-time messages
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setPageVisible(isVisible);
      console.log("🔍 [W] Page visibility changed:", isVisible ? 'visible' : 'hidden');
      
      if (isVisible) {
        console.log("🔍 [W] Window reactivated - polling for new messages");
        
        // Clear any existing timeout
        if (reloadTimeoutRef.current) {
          clearTimeout(reloadTimeoutRef.current);
        }
        
        // Process any pending messages first
        setPendingMessages(currentPending => {
          if (currentPending.length > 0) {
            console.log("🔍 [W] Processing", currentPending.length, "pending messages");
            setGroupMsgList(currentList => {
              const newList = mergeArrays(currentList, currentPending);
              console.log("🔍 [W] After merging pending - total messages:", newList?.length);
              return newList;
            });
          }
          return []; // Clear pending messages
        });
        
        // Debounce polling to prevent rapid successive calls
        reloadTimeoutRef.current = setTimeout(() => {
          // Get current values directly from localStorage to avoid stale closure
          const token = localStorage.getItem(TOKEN_KEY);
          const selectedGroupId = localStorage.getItem(SELECTED_GROUP_ID);
          
          console.log("🔍 [W] Polling for new messages - Token:", !!token, "Group ID:", selectedGroupId);
          
          if (token && selectedGroupId && socket.connected) {
            console.log("🔍 [W] Emitting GET_GROUP_MSG to poll for new messages");
            // Use socket to poll for messages, just like when sending a new message
            socket.emit(ChatConst.GET_GROUP_MSG, {
              token: token,
              groupId: parseInt(selectedGroupId)
            });
          } else {
            console.log("🔍 [W] Cannot poll messages - missing token, group ID, or socket disconnected");
          }
        }, 200); // 200ms debounce
      }
    };

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    
    // Check initial connection state
    if (socket.connected) {
      setSocketConnected(true);
    }

    socket.on(ChatConst.GET_GROUP_ONLINE_USERS, handleGetGroupOnlineUsers)
    socket.on(ChatConst.GET_GROUP_MSG, handleGetGroupMessages)
            socket.on(ChatConst.BAN_GROUP_USER, handleBanGroupUser);
        socket.on(ChatConst.UNBAN_GROUP_USER, handleUnbanGroupUser);
        socket.on(ChatConst.UNBAN_GROUP_USERS, handleUnbanGroupUsers);
        socket.on(ChatConst.GET_BANNED_USERS, handleGetBannedUsers);
    socket.on(ChatConst.JOIN_TO_GROUP_ANON, handleJoinToGroupAnon);
    // Receive the message afer sending the message.
    socket.on(ChatConst.SEND_GROUP_MSG, (data) => {
      const currentUserId = getCurrentUserId();
      const currentUserName = localStorage.getItem('userName') || 'Unknown';
      console.log("🔍 [W] SEND_GROUP_MSG socket event received by user:", currentUserName, "data:", data?.length, "messages");
      handleSendGroupMsg(data);
    });
    socket.on(ChatConst.DELETE_GROUP_MSG, handleDeleteGroupMsg);
    socket.on(ChatConst.GROUP_UPDATED, handleGroupUpdated);
          // Removed group blocked users socket handler - not needed

    socket.on(ChatConst.CLEAR_GROUP_CHAT, handleClearGroupChat);
    socket.on(ChatConst.EXPIRED, handleExpired);
    socket.on(ChatConst.FORBIDDEN, handleForbidden);

    // Timeout notification listener
    socket.on(ChatConst.USER_TIMEOUT_NOTIFICATION, handleTimeoutNotification);

    // Chat rules listeners
    console.log("🔍 [W] [Chat Rules] Setting up socket listeners");
    socket.on(ChatConst.GET_CHAT_RULES, handleGetChatRules);
    socket.on(ChatConst.UPDATE_CHAT_RULES, handleUpdateChatRules);

    // Add a test listener to see if any chat rules events are being received
    socket.on(ChatConst.GET_CHAT_RULES, (data) => {
      console.log("🔍 [W] [Chat Rules] RAW socket event received - GET_CHAT_RULES:", data);
    });
    socket.on(ChatConst.UPDATE_CHAT_RULES, (data) => {
      console.log("🔍 [W] [Chat Rules] RAW socket event received - UPDATE_CHAT_RULES:", data);
    });

    // Add listener for expired events to debug token issues
    socket.on(ChatConst.EXPIRED, () => {
      console.log("🔍 [W] [Chat Rules] Received EXPIRED event - token validation failed");
    });

    // Cleanup listeners on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clear any pending reload timeout
      if (reloadTimeoutRef.current) {
        clearTimeout(reloadTimeoutRef.current);
      }
      
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off(ChatConst.GET_GROUP_ONLINE_USERS, handleGetGroupOnlineUsers);
      socket.off(ChatConst.GET_GROUP_MSG, handleGetGroupMessages);
              socket.off(ChatConst.BAN_GROUP_USER, handleBanGroupUser);
        socket.off(ChatConst.UNBAN_GROUP_USER, handleUnbanGroupUser);
        socket.off(ChatConst.UNBAN_GROUP_USERS, handleUnbanGroupUsers);
            socket.off(ChatConst.GET_BANNED_USERS, handleGetBannedUsers);
    socket.off(ChatConst.JOIN_TO_GROUP_ANON, handleJoinToGroupAnon);
          socket.off(ChatConst.SEND_GROUP_MSG);
    socket.off(ChatConst.DELETE_GROUP_MSG, handleDeleteGroupMsg);
    socket.off(ChatConst.GROUP_UPDATED, handleGroupUpdated);
            // Removed group blocked users socket cleanup - not needed
    socket.off(ChatConst.CLEAR_GROUP_CHAT, handleClearGroupChat);
    socket.off(ChatConst.EXPIRED, handleExpired);
          socket.off(ChatConst.FORBIDDEN, handleForbidden);
      socket.off(ChatConst.USER_TIMEOUT_NOTIFICATION, handleTimeoutNotification);
      socket.off(ChatConst.GET_CHAT_RULES, handleGetChatRules);
      socket.off(ChatConst.UPDATE_CHAT_RULES, handleUpdateChatRules);
      socket.off(ChatConst.EXPIRED);
    };
  }, [handleSendGroupMsg, handleGetChatRules]); // Include handlers so socket listeners update when they change

  useEffect(() => {
    const options: { id: number; name: string }[] = [];
    options.push({ id: 1, name: "Copy Group Link" })
    if (!stayAsAnon) {
      options.push({ id: 2, name: favGroups.find(grp => grp.id == group?.id) == null ? "Add to My Groups" : "Remove from My Groups" })
    }
    options.push({ id: 3, name: hideChat ? "Show Chat" : "Hide Chat" })
    if (currentUserId == group?.creater_id) {
      options.push({ id: 4, name: "Send a Notification" })
      options.push({ id: 5, name: "Edit Chatbox Style" })
    }
    options.push({ id: 8, name: "Chat Rules" })
    if (stayAsAnon) {
      options.push({ id: 7, name: "Log in" })
    } else {
      options.push({ id: 6, name: "Log out" })
    }
    setGroupMenuOptions(options)
    // if (currentUserId == group?.creater_id) {
    //   setGroupMenuOptions([
    //     {id: 1, name: "Copy Group Link"},
    //     {id: 2, name: favGroups.find(grp => grp.id == group?.id) == null ? "Add to My Groups" : "Remove from My Groups"},
    //     {id: 3, name: hideChat ? "Show Chat" : "Hide Chat"},
    //     {id: 4, name: "Send a Notification"},
    //     {id: 5, name: "Edit Chatbox Style"},
    //     {id: 6, name: "Log out"}
    //   ])
    // } else {
    //   setGroupMenuOptions([
    //     {id: 1, name: "Copy Group Link"},
    //     {id: 2, name: favGroups.find(grp => grp.id == group?.id) == null ? "Add to My Groups" : "Remove from My Groups"},
    //     {id: 3, name: hideChat ? "Show Chat" : "Hide Chat"},
    //     {id: 6, name: "Log out"}
    //   ])
    // }

  }, [favGroups, group, hideChat, currentUserId]);

  // To get the initial data for the users and the categegories for the dashboard
  const registerAnon = useCallback(async (token: string, anonId: number, groupName: string) => {
    console.log("🔍 [W] registerAnon called with:", { token, anonId, groupName });
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private/add/groups/addanon`,
        {
          userId: anonId,
          groupName
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: token,
          },
        }
      );
      console.log("🔍 [W] registerAnon response:", res.data);
      if (res.data.group.length > 0) {
        dispatch(setIsLoading(false));
        toast.error(groupName + " group does not exist.");
        return;
      }
      console.log("🔍 [W] Setting group from registerAnon:", res.data.group);
      localStorage.setItem(SELECTED_GROUP_ID, res.data.group["id"].toString())
      setGroup(res.data.group);
      if (res.data.group != null) {
        // Load messages for this group using anonymous token
        console.log("🔍 [W] Calling getGroupMessages for group:", res.data.group.id, "with anonymous token");
        
        // Load messages immediately and with a retry
        getGroupMessages(token, res.data.group.id);
        getGroupHistoryAnon(res.data.group.id, lastChatDate);
        
        // Retry loading messages after a short delay to ensure socket connection
        setTimeout(() => {
          console.log("🔍 [W] Retrying message load after anonymous registration");
          getGroupMessages(token, res.data.group.id);
        }, 1000);

        // Trigger chat rules after successful anonymous registration
        setTimeout(() => {
          console.log("🔍 [W] [Chat Rules] Triggering chat rules after anonymous registration");
          triggerChatRulesAfterLogin(token, 'anonymous');
        }, 1500); // Delay to ensure group state is properly set
      }
    } catch (error) {
      console.error("🔍 [W] registerAnon error:", error);
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const getCurrentUserId = (): number => {
    let userId: string | null = "0";
    if (typeof window !== "undefined") {
      userId = localStorage.getItem(USER_ID_KEY);
      if (userId == null) {
        userId = "0";
      }
    }
    return parseInt(userId);
  };

  const getChatGroupID = (): number => {
    let groupID: string | null = "0";
    if (typeof window !== "undefined") {
      groupID = localStorage.getItem(SELECTED_GROUP_ID);
      if (groupID == null) {
        groupID = "0";
      }
    }
    return parseInt(groupID);
  };

  const startCooldown = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (group?.slow_mode) {
      setCanSend(false);
      setCooldown(group.slow_time ?? 0);

      timerRef.current = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setCanSend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  function mergeArrays(oldArray: MessageUnit[], newArray: MessageUnit[]): MessageUnit[] {
    const oldMap = new Map(oldArray.map(item => [item?.Id, item]));
    for (const newItem of newArray) {
      oldMap.set(newItem?.Id, newItem); // updates existing or adds new
    }
    return Array.from(oldMap.values());
  }

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (localStorage.getItem(TOKEN_KEY) && token) {
      fetchSoundOption();
    }
  }, [currentUserId]);

  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }

    if (scrollContainerRef.current?.parentElement) {
      const container = scrollContainerRef.current.parentElement;
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    if (filteredPrevMsgList.length < filteredMsgList.length) {
      scrollToBottom();
    }
  }, [filteredMsgList]);

  // The action for the last chat date
  useEffect(() => {
    if (lastChatDate == 1) return;
    const token = localStorage.getItem(TOKEN_KEY);
    getGroupHistory(token, group?.id, lastChatDate);
  }, [lastChatDate])

  // The action for the message send action
  const sendGroupMsgHandler = (type: string, value: string) => {
    console.log("🔍 [W] sendGroupMsgHandler called - type:", type, "value:", value);
    console.log("🔍 [W] Current user ID:", getCurrentUserId(), "Group ID:", group?.id);

    if (isBannedUser) {
      console.log("🔍 [W] User is banned, cannot send message");
      toast.error("You can't send message now. You are banned.");
      setInputMsg("");
      return;
    }
    if (!canPost) {
      console.log("🔍 [W] User cannot post, no permission");
      toast.error("You can't send message now. You have no permission.");
      setInputMsg("");
      return;
    }
    if (hideChat) {
      console.log("🔍 [W] Chat is hidden, cannot send message");
      return
    }
    if (!canSend) {
      console.log("🔍 [W] User in cooldown, cannot send message");
      toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
      return;
    }
    const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
    console.log("🔍 [W] Member info for sending:", memInfo);
    
    // Check if user is currently timed out (check both server data and localStorage)
    const isCurrentlyTimedOut = memInfo?.is_timed_out || checkPersistedTimeout(group?.id || 0);
    
    if (isCurrentlyTimedOut && group?.creater_id != getCurrentUserId()) {
      const toTime = isTimedout(memInfo?.to_time ?? "");
      const timeoutMessage = toTime ? `You can send message ${toTime} later.` : "You are temporarily restricted from sending messages.";
      toast.error("You can't send message now. You are timed out. " + timeoutMessage);
      console.log("🔍 [W] Message sending blocked - user is timed out");
      return;
    }
    let receiverid = null
    if (filterMode == 2) {
      receiverid = 1
    } else if (filterMode == 1) {
      if (filteredUser?.id) {
        receiverid = filteredUser.id
      }
    }

    let token = localStorage.getItem(TOKEN_KEY)
    if (stayAsAnon) {
      token = "anon" + currentUserId.toString()
    }

    if (attachment?.type && attachment.type === 'file') {
      sendGroupMsg(group?.id, `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" 
      href=${SERVER_URL + ""}/uploads/chats/files/${attachment.url}>File Name : ${attachment.url}</a>`
        , token, receiverid, replyMsg?.Id)
    } else if (attachment?.type && attachment.type === 'image') {
      sendGroupMsg(
        group?.id,
        `<img src='${SERVER_URL}/uploads/chats/images/${attachment?.url}' alt="" />`,
        token,
        receiverid,
        replyMsg?.Id
      )
    } else {
      if (type === "gif") {
        sendGroupMsg(group?.id, value, token, receiverid, replyMsg?.Id);
      } else if (type === "sticker") {
        sendGroupMsg(group?.id, value, token, receiverid, replyMsg?.Id);
      } else {
        if (inputMsg.length > 0) {
          const myMemInfo = group?.members?.find(mem => mem.id == getCurrentUserId())

          if (group?.url_level == 1
            && (myMemInfo?.role_id == 0 || myMemInfo?.role_id == null)
            && containsURL(inputMsg)) {
            toast.error("You can't post url. You have no permission.");
            setInputMsg("");
            setShowEmoji(false);
            return
          }
          const censorWords = getCensoredWordArray(group?.censored_words ?? null)
          const censoredMessage = getCensoredMessage(inputMsg, censorWords ?? [])
          console.log("🔍 [W] About to send message - group?.id:", group?.id, "group:", group);
          sendGroupMsg(group?.id, censoredMessage, token, receiverid, replyMsg?.Id);
          setInputMsg("");
          setShowEmoji(false);
        }
      }
    }
    setReplyMsg(null);
    setShowMsgReplyView(false);
    setAttachment({ type: null, url: null })
    let myMemInfo = group?.members?.find(mem => mem.id == getCurrentUserId())
    if (myMemInfo?.role_id == null || myMemInfo.role_id == 0) {
      if (group?.slow_mode && (group?.slow_time != null && group?.slow_time > 0)) {
        startCooldown();
      }
    }
  }

  // To handle Image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files![0]
      const maxSize = 1024 * 1024 * 3; //available to upload maximum 3 MB of image

      if (file && file.size > maxSize) {
        toast.error(messages.common.exceededFileSize)
      } else {
        const formData = new FormData()
        formData.append("Image", file)
        const res = await axios.post(`${SERVER_URL}/api/private/add/chats/images`, formData, {
          headers:
          {
            "Accept": "application/json",
            'Content-Type': 'multipart/form-data',
            'Authorization': localStorage.getItem(TOKEN_KEY) || "",
          }
        })
        setAttachment(Object.assign({}, { type: "image", url: res.data }))
      }
    } catch (error) {

    }
  }

  // To handle File upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files![0]
      const maxSize = 1024 * 1024 * 5; //available to upload maximum 3 MB of image

      if (file && file.size > maxSize) {
        toast.error(messages.common.exceededFileSize)
      } else {
        const formData = new FormData()
        formData.append("File", file)
        const res = await axios.post(`${SERVER_URL}/api/private/add/chats/files`, formData, {
          headers:
          {
            "Accept": "application/json",
            'Content-Type': 'multipart/form-data',
            'Authorization': localStorage.getItem(TOKEN_KEY) || "",
          }
        })
        setAttachment(Object.assign({}, { type: "file", url: res.data }))
      }
    } catch (error) {

    }
  }

  // The action for the Attachment remove
  const handleRemoveAttachment = async () => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/private/delete/chats/${attachment?.type === 'file' ? "files" : "images"}/${attachment?.url}`, {}, {
        headers:
        {
          "Accept": "application/json",
          'Content-Type': 'multipart/form-data',
          'Authorization': localStorage.getItem(TOKEN_KEY) || "",
        }
      })
      setAttachment(Object.assign({}, { type: null, url: null }))
    } catch (error) { }
  }

  const userBanButtonClicked = (userId: number | null | undefined) => {
    setOpenBanUserConfirmPopup(true);
    if (userId == undefined || userId == null) {
      return;
    }
    setBanUserId(userId);
  }

  const messageDeleteButtonClicked = (msgId: number | null | undefined) => {
    setOpenMsgDeleteConfirmPopup(true);
    if (msgId == undefined || msgId == null) {
      return;
    }
    setDeleteMsgId(msgId);
  }

  const getCurrentGroupOnlineUsers = () => {
    console.log("==== GET ONLINE USERS ====")
    const token = localStorage.getItem(TOKEN_KEY)
    getGroupOnlineUsers(token, group?.id)
  }

  const banUser = () => {
    if (banUserId == null) return;
    
    // RULE 1: User cannot ban himself
    const currentUserId = getCurrentUserId();
    if (banUserId === currentUserId) {
      toast.error("You cannot ban yourself");
      setOpenBanUserConfirmPopup(false);
      setBanUserId(null);
      return;
    }
    
    // RULE 2: Only Group Master can ban users
    if (group?.creater_id !== currentUserId) {
      toast.error("Only the group creator can ban users");
      setOpenBanUserConfirmPopup(false);
      setBanUserId(null);
      return;
    }
    
    const token = localStorage.getItem(TOKEN_KEY)
    console.log(`Frontend: Group Master ${currentUserId} attempting to ban user ${banUserId}`);
    banGroupUser(token, group?.id, banUserId);
    setOpenBanUserConfirmPopup(false);
    setBanUserId(null);
    
    // Refresh banned users list after a short delay
    setTimeout(() => {
      if (group?.members) {
        setGroupBannedUsers(group.members.filter(mem => mem.banned == 1));
        console.log(`🔄 [W] Refreshed banned users list after ban operation`);
      }
    }, 1000);
  }

  const unbanUser = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    unbanGroupUser(token, group?.id, getCurrentUserId());
    setOpenUnbanReqConfirmPopup(false);
  }

  const deleteMessage = () => {
    console.log("aaaa");
    if (deleteMsgId == null) return;
    const token = localStorage.getItem(TOKEN_KEY)
    deleteGroupMsg(token, deleteMsgId, group?.id);
    setOpenMsgDeleteConfirmPopup(false);
    setDeleteMsgId(null);
  }

  const onSendGroupNotification = (msg: string) => {
    const token = localStorage.getItem(TOKEN_KEY)
    hasShownGroupNotify.current = false
    sendGroupNotify(token, group?.id ?? null, msg)
  }

  // Removed getMyBlockedUsers - personal blocks should not affect group chat filtering

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 27) setShowEmoji(false)
      // else if (event.keyCode === 13) sendGroupMsgHandler()
    }
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  });

  const unbanRequestClicked = (groupId: number, userId: number, unban_request: number | null) => {
    if (unban_request == 1) {
      toast.success("You already sent unban request.");
      return;
    }
    setOpenUnbanReqConfirmPopup(true);
  }

  const handleGroupMenuClick = async (menuId: number) => {
    groupMemuPopoverRef.current?.click();
    if (menuId == 1) {
      try {
        fallbackCopyTextToClipboard(window.location.href)
        // await navigator.clipboard.writeText(window.location.href);
        toast.success("URL copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy URL: " + err);
      }
    } else if (menuId == 2) {
      let groupIdFav = favGroups?.find(grp => grp.id == group?.id) != null;
      let updateIsMember = groupIdFav ? 0 : 1;
      updateGroupFavInfo(localStorage.getItem(TOKEN_KEY), group?.id, updateIsMember);
    } else if (menuId == 3) {
      setHideChat(!hideChat)
    } else if (menuId == 4) {
      setOpenSendGroupNotification(true)
    } else if (menuId == 5) {
      setOpenEditGroupPop(true)
    } else if (menuId == 6) {
      localStorage.setItem(USER_ID_KEY, "")
      setCurrentUserId(-1)
      dispatch(setIsLoading(true))
      setStayAsAnon(false)
      userLoggedOut()
      localStorage.removeItem(TOKEN_KEY)
      
      // Stop token refresh interval on logout
      if ((window as any).tokenRefreshInterval) {
        clearInterval((window as any).tokenRefreshInterval);
        (window as any).tokenRefreshInterval = null;
        console.log("🔄 [W] Token refresh interval stopped on logout");
      }
      
      dispatch(setIsLoading(false))
    } else if (menuId == 7) {
      setShowSigninPopup(true)
    } else if (menuId == 8) {
      setOpenChatRules(true)
    }
  }

  const getSticker = (content: string) => {
    const stickerName = content.slice("sticker::".length);
    const sticker = stickers.find((stk) => stk.name === stickerName);
    return sticker?.content;
  }

  const getReplyMsgContentHtml = (content: string | null) => {
    let type = "text";
    let value = content;
    if (content!.indexOf("<img") > -1) {
      type = "img"; value = "Photo";
    }
    if (content!.indexOf("gif::https://") > -1 || content!.indexOf(".gif") > -1 && content!.indexOf(" ") < 0 && content!.indexOf("https://") > -1) {
      type = "gif"; value = "Gif";
    }
    if (content!.indexOf("sticker::") > -1) {
      type = "sticker"; value = "Sticker";
    }
    if (type === "text") {
      return <div className='text-[14px] mt-[3px]'>{value}</div>;
    } else {
      return <div className='text-[14px] mt-[3px] text-gray-400'>{value}</div>;
    }
  }

  const getReplyMsgImgHtml = (content: string | null) => {
    if (content!.indexOf("<img") > -1) {
      let contentStr = content!.replace("<img", "<img style='height: 36px'")
      return <div
        className="inline-block w-fit h-[36px]"
        dangerouslySetInnerHTML={{ __html: contentStr! }}
      />;
    }
    if (content!.indexOf("gif::https://") > -1) {
      return <img src={content!.slice("gif::".length)} className="h-[36px]" />
    }

    if (content!.indexOf(".gif") > -1 && content!.indexOf("https://") > -1 && content!.indexOf(" ") < 0) {
      return <img src={content!} className="h-[36px]" />
    }

    if (content!.indexOf("sticker::") > -1) {
      return <Lottie animationData={getSticker(content!)} style={{ height: 30 }} />
    }

    return null;
  }

  // Properly typed ref callback
  const setMsgItemRef = (index: number) => (el: HTMLDivElement | null) => {
    msgItemRefs.current[index] = el;
  };

  const scrollToRepliedMsg = (msgId: number | null | undefined) => {
    const itemIndex = filteredMsgList.findIndex(msg => msg.Id === msgId);
    console.log(itemIndex);
    const container = scrollContainerRef.current;
    const item = msgItemRefs.current[itemIndex];

    if (!container || !item) return;

    const containerHeight = container.clientHeight;
    const itemHeight = item.clientHeight;
    const itemOffsetTop = item.offsetTop;
    const scrollTop = itemOffsetTop - (containerHeight / 2) + (itemHeight / 2);
    container.scrollTo({
      top: scrollTop,
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    if (mySoundOptionId == null || mySoundOptionId == undefined) {
      setSoundSelectedOption(null);
    } else {
      setSoundSelectedOption(soundSettingOptions.find(opt => opt.option_id == mySoundOptionId)?.val);
    }

  }, [mySoundOptionId]);

  const fetchSoundOption = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private/get/chats/option`,
        {
          user_id: getCurrentUserId()
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        });

      if (res == null) {
        setMySoundOptionId(null);
      } else {
        const optVal: ChatOption = res.data["option"][0];
        setMySoundOptionId(optVal.sound_option);
      }
    } catch (error) {

    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const updateSoundOption = async () => {
    try {
      dispatch(setIsLoading(true));
      soundMenuPopoverRef.current?.click();
      const optionVal = soundSettingOptions.find(opt => opt.val === soundSelectedOption)?.option_id;
      if (mySoundOptionId == optionVal) {
        dispatch(setIsLoading(false));
        return;
      }
      const res = await axios.post(`${SERVER_URL}/api/private/add/chats/updateoption`,
        {
          user_id: getCurrentUserId(),
          sound_option: optionVal == null ? 0 : optionVal
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        });
      setMySoundOptionId(optionVal);
    } catch (error) {

    }
    dispatch(setIsLoading(false));
  }

  const handleSignin = (async (email: string, password: string) => {
    console.log("== LOG IN===")
    try {
      const res = await axios.post(`${SERVER_URL}/api/user/login`, {
        Email: email,
        Password: password,
        Role: 1,
      });

      // Error Notification
      if (res.status === httpCode.SUCCESS) {
        toast.success(messages.login.success);
        setCurrentUserId(res.data.id);
        localStorage.setItem(USER_ID_KEY, res.data.id);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        
        // Start periodic token refresh for newly logged-in users
        try {
          const { startTokenRefreshInterval } = await import('../resource/utils/auth');
          const refreshInterval = startTokenRefreshInterval();
          if (refreshInterval) {
            (window as any).tokenRefreshInterval = refreshInterval;
          }
        } catch (error) {
          console.log("Failed to start token refresh interval:", error);
        }
        
        console.log("=== Group Login===", group)
        loginAsReal(res.data.token, group?.id, getAnonId());
        setShowSigninPopup(false);
        console.log("== LOGIN USER===", res.data.id)

        // Immediately load messages after successful login
        if (group?.id) {
          console.log("🔍 [W] Loading messages immediately after login for group:", group.id);
          // Small delay to ensure socket connection is established
          setTimeout(() => {
            getGroupMessages(res.data.token, group.id);
            console.log("🔍 [W] Requested group messages after login");
          }, 500);

          // Trigger chat rules after successful login
          setTimeout(() => {
            console.log("🔍 [W] [Chat Rules] Triggering chat rules after successful login");
            triggerChatRulesAfterLogin(res.data.token, 'logged-in');
          }, 1000); // Small delay to ensure loginAsReal completes
        }
      } else if (res.status === httpCode.NOT_MATCHED) {
        toast.error(messages.common.notMatched);
      } else {
        toast.error(messages.common.failure);
      }

    } catch (error) {
      toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  });

  const handleSignup = useCallback(async (email: string, name: string, password: string) => {
    dispatch(setIsLoading(true));
    try {
      const res = await axios.post(`${SERVER_URL}/api/user/register/group`, {
        Email: email,
        Name: name,
        Password: password
      });

      // Handle verification flow
      if (res.status === httpCode.SUCCESS) {
        if (res.data.requiresVerification) {
          // Show verification popup
          setVerificationEmail(res.data.email);
          setShowSignupPopup(false);
          setShowVerificationPopup(true);
          toast.success("Verification email sent! Please check your email.");
        } else {
          // Old flow for backward compatibility
          toast.success(messages.login.success);
          setCurrentUserId(res.data.id);
          localStorage.setItem(USER_ID_KEY, res.data.id);
          localStorage.setItem(TOKEN_KEY, res.data.token);
          loginAsReal(res.data.token, group?.id, getAnonId());
          setShowSigninPopup(false);
          setShowSignupPopup(false);

          // Trigger chat rules after successful signup/login
          if (group?.id) {
            setTimeout(() => {
              console.log("🔍 [W] [Chat Rules] Triggering chat rules after successful signup");
              triggerChatRulesAfterLogin(res.data.token, 'logged-in');
            }, 1000);
          }
        }
      } else if (res.status === httpCode.NOT_MATCHED) {
        toast.error(messages.common.notMatched);
      } else {
        toast.error(messages.common.failure);
      }

    } catch (error: any) {
      if (error.response?.status === httpCode.DUPLICATED) {
        toast.error("This email is already registered. Please try signing in instead.");
      } else {
        toast.error(messages.common.serverError);
      }
    }
    dispatch(setIsLoading(false));
  }, [dispatch, group, getAnonId, loginAsReal, triggerChatRulesAfterLogin]);

  const handleVerification = useCallback(async (email: string, otp: string) => {
    dispatch(setIsLoading(true));
    try {
      const res = await axios.post(`${SERVER_URL}/api/user/confirm/group`, {
        email: email,
        otp: parseInt(otp)
      });

      if (res.status === httpCode.SUCCESS) {
        toast.success("Account verified successfully! Welcome to Pingbash!");
        setCurrentUserId(res.data.id);
        localStorage.setItem(USER_ID_KEY, res.data.id);
        localStorage.setItem(TOKEN_KEY, res.data.token);
        loginAsReal(res.data.token, group?.id, getAnonId());
        setShowVerificationPopup(false);

        // Trigger chat rules after successful verification
        if (group?.id) {
          setTimeout(() => {
            console.log("🔍 [W] [Chat Rules] Triggering chat rules after verification");
            triggerChatRulesAfterLogin(res.data.token, 'logged-in');
          }, 1000);
        }
      } else {
        toast.error("Invalid verification code. Please try again.");
      }
    } catch (error: any) {
      if (error.response?.status === httpCode.FORBIDDEN) {
        toast.error(error.response.data || "Invalid or expired verification code.");
      } else {
        toast.error("Verification failed. Please try again.");
      }
    }
    dispatch(setIsLoading(false));
  }, [dispatch, group, getAnonId, loginAsReal, triggerChatRulesAfterLogin]);

  const handleResendCode = useCallback(async (email: string) => {
    try {
      await axios.post(`${SERVER_URL}/api/user/resend`, { email });
      toast.success("Verification code resent successfully!");
    } catch (error) {
      toast.error("Failed to resend verification code. Please try again.");
    }
  }, []);

  // Admin and Mods tools Actions
  const handleAdminOptionClick = (optionId: string) => {
    if (optionId == "1") {
      setOpenChatLimitationPopup(true);
    } else if (optionId == "2") {
      setOpenManageChatPopup(true);
    } else if (optionId == "3") {
      setOpenModeratorsWidget(true);
    } else if (optionId == "4") {
      setOpenCensoredPopup(true);
    } else if (optionId == "5") {
      console.log("🚫 [W] Opening banned users menu - fetching banned users");
      const token = localStorage.getItem(TOKEN_KEY);
      getBannedUsers(token, group?.id);
      setOpenBannedUsersWidget(true);
    }
  }

  const updateChatLimits = (
    settings: any
  ) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupChatLimitations(
      token,
      group?.id,
      settings.postOption,
      settings.urlOption,
      settings.slowMode,
      settings.speed
    )
    setOpenChatLimitationPopup(false)
    dispatch(setIsLoading(true));
  }

  const onSaveGroupConfig = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupChatboxConfig(
      token,
      group?.id ?? null,
      groupEditConfig.sizeMode,
      groupEditConfig.width,
      groupEditConfig.height,
      groupEditConfig.colors.background,
      groupEditConfig.colors.title,
      groupEditConfig.colors.msgBg,
      groupEditConfig.colors.msgText,
      groupEditConfig.colors.replyText,
      groupEditConfig.colors.dateText,
      groupEditConfig.colors.inputBg,
      groupEditConfig.settings.userImages,
      groupEditConfig.settings.customFontSize,
      groupEditConfig.settings.fontSize,
      groupEditConfig.settings.roundCorners,
      groupEditConfig.settings.cornerRadius
    )
    setOpenEditGroupPop(false)
    dispatch(setIsLoading(true));
  }

  const pinMessage = (msgId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    pinChatmessage(token, group?.id, msgId);
  }

  const unpinMessage = (msgId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    unpinChatmessage(token, group?.id, msgId);
  }

  const clearGroupChatMessages = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    clearGroupChat(token, group?.id);
    setOpenManageChatPopup(false);
    dispatch(setIsLoading(true));
  }

  const onBlockUser = (userId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    blockUser(token, userId);
    dispatch(setIsLoading(true));
  }

  const updateModerators = (modIds: number[]) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupModerators(token, group?.id, modIds);
    setOpenModeratorsWidget(false);
    dispatch(setIsLoading(true));
  }

  const updateModeratorPermissions = (modId: number | null, settings: any) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupModPermissions(token, group?.id, modId, settings)
    dispatch(setIsLoading(true));
  }

  const onTimeOutGroupUser = (userId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    timeoutGroupUser(token, group?.id, userId)
    dispatch(setIsLoading(true));
  }

  const updateCensoredContents = (contents: string | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateCensoredWords(token, group?.id, contents);
    setOpenCensoredPopup(false);
    dispatch(setIsLoading(true));
  }

  const unbanUsers = (userIds: number[]) => {
    const token = localStorage.getItem(TOKEN_KEY)
    console.log(`Frontend: Unbanning users ${userIds} from group ${group?.id}`);
    unbanGroupUsers(token, group?.id, userIds);
    setOpenBannedUsersWidget(false);
    dispatch(setIsLoading(true));
  }

  useEffect(() => {
    if (currentUserId > 0 && currentUserId < 100000) {
      setShowSigninView(false)
    } else {
      if (stayAsAnon) {
        setShowSigninView(false)
      } else {
        setShowSigninView(true)
      }
    }
  }, [currentUserId, stayAsAnon])

  useEffect(() => {
    setShowOnlineUserCount(currentUserId > 0 && currentUserId < 100000 && !stayAsAnon)
  }, [currentUserId, stayAsAnon])

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Make textarea invisible but still selectable
    textArea.style.position = "fixed";
    textArea.style.left = "-1999px";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      console.log(successful ? "Copied!" : "Copy failed");
    } catch (err) {
      console.error("Fallback copy failed", err);
    }

    document.body.removeChild(textArea);
  }

  return (
    <div className="page-container bg-white">
      {/* Chats Area Start */}
      {/* <ChatangoWidget /> */}
      {/* <iframe src="http://mg.pingbash.com" width="800" height="600" allow="clipboard-write"></iframe> */}
      <div className="content-wrapper w-full max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
        {/* <div className="page-content w-full pt-[36px] h-full flex items-center justify-center px-[24px] pb-[24px] relative max-lg:px-[20px] "> */}
        <div className="page-content h-full flex items-center justify-center relative ">
          {/* <PageHeader /> */}
          <div className={`flex justify-center gap-[20px] w-full relative`}
            style={{
              width: groupConfig.sizeMode == "fixed" ? groupConfig.width : "100%",
              height: groupConfig.sizeMode == "fixed" ? groupConfig.height : "100%",
              maxWidth: "100%",
              maxHeight: "100%"
            }}
          >
            {/* Chat Left Side Start ---Chat Hisotry */}

            {/* Chat Left Side End ---Chat History */}

            {/* Chat Right Side Start ---Message History */}
            <section className={`flex flex-col justify-between bg-white border border-gray-500 rounded-[10px] duration-500 w-full`}
              style={{
                borderRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
              }}
            >

              {/* Chat Right Side Header Start */}
              {group?.id != 0 &&
                <nav className="shadow-lg shadow-slate-300 select-none px-[20px] py-[16px] gap-[10px] border-b flex justify-between flex-wrap"
                  style={{
                    background: groupConfig.colors.background ?? BG_COLOR,
                    borderTopLeftRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                    borderTopRightRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                    color: group?.title_color ?? TITLE_COLOR, zIndex: 1
                  }}
                >
                  <div className="flex gap-[16px] items-center">
                    <div>
                      <div className="flex justify-start max-[810px]:flex-col items-center gap-[5px] whitespace-nowrap truncate">
                        <img
                          alt="logo"
                          width="60"
                          height="60"
                          decoding="async"
                          data-nimg="1"
                          className="w-10 cursor-pointer hover:opacity-80 transition-opacity"
                          src="/logo-orange.png"
                          style={{ color: "transparent", width: "48px", height: "38px" }}
                          onClick={() => {
                            console.log("🔍 [W] Logo clicked - opening create new group modal");
                            setOpenNewGroupPop(true);
                          }}
                          title="Click to create a new group"
                        />
                        {/*<div className="text-[20px] font-bold truncate w-[100%]">{group?.name}</div>*/}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center flex-row">
                    {!showSigninView && <Popover placement="bottom-start" showArrow >
                      <PopoverTrigger>
                        <div className="max-[810px]:flex cursor-pointer" ref={groupMemuPopoverRef}><FontAwesomeIcon icon={faBars} className="text-[22px]" /></div>
                      </PopoverTrigger>
                      <PopoverContent className="bg-white dark:bg-zinc-100 border rounded-md shadow-md w-64 p-[16px]">
                        <ul className="flex flex-col gap-2">
                          {groupMenuOptions.map((item, index) => (
                            <li
                              key={index}
                              className="px-3 py-1 rounded-md hover:bg-default-200 cursor-pointer"
                              onClick={() => handleGroupMenuClick(item.id)}
                            >
                              {item.name}
                            </li>
                          ))}
                          <SwitchButton enabled={isDarkMode} onToggle={setDarkMode} />
                        </ul>
                      </PopoverContent>
                    </Popover>}
                    {/* {currentUserId > 0 && <div className="ml-[12px] cursor-pointer" onClick={() => {
                    localStorage.clear()
                    setCurrentUserId(0)
                  }}>LOG OUT</div>} */}
                  </div>

                </nav>}
              {/* Chat Right Side Header End */}

              {/* Pinned Message carousel Start */}
              {!hideChat && pinnedMessages?.length > 0 &&
                <PinnedMessagesWidget
                  messages={pinnedMessages}
                  bgColor={groupConfig.colors.background}
                  titleColor={groupConfig.colors.title}
                  msgColor={groupConfig.colors.msgText}
                  fontSize={groupConfig.settings.fontSize}
                  onMessageClick={(id) => {
                    // Replace this with scroll-to-message logic
                    scrollToRepliedMsg(id);
                    setTabbedPinMsgId(id);
                  }}
                />}

              {/* Pinned Message Carousel End */}

              {/* Chat Article Start */}
              <article className={`overflow-y-auto h-full ${hideChat ? "hidden" : "flex"} flex-col px-[14px] pt-[20px] overflow-x-hidden min-h-20`}
                style={{ background: groupConfig.colors.msgBg ?? MSG_BG_COLOR }}
              >
                {/* <div className="text-center text-sm"><button onClick={() => setLastChatDate(lastChatDate + 1)}
                  style={{color: groupConfig.colors.msgText ?? MSG_COLOR}}  
                >Read More</button></div> */}
                <div className="flex flex-col gap-[4px] overflow-y-scroll" ref={scrollContainerRef} >
                  {filteredMsgList?.length ? filteredMsgList.map((message, idx) => {
                    console.log(`🔍 [W] Rendering message ${idx}: group_id=${message.group_id}, current_group=${group?.id}, match=${message.group_id === group?.id}`);
                    if (message.group_id === group?.id) {
                      console.log(`🔍 [W] Rendering message ${idx}: "${message.Content}"`);
                      return (
                        <div key={idx} ref={setMsgItemRef(idx)}>
                          <Message
                            key={`message-${idx}`}
                            avatar={message?.sender_avatar ? `${SERVER_URL}/uploads/users/${message.sender_avatar}` : null}
                            content={`${message.Content}`}
                            sender_banned={message.sender_banned}
                            time={chatDate(`${message.Send_Time}`)}
                            read_time={message.Read_Time}
                            parentMsg={filteredMsgList.find(msg => msg.Id === message.parent_id)}
                            showPin={canPinMessage}
                            isPinned={pinnedMsgIds.includes(message.Id ?? -1)}
                            isTabbed={tabbedPinMsgId == message.Id}
                            show_reply={true}

                            show_avatar={groupConfig.settings.userImages ?? SHOW_USER_IMG}
                            font_size={groupConfig.settings.customFontSize ? groupConfig.settings.fontSize ?? FONT_SIZE : FONT_SIZE}
                            message_color={groupConfig.colors.msgText ?? MSG_COLOR}
                            date_color={groupConfig.colors.dateText ?? MSG_DATE_COLOR}
                            reply_message_color={groupConfig.colors.replyText ?? REPLY_MGS_COLOR}

                            message={message}
                            group={group}
                            userId={currentUserId}

                            onDelete={messageDeleteButtonClicked}
                            onBanUser={userBanButtonClicked}
                            onReplyMessage={(msgId) => {
                              if (isBannedUser) return
                              if (!canPost) return
                              if (hideChat) return
                              if (!canSend) {
                                toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                                return;
                              }
                              const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
                              const toTime = isTimedout(memInfo?.to_time ?? "")
                              if (toTime != "" && group?.creater_id != getCurrentUserId()) {
                                toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                                return
                              }
                              setReplyMsg(filteredMsgList.find(msg => msg.Id === msgId));
                              setShowMsgReplyView(true);
                            }}
                            onReplyMsgPartClicked={(msgId) => {
                              scrollToRepliedMsg(msgId);
                            }}
                            onEndedHighlight={() => setTabbedPinMsgId(null)}
                            onPinMessage={(msgId) => {
                              if (!canPinMessage) return
                              pinnedMsgIds.includes(message.Id ?? -1) ? unpinMessage(msgId) : pinMessage(msgId)
                            }}
                            onTimeOutUser={onTimeOutGroupUser}
                            onBlockUser={onBlockUser}
                          />
                        </div>

                      );
                    }
                    return null;
                  }) : ""}</div>
              </article>
              {/* Chat Article End */}
              <nav className={`relative max-[320px]:px-[5px] gap-[10px] flex flex-col border-t ${isMobile ? "p-[8px]" : "px-[12px] py-[6px]"}`}
                style={{
                  background: groupConfig.colors.background ?? BG_COLOR,
                  borderBottomLeftRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                  borderBottomRightRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                  color: groupConfig.colors.title ?? TITLE_COLOR
                }}
              >
                {/* start upload preview for image or file */}
                {attachment?.type && <div className="upload-preview relative">
                  {attachment.type === 'image' && <Image className="h-[100px] w-auto" src={`${SERVER_URL}/uploads/chats/images/${attachment.url}`} alt="" width={100} height={100} />}
                  {attachment.type === 'file' && (<div>File : ${attachment.url}</div>)}
                  <div onClick={handleRemoveAttachment} className="absolute top-0 right-0 text-xl cursor-pointer inline-block w-2 h-2">&times;</div>
                </div>}
                {/* end upload preview for image or file */}

                {showMsgReplyView && replyMsg && <div className="none relative flex flex-row justity-start h-[36px]">
                  <div><FontAwesomeIcon icon={faReply} className="text-[20px] mt-[4px] mr-[12px] text-[#2596be]" /></div>
                  {getReplyMsgImgHtml(replyMsg.Content)}
                  <div className="h-[16px] flex items-center  whitespace-nowrap absolute top-0 right-0 gap-2 mr-[12px]">
                    <button onClick={() => {
                      setReplyMsg(null);
                      setShowMsgReplyView(false);
                    }}>
                      <FontAwesomeIcon icon={faClose} className="text-[16px] text-[#8A8A8A]" />
                    </button>
                  </div>
                  <div className="ml-[12px] flex-column">
                    <div className="font-bold text-[15px] text-[#2596be] h-[16px] text-ruby">Reply to {replyMsg?.sender_name}</div>
                    {getReplyMsgContentHtml(replyMsg.Content)}
                  </div>
                </div>}

                <div className="flex max-[810px]:flex-col-reverse justify-between gap-[10px] items-center">
                  <div className="max-[810px]:flex justify-between max-[810px]:w-full">
                    <div className="flex gap-[10px] min-w-[126px] relative cursor-pointer max-[810px]:flex">
                      <div
                        onClick={() => {
                          if (isBannedUser) return
                          if (!canPost) return
                          if (hideChat) return
                          if (!canSend) {
                            toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                            return;
                          }
                          const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
                          const toTime = isTimedout(memInfo?.to_time ?? "")
                          if (toTime != "" && group?.creater_id != getCurrentUserId()) {
                            toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                            return
                          }
                          imageUploadRef.current?.click()
                        }}
                        className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faImages} className="text-[24px]" />
                      </div>
                      <input ref={imageUploadRef} type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                      <div
                        onClick={() => {
                          if (isBannedUser) return
                          if (!canPost) return
                          if (hideChat) return
                          if (!canSend) {
                            toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                            return;
                          }
                          const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
                          const toTime = isTimedout(memInfo?.to_time ?? "")
                          if (toTime != "" && group?.creater_id != getCurrentUserId()) {
                            toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                            return
                          }
                          fileUploadRef.current?.click()
                        }}
                        className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faPaperclip} className="text-[24px]" />
                      </div>
                      <input ref={fileUploadRef} type="file" onChange={handleFileUpload} className="hidden" />
                      {showEmoji &&
                        <div className=" absolute bottom-[3em] max-[810px]:bottom-[5.5em] w-[370px] h-[415px]">
                          <EmojiPicker
                            onSelect={(value) => {
                              console.log("Selected:", value)
                              // Example:
                              if (value.type === 'emoji') { setInputMsg(inputMsg + value.content); inputMsgRef.current?.focus() }
                              if (value.type === 'gif') {
                                sendGroupMsgHandler("gif", "gif::" + value.content);
                                setInputMsg("");
                                setShowEmoji(false);
                              }
                              if (value.type === 'sticker') {
                                sendGroupMsgHandler("sticker", "sticker::" + value.content);
                                setInputMsg("");
                                setShowEmoji(false);
                              }
                            }}
                          />
                        </div>}
                      <div
                        onClick={() => {
                          if (isBannedUser) return
                          if (!canPost) return
                          if (hideChat) return
                          if (!canSend) {
                            toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                            return;
                          }
                          const memInfo = group?.members?.find(user => user.id == getCurrentUserId());
                          const toTime = isTimedout(memInfo?.to_time ?? "")
                          if (toTime != "" && group?.creater_id != getCurrentUserId()) {
                            toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                            return
                          }
                          setShowEmoji(!showEmoji)
                        }}
                        className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faFaceSmile} className="text-[24px]" />
                      </div>
                      <Popover placement="bottom-start" showArrow >
                        <PopoverTrigger>
                          <div className="w-[24px] h-[24px]" ref={soundMenuPopoverRef}><FontAwesomeIcon icon={faVolumeUp} className="text-[24px]" /></div>

                        </PopoverTrigger>
                        <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 w-72">
                          <button
                            onClick={() => {
                              soundMenuPopoverRef.current?.click();
                              setSoundSelectedOption(soundSettingOptions.find(opt => opt.option_id == mySoundOptionId)?.val);
                            }}
                            className="absolute top-2 right-2 text-gray-500 hover:text-black text-[24px]"
                            aria-label="Close"
                          >
                            ×
                          </button>
                          <h3 className="text-lg font-medium mb-2">Play sounds:</h3>
                          <ul className="flex flex-col gap-2">
                            {soundSettingOptions.map((item, index) => (
                              <div className="flex items-center mb-2" key={index}>
                                <input
                                  type="radio"
                                  id={item.val}
                                  // name="sound"
                                  value={item.val}
                                  checked={soundSelectedOption === soundSettingOptions[index].val}
                                  onChange={(e) => {
                                    setSoundSelectedOption(e.target.value)
                                  }}
                                  className="mr-2"
                                />
                                <label htmlFor={item.val}>{item.name}</label>
                              </div>
                            ))}
                          </ul>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                updateSoundOption();
                              }}
                              className="bg-gray-300 hover:bg-gray-400 text-black py-1 px-4 rounded"
                            >
                              OK
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className={`hidden gap-[10px] ${adminManageOptions?.length > 0 && !isBannedUser ? "min-w-[152px]" : "min-w-[112px]"} relative cursor-pointer max-[810px]:flex justify-end`}>
                      {showOnlineUserCount && <div className="w-[40px] h-[24px]" onClick={() => setOpenGroupOnlineUsersPopup(true)}><FontAwesomeIcon icon={faUser} className="text-[24px] mr-[8px]" />{groupOnlineUserIds.length}</div>}
                      <Popover placement="bottom-start" showArrow >
                        <PopoverTrigger>
                          <span className="w-[24px] h-[24px]" ref={filterPopoverRef}><FontAwesomeIcon icon={faFilter} className="text-[24px]" /></span>

                        </PopoverTrigger>
                        <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 ">
                          <ul className="flex flex-col gap-2 w-[240px]">
                            {filterOptions &&
                              <FilterWidget
                                currentMode={filterMode}
                                filteredUser={filteredUser}
                                filterOptions={filterOptions}
                                users={group?.members ?? []}
                                onFilterModeUpdatede={(id) => {
                                  setFilteredUser(null)
                                  setFilterMode(id)
                                }}
                                onUserSelected={(user) => {
                                  setFilteredUser(user)
                                  console.log('Selected User:', user)
                                }}
                              />}
                          </ul>
                        </PopoverContent>
                      </Popover>

                      {adminManageOptions?.length > 0 && !isBannedUser &&
                        <Popover placement="bottom-start" showArrow >
                          <PopoverTrigger>
                            <div className="w-[24px] h-[24px]" ref={adminManagePopoverRef}><FontAwesomeIcon icon={faSliders} className="text-[24px]" /></div>
                          </PopoverTrigger>
                          <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 w-60">
                            <ul className="flex flex-col gap-2">
                              {adminManageOptions.map((item, index) => (
                                <div
                                  className="flex items-center mb-2 cursor-pointer"
                                  key={index}
                                  onClick={() => {
                                    handleAdminOptionClick(item.id);
                                    adminManagePopoverRef.current?.click()
                                  }}
                                >
                                  <label htmlFor={item.id} className="text-[18px] cursor-pointer">{item.name}</label>
                                </div>
                              ))}
                            </ul>
                          </PopoverContent>
                        </Popover>}
                    </div>
                  </div>

                  <div className={`flex w-full items-center justify-between p-[6px] ${isMobile ? "pl-12px" : "pl-[16px]"} rounded-full border`}
                    style={{ background: groupConfig.colors.inputBg ?? INPUT_BG_COLOR }}
                  >
                    <input
                      type="text"
                      ref={inputMsgRef}
                      onKeyDown={(e) => e.keyCode === 13 && sendGroupMsgHandler("msg", "")}
                      value={inputMsg}
                      onChange={(e) => setInputMsg(e.target.value)}
                      className="w-full outline-none text-[14px] leading-[24px]"
                      placeholder="Write a message"
                      style={{ background: groupConfig.colors.inputBg ?? INPUT_BG_COLOR, color: groupConfig.colors.msgText ?? MSG_COLOR }}
                    />
                    <button onClick={() => sendGroupMsgHandler("msg", "")} className="h-[30px] active:translate-y-[2px] py-[3px] max-[320px]:px-[12px] px-[26px] rounded-full text-[14px] max-[320px]:text-[10px] text-white bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF]">
                      {isMobile ? <div className="hidden max-[810px]:flex"><FontAwesomeIcon icon={faPaperPlane} className="text-[16px]" /></div> : "Send"}
                    </button>
                    {/* Debug button for testing membership refresh */}
                    {/* <button 
                      onClick={async () => {
                        const token = localStorage.getItem(TOKEN_KEY);
                        if (token && group?.id) {
                          console.log("🔍 [W] Manual membership refresh triggered");
                          await ensureGroupMembership(group.id, token);
                        }
                      }}
                      className="h-[30px] px-2 text-xs bg-red-500 text-white rounded"
                      title="Debug: Refresh Membership"
                    >
                      🔧
                    </button> */}
                  </div>
                  <div className={`flex gap-[10px] ${adminManageOptions?.length > 0 && !isBannedUser ? "min-w-[122px]" : "min-w-[82px]"} relative cursor-pointer max-[810px]:hidden`}>
                    {showOnlineUserCount && <div className="w-auto h-[24px]" onClick={() => setOpenGroupOnlineUsersPopup(!openGroupOnlineUsersPopup)}><FontAwesomeIcon icon={faUser} className="text-[24px] pr-[6px]" />{groupOnlineUserIds.length}</div>}
                    <Popover placement="bottom-start" showArrow >
                      <PopoverTrigger>
                        <span className="w-[24px] h-[24px]" ref={filterPopoverRef}><FontAwesomeIcon icon={faFilter} className="text-[24px]" /></span>

                      </PopoverTrigger>
                      <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 ">
                        <ul className="flex flex-col gap-2 w-[240px]">
                          {filterOptions &&
                            <FilterWidget
                              currentMode={filterMode}
                              filteredUser={filteredUser}
                              filterOptions={filterOptions}
                              users={group?.members ?? []}
                              onFilterModeUpdatede={(id) => {
                                setFilteredUser(null)
                                setFilterMode(id)
                              }}
                              onUserSelected={(user) => {
                                setFilteredUser(user)
                                console.log('Selected User:', user)
                              }}
                            />}
                        </ul>
                      </PopoverContent>
                    </Popover>

                    {adminManageOptions?.length > 0 && !isBannedUser &&
                      <Popover placement="bottom-start" showArrow >
                        <PopoverTrigger>
                          <div className="w-[24px] h-[24px]" ref={adminManagePopoverRef}><FontAwesomeIcon icon={faSliders} className="text-[24px]" /></div>
                        </PopoverTrigger>
                        <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 w-60">
                          <ul className="flex flex-col gap-2">
                            {adminManageOptions.map((item, index) => (
                              <div
                                className="flex items-center mb-2 cursor-pointer"
                                key={index}
                                onClick={() => {
                                  handleAdminOptionClick(item.id);
                                  adminManagePopoverRef.current?.click()
                                }}
                              >
                                <label htmlFor={item.id} className="text-[18px] cursor-pointer">{item.name}</label>
                              </div>
                            ))}
                          </ul>
                        </PopoverContent>
                      </Popover>}
                  </div>
                </div>
                {/* Image Upload, File Upload, Emoticon End */}

                {/* Add Sign in button for the anons */}
                {showSigninView && <div className="z-[11] w-full h-full absolute bottom-[0px] right-[0px] py-[3px] border-t px-[8px]" onClick={() => { setShowSigninPopup(true) }}>
                  <div
                    className="h-full w-full bg-white flex justify-center items-center cursor-pointer"
                    style={{
                      background: groupConfig.colors.background ?? BG_COLOR,
                      borderBottomLeftRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                      borderBottomRightRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                      color: groupConfig.colors.title ?? TITLE_COLOR
                    }}
                  >
                    Sign in
                  </div>
                </div>}
              </nav>
            </section>
            {/* Chat Right Side Start ---Message History */}
          </div>
        </div>
      </div>
      {/* Chats Area End */}
      <SigninPopup
        isOpen={showSigninPopup}
        onClose={() => setShowSigninPopup(false)}
        onSignin={handleSignin}
        goToSignup={() => {
          setShowSigninPopup(false)
          setShowSignupPopup(true)
        }}
        goAsAnon={() => {
          setStayAsAnon(true)
          setShowSigninPopup(false)
          console.log("=== Anon Id ====", getAnonId())
          registerAsAnon(getAnonId());
          setCurrentUserId(getAnonId())

          // Trigger chat rules for manual anonymous login
          if (group?.id) {
            const anonToken = localStorage.getItem('anonToken');
            if (anonToken) {
              console.log("🔍 [W] [Chat Rules] Triggering chat rules after manual Anon click");
              setTimeout(() => {
                triggerChatRulesAfterLogin(anonToken, 'anonymous');
              }, 1000); // Small delay to ensure anonymous registration completes
            } else {
              console.log("🔍 [W] [Chat Rules] No anonymous token available for manual Anon click");
            }
          } else {
            console.log("🔍 [W] [Chat Rules] No group available for manual Anon click");
          }
        }}
      />
      <SignupPopup
        isOpen={showSignupPopup}
        onClose={() => setShowSignupPopup(false)}
        onSignup={handleSignup}
        goToSignin={() => {
          setShowSignupPopup(false)
          setShowSigninPopup(true)
        }}
      />
      <VerificationPopup
        isOpen={showVerificationPopup}
        onClose={() => setShowVerificationPopup(false)}
        onVerify={handleVerification}
        email={verificationEmail}
        onResendCode={handleResendCode}
      />
      <GroupCreatPopup isOpen={openEditGroupPop} onClose={() => setOpenEditGroupPop(false)}>
        <h2 className="text-xl font-semibold mb-2 flex justify-center">Group: {group?.name}</h2>
        <GroupPropsEditWidget
          groupName={group?.name ?? ""}
          groupConfig={groupConfig}
          onUpdatedConfig={(conf) => {
            setGroupEditConfig(conf);
          }}
        />
        <button className={`h-[40px] mt-[20px] py-[2px] rounded-[12px] font-semibold text-white w-full bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF] cursor-pointer `}
          onClick={() => onSaveGroupConfig()}>Save</button>
      </GroupCreatPopup>

      <GroupCreatPopup isOpen={openNewGroupPop} onClose={() => {
        setOpenNewGroupPop(false);
        setNewGroupName(""); // Reset group name when closing
      }}>
        <h2 className="text-xl font-semibold mb-4 flex justify-center">Create New Group</h2>

        {/* Group Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Group Name *
          </label>
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Enter group name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={50}
          />
          {newGroupName.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{newGroupName.length}/50 characters</p>
          )}
        </div>

        <GroupPropsEditWidget
          groupName={newGroupName || "New Group"}
          groupConfig={groupConfig}
          onUpdatedConfig={(conf) => {
            setGroupConfig(conf);
          }}
        />
        <button
          className={`h-[40px] mt-[20px] py-[2px] rounded-[12px] font-semibold text-white w-full cursor-pointer ${newGroupName.trim().length > 0
              ? 'bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF] hover:opacity-90'
              : 'bg-gray-400 cursor-not-allowed'
            }`}
          disabled={newGroupName.trim().length === 0}
          onClick={() => {
            if (newGroupName.trim().length === 0) {
              toast.error("Please enter a group name");
              return;
            }

            const token = localStorage.getItem(TOKEN_KEY);
            const userId = getCurrentUserId();

            if (!token || userId === 0) {
              toast.error("Please log in to create a group");
              setShowSigninPopup(true);
              return;
            }

            createNewGroup();
          }}
        >
          Create Group
        </button>
      </GroupCreatPopup>

      <SendNotificationPopup
        isOpen={openSendGroupNotification}
        onClose={() => setOpenSendGroupNotification(false)}
        onSend={onSendGroupNotification}
      />
      <ConfirmPopup
        title={"Delete message?"}
        description={"Are you sure you want to delete this message?"}
        yesBtnTitle="Yes, delete"
        noBtnTitle="Cancel"
        isOpen={openMsgDeleteConfirmPopup}
        onNoBtnclicked={() => {
          setOpenMsgDeleteConfirmPopup(false);
          setDeleteMsgId(null);
        }}
        onYesBtnClicked={deleteMessage}
      />
      <ConfirmPopup
        title={"Ban this user?"}
        description={"Are you sure you want to ban this user?"}
        yesBtnTitle="Yes, ban"
        noBtnTitle="Cancel"
        isOpen={openBanUserConfirmPopup}
        onNoBtnclicked={() => {
          setOpenBanUserConfirmPopup(false);
          setBanUserId(null);
        }}
        onYesBtnClicked={banUser}
      />
      <ConfirmPopup
        title={"Unban request send?"}
        description={"Are you sure you want to send unban request to owner?"}
        yesBtnTitle="Yes, ban"
        noBtnTitle="Cancel"
        isOpen={openUnbanReqConfirmPopup}
        onNoBtnclicked={() => {
          setOpenUnbanReqConfirmPopup(false);
          setBanUserId(null);
        }}
        onYesBtnClicked={unbanUser}
      />

      {/* Group Admin Modals */}
      <ChatLimitPopup
        isOpen={openChatLimitationPopup}
        postLvl={group?.post_level}
        urlLvl={group?.url_level}
        slow_mode={group?.slow_mode}
        slowTime={group?.slow_time}
        onClose={() => {
          setOpenChatLimitationPopup(false)
        }}
        onConfirm={updateChatLimits}
      />

      <ManageChatPopup
        isOpen={openManageChatPopup}
        isOpenPinnedMsgView={showPinnedMessagesView}
        onClose={() => setOpenManageChatPopup(false)}
        onOpenPinnedMsgView={setShowPinnedMessageView}
        pinnedMessages={filteredMsgList.filter(msg => pinnedMsgIds.includes(msg?.Id ?? -1))}
        unPinGroupMessage={unpinMessage}
        onClearChat={clearGroupChatMessages}
      />

      <ModeratorsPopup
        allMembers={group?.members?.filter(mem => mem.role_id != 1 && mem.role_id != 2) ?? []}
        moderators={group?.members?.filter(mem => mem.role_id == 2) ?? []}
        isOpen={openModeratorsWidget}
        onClose={() => setOpenModeratorsWidget(false)}
        onSave={updateModerators}
        onUpdateModPermissions={updateModeratorPermissions}
      />

      <CensoredContentsPopup
        isOpen={openCensoredPopup}
        onClose={() => setOpenCensoredPopup(false)}
        contentsStr={group?.censored_words ?? ""}
        onSave={updateCensoredContents}
      />

      <BannedUsersPopup
        users={groupBannedUsers}
        isOpen={openBannedUsersWidget}
        onClose={() => setOpenBannedUsersWidget(false)}
        unbanUsers={unbanUsers}
      />

      <GroupOnlineUsersPopup
        isOpen={openGroupOnlineUsersPopup}
        onClose={() => setOpenGroupOnlineUsersPopup(false)}
        onlineUserIds={groupOnlineUserIds}
        allCount={groupOnlineUserIds.length}
        members={group?.members ?? []}
      />

      <ChatRulesPopup
        isOpen={openChatRules}
        onClose={() => {
          setOpenChatRules(false);
          // Mark rules as seen when popup is closed
          const groupId = group?.id;
          if (groupId) {
            markRulesAsSeen(groupId);
          }
        }}
        groupId={group?.id}
        groupName={group?.name}
        initialRules={chatRules}
        isCreator={currentUserId == group?.creater_id}
        onSave={(rules) => {
          console.log("🔍 [W] [Chat Rules] Saving chat rules:", rules);
          const token = localStorage.getItem(TOKEN_KEY);
          if (token && group?.id) {
            updateChatRules(token, group.id, rules, groupConfig.settings.showChatRules);
          }
        }}
      />

      {/* Timeout Notification */}
      <TimeoutNotification
        isVisible={showTimeoutNotification}
        timeoutMinutes={timeoutData?.timeoutMinutes || 15}
        expiresAt={timeoutData?.expiresAt || ''}
        onClose={() => setShowTimeoutNotification(false)}
      />
    </div>
  );
};

const Chats: React.FC = () => {
  return (
    <Suspense fallback={<PreLoading />} >
      <ChatsContent />
    </Suspense >
  )
}
export default Chats;
