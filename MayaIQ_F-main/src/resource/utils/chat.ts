import { SERVER_URL } from "../const/const";
import io from "socket.io-client";
import ChatConst from "../const/chat_const";
import { makeTextSafe } from "./helpers";

export const socket = io(SERVER_URL);

// Add socket connection debugging
socket.on('connect', () => {
  console.log('🔍 Socket connected successfully!', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('🔍 Socket disconnected:', reason);
});

socket.on('connect_error', (error) => {
  console.log('🔍 Socket connection error:', error);
});

// Add general event listener to see all incoming events
socket.onAny((eventName, ...args) => {
  console.log('🔍 Socket received event:', eventName, args);
});

export const userLoggedIn = (token: string | null) => {
  if (token) { 
    console.log('🔍 Emitting USER_LOGGED with token');
    socket.emit(ChatConst.USER_LOGGED, { token }) 
  } else {
    console.log('🔍 Emitting USER_OUT - no token');
    socket.emit(ChatConst.USER_OUT) 
  }
}

export const userRegistered = () => socket.emit(ChatConst.USER_REGISTER)
export const userLoggedOut = () => socket.emit(ChatConst.USER_OUT)

export const getUsers = (token: string | null) => {
  if (token)
    socket.emit(ChatConst.GET_USERS, { token })
}

export const getFriends = (token: string | null) => {
  if (token)
    socket.emit(ChatConst.GET_FRIEND_USERS, { token })
}

export const addFriend = (token: string | null, friendId: number | null, willFriend: boolean | null) => {
  if (token && friendId)
    socket.emit(ChatConst.ADD_FRIEND, { token, friendId, willFriend})
}

export const getSearchUsers = (token: string | null, search: string) => {
  console.log('🔍 [Friends Search] getSearchUsers called with search:', search, 'token:', token ? 'Available' : 'Missing');
  if (token) {
    socket.emit(ChatConst.GET_SEARCH_USERS, { token, search });
    console.log('🔍 [Friends Search] Emitted GET_SEARCH_USERS event');
  } else {
    console.log('🔍 [Friends Search] Cannot emit GET_SEARCH_USERS - no token');
  }
}

export const getMyGroups = (token: string | null) => {
  if (token) {
    console.log('🔍 Emitting GET_MY_GROUPS with token:', token ? 'Available' : 'Missing');
    socket.emit(ChatConst.GET_MY_GROUPS, { token });
  } else {
    console.log('🔍 Cannot emit GET_MY_GROUPS - no token available');
  }
}

export const getFavGroups = (token: string | null) => {
  if (token)
    socket.emit(ChatConst.GET_FAV_GROUPS, { token })
}

export const updateGroupFavInfo = (token: string | null, groupId: number | null | undefined, isMember: number | null) => {
  if (token && groupId)
    socket.emit(ChatConst.UPDATE_FAV_GROUPS, { token, groupId, isMember })
}

export const sendMsg = (
  to: number | null | undefined, 
  msg: string, 
  token: string | null,
  parent_id: number | null | undefined
) => {
  let message = makeTextSafe(msg); 
  socket.emit(ChatConst.SEND_MSG, { to, msg: message, token, parent_id })
}

export const sendGroupMsg = (
  groupId: number | null | undefined, 
  msg: string, 
  token: string | null, 
  receiverId: number | null,
  parent_id: number | null | undefined
) => {
  let message = makeTextSafe(msg);
  console.log("🔍 Sending group message to group:", groupId, "message:", message);
  socket.emit(ChatConst.SEND_GROUP_MSG, { groupId, msg: message, token, receiverId, parent_id })
}

/**
 * Function to request chatting records with selected user
 * @param token my token
 * @param target opposite's Id
 */
export const getMessages = (token: string | null, target: number | null | undefined) => {
  socket.emit(ChatConst.GET_MSG, { token, target })
}

export const getGroupMessages = (token: string | null, groupId: number | null | undefined) => {
  console.log("🔍 [F] Emitting GET_GROUP_MSG for group:", groupId, "with token:", token?.substring(0, 20) + "...");
  console.log("🔍 [F] Socket connected status:", socket.connected);
  console.log("🔍 [F] Socket ID:", socket.id);
  
  if (!socket.connected) {
    console.warn("🔍 [F] WARNING: Attempting to emit GET_GROUP_MSG but socket is not connected!");
  }
  
  socket.emit(ChatConst.GET_GROUP_MSG, { token, groupId })
}

export const getHistory = (token: string | null, target: number | null | undefined, limit: number | null) => {
  if (target && limit && token)
    socket.emit(ChatConst.GET_HISTORY, { token, target, limit })
}

export const getGroupHistory = (token: string | null, target: number | null | undefined, limit: number | null) => {
  if (target && limit && token)
    socket.emit(ChatConst.GET_GROUP_HISTORY, { token, target, limit })
}

export const readMsg = (token: string | null, id: number | null) => {
  if (token && id) {
    socket.emit(ChatConst.READ_MSG, { token, id })
  }
}

export const deleteMsg = (token: string | null, msgId: number, receiverId: number | null | undefined) => {
  if (token && msgId && receiverId) {
    socket.emit(ChatConst.DELETE_MSG, { token, msgId, receiverId })
  }
}

export const sendGroupNotify = (token: string | null, groupId: number | null, message: string) => {
  if (token && groupId && message) {
    socket.emit(ChatConst.SEND_GROUP_NOTIFY, { token, groupId, message })
  }
}

export const deleteGroupMsg = (token: string | null, msgId: number, groupId: number | null | undefined) => {
  if (token && msgId && groupId) {
    socket.emit(ChatConst.DELETE_GROUP_MSG, { token, msgId, groupId })
  }
}

export const banGroupUser = (token: string | null, groupId: number | null | undefined, userId: number | null | undefined) => {
  if (token && groupId && groupId) {
    socket.emit(ChatConst.BAN_GROUP_USER, { token, groupId, userId })
  }
}

export const unbanGroupUser = (token: string | null, groupId: number | null | undefined, userId: number | null | undefined) => {
  if (token && groupId && groupId) {
    socket.emit(ChatConst.UNBAN_GROUP_USER, { token, groupId, userId })
  }
}

export const unbanGroupUsers = (token: string | null, groupId: number | null | undefined, userIds: number[]) => {
  if (token && groupId && userIds) {
    console.log(userIds);
    socket.emit(ChatConst.UNBAN_GROUP_USERS, { token, groupId, userIds })
  }
}

export const updateGroupChatLimitations = (
  token: string | null, 
  groupId: number | null | undefined, 
  post_level: number | null,
  url_level: number | null,
  slow_mode: boolean | null,
  slow_time: number | null
) => {
  if (token && groupId) {
    socket.emit(ChatConst.UPDATE_GROUP_POST_LEVEL, 
      {token, groupId, post_level, url_level, slow_mode, slow_time})
  }
}

export const updateGroupChatboxConfig = (
  token: string | null, 
  groupId: number | null,
  size_mode: 'fixed' | 'responsive',
  frame_width: number | null,
  frame_height: number | null,
  bg_color: string,
  title_color: string,
  msg_bg_color: string,
  msg_txt_color: string,
  reply_msg_color: string,
  msg_date_color: string,
  input_bg_color: string,
  show_user_img: boolean,
  custom_font_size: boolean,
  font_size: number,
  round_corners: boolean,
  corner_radius: number
) => {
  if (token && groupId) {
    socket.emit(ChatConst.UPDATE_GROUP_CHATBOX_STYLE, 
      {
        token, 
        groupId, 
        size_mode,
        frame_width,
        frame_height,
        bg_color,
        title_color,
        msg_bg_color,
        msg_txt_color,
        reply_msg_color,
        msg_date_color,
        input_bg_color,
        show_user_img,
        custom_font_size,
        font_size,
        round_corners,
        corner_radius
      })
  }
}

export const updateGroupModPermissions = (token: string | null, groupId: number | null | undefined, modId: number | null, settings: any) => {
  if (token && groupId && modId) {
    socket.emit(ChatConst.UPDATE_MOD_PERMISSIONS, 
      { 
        token, 
        groupId, 
        modId,
        chat_limit: settings.chatLimit,
        manage_mods: settings.manageMods,
        manage_chat: settings.manageChat,
        manage_censored: settings.censoredContent,
        ban_user: settings.banUsers
      })
  }
}

export const updateCensoredWords = (token: string | null, groupId: number | null | undefined, contents: string | null) => {
  if (token && groupId) {
    socket.emit(ChatConst.UPDATE_CENSORED_CONTENTS, { token, groupId, contents })
  }
}

export const updateGroupModerators = (token: string | null, groupId: number | null | undefined, modIds: number[] | null) => {
  if (token && groupId) {
    socket.emit(ChatConst.UPDATE_GROUP_MODERATORS, { token, groupId, modIds })
  }
}

export const getBlockedUsers = (token: string | null) => {
  if (token) {
    socket.emit(ChatConst.GET_BLOCKED_USERS_INFO, { token })
  }
}

export const blockUser = (token: string | null, userId: number | null) => {
  if (token && userId) {    
    socket.emit(ChatConst.BLOCK_USER, { token, userId })
  }
}

export const unblockUser = (token: string | null, userId: number | null) => {
  if (token && userId) {    
    socket.emit(ChatConst.UNBLOCK_USER, { token, userId })
  }
}

export const clearGroupChat = (token: string | null, groupId: number | null | undefined) => {
  if (token && groupId) {
    console.log("== Group ID ===", groupId, token);
    socket.emit(ChatConst.CLEAR_GROUP_CHAT, { token, groupId })
  }
}

export const pinChatmessage = (token: string | null, groupId: number | null | undefined, msgId: number | null) => {
  if (token && msgId) {
    socket.emit(ChatConst.PIN_MESSAGE, { token, groupId, msgId })
  }
}

export const unpinChatmessage = (token: string | null, groupId: number | null | undefined, msgId: number | null) => {
  if (token && msgId) {
    socket.emit(ChatConst.UNPIN_MESSAGE, { token, groupId, msgId })
  }
}

export const getPinnedMessages = (token: string | null, groupId: number | null) => {
  if (token && groupId) {
    socket.emit(ChatConst.GET_PINNED_MESSAGES, { token, groupId })
  }
}

export const addListenerToGroup = (token: string | null, groupId: number | null, userId: number | null) => {
  if (token && groupId && userId) {    
    socket.emit(ChatConst.ADD_LISTENER_GROUP, { token, groupId, userId })
  }
}

export const userJoinToGroup = (token: string | null, groupId: number | null | undefined, userId: number | null) => {
  if (token && groupId && userId) {
    socket.emit(ChatConst.JOIN_TO_GROUP, { token, groupId, userId })
  }
}

export const anonJoinToGroup = (groupId: number | null | undefined, anonId: number | null | undefined) => {
  if (groupId && anonId) {
    console.log(`🔍 Anonymous user ${anonId} joining group ${groupId}`);
    socket.emit(ChatConst.JOIN_TO_GROUP_ANON, { groupId, anonId })
  }
}

export const timeoutGroupUser = (token: string | null, groupId: number | null | undefined, userId: number | null) => {
  if (token && groupId && userId) {
    socket.emit(ChatConst.TIMEOUT_USER, { token, groupId, userId })
  }
}

export const readGroupMsg = (token: string | null, groupId: number | null) => {
  if (token && groupId) {
    socket.emit(ChatConst.READ_GROUP_MSG, { token, groupId })
  }
}

export const getGroupOnlineUsers = (token: string | null, groupId: number | null | undefined) => {
  if (token && groupId) {
    socket.emit(ChatConst.GET_GROUP_ONLINE_USERS, { token, groupId })
  }
}

export const getBannedUsers = (token: string | null, groupId: number | null | undefined) => {
  if (token && groupId) {
    console.log(`🚫 Requesting banned users for group ${groupId}`);
    socket.emit(ChatConst.GET_BANNED_USERS, { token, groupId })
  }
}

export const getIpBans = (token: string | null, groupId: number | null | undefined) => {
  if (token && groupId) {
    console.log(`🚫 Requesting IP bans for group ${groupId}`);
    socket.emit(ChatConst.GET_IP_BANS, { token, groupId })
  }
}

export const unbanGroupIps = (token: string | null, groupId: number | null | undefined, ipAddresses: string[]) => {
  if (token && groupId) {
    console.log(`🚫 Unbanning IPs ${ipAddresses} from group ${groupId}`);
    socket.emit(ChatConst.UNBAN_GROUP_IPS, { token, groupId, ipAddresses })
  }
}

export const getChatRules = (token: string | null, groupId: number | null) => {
  console.log('🔍 [Chat Rules] getChatRules called with groupId:', groupId, 'token:', token ? 'Available' : 'Missing');
  if (token && groupId) {
    socket.emit(ChatConst.GET_CHAT_RULES, { token, groupId });
    console.log('🔍 [Chat Rules] Emitted GET_CHAT_RULES event');
  } else {
    console.log('🔍 [Chat Rules] Cannot emit GET_CHAT_RULES - missing token or groupId');
  }
}

export const updateChatRules = (token: string | null, groupId: number | null, chatRules: string, showChatRules: boolean) => {
  console.log('🔍 [Chat Rules] updateChatRules called with:', { groupId, chatRules: chatRules?.length, showChatRules });
  if (token && groupId) {
    socket.emit(ChatConst.UPDATE_CHAT_RULES, { token, groupId, chatRules, showChatRules });
    console.log('🔍 [Chat Rules] Emitted UPDATE_CHAT_RULES event');
  } else {
    console.log('🔍 [Chat Rules] Cannot emit UPDATE_CHAT_RULES - missing token or groupId');
  }
}