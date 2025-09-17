
'use client'

import Image from "next/image";
import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { SERVER_URL } from "@/resource/const/const";

interface GroupCardProps {
  groupId: number;
  groupName: string;
  groupCreaterId: number;
  ismember: boolean;
  myId: number;
  onJoinGroup: (groupId: number) => void;
  onLeaveGroup: (groupId: number) => void;
  onDeleteGroup: (groupId: number) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
    groupId, 
    groupName, 
    groupCreaterId, 
    ismember,
    myId,
    onJoinGroup, 
    onLeaveGroup,
    onDeleteGroup
}) => {
  // Add this function to handle the "Chat Now" button click  

  const joinGroup = () => {
    onJoinGroup(groupId);
  }

  const leaveGroup = () => {
    onLeaveGroup(groupId);
  }

  const deleteGroup = () => {
    onDeleteGroup(groupId);
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full rounded-[18px] truncate p-5 shadow-md shadow-gray-500 cursor-pointer">
        
        <div className="py-1">
          <h4 className="truncate">{groupName}</h4>
        </div>
        <div className="text-sm grid grid-cols-2">
            {}
          {groupCreaterId != myId && !ismember && <button className="flex items-center w-full font-semibold float-right-chil" onClick={joinGroup}>
            {/* <Image
              className="inline-block px-[1px]"
              src={`/assets/viewProfile.svg`}
              alt="view profile"
              width={100}
              height={100}
              style={{ width: "auto", height: "1.1em" }}
              priority
            /> */}
            <span className="inline-block text-sm truncate bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent">Join Group</span>
          </button>}
          {groupCreaterId != myId && ismember && <button className="flex items-center w-full font-semibold float-right-chil" onClick={leaveGroup}>
            {/* <Image
              className="inline-block px-[1px]"
              src={`/assets/chatNow.svg`}
              alt="Leave Group"
              width={100}
              height={100}
              style={{ width: "auto", height: "1.1em" }}
              priority
            /> */}
            <span className="inline-block text-sm truncate bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent">Leave Group</span>
          </button>}
          {groupCreaterId == myId && <button className="flex items-center w-full font-semibold float-right-chil" onClick={deleteGroup}>
            {/* <Image
              className="inline-block px-[1px]"
              src={`/assets/chatNow.svg`}
              alt="Leave Group"
              width={100}
              height={100}
              style={{ width: "auto", height: "1.1em" }}
              priority
            /> */}
            <span className="inline-block text-sm truncate bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent">Delete Group</span>
            </button>}
        </div>
      </div>
    </Suspense>
  );
};
export default GroupCard;