// messagesSlice.ts
import { MessageUnit, selectedUserDetail, User, ChatGroup } from '@/interface/chatInterface';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MessagesState {
  messageList: MessageUnit[];
  unreadCount: number;
  selectedChatUser: selectedUserDetail | null;
  selectedChatGroup: ChatGroup | null;
  chatUserList: User[];
  myGroupList: ChatGroup[];
  favoriteGroupList: ChatGroup[];
}

const initialState: MessagesState = {
  messageList: [],
  unreadCount: 0,
  selectedChatUser: null,
  selectedChatGroup: null,
  chatUserList: [],
  myGroupList: [],
  favoriteGroupList: []
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setMessageList: (state, action: PayloadAction<MessageUnit[]>) => {
      if (Array.isArray(action.payload)) {
        state.messageList = [...action.payload]
      };
    },
    setSelectedChatUser: (state, action: PayloadAction<selectedUserDetail>) => {
      state.selectedChatUser = action.payload
    },
    setSelectedChatGroup: (state, action: PayloadAction<ChatGroup>) => {
      state.selectedChatGroup = action.payload
    },
    setChatUserList: (state, action: PayloadAction<User[]>) => {
      state.chatUserList = [...action.payload]
    },
    setMyGroupList: (state, action: PayloadAction<ChatGroup[]>) => {
      state.myGroupList = [...action.payload]
    },
    setFavoriteGroupList: (state, action: PayloadAction<ChatGroup[]>) => {
      state.favoriteGroupList = [...action.payload]
    }
  },
});

export const { setMessageList, setSelectedChatUser, setChatUserList, setMyGroupList, setSelectedChatGroup, setFavoriteGroupList } = messagesSlice.actions;
export default messagesSlice.reducer;
