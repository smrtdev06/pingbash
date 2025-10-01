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
  faClose,
  faReply,
  faEllipsisVertical
} from "@fortawesome/free-solid-svg-icons";
import { 
  getMessages, 
  getUsers, 
  deleteMsg,
  getFriends,
  addFriend,
  getSearchUsers,
  sendMsg, 
  socket, 
  readMsg,
  getBlockedUsers,
  unblockUser
 } from "@/resource/utils/chat";
import { useRouter, useSearchParams } from "next/navigation";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import ChatConst from "@/resource/const/chat_const";
import { FONT_SIZE, MSG_COLOR, MSG_DATE_COLOR, REPLY_MGS_COLOR, SERVER_URL, SHOW_USER_IMG, TOKEN_KEY, USER_ID_KEY } from "@/resource/const/const";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { chatDate } from "@/resource/utils/helpers";
import { MessageUnit, User, ChatOption } from "@/interface/chatInterface";
import { setMessageList } from "@/redux/slices/messageSlice";
import toast from "react-hot-toast";
import messages from "@/resource/const/messages";
import axios from "axios";
import PreLoading from "@/components/mask/preLoading";
import { setIsLoading } from "@/redux/slices/stateSlice";
import ChatUserCard from "@/components/chats/ChatUserCard";
import ConfirmPopup from "@/components/ConfirmPopup";
import Lottie from "lottie-react"
import { stickers } from '../../components/chats/LottiesStickers';
import { useSound } from "@/components/chats/useSound";
import "../globals.css";


interface Attachment {
  type: string | null;
  url: string | null;
}

interface Group {
  id: number;
  name: string;
  creater_id: number;
  members: string[];
}

const ChatsContent: React.FC = () => {

  const [inputMsg, setInputMsg] = useState("")
  const [lastChatDate, setLastChatDate] = useState(1)
  const [showEmoji, setShowEmoji] = useState(false)
  const [search, setSearch] = useState("")
  const [attachment, setAttachment] = useState<Attachment>()

  const msgList: MessageUnit[] = useSelector((state: RootState) => state.msg.messageList)
//   const userList = useSelector((state: RootState) => state.msg.chatUserList)
//   const selectedUser = useSelector((state: RootState) => state.msg.selectedChatUser)

    const [inBoxUsers, setInboxUsers] = useState<User[]>([]);
    const [friends, setFriends] = useState<User[]>([]);
    const [blockedUsers, setBlockedUsers] = useState<User[]>([])
    const [searchedUsers, setSearchedUsers] = useState<User[]>([]);
    const [tableUsers, setTableUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const [prevMsgList, setPrevMsgList] = useState<MessageUnit[]>([]);

  // const [groups, setGroups] = useState<Group[]>([]);

  const params = useSearchParams();
  const dispatch = useDispatch()
  const router = useRouter();
  const imageUploadRef = useRef<HTMLInputElement | null>(null)
  const fileUploadRef = useRef<HTMLInputElement | null>(null)
  const inputMsgRef = useRef<HTMLInputElement | null>(null)
  const [isMobile, setIsMobile] = useState(false);  
  
  

  const [deleteMsgId, setDeleteMsgId] = useState<number | null>(null);
  const [openMsgDeleteConfirmPopup, setOpenMsgDeleteConfirmPopup] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const groupMemuPopoverRef = useRef<HTMLDivElement>(null);
  const msgItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [replyMsg, setReplyMsg] = useState<MessageUnit | null | undefined>();
  const [showMsgReplyView, setShowMsgReplyView] = useState<boolean | null>(null);
  const [tabIndex, setTabIndex] = useState(0);
  const [menuOptions, setMenuOptions] = useState<any[]>([]);
  const playBell = useSound("https://widget.pingbash.com/sounds/sound_bell.wav");

  const soundMenuPopoverRef = useRef<HTMLImageElement>(null);
  const [showChatBox, setShowChatBox] = useState(true)

  const [mySoundOptionId, setMySoundOptionId] = useState<number | null | undefined>(null);
  const [soundSelectedOption, setSoundSelectedOption] = useState<string | null | undefined>(null);
  const soundSettingOptions = [
    {val: "every", name: "On every message",  option_id: 1},
    {val: "reply", name: "Only on @replies",  option_id: 2},
    {val: "never", name: "Never",  option_id: 0}
  ];

  const tabs = [
    {
      label: "Inbox",
    },
    {
      label: "Friends",
    },
    {
      label: "Block List",
    },
  ];

  const [userNavShow, setUserNavShow] = useState(params.get("User") ? false : true)

  useEffect(() => {
    // load();
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    fetchSoundOption();
    getUsers(localStorage.getItem(TOKEN_KEY));
    getFriends(localStorage.getItem(TOKEN_KEY));
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {    
    console.log("===========", selectedUser)
    const userIsFriend = friends.find(user => user.Opposite_Id == selectedUser?.Opposite_Id) != null;
    setMenuOptions([
      {id: 1, name: userIsFriend ? "Remove from Friends" : "Add to Friends"},
      {id: 2, name: "Hide Chat"}
    ]);
  }, [friends, selectedUser]);

  const getCurrentUserId = (): number => {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (userId == null) {
      userId = "0";
    }
    return parseInt(userId);
  };

  useEffect(() => {
    const handleGetUsers = (data: User[]) => {
      if (blockedUsers?.length > 0) {
        // setInboxUsers(data.filter(user => blockedUsers.find(bu => bu.Opposite_Id == user.Opposite_Id) == null));
      } else {
        setInboxUsers(data)
      }   
    };
    const handleGetFriends = (data: User[]) => {
      if (blockedUsers?.length > 0) {
        setFriends(data.filter(user => blockedUsers.find(bu => bu.Opposite_Id == user.Opposite_Id) == null));
      } else {
        setFriends(data)
      }
    }

    const handleSearchFriends = (data: User[]) => {
      console.log("🔍 [Friends Search] Received search results:", data?.length, "users");
      console.log("🔍 [Friends Search] Search results:", data);
      setSearchedUsers(data);
    }

    const handleSendMsg = (data: MessageUnit[]) => {
      const receiver = data?.length && data[data.length - 1].Receiver_Id
      const sender = data?.length && data[data.length - 1].Sender_Id
      let currentUser = selectedUser?.Opposite_Id
      const latestMessage = data?.length && data[data.length - 1];
      const currentUserId = getCurrentUserId();
      
      console.log('📨 [Inbox] Received SEND_MSG:', {
        sender,
        receiver,
        currentUserId,
        selectedUser: currentUser,
        messageContent: latestMessage && typeof latestMessage === 'object' ? latestMessage.Content?.substring(0, 50) : ''
      });

      // Update message list if this message is for the currently selected chat
      if (receiver === currentUser || sender === currentUser) {
        const newList = mergeArrays(msgList, data);
        const prevLength = msgList == null ? 0 : msgList.length;
        const newLength = newList == null ? 0 : newList.length;
        if (prevLength + 1 == newLength) {
          if (newList[newLength - 1].Sender_Id != getCurrentUserId()) {
            
            if (mySoundOptionId == 1) {
              playBell();
            } else if (mySoundOptionId == 2) {
              if (newList[newLength - 1].parent_id != null) {
                const toMsgId = newList[newLength - 1].parent_id;
                const toMsg = msgList.find(msg =>  msg.Id == toMsgId);
                if (toMsg?.Sender_Id == getCurrentUserId()) {
                  playBell();
                }
              }
            }          
          }
        }
        setPrevMsgList(msgList);
        dispatch(setMessageList([...newList]))
      }
      
      // ALWAYS update inbox user list for ANY message involving current user
      // (not just for selected chat)
      if (latestMessage && (latestMessage.Sender_Id === currentUserId || latestMessage.Receiver_Id === currentUserId)) {
        const oppositeUserId = latestMessage.Sender_Id === currentUserId 
          ? latestMessage.Receiver_Id 
          : latestMessage.Sender_Id;
        
        console.log('📨 [Inbox] Updating inbox list for user:', oppositeUserId);
        
        // Update the inbox users list
        setInboxUsers(prevUsers => {
          // Find the user in the list
          const userIndex = prevUsers.findIndex(u => u.Opposite_Id === oppositeUserId);
          
          if (userIndex !== -1) {
            // User exists - update their last message and move to top
            const updatedUser = {
              ...prevUsers[userIndex],
              Content: latestMessage.Content,
              Send_Time: latestMessage.Send_Time,
              Sender_Id: latestMessage.Sender_Id,
              Receiver_Id: latestMessage.Receiver_Id
            };
            
            console.log('📨 [Inbox] User found at index', userIndex, '- moving to top with new message');
            
            const newUsers = [
              updatedUser,
              ...prevUsers.filter((_, idx) => idx !== userIndex)
            ];
            
            return newUsers;
          } else {
            // User doesn't exist - they might be a new conversation
            console.log('📨 [Inbox] User not found in inbox - requesting refresh');
            // Request full user list refresh
            getUsers(localStorage.getItem(TOKEN_KEY));
            return prevUsers;
          }
        });
      }
    }

    
    
    socket.on(ChatConst.GET_BLOCKED_USERS_INFO, handleGetBlockedUsers);

    // Register socket listener
    socket.on(ChatConst.GET_USERS, handleGetUsers);
    socket.on(ChatConst.GET_FRIEND_USERS, handleGetFriends);
    socket.on(ChatConst.GET_SEARCH_USERS, handleSearchFriends);
    socket.on(ChatConst.GET_MSG, (data) => {
      dispatch(setMessageList(data))
    })
    socket.on(ChatConst.SEND_MSG, handleSendMsg)

    // Cleanup to avoid memory leaks and invalid state updates
    return () => {
      socket.off(ChatConst.GET_USERS, handleGetUsers);
      socket.off(ChatConst.GET_FRIEND_USERS, handleGetFriends);
      socket.off(ChatConst.GET_SEARCH_USERS, handleSearchFriends);
      socket.off(ChatConst.GET_BLOCKED_USERS_INFO, handleGetBlockedUsers);
      socket.off(ChatConst.GET_MSG, (data) => {
        dispatch(setMessageList(data))
      })
      socket.off(ChatConst.SEND_MSG, handleSendMsg)
    };
  }, [selectedUser, msgList, mySoundOptionId, blockedUsers]);

  const handleGetBlockedUsers = (data: User[]) => {
    dispatch(setIsLoading(false));
    setBlockedUsers(data)
  }

  function mergeArrays(oldArray: MessageUnit[], newArray: MessageUnit[]): MessageUnit[] {
    const oldMap = new Map(oldArray.map(item => [item?.Id, item]));
    for (const newItem of newArray) {
      oldMap.set(newItem?.Id, newItem); // updates existing or adds new
    }
    return Array.from(oldMap.values());
  }

  // Get message list for selected each one
  

    // const updatedList = userList.map((user) => {
    //   if (user.Opposite_Id === sender) {
    //     const unreadCount = typeof user.Unread_Message_Count === 'number' ? user.Unread_Message_Count : parseInt(user.Unread_Message_Count) || 0;
    //     const newUnreadCount = unreadCount + 1;
    //     return { ...user, Unread_Message_Count: newUnreadCount };
    //   } else {
    //     return user;
    //   }
    // });

    // dispatch(setChatUserList([...updatedList]));
  
  // Receive updated message afer delete group message.
  socket.on(ChatConst.DELETE_MSG, (data) => { 
    const updateMsgList = msgList.filter(msg => msg.Id != data);
    setPrevMsgList(msgList);
    dispatch(setMessageList([...updateMsgList]))
  });

  // Receive the signal with socket for the new user login
  socket.on(ChatConst.LOGGED_NEW_USER, (data) => {
    const { ID, Socket } = data;

    // Assuming userList is accessible here
    // const updatedList = userList.map((user) => {
    //   if (user.Opposite_Id === ID) {
    //     return { ...user, Opposite_Id: ID, Socket };
    //   } else {
    //     return user;
    //   }
    // });
    // dispatch(setChatUserList([...updatedList]));
  });

  // Receive the signal with socket for the user logout
  socket.on(ChatConst.USER_OUT, (data) => {
    const oppositeId = data.ID;

    // const modifyList: User[] = userList.map(user => {
    //   if (user.Opposite_Id === oppositeId) {
    //     return { ...user, Socket: false };
    //   }
    //   return user;
    // });

    // dispatch(setChatUserList([...modifyList]));
  });

  // To get the chat hisotry with the selected user
  socket.on(ChatConst.GET_HISTORY, (data) => {
    // dispatch(setMessageList([...data]))
  })

  // when the time expired++
  socket.on(ChatConst.EXPIRED, () => {
    localStorage.clear()
    router.push(`/auth?Role=${params.get("Role")}&Collection=login`);
  })
  

  // The action for selected user
  useEffect(() => {
    if (tabIndex == 2) return
    const token = localStorage.getItem(TOKEN_KEY);
    const target = selectedUser?.Opposite_Id;
    getMessages(token, target);

    // const readList = userList.map((user) => user.Opposite_Id === selectedUser?.Id ? { ...user, Unread_Message_Count: 0 } : user);
    // dispatch(setChatUserList([...readList]));
  }, [selectedUser]);

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
    if (prevMsgList.length <= msgList.length) {
      scrollToBottom();
    }

  }, [msgList]);

  // The action for the message send action
  const sendMsgHandler = (type: string, value: string) => {
    if (attachment?.type && attachment.type === 'file') {
        console.log("==== Case 1 ====");
      sendMsg(selectedUser?.Opposite_Id, `<a className="inline-block text-cyan-300 hover:underline w-8/12 relative rounded-e-md" 
        href=${SERVER_URL + ""}/uploads/chats/files/${attachment.url}>File Name : ${attachment.url}</a>`
        , localStorage.getItem(TOKEN_KEY), replyMsg?.Id)
    } else if (attachment?.type && attachment.type === 'image') {
        console.log("==== Case 1 ====");
      sendMsg(selectedUser?.Opposite_Id, `<img src='${SERVER_URL}/uploads/chats/images/${attachment?.url}' alt="" />`, localStorage.getItem(TOKEN_KEY), replyMsg?.Id)
    } else {
        const token = localStorage.getItem(TOKEN_KEY);  
        if (type === "gif" || type === "sticker") {
            sendMsg(selectedUser?.Opposite_Id, value, token, replyMsg?.Id);
        } else {
            if (inputMsg.length > 0) {   
              console.log("==== Case 4 ====");    
                sendMsg(selectedUser?.Opposite_Id, inputMsg, token, replyMsg?.Id);      
                setInputMsg(""); 
                setShowEmoji(false);         
            }
        }
    }
    setReplyMsg(null);
    setShowMsgReplyView(false);
    setAttachment({ type: null, url: null })
  }  

  // The action for the user selected
  const userSelectHandler = (user:User) => {
    if (window.innerWidth < 810) { setUserNavShow(false); }
    setSelectedUser(user);
    if (tabIndex == 2 || blockedUsers.find(bu => bu.Opposite_Id == user.Opposite_Id) != null) return
    const token = localStorage.getItem(TOKEN_KEY)
    // To call the function to send the socket function to make the Read_Time to set    
    readMsg(token, user.Opposite_Id);

    // To remove the red badge
    // const readList = userList.map((user) => user.Opposite_Id === Id ? { ...user, Unread_Message_Count: 0 } : user);
    // dispatch(setChatUserList([...readList]));
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


  const messageDeleteButtonClicked = (msgId: number | null | undefined) => {
    setOpenMsgDeleteConfirmPopup(true);
    if (msgId == undefined || msgId == null) {
      return;
    }
    setDeleteMsgId(msgId);
  }

  const deleteMessage = () => {    
    if (deleteMsgId == null) return;
    const token = localStorage.getItem(TOKEN_KEY);
    const delMsg = msgList.find(msg => msg.Id == deleteMsgId);
    deleteMsg(token, deleteMsgId, delMsg?.Receiver_Id);
    setOpenMsgDeleteConfirmPopup(false);
    setDeleteMsgId(null);
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.keyCode === 27) setShowEmoji(false)
      // else if (event.keyCode === 13) sendGroupMsgHandler()
    }
    window.addEventListener("keydown", handleKeyDown)
    getMyBlockedUsers()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, []);

  const getMyBlockedUsers = () => {
    const token = localStorage.getItem(TOKEN_KEY)
    getBlockedUsers(token);
    dispatch(setIsLoading(true));
  }

  const onUnblockUser = (userId: number | null) => {
    const token = localStorage.getItem(TOKEN_KEY)
    unblockUser(token, userId);
    dispatch(setIsLoading(true));
  }
  
  const handleMenuClick = (menuId: number) => {
    groupMemuPopoverRef.current?.click();    
    if (menuId == 1) {        
      const willFriend = friends.find(user => user.Opposite_Id == selectedUser?.Opposite_Id) == null;
      addFriend(localStorage.getItem(TOKEN_KEY), selectedUser?.Opposite_Id ?? null, willFriend );
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
      return  <div className='text-[14px] mt-[3px]'>{value}</div>;
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
    const itemIndex = msgList.findIndex(msg => msg.Id === msgId);
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

  useEffect(() => {
    console.log("🔍 [Friends Search] Search term changed:", search);
    if (search != "") {
        console.log("🔍 [Friends Search] Calling getSearchUsers with search:", search);
        getSearchUsers(localStorage.getItem(TOKEN_KEY), search);
    } else {
        console.log("🔍 [Friends Search] Clearing search results");
        setSearchedUsers([]);
    }
  }, [search]); 
  
  useEffect(() => {
    if (tabIndex == 0) {
        getUsers(localStorage.getItem(TOKEN_KEY));
    } else if (tabIndex == 1) {
        getFriends(localStorage.getItem(TOKEN_KEY));
    } else if (tabIndex == 2) {
      if (blockedUsers.length == 0) {
        getMyBlockedUsers()
      }        
    }
  }, [tabIndex])

  useEffect(() => {
    console.log("🔍 [Friends Search] Setting table users - tabIndex:", tabIndex, "search:", search);
    if (tabIndex == 0) {
        console.log("🔍 [Friends Search] Inbox tab - showing", inBoxUsers?.length, "users");
        setTableUsers(inBoxUsers);
    } else if (tabIndex == 1) {
        if (search == "") {
            console.log("🔍 [Friends Search] Friends tab - showing", friends?.length, "friends");
            setTableUsers(friends);
        } else {
            console.log("🔍 [Friends Search] Friends tab - showing", searchedUsers?.length, "search results");
            setTableUsers(searchedUsers);
        }
    } else if (tabIndex == 2) {
      console.log("🔍 [Friends Search] Blocked tab - showing", blockedUsers?.length, "blocked users");
      setTableUsers(blockedUsers)
    }
  }, [tabIndex, inBoxUsers, friends, searchedUsers, search, blockedUsers]); 

  useEffect(() => {
    setShowChatBox(tabIndex != 2 && blockedUsers?.find(user => user.Opposite_Id == selectedUser?.Opposite_Id) == null)
  }, [tabIndex, blockedUsers, selectedUser])

  useEffect(() => {
    const updatedInboxUsers = inBoxUsers.filter(user => blockedUsers.find(bu => bu.Opposite_Id == user.Opposite_Id) == null);
    setInboxUsers(updatedInboxUsers)
    const updatedFriends = friends.filter(user => blockedUsers.find(bu => bu.Opposite_Id == user.Opposite_Id) == null);
    setFriends(updatedFriends)  
  }, [blockedUsers])

  function getAge (birthdate: string) {
    const birth = new Date(birthdate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();

    const monthDiff = today.getMonth() - birth.getMonth();
    const dayDiff = today.getDate() - birth.getDate();

    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  }

  function getUserInfoString(user: User)  {
    let str = "";
    if (user.gender) {
      str = user.gender.charAt(0)
    }
    if (user.birthday && getAge(user.birthday) > 0) {
      str = str + (str == "" ? "" : ", ") + getAge(user.birthday)
    }
    if (user.country && user.country != "null") {
      str = str + (str == "" ? "" : ", ") + user.country
    }
    return str;
  }

  return (
    <div className="page-container bg-white">
      <SideBar />
      {/* Chats Area Start */}
      <div className="content-wrapper w-full pl-[280px] max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
        <div className="page-content w-full pt-[12px] flex flex-col px-[24px] pb-[24px] relative max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px] max-[810px]:pb-[20px]">
          <PageHeader />
          <div className={`flex justify-stretch gap-[20px] w-full relative ${isMobile ? "h-mob-chatbox" : "h-[85vh]"}`}>
            {/* Chat Left Side Start ---Chat Hisotry */}
            <aside className={`w-[360px] pr-[5px] flex flex-col overflow-y-auto overflow-x-hidden duration-500 ${(userNavShow ? "flex max-[810px]:w-full" : "max-[810px]:hidden")} max-[810px]:gap-0`}>

                <div className="flex justify-center h-[40px] min-h-[40px]">
                    <TabBar
                        tabs={tabs}
                        activeIndex={tabIndex}
                        onTabClick={(index) => {
                            setTabIndex(index);
                        }}
                    />                
                </div>
              {/* Search Area Start */}
              {tabIndex == 1 && <div className="search-box sticky top-0 bg-white z-10 my-[8px] px-[12px] py-[8px]  gap-[10px] whitespace-nowrap rounded-[10px] flex items-center w-full border">
                <span className="max-[810px]:flex"><FontAwesomeIcon icon={faSearch} className="text-[14px]" /></span>
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none inline-block w-full text-[14px]" placeholder="Search or start a new chat" />
                {search != null && search != "" && <div className="h-[16px] flex items-center  whitespace-nowrap absolute top-[10px] right-0 gap-2 mr-[12px]">
                    <button onClick={() => {
                      setSearch("");
                    }}>
                      <FontAwesomeIcon icon={faClose} className="text-[16px] text-[#8A8A8A]"/>
                    </button>
                  </div>} 
              </div>}              
              {/* Search Area End*/}

              {/* User List Start  */}
              <div className="flex flex-col gap-[2px] w-[100%]">
                {tableUsers != undefined && tableUsers.length > 0 && tableUsers.map((user, idx) => (                  
                  // <ChatItem
                  //   onClick={() => userSelectHandler(user)}
                  //   key={`user-list-${idx}`}
                  //   id={user.Opposite_Id}
                  //   avatar={user.Opposite_Photo_Name ? `${SERVER_URL}/uploads/users/${user.Opposite_Photo_Name}` : "/assets/default-user.svg"}
                  //   alt="user"
                  //   title={getNameLabelStr(user)}
                  //   // title={user.Opposite_Id == getCurrentUserId()
                  //   //     ? tabIndex == 0 ? user.Opposite_Name + " (You)" :  user.Opposite_Name
                  //   //     : user.Opposite_Name}
                  //   subtitle={`${user.Opposite_Profession == undefined ? user.Content ?? "" : user.Opposite_Profession}`}
                  //   className={`${selectedUser?.Opposite_Id === user.Opposite_Id ? "bg-[#3a7cff4d]" : ""}`}
                  //   dateString={chatDate(`${user.Send_Time}`)}
                  //   unread={0} //Number(user.Unread_Message_Count)
                  //   statusColor={user.Socket ? "#00BF63" : "gray"}
                  // />
                  <ChatUserCard
                    onClick={() => userSelectHandler(user)}
                    key={`user-list-${idx}`}
                    id={user.Opposite_Id}
                    avatar={user.Opposite_Photo_Name ? `${SERVER_URL}/uploads/users/${user.Opposite_Photo_Name}` : "/assets/default-user.svg"}
                    alt="user"
                    title={user.Opposite_Name}
                    infoStr={getUserInfoString(user)}
                    // title={user.Opposite_Id == getCurrentUserId()
                    //     ? tabIndex == 0 ? user.Opposite_Name + " (You)" :  user.Opposite_Name
                    //     : user.Opposite_Name}
                    subtitle={`${user.Opposite_Profession == undefined ? user.Content ?? "" : user.Opposite_Profession}`}
                    className={`${selectedUser?.Opposite_Id === user.Opposite_Id ? "bg-[#3a7cff4d]" : ""}`}
                    dateString={chatDate(`${user.Send_Time}`)}
                    unread={0} //Number(user.Unread_Message_Count)
                    isBlocked={blockedUsers.find(u => u.Opposite_Id == user.Opposite_Id) != null}
                    statusColor={user.Socket ? "bg-[#00BF63]" : "bg-gray-400"}
                    onUnblock={onUnblockUser}
                  />
                ))}
              </div>
            </aside>
            {/* Chat Left Side End ---Chat History */}

            {/* Chat Right Side Start ---Message History */}
            <section className={`flex flex-col justify-between border rounded-[10px] w-[calc(100%-267px)] duration-500 ${userNavShow ? "max-[810px]:hidden" : "max-[810px]:w-full"} ${showChatBox ? "visible" : "invisible"}`}>

              {/* Chat Right Side Header Start */}
              {selectedUser != null && selectedUser.Opposite_Id && 
              <nav className="relative shadow-lg shadow-slate-300 select-none px-[16px] py-[8px] gap-[10px] border-b flex justify-between flex-wrap ">
                <div className="flex gap-[8px] items-center">
                  <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={userNavShow ? faArrowRight : faArrowLeft} onClick={() => setUserNavShow(!userNavShow)} /></span>
                  <Image className="target-user w-[48px] h-[48px] rounded-full" src={selectedUser?.Opposite_Photo_Name ? `${SERVER_URL}/uploads/users/${selectedUser.Opposite_Photo_Name}` : `/assets/default-user.svg`} alt="" width={100} height={100} />
                  <div className="mr-[120px]">
                    <p className="flex justify-start max-[810px]:flex-col items-center gap-[5px] whitespace-nowrap truncate">
                      <span className="text-[15px] font-bold truncate">{selectedUser?.Opposite_Name}</span>
                      <span className="text-[14px] truncate">{getUserInfoString(selectedUser)}</span>
                    </p> 
                    <p className="text-[14px] flex flex-col whitespace-normal break-words">
                      {selectedUser?.Opposite_Profession}                      
                    </p>                   
                  </div>
                </div>
                <p className="absolute top-[20px] right-[72px] flex items-center gap-[2px]">
                  <span className={`inline-block w-[8px] h-[8px] ${selectedUser?.Socket ? "bg-[#00BF63]" : "bg-gray-600"} rounded-full`}></span>
                  <span className="text-[12px] text-gray-600">{selectedUser?.Socket ? "Online" : "Offline"}</span>
                </p>
                
                <Popover placement="bottom-start" showArrow >
                    <PopoverTrigger>
                      <div 
                        className="absolute px-[18px] right-[20px] top-[20px] max-[810px]:flex cursor-pointer" 
                        ref={groupMemuPopoverRef}
                      >
                        <FontAwesomeIcon icon={faEllipsisVertical} className="text-[20px]" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="bg-white dark:bg-zinc-100 border rounded-md shadow-md w-64">
                    <ul className="flex flex-col gap-2">
                        {menuOptions.map((item, index) => (
                        <li
                            key={index}
                            className="px-3 py-1 rounded-md hover:bg-default-200 cursor-pointer"
                            onClick={() => handleMenuClick(item.id)}
                        >
                            {item.name}
                        </li>
                        ))}
                    </ul>
                    </PopoverContent>
                </Popover>
              </nav>            
            }
              {/* Chat Right Side Header End */}

              {/* Chat Article Start */}
              <article className="overflow-y-auto h-full flex flex-col px-[14px] pt-[20px] overflow-x-hidden min-h-20">
                <p className="text-center text-sm"><button onClick={() => setLastChatDate(lastChatDate + 1)}>Read More</button></p>
                <div className="flex flex-col gap-[6px] overflow-y-scroll" ref={scrollContainerRef} >
                  {msgList?.length ? msgList.map((message, idx) => {
                    if (message.Receiver_Id === selectedUser?.Opposite_Id || message.Sender_Id === selectedUser?.Opposite_Id) {
                      return (
                        <div key={idx} ref={setMsgItemRef(message.Id ?? -1)}>
                          <Message                            
                            key={`message-${idx}`}                          
                            messageId={message.Id}
                            avatar={message?.sender_avatar ? `${SERVER_URL}/uploads/users/${message.sender_avatar}` : null}
                            senderId={message.Sender_Id}
                            sender={message.sender_name}
                            content={`${message.Content}`}
                            sender_banned={message.sender_banned}
                            time={chatDate(`${message.Send_Time}`)}
                            read_time={message.Read_Time}
                            parentMsg={msgList.find(msg => msg.Id === message.parent_id)}
                            
                            show_avatar={SHOW_USER_IMG}
                            font_size={FONT_SIZE}
                            message_color={MSG_COLOR}
                            date_color={MSG_DATE_COLOR}
                            reply_message_color={REPLY_MGS_COLOR}

                            showPin={false}
                            isPinned={false}
                            isTabbed={false}
                            show_reply={true}

                            message={message}
                            group={null}
                            userId={getCurrentUserId()}

                            onDelete={messageDeleteButtonClicked}
                            onBanUser={() => {}}
                            onReplyMessage={(msgId) => {
                                setReplyMsg(msgList.find(msg => msg.Id === msgId));
                                setShowMsgReplyView(true);
                            }}
                            onReplyMsgPartClicked={(msgId) => {
                                scrollToRepliedMsg(msgId);
                            }}
                            onPinMessage={() => {}}
                            onEndedHighlight={() => {}}
                            onTimeOutUser={() => {}}
                            onBlockUser={() => {}}
                            />
                        </div>
                        
                      );
                    }
                    return null;
                  }) : ""}</div>
              </article>
              {/* Chat Article End */}
              <nav className={`max-[320px]:px-[5px] gap-[10px] flex flex-col border-t ${isMobile ? "p-[8px]" : "px-[12px] py-[6px]"}`}>
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
                    
                <div className="flex max-sm:flex-col-reverse justify-between gap-[10px] items-center">
                  
                  <div className="flex gap-[10px] min-w-[126px] relative cursor-pointer max-[810px]:w-full">
                    <Image onClick={() => imageUploadRef.current?.click()} className="w-[24px] h-[24px]" src={`/assets/light/chats/images.svg`} alt="" width={100} height={100} />
                    <input ref={imageUploadRef} type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                    <Image onClick={() => fileUploadRef.current?.click()} className="w-[24px] h-[24px]" src={`/assets/light/chats/paperclip.svg`} alt="" width={100} height={100} />
                    <input ref={fileUploadRef} type="file" onChange={handleFileUpload} className="hidden" />
                    {showEmoji &&
                    <div className=" absolute bottom-[3em] max-[810px]:bottom-[5.5em] w-[370px] h-[415px]">                      
                      <EmojiPicker
                        onSelect={(value) => {
                          console.log("Selected:", value)
                          // Example:
                          if (value.type === 'emoji') { setInputMsg(inputMsg + value.content); inputMsgRef.current?.focus() }
                          if (value.type === 'gif') {
                            sendMsgHandler("gif", "gif::"+value.content);
                            setInputMsg("");
                            setShowEmoji(false);
                          }
                          if (value.type === 'sticker') {
                            sendMsgHandler("sticker", "sticker::"+value.content);
                            setInputMsg("");
                            setShowEmoji(false);
                          }
                        }}
                      />
                    </div>}
                    <Image onClick={() => setShowEmoji(!showEmoji)} className={`w-[24px] h-[24px] ${showEmoji && "bg-gray-200"}`} src={`/assets/light/chats/smile.svg`} alt="" width={100} height={100} />
                    <Popover placement="bottom-start" showArrow >
                      <PopoverTrigger>
                        <Image 
                          className={`w-[24px] h-[24px] bg-gray-200`} 
                          src={mySoundOptionId == 0 || mySoundOptionId == null || mySoundOptionId == undefined ? `/assets/light/chats/speaker_off.svg` : `/assets/light/chats/speaker_on.svg`} 
                          alt="" 
                          width={100} 
                          height={100}
                          ref={soundMenuPopoverRef} />
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
                  <div className={`flex w-full items-center justify-between p-[6px] ${isMobile ? "pl-12px" : "pl-[16px]"} rounded-full border`}>
                    <input type="text" ref={inputMsgRef} onKeyDown={(e) => e.keyCode === 13 && sendMsgHandler("msg", "")} value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} className="w-full outline-none text-[14px] leading-[24px]" placeholder="Write a message" />
                    <button onClick={() => sendMsgHandler("msg", "")} className="h-[30px] active:translate-y-[2px] py-[3px] max-[320px]:px-[12px] px-[26px] rounded-full text-[14px] max-[320px]:text-[10px] text-white bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF]">
                      {isMobile ? <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={faPaperPlane} className="text-[16px]" /></span> : "Send"}
                    </button>
                  </div>
                </div>
                {/* Image Upload, File Upload, Emoticon End */}
              </nav>
            </section>
            {/* Chat Right Side Start ---Message History */}
          </div>
        </div>
      </div>
      {/* Chats Area End */}
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
