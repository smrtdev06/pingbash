'use client'

import PageHeader from "@/components/pageHeader";
import SideBar from "@/components/sideBar";
import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import EmojiPicker from "@/components/chats/EmojiPicker";
import Message from "@/components/chats/message";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import TabBar from "@/components/groups/TabBar";
import { 
  faArrowLeft, 
  faArrowRight, 
  faSearch, 
  faPaperPlane,
  faBars,
  faUser,
  faClose,
  faReply,
  faPaperclip,
  faVolumeUp,
  faSliders,
  faFilter
} from "@fortawesome/free-solid-svg-icons";
import {
  faImages,
  faFaceSmile,
} from "@fortawesome/free-regular-svg-icons";
import { 
  getGroupHistory, 
  getUsers, 
  sendGroupMsg, 
  getGroupMessages, 
  socket, 
  readMsg, 
  readGroupMsg, 
  getMyGroups,
  getFavGroups,
  deleteGroupMsg,
  banGroupUser,
  unbanGroupUser,
  unbanGroupUsers,
  addListenerToGroup,
  userJoinToGroup,
  updateGroupFavInfo,
  updateCensoredWords,
  updateGroupModerators,
  clearGroupChat,
  pinChatmessage,
  getPinnedMessages,
  unpinChatmessage,
  updateGroupChatLimitations,
  updateGroupModPermissions,
  sendGroupNotify,
  updateGroupChatboxConfig,
  timeoutGroupUser,
  getBlockedUsers,
  blockUser,
  getGroupOnlineUsers,
  getBannedUsers,
  getIpBans,
  unbanGroupIps,
  getChatRules,
  updateChatRules
 } from "@/resource/utils/chat";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import ChatConst from "@/resource/const/chat_const";
import { SERVER_URL, TOKEN_KEY, USER_ID_KEY } from "@/resource/const/const";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { chatDate, containsURL, getCensoredMessage, getCensoredWordArray, isTimedout, now } from "@/resource/utils/helpers";
import { setMyGroupList, setFavoriteGroupList } from "@/redux/slices/messageSlice";
import { MessageUnit, User, ChatUser, ChatGroup, ChatOption } from "@/interface/chatInterface";
// import { setMessageList } from "@/redux/slices/messageSlice";
import toast from "react-hot-toast";
import messages from "@/resource/const/messages";
import axios from "axios";
import PreLoading from "@/components/mask/preLoading";
import { setIsLoading } from "@/redux/slices/stateSlice";
import ChatGroupCard from "@/components/chats/ChatGroupCard";
import ConfirmPopup from "@/components/ConfirmPopup";
import Lottie from "lottie-react"
import { stickers } from '../../components/chats/LottiesStickers';
import { useSound } from "@/components/chats/useSound";
import "../globals.css";
import EmbedCodeDialog from "@/components/chats/EmbedCodeDialog";
import { isValidGroupName } from "@/resource/utils/helpers";
import { GroupPropsEditWidget } from "@/components/chats/GroupPropsEditWidget";
import GroupCreatPopup from "@/components/groups/groupCreatPopup";
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
import ChatLimitPopup from "@/components/groupAdmin/ChatLimitPopup";
import ModeratorsPopup from "@/components/groupAdmin/ModeratorsPopup";
import CensoredContentsPopup from "@/components/groupAdmin/CensoredContentsPopup";
import ManageChatPopup from "@/components/groupAdmin/ManageChatPopup";
import PinnedMessagesWidget from "@/components/chats/PinnedMessagesWidget";
import FilterWidget from "@/components/groupAdmin/FilterWidget";
import BannedUsersPopup from "@/components/groupAdmin/BannedUsersPopup";
import IpBansPopup from "@/components/groupAdmin/IpBansPopup";
import SendNotificationPopup from "@/components/groupAdmin/SendNotificationPopup";
import GroupOnlineUsersPopup from "@/components/groupAdmin/GroupOnlineUsersPopup";
import ChatRulesPopup from "@/components/groupAdmin/ChatRulesPopup";

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

  const [inputMsg, setInputMsg] = useState("")
  const [lastChatDate, setLastChatDate] = useState(1)
  const [showEmoji, setShowEmoji] = useState(false)
  const [search, setSearch] = useState("")
  const [attachment, setAttachment] = useState<Attachment>()
  const router = useRouter();
  const [groupMsgList, setGroupMsgList] = useState<MessageUnit[]>([])
  const hasShownGroupNotify = useRef(false);

  const myGroupList = useSelector((state: RootState) => state.msg.myGroupList);
  const favGroupList = useSelector((state: RootState) => state.msg.favoriteGroupList);
  const [searchedGroupList, setSearchedGroupList] = useState<ChatGroup[]>([])
  const [filterdGroupList, setFilteredGroupList] = useState<ChatGroup[]>([])
  // const selectedChatGroup = useSelector((state: RootState) => state.msg.selectedChatGroup);
  const [selectedChatGroup, setSelectedChatGroup] = useState<ChatGroup | null>(null)

  // Debug selectedChatGroup changes
  useEffect(() => {
    console.log("🔍 selectedChatGroup changed to:", selectedChatGroup?.id, selectedChatGroup?.name);
  }, [selectedChatGroup]);

  const params = useSearchParams();
  const dispatch = useDispatch();
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
  const [tabIndex, setTabIndex] = useState(0);

  const [openNewGroupPop, setOpenNewGroupPop] = useState(false);
  const [openEditGroupPop, setOpenEditGroupPop] = useState(false);
  const inputGroupRef = useRef<HTMLInputElement | null>(null);
  const [groupNameMessage, setGroupNameMessage] = useState("");
  const [groupNameIsValid, setGroupNameIsValid] = useState(false);

  const [showJoinView, setShowJoinView] = useState(false);
  const [groupMenuOptions, setGroupMenuOptions] = useState<any[]>([]);

  const [openEmbedCodeDlg, setOpenEmbedCodeDlg] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");  
  
  const [config, setConfig] = useState<ChatWidgetConfig>({
    sizeMode: 'fixed',
    width: 500,
    height: 400,
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
    width: 500,
    height: 400,
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

  const [groupConfig, setGroupConfig] = useState<ChatWidgetConfig>({
    sizeMode: 'fixed',
    width: 500,
    height: 400,
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

  const configRef = useRef(config);

  // Keep the ref updated with the latest config
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const tabs = [
    {
      label: "My Groups",
    },
    {
      label: "Favorites",
    },
  ];

  const soundMenuPopoverRef = useRef<HTMLImageElement>(null);
  const filterPopoverRef = useRef<HTMLImageElement>(null);

  const [mySoundOptionId, setMySoundOptionId] = useState<number | null | undefined>(null);
  const [soundSelectedOption, setSoundSelectedOption] = useState<string | null | undefined>(null);
  

  const soundSettingOptions = [
    {val: "every", name: "On every message",  option_id: 1},
    {val: "reply", name: "Only on @replies",  option_id: 2},
    {val: "never", name: "Never",  option_id: 0}
  ];

  const [hideChat, setHideChat] = useState(false)

  const chatRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [chatPosition, setChatPosition] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, chatX: 0, chatY: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

// Parameters for the Admin Tools
  const adminManagePopoverRef = useRef<HTMLImageElement>(null);
  const [openChatLimitationPopup, setOpenChatLimitationPopup] = useState(false);
  const [openBannedUsersWidget, setOpenBannedUsersWidget] = useState(false);
  const [openIpBansWidget, setOpenIpBansWidget] = useState(false);
  const [openModeratorsWidget, setOpenModeratorsWidget] = useState(false);
  const [openCensoredPopup, setOpenCensoredPopup] = useState(false);
  const [openManageChatPopup, setOpenManageChatPopup] = useState(false);
  const [showPinnedMessagesView, setShowPinnedMessageView] = useState(false);
  const [groupBannedUsers, setGroupBannedUsers] = useState<ChatUser[]>([]);
  const [groupIpBans, setGroupIpBans] = useState<any[]>([]);
  const [pinnedMsgIds, setPinnedMsgIds] = useState<number[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<MessageUnit[]>([]);
  const [tabbedPinMsgId, setTabbedPinMsgId] = useState<number | null>(null);
  const [adminManageOptions, setAdminManageOptions] = useState<{ id: string; name: string }[]>([]);
  const [filterOptions, setFilterOption] = useState<{ id: number; name: string }[]>([]);
  const [filterMode, setFilterMode]  = useState(0)
  const [filteredUser, setFilteredUser] = useState<ChatUser | null>(null)  // For the user selected in Filter mode for 1 on 1 Mode
  const [openSendGroupNotification, setOpenSendGroupNotification] = useState(false)
  const [filteredMsgList, setFilteredMsgList] = useState<MessageUnit[]>([])
  const [filteredPrevMsgList, setFilteredPrevMsgList] = useState<MessageUnit[]>([])
  const [blockedUserIds, setBlockedUserIds] = useState<number[]>([])

  const [showOnlineUserCount, setShowOnlineUserCount] = useState(true)
  const [openGroupOnlineUsersPopup, setOpenGroupOnlineUsersPopup] = useState(false)
  const [groupOnlineUserIds, setGroupOnlineUserIds] = useState<number[]>([])
  
  const [isBannedUser, setIsBanneduser] = useState(false);
  const [canPost, setCanPost] = useState(true)
  const [canPinMessage, setCanPinMessage] = useState(false);
  
  const [openChatRules, setOpenChatRules] = useState(false);
  const [chatRules, setChatRules] = useState("");
  const [hasSeenRulesForGroup, setHasSeenRulesForGroup] = useState<{[groupId: number]: boolean}>(() => {
    // Load seen rules from localStorage
    try {
      const stored = localStorage.getItem('seenChatRules');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });  

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [canSend, setCanSend] = useState(true);
  const [cooldown, setCooldown] = useState(0);

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
      console.log("🔍 [Chat Rules] Seen rules cleared for testing");
    } catch (error) {
      console.error('Failed to clear seen rules from localStorage:', error);
    }
  };

  // Helper function to force show chat rules for testing
  const forceShowChatRules = () => {
    console.log("🔍 [Chat Rules] Force showing chat rules for testing");
    setOpenChatRules(true);
  };

  // Make functions available globally for testing
  if (typeof window !== 'undefined') {
    (window as any).resetSeenRules = resetSeenRules;
    (window as any).forceShowChatRules = forceShowChatRules;
  }
  //--------------------------



  const [userNavShow, setUserNavShow] = useState(params.get("User") ? false : true)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    fetchSoundOption();  // Get user sound selected status
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("🔍 Initial load - Token:", token ? "Available" : "Missing");
    console.log("🔍 Calling getMyGroups...");
    getMyGroups(token); // Socket Emit to get My groups and favorite groups
    console.log("🔍 Calling getFavGroups...");
    getFavGroups(token); // Socket Emit to get My groups and favorite groups
    
    // Backend socket handlers are now working - no test data needed 
    const interval = setInterval(getCurrentGroupOnlineUsers, 1 * 60 * 1000);   
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      clearInterval(interval)
      window.removeEventListener('resize', checkScreenSize)
    };
  }, []);

  useEffect(() => {    
    setGroupBannedUsers(selectedChatGroup?.members?.filter(mem => mem.banned == 1) ?? [])
    dispatch(setIsLoading(false)); 
    
    if (selectedChatGroup) {
      const myMemInfo = selectedChatGroup?.members?.find(mem => mem.id == getCurrentUserId());

      // Set Admin / Mod tools list
      const options: { id: string; name: string }[] = [];
      if (myMemInfo?.id == selectedChatGroup?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.chat_limit) {
        options.push({ id: "1", name: "Chat Limitations" });
      }
      if (myMemInfo?.id == selectedChatGroup?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_chat) {
        options.push({ id: "2", name: "Manage Chat" });
      }
      if (myMemInfo?.id == selectedChatGroup?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_mods) {
        options.push({ id: "3", name: "Manage Moderators" });
      }
      if (myMemInfo?.id == selectedChatGroup?.creater_id || myMemInfo?.role_id == 2 && myMemInfo.manage_censored) {
        options.push({ id: "4", name: "Censored Content" });
      }
      // Only Group Master can access ban management
      if (myMemInfo?.id == selectedChatGroup?.creater_id) {
        options.push({ id: "5", name: "Banned Users" });
        options.push({ id: "6", name: "IP Bans" });
      }
      setAdminManageOptions(options);  
      
      // Set filter option based on user role
      const filterOptions: { id: number; name: string }[] = [];
      filterOptions.push({ id: 0, name: "Public Mode" });
      filterOptions.push({ id: 1, name: "1 on 1 Mode" });
      if (myMemInfo?.id == selectedChatGroup?.creater_id || myMemInfo?.role_id == 2) {
        filterOptions.push({ id: 2, name: "Mods Mode" });
      }
      setFilterOption(filterOptions)
      
      // Is Banner init
      setIsBanneduser(myMemInfo?.banned == 1)

      // Init Addmin tools variables
      if (selectedChatGroup.post_level == null || selectedChatGroup.post_level == 0) {
        setCanPost(true)
      } else if (selectedChatGroup.post_level == 1 ) {
        if (myMemInfo?.id && myMemInfo?.id < 1000000) {
          setCanPost(true)
        } else {
          setCanPost(false)
        }
      } else if (selectedChatGroup.post_level == 2) {
        if (myMemInfo?.role_id == 1 || myMemInfo?.role_id == 2) {
          setCanPost(true)
        } else {
          setCanPost(false)
        }
      }

      if (myMemInfo?.role_id == 1 || selectedChatGroup?.creater_id == getCurrentUserId() || myMemInfo?.role_id == 2 ) {
        setCanPinMessage(true)
      } else {
        setCanPinMessage(false)
      }      
    }

    getCurrentGroupOnlineUsers()

    // Get Group messages whenever update selected group
    if (selectedChatGroup == null) {
      setGroupMsgList([]);
      setShowJoinView(false);
      return;
    }     

    const groupMyInfo = selectedChatGroup.members?.find(mem => mem.id === getCurrentUserId());
    if (groupMyInfo == null || groupMyInfo && groupMyInfo.is_member != 1) {
        const token = localStorage.getItem(TOKEN_KEY);
        // If user click unJoined group, then add user to group as listener to show group messages
        addListenerToGroup(token, selectedChatGroup.id, getCurrentUserId());
    }

    // Show or hide Join Now view on chatting box
    if (selectedChatGroup.members == null || selectedChatGroup.members.length == 0) {
        setShowJoinView(true);
        return;
    }
    const myGroupInfo = selectedChatGroup.members.find(mem => mem.id === getCurrentUserId());
    if (myGroupInfo == null) {
        setShowJoinView(true);
        return;
    }
    if (myGroupInfo.is_member != 1) {
        setShowJoinView(true);
        return;
    }
    setShowJoinView(false);

  }, [selectedChatGroup]);

  useEffect(() => {
    const myMemInfo = selectedChatGroup?.members?.find(mem => mem.id == getCurrentUserId())
    setFilteredPrevMsgList(filteredMsgList)
    let newMsgs = []
    if (myMemInfo?.role_id == 1 || myMemInfo?.role_id == 2) {
      newMsgs = groupMsgList.filter(msg => msg.Receiver_Id == null || msg.Receiver_Id == 1 || msg.Receiver_Id == getCurrentUserId() || msg.Sender_Id == getCurrentUserId())      
    } else {
      newMsgs = groupMsgList.filter(msg => msg.Receiver_Id == null || msg.Receiver_Id == getCurrentUserId() || msg.Sender_Id == getCurrentUserId())
    }

    if (myMemInfo?.role_id != 1 && myMemInfo?.role_id != 2 && selectedChatGroup?.creater_id != getCurrentUserId()) {
      if (blockedUserIds?.length > 0) {
        newMsgs = newMsgs.filter(msg => {
          const senderInfo = selectedChatGroup?.members?.find(u => u.id === msg.Sender_Id)
          if (senderInfo?.role_id == 1 || senderInfo?.role_id == 2) return true
          console.log("msg sender Id==", msg.Sender_Id ?? -1 )
          return !blockedUserIds.includes(msg.Sender_Id ?? -1)        
        })
      }
    }
    
    setFilteredMsgList(newMsgs)

    const prevLength = filteredMsgList.length;
    const newLength = newMsgs.length;
    if (prevLength + 1 == newLength) {
      if (newMsgs[newLength - 1].Sender_Id != getCurrentUserId()) {        
        if (mySoundOptionId == 1) {
          console.log(" === Played Bell ==== ")
          playBell();
        } else if (mySoundOptionId == 2) {
          if (newMsgs[newLength - 1].parent_id != null) {
            const toMsgId = newMsgs[newLength - 1].parent_id;
            const toMsg = filteredMsgList.find(msg =>  msg.Id == toMsgId);
            if (toMsg?.Sender_Id == getCurrentUserId()) {
              console.log(" === Played Bell ==== ")
              playBell();
            }
          }
        }          
      }
    }
  }, [groupMsgList, blockedUserIds, selectedChatGroup])

  useEffect(() => {

    if (selectedChatGroup) {
      // Whenever click group, get Group messages
      getGroupMessages(localStorage.getItem(TOKEN_KEY), selectedChatGroup?.id);
    }
    console.log("get block data")
    getMyBlockedUsers();

    const token = localStorage.getItem(TOKEN_KEY);
    if (token && selectedChatGroup) {
      setPinnedMsgIds([]);
      getPinnedMessages(token, selectedChatGroup?.id);
      
      // Load chat rules for the selected group
      console.log("🔍 [Chat Rules] Loading chat rules for group:", selectedChatGroup.id);
      getChatRules(token, selectedChatGroup.id);
    }
    setShowMsgReplyView(false);
    setFilterMode(0)
    setChatPosition({ x: 0, y: 0 });
  }, [selectedChatGroup?.id]);

  useEffect(() => {
    const currGrpIsFav = favGroupList.find(group => group.id === selectedChatGroup?.id) != null;    
    if (getCurrentUserId() == selectedChatGroup?.creater_id) {
      setGroupMenuOptions([
        {id: 1, name: "Copy Group Link"},
        {id: 2, name: currGrpIsFav ? "Remove from Favorites" : "Add to Favorites"},
        {id: 3, name: hideChat ? "Show Chat" : "Hide Chat"},
        {id: 4, name: "Send a Notification"},
        {id: 5, name: "Edit Chatbox Style"},
        {id: 6, name: "Chat Rules"}
      ]); 
    } else {
        setGroupMenuOptions([
          {id: 1, name: "Copy Group Link"},
          {id: 2, name: currGrpIsFav ? "Remove from Favorites" : "Add to Favorites"},
          {id: 3, name: hideChat ? "Show Chat" : "Hide Chat"},
          {id: 6, name: "Chat Rules"}
        ]); 
    }    
  }, [favGroupList, selectedChatGroup, hideChat]);

  // Update show groups based on several cases: TabIndex(My groups, Favrorites), My groups, favorite groups, searched result
  useEffect(() => {
    switch (tabIndex) {
        case 0:
            console.log("🔍 My Groups tab - showing", myGroupList?.length, "groups");
            setFilteredGroupList(myGroupList);
            break;
        case 1:
            if (search == "") {
                console.log("🔍 Favorites tab - showing", favGroupList?.length, "groups");
                setFilteredGroupList(favGroupList);
            } else {
                console.log("🔍 Search results - showing", searchedGroupList?.length, "groups");
                setFilteredGroupList(searchedGroupList);
            }            
            break;
        default:
            setFilteredGroupList(myGroupList);
            break;
    }    
  }, [myGroupList, favGroupList, tabIndex, search, searchedGroupList]);

  const startCooldown = () => {
    // Clear existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (selectedChatGroup?.slow_mode) {
      setCanSend(false);
      setCooldown(selectedChatGroup.slow_time ?? 0);

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

  // Fetch Groups with search string
  const searchGroups = useCallback(async (searchStr: string) => {
    try {
      const res = await axios.post(`${SERVER_URL}/api/private/get/groups/search`,
        {
          search: searchStr
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        }
      );
      setSearchedGroupList(res.data.groups);
    } catch (error) {
      // Handle error appropriately
    //   toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  useEffect(() => {
    if (search != "") {
        searchGroups(search);
    }   
  }, [search]);  

  useEffect(() => {
    if (!isDarkMode) {
      setGroupConfig({
        ...groupConfig,
        sizeMode: selectedChatGroup?.size_mode ?? "fixed",
        width: selectedChatGroup?.frame_width ?? 500,
        height: selectedChatGroup?.frame_height ?? 400,
        colors: {
          ...groupConfig.colors,
          background: selectedChatGroup?.bg_color ?? BG_COLOR,
          title: selectedChatGroup?.title_color ?? TITLE_COLOR,
          msgBg: selectedChatGroup?.msg_bg_color ?? MSG_BG_COLOR,
          replyText: selectedChatGroup?.reply_msg_color ?? REPLY_MGS_COLOR,
          msgText: selectedChatGroup?.msg_txt_color ?? MSG_COLOR,
          dateText: selectedChatGroup?.msg_date_color ?? MSG_DATE_COLOR,      
          inputBg: selectedChatGroup?.input_bg_color ?? INPUT_BG_COLOR,
        },
        settings: {
          ...groupConfig.settings,
          userImages: selectedChatGroup?.show_user_img ?? SHOW_USER_IMG,
          customFontSize: selectedChatGroup?.custom_font_size ?? false,
          fontSize: selectedChatGroup?.font_size ?? FONT_SIZE,
          roundCorners: selectedChatGroup?.round_corners ?? false,
          cornerRadius: selectedChatGroup?.corner_radius ?? CORNOR_RADIUS
        }
      });
    } else {
      setGroupConfig({
        ...groupConfig,
        sizeMode: selectedChatGroup?.size_mode ?? "fixed",
        width: selectedChatGroup?.frame_width ?? 500,
        height: selectedChatGroup?.frame_height ?? 400,
        colors: {
          ...groupConfig.colors,
          background: darkenColor(selectedChatGroup?.bg_color ?? BG_COLOR),
          title: darkenColor(selectedChatGroup?.title_color ?? TITLE_COLOR),
          msgBg: darkenColor(selectedChatGroup?.msg_bg_color ?? MSG_BG_COLOR),
          replyText: darkenColor(selectedChatGroup?.reply_msg_color ?? REPLY_MGS_COLOR),
          msgText: darkenColor(selectedChatGroup?.msg_txt_color ?? MSG_COLOR),
          dateText: darkenColor(selectedChatGroup?.msg_date_color ?? MSG_DATE_COLOR),      
          inputBg: darkenColor(selectedChatGroup?.input_bg_color ?? INPUT_BG_COLOR),
        },
        settings: {
          ...groupConfig.settings,
          userImages: selectedChatGroup?.show_user_img ?? SHOW_USER_IMG,
          customFontSize: selectedChatGroup?.custom_font_size ?? false,
          fontSize: selectedChatGroup?.font_size ?? FONT_SIZE,
          roundCorners: selectedChatGroup?.round_corners ?? false,
          cornerRadius: selectedChatGroup?.corner_radius ?? CORNOR_RADIUS
        }
      });
    }   
  }, [selectedChatGroup, isDarkMode]);

  const getCurrentUserId = (): number => {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (userId == null) {
      userId = "0";
    }
    return parseInt(userId);
  };

  const getEmbedCode = () => {
    if (selectedChatGroup == null) return "";
    return '<iframe src="http://' + selectedChatGroup?.name + '.pingbash.com" width="600" height="400" allow="clipboard-write"></iframe>';
  }

  useEffect(() => {
    const handleGetGroupOnlineUsers = (data: number[]) => {
      console.log("==== Online Users === ", data)
      setGroupOnlineUserIds(data)
    }
    const handleGetGroupMsg = (data: MessageUnit[]) => {
      console.log("🔍 handleGetGroupMsg received:", data?.length, "messages for group:", selectedChatGroup?.id);
      setGroupMsgList(data)
      // dispatch(setMessageList(data))
    }

    const handleSendGroupNotify = (msg: string | null) => {  
      if (!hasShownGroupNotify.current) {
        toast.success("Sent notifications successfully")
        hasShownGroupNotify.current = true
      }      
    }

    socket.on(ChatConst.GET_GROUP_ONLINE_USERS, handleGetGroupOnlineUsers)
    socket.on(ChatConst.GET_GROUP_MSG, handleGetGroupMsg)   
    socket.on(ChatConst.GET_PINNED_MESSAGES, handleGetPinnedMesssages)
    socket.on(ChatConst.SEND_GROUP_NOTIFY, handleSendGroupNotify)
    
    // Cleanup to avoid memory leaks and invalid state updates
    return () => {

      // Get Group Chatting messages
      socket.off(ChatConst.GET_GROUP_MSG, handleGetGroupMsg)
      socket.off(ChatConst.GET_PINNED_MESSAGES, handleGetPinnedMesssages)
      socket.off(ChatConst.SEND_GROUP_NOTIFY, handleSendGroupNotify)
      // socket.off(ChatConst.GET_GROUP_HISTORY, handleGetGroupHistory)
      // socket.off(ChatConst.SEND_MSG, handleSendMsg)
    };
  }, [selectedChatGroup]); 

  const handleGetPinnedMesssages = (msgIds: number[]) => {
    setPinnedMsgIds(msgIds);
  }

  function mergeArrays(oldArray: MessageUnit[], newArray: MessageUnit[]): MessageUnit[] {
    const oldMap = new Map(oldArray.map(item => [item?.Id, item]));
    for (const newItem of newArray) {
      oldMap.set(newItem?.Id, newItem); // updates existing or adds new
    }
    return Array.from(oldMap.values());
  }

  const handleForbidden = (message: string | number) => {
    dispatch(setIsLoading(false));
    if (typeof message === 'string') {
      toast.error(message);
    } else {
      toast.error("Access forbidden");
    }
  }    

  const handleGetMyGroups = (data: ChatGroup[]) => {
    console.log("🔍 handleGetMyGroups received data:", data?.length, "groups");              
    dispatch(setMyGroupList(data));
  };

  

  const handleGetFavGroups = (data: ChatGroup[]) => {
    let updatedData: ChatGroup[] = [];    
    data.map(group => {
      var banned = null;
      var unban_request = null;
      let loggedInUserId = localStorage.getItem(USER_ID_KEY);
      if (group.creater_id.toLocaleString() != loggedInUserId && group.members != null) {
        const myGroupInfo = group.members.find(m => m.id.toLocaleString() == loggedInUserId);
        if (myGroupInfo != null) {
          banned = myGroupInfo?.banned;
          unban_request = myGroupInfo?.unban_request;
        }        
      }
      let newGroup = {...group};
      newGroup.banned = banned;
      newGroup.unban_request = unban_request;
      updatedData.push(newGroup);
    });    
    dispatch(setFavoriteGroupList(updatedData));
    const newSelGroup = updatedData.find(group => group.id == selectedChatGroup?.id) ?? null;
    if (newSelGroup) {
      const oldInfo = selectedChatGroup?.members?.find(mem => mem.id == getCurrentUserId());
      const newInfo = newSelGroup?.members?.find(mem => mem.id == getCurrentUserId());
      if (oldInfo?.is_member != newInfo?.is_member) {
        const updatedSearchedGroup = searchedGroupList.map(group =>
          group.id === selectedChatGroup?.id
            ? {
                ...group,
                members: group.members.map(member =>
                  member.id === getCurrentUserId()
                    ? { ...member, is_member: 1 }
                    : member
                )
              }
            : group
          );
          setSearchedGroupList(updatedSearchedGroup);
      }
      setSelectedChatGroup(newSelGroup); 
    } 
  };

  const handleBanGroupUser = (userId: number) => {
    console.log(`🚫 [F] User ${userId} banned - updating UI`);
    
    // Remove messages from banned user
    const updateMsgList = groupMsgList.filter(msg => msg.Sender_Id != userId);
    setGroupMsgList(updateMsgList);
    
    // Update banned users list immediately
    if (selectedChatGroup?.members) {
      const updatedMembers = selectedChatGroup.members.map(member => 
        member.id === userId ? { ...member, banned: 1 } : member
      );
      const updatedGroup = { ...selectedChatGroup, members: updatedMembers };
      setSelectedChatGroup(updatedGroup);
      
      // Update banned users list
      setGroupBannedUsers(updatedMembers.filter(mem => mem.banned == 1));
      console.log(`🚫 [F] Banned users list updated - now ${updatedMembers.filter(mem => mem.banned == 1).length} banned users`);
    }
  }

  const handleUnbanGroupUser = (userId: number) => {
    console.log(`✅ [F] User ${userId} unbanned - updating UI`);
    
    // Restore messages from unbanned user
    const updateMsgList = groupMsgList.map(msg => msg.Sender_Id == userId ? {...msg, sender_banned: 0} : msg);
    setGroupMsgList(updateMsgList);
    
    // Update banned users list immediately
    if (selectedChatGroup?.members) {
      const updatedMembers = selectedChatGroup.members.map(member => 
        member.id === userId ? { ...member, banned: 0 } : member
      );
      const updatedGroup = { ...selectedChatGroup, members: updatedMembers };
      setSelectedChatGroup(updatedGroup);
      
      // Update banned users list
      setGroupBannedUsers(updatedMembers.filter(mem => mem.banned == 1));
      console.log(`✅ [F] Banned users list updated - now ${updatedMembers.filter(mem => mem.banned == 1).length} banned users`);
    }
  }

  const handleUnbanGroupUsers = (userIds: number[] | null) => {
    console.log(`✅ [F] Users ${userIds} unbanned - updating UI`);
    
    // Restore messages from unbanned users
    const updateMsgList = groupMsgList.map(msg => userIds?.includes(msg.Sender_Id ?? -1) ? {...msg, sender_banned: 0} : msg);
    setGroupMsgList(updateMsgList);
    
    // Update banned users list immediately
    if (selectedChatGroup?.members && userIds) {
      const updatedMembers = selectedChatGroup.members.map(member => 
        userIds.includes(member.id) ? { ...member, banned: 0 } : member
      );
      const updatedGroup = { ...selectedChatGroup, members: updatedMembers };
      setSelectedChatGroup(updatedGroup);
      
      // Update banned users list
      setGroupBannedUsers(updatedMembers.filter(mem => mem.banned == 1));
      console.log(`✅ [F] Banned users list updated - now ${updatedMembers.filter(mem => mem.banned == 1).length} banned users`);
    }
  }

  const handleGetBannedUsers = (bannedUsers: ChatUser[]) => {
    console.log(`🚫 [F] Received banned users:`, bannedUsers.length, "users");
    setGroupBannedUsers(bannedUsers);
  }

  const handleGetIpBans = (ipBans: any[]) => {
    console.log(`🚫 [F] Received IP bans:`, ipBans.length, "IP addresses");
    setGroupIpBans(ipBans);
  }

  const handleJoinToGroupAnon = (data: any) => {
    console.log(`🔍 [F] Anonymous join response:`, data);
    if (data.success) {
      toast.success(`Successfully joined group ${data.groupId} as anonymous user`);
    }
  }

  const handleSendGroupMsg = useCallback((data: MessageUnit[]) => {
      console.log("🔍 handleSendGroupMsg received:", data?.length, "messages");
      const groupId = data?.length && data[data.length - 1].group_id;
      console.log("🔍 Message group ID:", groupId, "Selected group ID:", selectedChatGroup?.id);
      console.log("🔍 selectedChatGroup object:", selectedChatGroup);
      if (groupId === selectedChatGroup?.id) {
        console.log("🔍 Adding messages to current group");
        const newList = mergeArrays(groupMsgList, data);
        setGroupMsgList(newList)
        // dispatch(setMessageList([...newList]));
      } else {
        console.log("🔍 Message not for current group, ignoring");
      }
    }, [selectedChatGroup, groupMsgList]); // Add dependencies so it updates when these change

  const handleGroupUpdated = (updatedGroup: ChatGroup) => {
    dispatch(setIsLoading(false));
    if (selectedChatGroup?.id == updatedGroup.id) {
      setSelectedChatGroup(updatedGroup);
      // Update banned users list when group is updated
      setGroupBannedUsers(updatedGroup?.members?.filter(mem => mem.banned == 1) ?? []);
      console.log(`🔄 [F] Group updated - banned users: ${updatedGroup?.members?.filter(mem => mem.banned == 1).length}`);
    }
    if (myGroupList.find(grp => grp.id == updatedGroup.id)) {
      dispatch(setMyGroupList(myGroupList.map(grp => grp.id == updatedGroup.id ? updatedGroup : grp)));
    }
    if (favGroupList.find(grp => grp.id == updatedGroup.id)) {
      dispatch(setFavoriteGroupList(favGroupList.map(grp => grp.id == updatedGroup.id ? updatedGroup : grp)));
    }
    if (searchedGroupList.find(grp => grp.id == updatedGroup.id)) {
      setSearchedGroupList(searchedGroupList.map(grp => grp.id == updatedGroup.id ? updatedGroup : grp));
    }
  }

  const handleClearGroupChat = (groupId: number) => {
    if (groupId == selectedChatGroup?.id) {
      // dispatch(setMessageList([]));
      setGroupMsgList([])
    }
    dispatch(setIsLoading(false));
  } 

  const handleDeleteGroupMsg = (data: number) => {
    const updateMsgList = groupMsgList.filter(msg => msg.Id != data);
    setGroupMsgList(updateMsgList)
    // dispatch(setMessageList([...updateMsgList]))
  }

  const handleGetChatRules = (data: any) => {
    console.log("🔍 [Chat Rules] Received chat rules:", data);
    console.log("🔍 [Chat Rules] Current selectedChatGroup:", selectedChatGroup);
    console.log("🔍 [Chat Rules] hasSeenRulesForGroup:", hasSeenRulesForGroup);
    
    setChatRules(data.chatRules || '');
    
    // Update the config if needed
    if (data.showChatRules !== undefined) {
      setConfig(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          showChatRules: data.showChatRules
        }
      }));
    }
    
    // Auto-show chat rules if:
    // 1. showChatRules is true
    // 2. There are actual rules to show
    // 3. User hasn't seen rules for this group yet
    // 4. User is not the creator (creators can see rules anytime via menu)
    const groupId = selectedChatGroup?.id;
    const isCreator = getCurrentUserId() === selectedChatGroup?.creater_id;
    
    console.log("🔍 [Chat Rules] Auto-display conditions:", {
      showChatRules: data.showChatRules,
      hasRules: data.chatRules && data.chatRules.trim().length > 0,
      groupId,
      hasSeenBefore: groupId ? hasSeenRulesForGroup[groupId] : undefined,
      isCreator
    });
    
    if (data.showChatRules && 
        data.chatRules && 
        data.chatRules.trim().length > 0 && 
        groupId && 
        !hasSeenRulesForGroup[groupId] && 
        !isCreator) {
      
      console.log("🔍 [Chat Rules] Auto-showing rules for group:", groupId);
      
      // Add a small delay to ensure the UI is ready
      setTimeout(() => {
        setOpenChatRules(true);
        // Mark that user has seen rules for this group
        markRulesAsSeen(groupId);
      }, 500);
    } else {
      console.log("🔍 [Chat Rules] Not auto-showing rules - conditions not met");
    }
  };

  const handleUpdateChatRules = (data: any) => {
    console.log("🔍 [Chat Rules] Chat rules updated:", data);
    if (data.success) {
      setChatRules(data.chatRules || '');
      toast.success("Chat rules updated successfully!");
    } else if (data.groupId && data.groupId === selectedChatGroup?.id) {
      // Real-time update from another user
      setChatRules(data.chatRules || '');
    }
  };

  const handleGetBlockedUsers = (data: User[]) => {
    dispatch(setIsLoading(false));
    setBlockedUserIds(data.map(user => user.Opposite_Id))
  }
  
  const handleExpired = () => {
    localStorage.clear()
    dispatch(setIsLoading(false));
    router.push(`/auth?Role=${params.get("Role")}&Collection=login`);
  } 

  const handleServerError = () => {
    dispatch(setIsLoading(false));
    toast.error("Server Internal Error!")
  }

  // Setup socket listeners with proper cleanup
  useEffect(() => {
    // Get Groups list for chat history in chat page
    socket.on(ChatConst.GET_MY_GROUPS, handleGetMyGroups);
    socket.on(ChatConst.GET_FAV_GROUPS, handleGetFavGroups);
    
    // Socket hook for ban user socket
    // Group admin can ban user
    socket.on(ChatConst.BAN_GROUP_USER, handleBanGroupUser);
    socket.on(ChatConst.UNBAN_GROUP_USER, handleUnbanGroupUser);
    socket.on(ChatConst.UNBAN_GROUP_USERS, handleUnbanGroupUsers);
    socket.on(ChatConst.GET_BANNED_USERS, handleGetBannedUsers);
    socket.on(ChatConst.GET_IP_BANS, handleGetIpBans);
    socket.on(ChatConst.JOIN_TO_GROUP_ANON, handleJoinToGroupAnon);

    // Receive updated message afer delete group message.
    socket.on(ChatConst.DELETE_GROUP_MSG, handleDeleteGroupMsg);
    socket.on(ChatConst.CLEAR_GROUP_CHAT, handleClearGroupChat);
    socket.on(ChatConst.GROUP_UPDATED, handleGroupUpdated);

    socket.on(ChatConst.EXPIRED, handleExpired)
    socket.on(ChatConst.FORBIDDEN, handleForbidden)
    socket.on(ChatConst.SERVER_ERROR, handleServerError)

    socket.on(ChatConst.GET_BLOCKED_USERS_INFO, handleGetBlockedUsers);

         // Receive the message afer sending the message.
     socket.on(ChatConst.SEND_GROUP_MSG, handleSendGroupMsg);

     // Chat rules listeners
     socket.on(ChatConst.GET_CHAT_RULES, handleGetChatRules);
     socket.on(ChatConst.UPDATE_CHAT_RULES, handleUpdateChatRules);

     // Cleanup listeners on unmount
     return () => {
      socket.off(ChatConst.GET_MY_GROUPS, handleGetMyGroups);
      socket.off(ChatConst.GET_FAV_GROUPS, handleGetFavGroups);
      socket.off(ChatConst.BAN_GROUP_USER, handleBanGroupUser);
      socket.off(ChatConst.UNBAN_GROUP_USER, handleUnbanGroupUser);
      socket.off(ChatConst.UNBAN_GROUP_USERS, handleUnbanGroupUsers);
          socket.off(ChatConst.GET_BANNED_USERS, handleGetBannedUsers);
    socket.off(ChatConst.GET_IP_BANS, handleGetIpBans);
    socket.off(ChatConst.JOIN_TO_GROUP_ANON, handleJoinToGroupAnon);
      socket.off(ChatConst.DELETE_GROUP_MSG, handleDeleteGroupMsg);
      socket.off(ChatConst.CLEAR_GROUP_CHAT, handleClearGroupChat);
      socket.off(ChatConst.GROUP_UPDATED, handleGroupUpdated);
      socket.off(ChatConst.EXPIRED, handleExpired);
      socket.off(ChatConst.FORBIDDEN, handleForbidden);
      socket.off(ChatConst.SERVER_ERROR, handleServerError);
             socket.off(ChatConst.GET_BLOCKED_USERS_INFO, handleGetBlockedUsers);
       socket.off(ChatConst.SEND_GROUP_MSG, handleSendGroupMsg);
       socket.off(ChatConst.GET_CHAT_RULES, handleGetChatRules);
       socket.off(ChatConst.UPDATE_CHAT_RULES, handleUpdateChatRules);
     };
   }, [handleSendGroupMsg]); // Include handleSendGroupMsg so socket listener updates when it changes

  // When get new messages, will scroll bottom message list view.
  const scrollToBottom = () => {
    scrollContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    
    if (scrollContainerRef.current?.parentElement) {
      const msgContainer = scrollContainerRef.current.parentElement;
      msgContainer.scrollTop = msgContainer.scrollHeight;
    }
  };

  useEffect(() => {
    const pinnedMsgs = filteredMsgList.filter(msg => pinnedMsgIds.includes(msg.Id ?? -1))
    setPinnedMessages(pinnedMsgs);
  }, [filteredMsgList, pinnedMsgIds]);

  useEffect(() => {
    if (filteredPrevMsgList.length < filteredMsgList.length) {
      scrollToBottom();
    }
  }, [filteredMsgList]);

  // The action for the last chat date
  useEffect(() => {
    if (lastChatDate == 1) return;
    const token = localStorage.getItem(TOKEN_KEY);
    getGroupHistory(token, selectedChatGroup?.id, lastChatDate);
  }, [lastChatDate])  

  // The action for the message send action
  const sendGroupMsgHandler = (type: string, value: string) => {
    if (isBannedUser) {
      toast.error("You can't send message now. You are banned.");
      setInputMsg("");
      return;
    }
    if (!canPost) {
      toast.error("You can't send message now. You have no permission.");
      setInputMsg("");
      return;
    }
    if (hideChat) return
    if (!canSend) {
      toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
      return;
    }
    const memInfo = selectedChatGroup?.members?.find(user => user.id == getCurrentUserId());
    const toTime = isTimedout(memInfo?.to_time ?? "")
    if (toTime != "" && selectedChatGroup?.creater_id != getCurrentUserId()) {
      toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
      return
    }
    let receiverid = null
    if (filterMode == 2) {
      receiverid = 1
    } else if (filterMode == 1) {
      if (filteredUser?.id) {
        receiverid = filteredUser.id
      }
    }

    if (attachment?.type && attachment.type === 'file') {
      sendGroupMsg(selectedChatGroup?.id, `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" 
      href=${SERVER_URL + ""}/uploads/chats/files/${attachment.url}>File Name : ${attachment.url}</a>`
        , localStorage.getItem(TOKEN_KEY), receiverid, replyMsg?.Id)
    } else if (attachment?.type && attachment.type === 'image') {
      sendGroupMsg(
        selectedChatGroup?.id, 
        `<img src='${SERVER_URL}/uploads/chats/images/${attachment?.url}' alt="" />`, 
        localStorage.getItem(TOKEN_KEY), 
        receiverid,
        replyMsg?.Id
      )
    } else {
      const token = localStorage.getItem(TOKEN_KEY);
       if (type === "gif") {
        sendGroupMsg(selectedChatGroup?.id, value, token, receiverid, replyMsg?.Id);
      } else if (type === "sticker") {
        sendGroupMsg(selectedChatGroup?.id, value, token, receiverid, replyMsg?.Id);
      } else {
        if (inputMsg.length > 0) {
          const myMemInfo = selectedChatGroup?.members?.find(mem => mem.id == getCurrentUserId())

          if (selectedChatGroup?.url_level == 1 
            && (myMemInfo?.role_id == 0 || myMemInfo?.role_id == null) 
            && containsURL(inputMsg)) {
            toast.error("You can't post url. You have no permission.");
            setInputMsg(""); 
            setShowEmoji(false);  
            return
          }
          const censorWords = getCensoredWordArray(selectedChatGroup?.censored_words ?? null)
          const censoredMessage = getCensoredMessage(inputMsg, censorWords ?? [])
          console.log("🔍 About to send message - selectedChatGroup?.id:", selectedChatGroup?.id, "selectedChatGroup:", selectedChatGroup);
          sendGroupMsg(selectedChatGroup?.id, censoredMessage, token, receiverid, replyMsg?.Id);       
          setInputMsg(""); 
          setShowEmoji(false);         
        }
      }      
    }
    setReplyMsg(null);
    setShowMsgReplyView(false);
    setAttachment({ type: null, url: null })
    let myMemInfo = selectedChatGroup?.members?.find(mem => mem.id == getCurrentUserId())
    if (myMemInfo?.role_id == null || myMemInfo.role_id == 0) {
      if (selectedChatGroup?.slow_mode && (selectedChatGroup?.slow_time != null && selectedChatGroup?.slow_time > 0)) {
        startCooldown();
      }
    }
    
  } 

  const groupSelectHandler = (
    group : ChatGroup
  ) => {
    console.log("🔍 Group selected:", group.id, "Previous:", selectedChatGroup?.id);
    if (window.innerWidth < 810) { setUserNavShow(false); }
    // router.push(`${path}?Group=${id}`);
    if (selectedChatGroup?.id == group.id) return;
    setSelectedChatGroup(group)
    console.log("🔍 setSelectedChatGroup called with group:", group.id);
    const token = localStorage.getItem(TOKEN_KEY)
    // To call the function to send the socket function to make the Read_Time to set
    readGroupMsg(token, group.id)
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

  const joinToGroup = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    userJoinToGroup(token, selectedChatGroup?.id, getCurrentUserId());
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
    getGroupOnlineUsers(token, selectedChatGroup?.id)
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
    if (selectedChatGroup?.creater_id !== currentUserId) {
      toast.error("Only the group creator can ban users");
      setOpenBanUserConfirmPopup(false);
      setBanUserId(null);
      return;
    }
    
    const token = localStorage.getItem(TOKEN_KEY)
    console.log(`Frontend: Group Master ${currentUserId} attempting to ban user ${banUserId}`);
    banGroupUser(token, selectedChatGroup?.id, banUserId);
    setOpenBanUserConfirmPopup(false);
    setBanUserId(null);
    
    // Refresh banned users list after a short delay
    setTimeout(() => {
      if (selectedChatGroup?.members) {
        setGroupBannedUsers(selectedChatGroup.members.filter(mem => mem.banned == 1));
        console.log(`🔄 [F] Refreshed banned users list after ban operation`);
      }
    }, 1000);
  }

  const unbanUser = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    unbanGroupUser(token, selectedChatGroup?.id, getCurrentUserId());
    setOpenUnbanReqConfirmPopup(false);
  }

  const unbanUsers = (userIds: number[]) => {
    // Only Group Master can unban users
    const currentUserId = getCurrentUserId();
    if (selectedChatGroup?.creater_id !== currentUserId) {
      toast.error("Only the group creator can unban users");
      return;
    }
    
    const token = localStorage.getItem(TOKEN_KEY)
    console.log(`Frontend: Group Master ${currentUserId} unbanning users ${userIds} from group ${selectedChatGroup?.id}`);
    unbanGroupUsers(token, selectedChatGroup?.id, userIds);
    setOpenBannedUsersWidget(false);
    dispatch(setIsLoading(true));
  }

  const unbanIps = (ipAddresses: string[]) => {
    // Only Group Master can unban IPs
    const currentUserId = getCurrentUserId();
    if (selectedChatGroup?.creater_id !== currentUserId) {
      toast.error("Only the group creator can unban IP addresses");
      return;
    }
    
    const token = localStorage.getItem(TOKEN_KEY)
    console.log(`Frontend: Group Master ${currentUserId} unbanning IPs ${ipAddresses} from group ${selectedChatGroup?.id}`);
    unbanGroupIps(token, selectedChatGroup?.id, ipAddresses);
    setOpenIpBansWidget(false);
    dispatch(setIsLoading(true));
  }

  const updateChatLimits = (
    settings: any
  ) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupChatLimitations(
      token, 
      selectedChatGroup?.id, 
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
      selectedChatGroup?.id ?? null,
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

  const updateModeratorPermissions = (modId: number | null, settings: any) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupModPermissions(token, selectedChatGroup?.id, modId, settings)
    dispatch(setIsLoading(true));
  }

  const onTimeOutGroupUser = (userId: number | null) => {
    console.log("====senderId===", userId)
    const token = localStorage.getItem(TOKEN_KEY)
    timeoutGroupUser(token, selectedChatGroup?.id, userId)
    dispatch(setIsLoading(true));
  }

  const updateCensoredContents = (contents: string | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateCensoredWords(token, selectedChatGroup?.id, contents);
    setOpenCensoredPopup(false);
    dispatch(setIsLoading(true));
  }

  const updateModerators = (modIds: number[]) => {
    const token = localStorage.getItem(TOKEN_KEY)
    updateGroupModerators(token, selectedChatGroup?.id, modIds);
    setOpenModeratorsWidget(false);
    dispatch(setIsLoading(true));
  }

  const getMyBlockedUsers = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    getBlockedUsers(token);
    dispatch(setIsLoading(true));
  }

  const clearGroupChatMessages = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    clearGroupChat(token, selectedChatGroup?.id);
    setOpenManageChatPopup(false);
    dispatch(setIsLoading(true));
  }

  const onBlockUser = (userId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)   
    blockUser(token, userId);
    dispatch(setIsLoading(true));
  }

  const pinMessage = (msgId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    pinChatmessage(token, selectedChatGroup?.id, msgId);
  }

  const unpinMessage = (msgId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    unpinChatmessage(token, selectedChatGroup?.id, msgId);
  }

  const onSendGroupNotification = (msg: string) => {
    const token = localStorage.getItem(TOKEN_KEY)
    hasShownGroupNotify.current = false
    sendGroupNotify(token, selectedChatGroup?.id ?? null, msg)
  }

  const deleteMessage = () => {    
    if (deleteMsgId == null) return;
    const token = localStorage.getItem(TOKEN_KEY)     
    deleteGroupMsg(token, deleteMsgId, selectedChatGroup?.id);
    setOpenMsgDeleteConfirmPopup(false);
    setDeleteMsgId(null);
  }

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
    groupMemuPopoverRef?.current?.click();
    switch (menuId) {
      case 1:
        try {
          await navigator.clipboard.writeText("http://" + selectedChatGroup?.name + ".pingbash.com");
          toast.success("URL copied to clipboard!");
        } catch (err) {
          toast.error("Failed to copy URL: " + err);
        }
        break;
      case 2:
        let groupIdFav = favGroupList.find(group => group.id === selectedChatGroup?.id) != null;
        let updateIsMember = groupIdFav ? 0 : 1;
        updateGroupFavInfo(localStorage.getItem(TOKEN_KEY), selectedChatGroup?.id, updateIsMember);
        break;
      case 3:
        setHideChat(!hideChat)
        break;
      case 4:
        setOpenSendGroupNotification(true)
        break;
      case 5:
        setOpenEditGroupPop(true)
        break;
      case 6:
        setOpenChatRules(true)
        break;
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
      type = "img"; value= "Photo";
    }
    if (content!.indexOf("gif::https://") > -1 || content!.indexOf(".gif") > -1 && content!.indexOf(" ") < 0 && content!.indexOf("https://") > -1) {
      type = "gif"; value= "Gif";
    }
    if (content!.indexOf("sticker::") > -1) {
      type = "sticker"; value= "Sticker";
    }
    if (type === "text") {
      return  <div className='text-[14px] mt-[3px]'><span  dangerouslySetInnerHTML={{ __html: content! }} /></div>;
    } else {
      return  <div className='text-[14px] mt-[3px] text-gray-400'>{value}</div>;
    }
  }

  const getReplyMsgImgHtml = (content: string | null) => {
    if (content!.indexOf("<img") > -1) {
      let contentStr = content!.replace("<img", "<img style='height: 36px'")
      return <span
        className="inline-block w-fit h-[36px]"
        dangerouslySetInnerHTML={{ __html: contentStr! }}
      />;
    }
    if (content!.indexOf("gif::https://") > -1 ) {
      return <img src={content!.slice("gif::".length)} className="h-[36px]" /> 
    }

    if (content!.indexOf(".gif") > -1 && content!.indexOf("https://") > -1 && content!.indexOf(" ") < 0) {
      return <img src={content!} className="h-[36px]" />
    }
    
    if (content!.indexOf("sticker::") > -1 ) {
      return <Lottie animationData={getSticker(content!)} style={{height: 30 }} /> 
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

    // container.scrollTop = containerHeight;
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

  const createNewGroup = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const myConfig = configRef.current;
      const res = await axios.post(`${SERVER_URL}/api/private/add/groups/create`,
        {
          groupName: inputGroupRef.current?.value,
          createrId: getCurrentUserId(),
          size_mode: myConfig.sizeMode,
          frame_width: myConfig.width,
          frame_height: myConfig.height,
          bg_color: myConfig.colors.background,
          title_color: myConfig.colors.title,
          msg_bg_color: myConfig.colors.msgBg,
          msg_txt_color: myConfig.colors.msgText,
          reply_msg_color: myConfig.colors.replyText,
          msg_date_color: myConfig.colors.dateText,
          input_bg_color: myConfig.colors.inputBg,
          show_user_img: myConfig.settings.userImages,
          custom_font_size: myConfig.settings.customFontSize,
          font_size: myConfig.settings.fontSize,
          round_corners: myConfig.settings.roundCorners,
          corner_radius: myConfig.settings.cornerRadius,
          chat_rules: '',
          show_chat_rules: myConfig.settings.showChatRules
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        }
      );
    //   setChatGroupList(res.data.groups);
      console.log("🔍 Group created successfully, calling getMyGroups...");
      getMyGroups(localStorage.getItem(TOKEN_KEY));
      toast.success(messages.group.createSuccess);
      setOpenNewGroupPop(false);
    } catch (error) {
      // Handle error appropriately
      toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const onCreateNewGroup = () => {
    if (inputGroupRef.current?.value == "") {
      inputGroupRef.current.focus();
      return;
    }
    createNewGroup();
  }

  const checkGroupNameAvailability = async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await axios.post(
      `${SERVER_URL}/api/private/get/groups/name/availability`,
      {groupName: inputGroupRef.current?.value},
      {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          Authorization: token,
        },
      }
    );
    setNewGroupName(inputGroupRef.current?.value ?? "");
    setGroupNameIsValid(res.data.availability);
  }

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
      console.log("🚫 [F] Opening banned users menu - fetching banned users");
      const token = localStorage.getItem(TOKEN_KEY);
      getBannedUsers(token, selectedChatGroup?.id);
      setOpenBannedUsersWidget(true);
    } else if (optionId == "6") {
      console.log("🚫 [F] Opening IP bans menu - fetching IP bans");
      const token = localStorage.getItem(TOKEN_KEY);
      getIpBans(token, selectedChatGroup?.id);
      setOpenIpBansWidget(true);
    }
  }


  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, resizeStart, groupConfig.width, groupConfig.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.resize-handle')) {
      setIsResizing(true);
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: groupConfig.width,
        height: groupConfig.height
      });
    } else if (containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const offsetX = e.clientX - container.left - chatPosition.x;
      const offsetY = e.clientY - container.top - chatPosition.y;
      
      setDragStart({
        x: offsetX,
        y: offsetY,
        chatX: chatPosition.x,
        chatY: chatPosition.y
      });
      setIsDragging(true);
    }
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      const container = containerRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(
        e.clientX - container.left - dragStart.x, 
        container.width - groupConfig.width
      ));
      const newY = Math.max(0, Math.min(
        e.clientY - container.top - dragStart.y, 
        container.height - groupConfig.height
      ));
      setChatPosition({ x: newX, y: newY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      const newWidth = Math.max(500, resizeStart.width + deltaX);
      const newHeight = Math.max(400, resizeStart.height + deltaY);
      
      setConfig(prev => ({ ...prev, width: newWidth, height: newHeight }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <div className="page-container bg-white">
      <SideBar />
      {/* Chats Area Start */}
      <div className="content-wrapper w-full pl-[280px] max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
        <div className="page-content w-full pt-[12px] flex flex-col px-[24px] pb-[24px] relative max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px] max-[810px]:pb-[20px]">
          <PageHeader />
          <div className={`flex justify-stretch gap-[20px] w-full relative ${isMobile ? "h-mob-chatbox" : "h-[85vh]"}`}>
            {/* Chat Left Side Start ---Chat Hisotry */}
            <aside className={`relative min-w-[267px] w-[267px] pr-[5px] flex flex-col overflow-y-auto overflow-x-hidden duration-500 ${(userNavShow ? "flex max-[810px]:w-full" : "max-[810px]:hidden")} max-[810px]:gap-0`}>

              <div className="flex justify-center h-[40px]">
                <TabBar
                    tabs={tabs}
                    activeIndex={tabIndex}
                    onTabClick={(index) => {
                        setTabIndex(index);
                    }}
                />                
              </div>
              {tabIndex == 0 && <button className="absolute bottom-[0px] right-[0px] bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-white text-[14px] text-bold px-4 py-2 rounded-full z-[2]"
                  onClick={()=>!openNewGroupPop && setOpenNewGroupPop(true)}>
                  New Group
              </button>}

              {/* Search Area Start */}
              {tabIndex === 1 && 
              <div className="search-box sticky top-0 bg-white z-10 my-[8px] px-[12px] py-[8px] gap-[10px] whitespace-nowrap rounded-[10px] flex items-center w-full border">
                  <span className="max-[810px]:flex"><FontAwesomeIcon icon={faSearch} className="text-[14px]" /></span>
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none inline-block w-full text-[14px]" placeholder="Search or start a new chat" />
              </div>}
                  {/* Search Area End*/}
              {/* Group List Start  */}
              <div className="flex flex-col gap-[2px] h-[calc(100%-40px)] overflow-y-auto">
                {filterdGroupList != null && filterdGroupList.length > 0 && filterdGroupList.map((group, idx) => (
                  <ChatGroupCard
                    key={group.id}
                    groupId={group.id}
                    groupName={group.name}
                    groupCreaterId={group.creater_id}
                    groupCreaterName={group.creater_name}
                    members={group.members}
                    banned={group.banned}
                    unban_request={group.unban_request}
                    myId={getCurrentUserId()}
                    selectedGroupId={selectedChatGroup?.id}
                    onClick={() => groupSelectHandler(group)}
                    onBanLabelClick={unbanRequestClicked}
                  />))}
              </div>
              {/* Group List End */}
            </aside>
            {/* Chat Left Side End ---Chat History */}

            {/* Chat Container */}
            <div 
              ref={containerRef}
              className="flex-1 relative overflow-auto"
              style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              }}
            >
              {/* Chat Box */}
              <div
                ref={chatRef}
                className={`absolute select-none ${!isDragging && !isResizing ? 'transition-all duration-150 ease-out' : ''}`}
                style={{
                  left: `${chatPosition.x}px`,
                  top: `${chatPosition.y}px`,
                  zIndex: 10,
                  userSelect: 'none',
                  width: groupConfig?.sizeMode === 'fixed'
                    ? `min(100%, ${groupConfig.width}px)`
                    : '100%',
                  height: groupConfig?.sizeMode === 'fixed'
                    ? `min(100%, ${groupConfig.height}px)`
                    : '100%',
                }}
                
              >
                {/* Chat Right Side Start ---Message History */}
                  <section className={`flex flex-col justify-between bg-white border rounded-[10px] w-[calc(100%-267px)] duration-500 ${userNavShow ? "max-[810px]:hidden" : "max-[810px]:w-full"}`}
                    style={{
                      borderRadius: groupConfig?.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                      width: '100%',
                      height: '100%'                
                    }}
                  >

                    {/* Chat Right Side Header Start */} 
                    {selectedChatGroup != null && selectedChatGroup.id && 
                    <nav className={`relative shadow-lg shadow-slate-300 select-none px-[20px] py-[16px] gap-[10px] border-b flex justify-between flex-wrap ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      style={{background: groupConfig.colors.background ?? BG_COLOR, 
                        borderTopLeftRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                        borderTopRightRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                        color: groupConfig.colors.title ?? TITLE_COLOR
                      }}
                      onMouseDown={handleMouseDown}
                    >
                      <div className="flex gap-[16px] items-center">
                        <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={userNavShow ? faArrowRight : faArrowLeft} onClick={() => setUserNavShow(!userNavShow)} /></span>
                        
                        <div>
                          <p className="flex justify-start max-[810px]:flex-col items-center gap-[5px] whitespace-nowrap truncate">
                            <img
                              alt="logo"
                              width="60"
                              height="60"
                              decoding="async"
                              data-nimg="1"
                              className="w-10"
                              src="/logo-orange.png"
                              style={{ color: "transparent", width: "48px", height: "38px" }}
                            />
                            {/*<span className="text-[20px] font-bold truncate w-[100%]">{selectedChatGroup?.name}</span>*/}
                          </p>
                        </div>
                        
                      </div>
                      {selectedChatGroup && selectedChatGroup.creater_id == getCurrentUserId() && 
                      <div className="absolute px-[10px] py-[6px] top-[13px] right-[72px] rounded-[6px] bg-[wheat] cursor-pointer"
                        onClick={() => setOpenEmbedCodeDlg(true)}
                      >{'< Embed Code />'}</div>}
                      <Popover placement="bottom-start" showArrow >
                        <PopoverTrigger >
                          <div className="max-[810px]:flex cursor-pointer" ref={groupMemuPopoverRef}>
                            <FontAwesomeIcon icon={faBars} className="text-[22px]" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="bg-white dark:bg-zinc-100 border rounded-md shadow-md w-64 py-[20px]">
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
                      </Popover>
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
                    {<article className={`overflow-y-auto h-full ${hideChat ? "hidden" : "flex"} flex-col py-[12px] overflow-x-hidden min-h-20 pb-0`}
                      style={{background: groupConfig?.colors.msgBg ?? MSG_BG_COLOR}}
                    >
                      {/* <p className="text-center text-sm" style={{color: groupConfig.colors.msgText ?? MSG_COLOR}}><button onClick={() => setLastChatDate(lastChatDate + 1)}>Read More</button></p> */}
                      <div className="flex flex-col overflow-y-scroll gap-[4px]" ref={scrollContainerRef} >
                        {filteredMsgList?.length ? filteredMsgList.map((message, idx) => {
                          if (message.group_id === selectedChatGroup?.id) {
                            return (
                              <div key={idx} ref={setMsgItemRef(idx)}>
                                <Message
                                  key={`message-${idx}`}                          
                                  messageId={message.Id}
                                  avatar={message?.sender_avatar ? `${SERVER_URL}/uploads/users/${message.sender_avatar}` : null}
                                  senderId={message.Sender_Id}
                                  sender={message.sender_name}
                                  content={`${message.Content}`}
                                  sender_banned={selectedChatGroup?.members?.find(mem => mem.id === message.Sender_Id)?.banned ?? null}
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
                                  group={selectedChatGroup}
                                  userId={getCurrentUserId()}

                                  onDelete={messageDeleteButtonClicked}
                                  onBanUser={userBanButtonClicked}
                                  onReplyMessage={(msgId) => {
                                    if (isBannedUser) return
                                    if (!canPost) return
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
                    </article>}
                    {/* Chat Article End */}
                    <nav className={`relative max-[320px]:px-[5px] gap-[10px] flex flex-col border-t ${isMobile ? "p-[8px]" : "px-[12px] py-[6px]"}`}
                      style={{background: groupConfig.colors?.background ?? BG_COLOR, 
                        borderBottomLeftRadius: groupConfig?.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                        borderBottomRightRadius: groupConfig?.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS,
                        color: groupConfig?.colors.title ?? TITLE_COLOR
                      }}
                    >
                      {/* start upload preview for image or file */}
                      {attachment?.type && <div className="upload-preview relative">
                        {attachment.type === 'image' && <Image className="h-[100px] w-auto" src={`${SERVER_URL}/uploads/chats/images/${attachment.url}`} alt="" width={100} height={100} />}
                        {attachment.type === 'file' && (<div>File : ${attachment.url}</div>)}
                        <span onClick={handleRemoveAttachment} className="absolute top-0 right-0 text-xl cursor-pointer inline-block w-2 h-2">&times;</span>
                      </div>}
                      {/* end upload preview for image or file */}

                      {showMsgReplyView && replyMsg && <div className="none relative flex flex-row justity-start h-[36px]">
                        <div><FontAwesomeIcon icon={faReply} className="text-[20px] mt-[4px] mr-[12px] text-[#2596be]"/></div>
                        {getReplyMsgImgHtml(replyMsg.Content)}
                        <div className="h-[16px] flex items-center  whitespace-nowrap absolute top-0 right-0 gap-2 mr-[12px]">
                          <button onClick={() => {
                            setReplyMsg(null);
                            setShowMsgReplyView(false);
                          }}>
                            <FontAwesomeIcon icon={faClose} className="text-[16px] text-[#8A8A8A]"/>
                          </button>
                        </div>   
                        <div className="ml-[12px] flex-column">
                          <div className="font-bold text-[15px] text-[#2596be] h-[16px] text-ruby">Reply to {replyMsg?.sender_name}</div> 
                          {getReplyMsgContentHtml(replyMsg.Content)} 
                        </div>                   
                      </div>}
                          
                      <div className=" flex max-[810px]:flex-col-reverse justify-between gap-[10px] items-center">
                        <div className="max-[810px]:flex justify-between max-[810px]:w-full">
                          <div className="flex gap-[10px] min-w-[126px] relative cursor-pointer max-[810px]:flex">
                            <span 
                              onClick={() => {
                                if (isBannedUser) return
                                if (!canPost) return
                                if (hideChat) return
                                if (!canSend) {
                                  toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                                  return;
                                }
                                const memInfo = selectedChatGroup?.members?.find(user => user.id == getCurrentUserId());
                                const toTime = isTimedout(memInfo?.to_time ?? "")
                                if (toTime != "" && selectedChatGroup?.creater_id != getCurrentUserId()) {
                                  toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                                  return
                                }
                                imageUploadRef.current?.click()
                              }} 
                              className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faImages} className="text-[24px]" 
                            /></span>
                            {/* <Image onClick={() => imageUploadRef.current?.click()} className="w-[24px] h-[24px]" src={`/assets/light/chats/images.svg`} alt="" width={100} height={100} /> */}
                            <input ref={imageUploadRef} type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                            <span 
                              onClick={() => {
                                if (isBannedUser) return
                                if (!canPost) return
                                if (hideChat) return
                                if (!canSend) {
                                  toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                                  return;
                                }
                                const memInfo = selectedChatGroup?.members?.find(user => user.id == getCurrentUserId());
                                const toTime = isTimedout(memInfo?.to_time ?? "")
                                if (toTime != "" && selectedChatGroup?.creater_id != getCurrentUserId()) {
                                  toast.error("You can't send message now. You are timed out. You can send message " + toTime + " later.");
                                  return
                                }
                                fileUploadRef.current?.click()
                              }} 
                              className="w-[24px] h-[24px]">
                                <FontAwesomeIcon icon={faPaperclip} className="text-[24px]" />
                            </span>
                            {/* <Image onClick={() => fileUploadRef.current?.click()} className="w-[24px] h-[24px]" src={`/assets/light/chats/paperclip.svg`} alt="" width={100} height={100} /> */}
                            <input ref={fileUploadRef} type="file" onChange={handleFileUpload} className="hidden" />
                            {showEmoji &&
                            <div className=" absolute bottom-[3em] max-[810px]:bottom-[5.5em] w-[370px] h-[415px]">                      
                              <EmojiPicker
                                onSelect={(value) => {
                                  // Example:
                                  if (value.type === 'emoji') { setInputMsg(inputMsg + value.content); inputMsgRef.current?.focus() }
                                  if (value.type === 'gif') {
                                    sendGroupMsgHandler("gif", "gif::"+value.content);
                                    setInputMsg("");
                                    setShowEmoji(false);
                                  }
                                  if (value.type === 'sticker') {
                                    sendGroupMsgHandler("sticker", "sticker::"+value.content);
                                    setInputMsg("");
                                    setShowEmoji(false);
                                  }
                                }}
                              />
                            </div>}
                            <span 
                              onClick={() => {
                                if (isBannedUser) return
                                if (!canPost) return
                                if (hideChat) return                                
                                if (!canSend) {
                                  toast.error("You can't send message now. You can send " + cooldown + " seconds later.");
                                  return;
                                }
                                const memInfo = selectedChatGroup?.members?.find(user => user.id == getCurrentUserId());
                                const toTime = isTimedout(memInfo?.to_time ?? "")
                                if (toTime != "" && selectedChatGroup?.creater_id != getCurrentUserId()) return
                                setShowEmoji(!showEmoji)
                              }} 
                              className="w-[24px] h-[24px]"><FontAwesomeIcon icon={faFaceSmile} className="text-[24px]" />
                            </span>
                            {/* <Image onClick={() => setShowEmoji(!showEmoji)} className={`w-[24px] h-[24px] ${showEmoji && "bg-gray-200"}`} src={`/assets/light/chats/smile.svg`} alt="" width={100} height={100} /> */}
                            <Popover placement="bottom-start" showArrow >
                              <PopoverTrigger>
                                <div className="w-[24px] h-[24px]" ref={soundMenuPopoverRef}><FontAwesomeIcon icon={faVolumeUp} className="text-[24px]" /></div>
                                
                              </PopoverTrigger>
                              <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 w-64">
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
                                <div className="w-[24px] h-[24px]" ref={filterPopoverRef}><FontAwesomeIcon icon={faFilter} className="text-[24px]" /></div>
                                
                              </PopoverTrigger>
                              <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 ">
                                <ul className="flex flex-col gap-2 w-[240px]">
                                  {filterOptions &&                           
                                  <FilterWidget
                                    currentMode={filterMode}
                                    filteredUser={filteredUser}
                                    filterOptions={filterOptions}
                                    users={selectedChatGroup?.members ?? []}
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
                          style={{background: groupConfig?.colors.inputBg ?? INPUT_BG_COLOR}}
                        >
                          <input 
                            type="text" 
                            ref={inputMsgRef} 
                            onKeyDown={(e) => e.keyCode === 13 && sendGroupMsgHandler("msg", "")} 
                            value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} 
                            className="w-full outline-none text-[14px] leading-[24px]" placeholder="Write a message" 
                            style={{background: groupConfig?.colors.inputBg ?? INPUT_BG_COLOR, color: groupConfig?.colors.msgText ?? MSG_COLOR}}
                          />
                          <button onClick={() => sendGroupMsgHandler("msg", "")} className="h-[30px] active:translate-y-[2px] py-[3px] max-[320px]:px-[12px] px-[26px] rounded-full text-[14px] max-[320px]:text-[10px] text-white bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF]">
                            {isMobile ? <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={faPaperPlane} className="text-[16px]" /></span> : "Send"}
                          </button>
                        </div>
                        <div className={`flex gap-[10px] ${adminManageOptions?.length > 0 && !isBannedUser ? "min-w-[122px]" : "min-w-[82px]"} relative cursor-pointer max-[810px]:hidden`}>                      
                          {showOnlineUserCount && <div className="w-auto h-[24px]" onClick={() => setOpenGroupOnlineUsersPopup(!openGroupOnlineUsersPopup)}><FontAwesomeIcon icon={faUser} className="text-[24px] pr-[6px]" />{groupOnlineUserIds.length}</div>}
                          <Popover placement="bottom-start" showArrow >
                            <PopoverTrigger>
                              <div className="w-[24px] h-[24px]" ref={filterPopoverRef}><FontAwesomeIcon icon={faFilter} className="text-[24px]" /></div>
                              
                            </PopoverTrigger>
                            <PopoverContent className="relative bg-white dark:bg-zinc-100 border rounded-md shadow-md p-4 ">
                              <ul className="flex flex-col gap-2 w-[240px]">
                                {filterOptions &&                           
                                <FilterWidget
                                  currentMode={filterMode}
                                  filteredUser={filteredUser}
                                  filterOptions={filterOptions}
                                  users={selectedChatGroup?.members ?? []}
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
                      {showJoinView &&
                      <div className="z-[11] w-full h-full absolute bottom-[0px] right-[0px] py-[3px] border-t px-[8px]" onClick={joinToGroup}>
                          <div className="h-full w-full bg-white flex justify-center items-center cursor-pointer"
                            style={{
                              background: groupConfig.colors.background ?? BG_COLOR,
                              borderRadius: groupConfig.settings.roundCorners ? groupConfig.settings.cornerRadius ?? CORNOR_RADIUS : CORNOR_RADIUS
                            }}
                          >
                                Join now
                          </div>
                      </div>}                
                    </nav>              
                  </section>
                  {/* Chat Right Side Start ---Message History */}
                
                {/* Resize Handle */}
                {config.sizeMode === 'fixed' && (
                  <div
                    className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
                    style={{
                      background: 'linear-gradient(-45deg, transparent 0%, transparent 40%, #ccc 40%, #ccc 60%, transparent 60%)',
                      backgroundSize: '4px 4px'
                    }}
                  />
                )}
              </div>

              {/* Demo Content */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center text-white/50">
                  <h2 className="text-2xl font-bold mb-2">PingBash Group Chatting Box</h2>
                  {/* <p>Drag the chat box around and resize it!</p>
                  <p className="text-sm mt-2">Configure colors and settings in the left panel</p> */}
                </div>
              </div>
            </div>            
          </div>
        </div>
      </div>
        {/* Chats Area End */}
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
      {openEmbedCodeDlg && (
        <EmbedCodeDialog
          embedCode={getEmbedCode()}
          onClose={() => setOpenEmbedCodeDlg(false)}
        />
      )}
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
      <GroupCreatPopup isOpen={openNewGroupPop} onClose={() => setOpenNewGroupPop(false)}>
        <h2 className="text-xl font-semibold mb-2 flex justify-center">Create New Group</h2>
        <input 
          type="text" 
          ref={inputGroupRef} 
          onChange={(e) => {
            if (inputGroupRef.current?.value == "") {
              setGroupNameMessage("");
              return;
            }
            if (!isValidGroupName(inputGroupRef.current?.value ?? "")) {
              setGroupNameMessage("* Group name should contains only numbers and lower cases.");
              setGroupNameIsValid(false);
            } else {
              setGroupNameMessage("");
              checkGroupNameAvailability();
            }
          }}
          className="w-full px-5 border border-gray-200 bg-gray-100 rounded-[12px] p-2 mb-[20px]" 
          placeholder="Write a group name" 
        />
        {groupNameMessage != ""  && <div className="text-sm my-2 text-[red]">{groupNameMessage}</div>}   
        <GroupPropsEditWidget 
          groupName={newGroupName} 
          groupConfig={null}
          msgList={null}
          onUpdatedConfig={(conf) => {
            setConfig(conf);
          }}
        />         
        <button  className={`h-[40px] mt-[20px] py-[2px] rounded-[12px] font-semibold text-white w-full ${groupNameIsValid ? "bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF] cursor-pointer" : "bg-gray-400 cursor-no-drop"} `}
        onClick={() => onCreateNewGroup()}>Create</button>
      </GroupCreatPopup>

      <GroupCreatPopup isOpen={openEditGroupPop} onClose={() => setOpenEditGroupPop(false)}>
        <h2 className="text-xl font-semibold mb-2 flex justify-center">Group: {selectedChatGroup?.name}</h2>
        <GroupPropsEditWidget 
          groupName={selectedChatGroup?.name ?? ""} 
          groupConfig={groupConfig}
          msgList={filteredMsgList}
          onUpdatedConfig={(conf) => {
            setGroupEditConfig(conf);
          }}
        />         
        <button  className={`h-[40px] mt-[20px] py-[2px] rounded-[12px] font-semibold text-white w-full bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF] cursor-pointer `}
        onClick={() => onSaveGroupConfig()}>Save</button>
      </GroupCreatPopup>

      {/* Group Admin Modals */}
      <ChatLimitPopup 
        isOpen={openChatLimitationPopup} 
        postLvl = {selectedChatGroup?.post_level}
        urlLvl = {selectedChatGroup?.url_level}
        slow_mode = {selectedChatGroup?.slow_mode}
        slowTime = {selectedChatGroup?.slow_time}
        onClose={() => {
          setOpenChatLimitationPopup(false)
        }} 
        onConfirm={updateChatLimits}
      />

      <BannedUsersPopup 
        users={groupBannedUsers}
        isOpen={openBannedUsersWidget}
        onClose={() => setOpenBannedUsersWidget(false)}
        unbanUsers={unbanUsers}
      />

      <IpBansPopup 
        ipBans={groupIpBans}
        isOpen={openIpBansWidget}
        onClose={() => setOpenIpBansWidget(false)}
        unbanIps={unbanIps}
      />

      <ModeratorsPopup
        allMembers={selectedChatGroup?.members?.filter(mem => mem.id != getCurrentUserId()) ?? []}
        moderators={selectedChatGroup?.members?.filter(mem => mem.role_id == 2) ?? []}
        isOpen={openModeratorsWidget}
        onClose={() => setOpenModeratorsWidget(false)}
        onSave={updateModerators}
        onUpdateModPermissions={updateModeratorPermissions}
      />

      <CensoredContentsPopup 
        isOpen={openCensoredPopup}
        onClose={() => setOpenCensoredPopup(false)}
        contentsStr={selectedChatGroup?.censored_words ?? ""}
        onSave={updateCensoredContents}
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

      <GroupOnlineUsersPopup
        isOpen={openGroupOnlineUsersPopup}
        onClose={() => setOpenGroupOnlineUsersPopup(false)}
        onlineUserIds={groupOnlineUserIds}
        allCount={groupOnlineUserIds.length}
        members={selectedChatGroup?.members ?? []}
      />

      <ChatRulesPopup
        isOpen={openChatRules}
        onClose={() => {
          setOpenChatRules(false);
          // Mark rules as seen when popup is closed
          const groupId = selectedChatGroup?.id;
          if (groupId) {
            markRulesAsSeen(groupId);
          }
        }}
        groupId={selectedChatGroup?.id}
        groupName={selectedChatGroup?.name}
        initialRules={chatRules}
        isCreator={getCurrentUserId() == selectedChatGroup?.creater_id}
        onSave={(rules) => {
          console.log("🔍 [Chat Rules] Saving chat rules:", rules);
          const token = localStorage.getItem(TOKEN_KEY);
          if (token && selectedChatGroup?.id) {
            updateChatRules(token, selectedChatGroup.id, rules, config.settings.showChatRules);
          }
        }}
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
