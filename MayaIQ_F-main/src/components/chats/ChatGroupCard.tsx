
'use client'

import Image from "next/image";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { ChatUser } from "@/interface/chatInterface";
import { SERVER_URL } from "@/resource/const/const";

interface ChatGroupCardProps {
  groupId: number;
  groupName: string;
  groupCreaterId: number;
  groupCreaterName: string | null;
  members: ChatUser[];
  myId: number;
  selectedGroupId: number | null | undefined;
  banned: number | null,
  unban_request: number | null,
  onClick: (groupId: number) => void;
  onBanLabelClick: (groupId: number, userId: number, unban_request_sent: number | null) => void;
}

const ChatGroupCard: React.FC<ChatGroupCardProps> = ({
    groupId, 
    groupName, 
    groupCreaterId, 
    groupCreaterName,
    members,
    myId,
    selectedGroupId,
    banned,
    unban_request,
    onClick,
    onBanLabelClick
}) => {
  // Add this function to handle the "Chat Now" button click  

  const onGroupClicked = () => {
    onClick(groupId);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={`min-h-[56px] w-full truncate shadow-md cursor-default ${selectedGroupId == groupId ? "bg-gray-400" : "bg-gray-100"} `} onClick={onGroupClicked}>        
        <div className="relative px-4 py-4">
          <h4 className="truncate">
            {groupName}</h4>
          {banned == 1 && 
          <p className={`text-[12px] cursor-pointer truncate absolute top-2 right-4 ${groupCreaterId == myId ? "text-[#8888FF]" : "text-gray-600"}`}
           onClick={() => onBanLabelClick(groupId, myId, unban_request)}>You are banned.</p>}
          <p className={`text-[12px] cursor-default truncate absolute bottom-2 right-4 ${groupCreaterId == myId ? "text-[#8888FF]" : "text-gray-600"}`}>Created by {groupCreaterId == myId ? "Me" : groupCreaterName}</p>
        </div>
      </div>
    </Suspense>
  );
};
export default ChatGroupCard;