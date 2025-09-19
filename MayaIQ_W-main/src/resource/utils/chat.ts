import { SERVER_URL } from "../const/const";
import io from "socket.io-client";
import ChatConst from "../const/chat_const";
import { validateTokenFormat } from "./auth";
import { makeTextSafe } from "./helpers";

export const socket = io(SERVER_URL);

// Add socket connection debugging
socket.on('connect', () => {
  console.log('🔍 [W] Socket connected successfully!', socket.id);
});

socket.on('disconnect', () => {
  console.log('🔍 [W] Socket disconnected');
});

socket.on('connect_error', (error) => {
  console.error('🔍 [W] Socket connection error:', error);
});

// Log all socket events for debugging
socket.onAny((eventName, ...args) => {
  console.log('🔍 [W] Socket received event:', eventName, args);
});

export const userLoggedIn = (token: string | null) => {
  console.log("🔍 [W] userLoggedIn called with token:", token ? "Available" : "Missing");
  if (token) { 
    socket.emit(ChatConst.USER_LOGGED, { token }) 
  } else {
    socket.emit(ChatConst.USER_OUT) 
  }

}

export const userRegistered = () => socket.emit(ChatConst.USER_REGISTER)
export const userLoggedOut = () => socket.emit(ChatConst.USER_OUT)

export const getUsers = (token: string | null) => {
  if (token)
    socket.emit(ChatConst.GET_USERS, { token })
}

export const registerAsAnon = (userId: number | null) => {
  if (userId)
    socket.emit(ChatConst.USER_LOGGED_AS_ANNON, { userId })
}

export const loginAsReal = (token: string | null, groupId: number | undefined, anonId: number | null) => {
  console.log(anonId, "\\", groupId, "\\", token);
  if (token && groupId && anonId)
    socket.emit(ChatConst.USER_LOGGED_WILD_SUB, {token, groupId, anonId})
}

export const getGroups = (token: string | null) => {
  if (token)
    socket.emit(ChatConst.GET_GROUPS, { token })
}

export const sendMsg = (to: number | null | undefined, msg: string, token: string | null) => {
  let message = makeTextSafe(msg)
  socket.emit(ChatConst.SEND_MSG, { to, msg: message, token })
}

export const sendGroupMsg = (
  groupId: number | null | undefined, 
  msg: string, 
  token: string | null, 
  receiverId: number | null,
  parent_id: number | null | undefined
) => {
  let message = makeTextSafe(msg);
  if (token?.startsWith("anon")) {
    const anonId = Number(token.slice(4))
    console.log("=== Token ====", anonId)
    socket.emit(ChatConst.SEND_GROUP_MSG_ANON, { groupId, msg: message, anonId, receiverId, parent_id })
  } else {
    console.log("=== Token ====", token)
    socket.emit(ChatConst.SEND_GROUP_MSG, { groupId, msg: message, token, receiverId, parent_id })
  }  
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
  console.log("🔍 [W] getGroupMessages called - Group:", groupId, "Token exists:", !!token);
  
  if (!token) {
    console.error("❌ [W] Cannot get group messages: Token is null or undefined");
    return;
  }
  
  if (!groupId) {
    console.error("❌ [W] Cannot get group messages: Group ID is null or undefined");
    return;
  }

  // Validate token format before sending
  const validation = validateTokenFormat(token);
  if (!validation.isValid) {
    console.error("❌ [W] Invalid token format detected:", validation.error);
    return;
  }
  console.log("✅ [W] Token validation passed, type:", validation.type);
  
  console.log("🔍 [W] Emitting GET_GROUP_MSG for group:", groupId, "with token:", token.substring(0, 20) + "...");
  socket.emit(ChatConst.GET_GROUP_MSG, { token, groupId })
}

export const listenGroupMessages = (token: string | null, groupId: string) => {
  if (token && groupId)  
    socket.emit(ChatConst.LISTEN_GROUP_MSG, { groupId })
}

export const getHistory = (token: string | null, target: number | null | undefined, limit: number | null) => {
  if (target && limit && token)
    socket.emit(ChatConst.GET_HISTORY, { token, target, limit })
}

export const getGroupHistory = (token: string | null, target: number | null | undefined, limit: number | null) => {
  if (target && limit && token)
    socket.emit(ChatConst.GET_GROUP_HISTORY, { token, target, limit })
}

export const getGroupHistoryAnon = (target: number | null | undefined, limit: number | null) => {
  if (target && limit)
    socket.emit(ChatConst.GET_GROUP_HISTORY_ANON, { target, limit })
}

export const readMsg = (token: string | null, id: number | null) => {
  if (token && id) {
    socket.emit(ChatConst.READ_MSG, { token, id })
  }
}

export const deleteGroupMsg = (token: string | null, msgId: number, groupId: number | null | undefined) => {
  if (token && msgId && groupId) {
    socket.emit(ChatConst.DELETE_GROUP_MSG, { token, msgId, groupId })
  }
}

export const sendGroupNotify = (token: string | null, groupId: number | null, message: string) => {
  if (token && groupId && message) {
    socket.emit(ChatConst.SEND_GROUP_NOTIFY, { token, groupId, message })
  }
}

export const banGroupUser = (token: string | null, groupId: number | null | undefined, userId: number | null | undefined) => {
  console.log(token, ",", groupId, ",", userId);
  if (token && groupId && userId) {
    socket.emit(ChatConst.BAN_GROUP_USER, { token, groupId, userId })
  }
}

export const unbanGroupUser = (token: string | null, groupId: number | null | undefined, userId: number | null | undefined) => {
  if (token && groupId && userId) {
    socket.emit(ChatConst.UNBAN_GROUP_USER, { token, groupId, userId })
  }
}

export const unbanGroupUsers = (token: string | null, groupId: number | null | undefined, userIds: number[]) => {
  if (token && groupId && userIds) {
    console.log(userIds);
    socket.emit(ChatConst.UNBAN_GROUP_USERS, { token, groupId, userIds })
  }
}

export const readGroupMsg = (token: string | null, groupId: number | null) => {
  if (token && groupId) {
    socket.emit(ChatConst.READ_GROUP_MSG, { token, groupId })
  }
}

export const updateGroupFavInfo = (token: string | null, groupId: number | null | undefined, isMember: number | null) => {
  if (token && groupId)
    socket.emit(ChatConst.UPDATE_FAV_GROUPS, { token, groupId, isMember })
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

export const timeoutGroupUser = (token: string | null, groupId: number | null | undefined, userId: number | null) => {
  if (token && groupId && userId) {
    socket.emit(ChatConst.TIMEOUT_USER, { token, groupId, userId })
  }
}

export const getGroupOnlineUsers = (token: string | null, groupId: number | null | undefined) => {
  if (token && groupId) {
    socket.emit(ChatConst.GET_GROUP_ONLINE_USERS, { token, groupId })
  }
}

export const getChatRules = (token: string | null, groupId: number | null) => {
  console.log('🔍 [W] [Chat Rules] getChatRules called with groupId:', groupId, 'token:', token ? 'Available' : 'Missing');
  if (token && groupId) {
    socket.emit(ChatConst.GET_CHAT_RULES, { token, groupId });
    console.log('🔍 [W] [Chat Rules] Emitted GET_CHAT_RULES event');
  } else {
    console.log('🔍 [W] [Chat Rules] Cannot emit GET_CHAT_RULES - missing token or groupId');
  }
}

export const updateChatRules = (token: string | null, groupId: number | null, chatRules: string, showChatRules: boolean) => {
  console.log('🔍 [W] [Chat Rules] updateChatRules called with:', { groupId, chatRules: chatRules?.length, showChatRules });
  if (token && groupId) {
    socket.emit(ChatConst.UPDATE_CHAT_RULES, { token, groupId, chatRules, showChatRules });
    console.log('🔍 [W] [Chat Rules] Emitted UPDATE_CHAT_RULES event');
  } else {
    console.log('🔍 [W] [Chat Rules] Cannot emit UPDATE_CHAT_RULES - missing token or groupId');
  }
}

export const anonJoinToGroup = (groupId: number | null | undefined, anonId: number | null | undefined) => {
  if (groupId && anonId) {
    console.log(`🔍 [W] Anonymous user ${anonId} joining group ${groupId}`);
    socket.emit(ChatConst.JOIN_TO_GROUP_ANON, { groupId, anonId })
  }
}

export const getBannedUsers = (token: string | null, groupId: number | null | undefined) => {
  if (token && groupId) {
    console.log(`🚫 [W] Requesting banned users for group ${groupId}`);
    socket.emit(ChatConst.GET_BANNED_USERS, { token, groupId })
  }
}

export const getIpBans = (token: string | null, groupId: number | null | undefined) => {
  if (token && groupId) {
    console.log(`🚫 [W] Requesting IP bans for group ${groupId}`);
    socket.emit(ChatConst.GET_IP_BANS, { token, groupId })
  }
}

export const unbanGroupIps = (token: string | null, groupId: number | null | undefined, ipAddresses: string[]) => {
  if (token && groupId) {
    console.log(`🚫 [W] Unbanning IPs ${ipAddresses} from group ${groupId}`);
    socket.emit(ChatConst.UNBAN_GROUP_IPS, { token, groupId, ipAddresses })
  }
}