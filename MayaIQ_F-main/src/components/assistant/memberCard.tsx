/**
 * @author       Mykola
 * @published    June 21, 2024
 * @description
 ** This is the page for the memberCard for PingBash
 */
'use client'

import React from "react"
import Image from "next/image"
import { SERVER_URL } from "@/resource/const/const"

const MemberCard: React.FC = () => {
    return (
        <div className="max-w-xs overflow-hidden">
            <Image className="rounded-xl" src={`${SERVER_URL}/uploads/users/1718369685945.jpg`} width={200} height={100} alt="" style={{ width: "100%", height: "auto" }} priority />
            <div className="flex justify-between px-0">
                <p className="text-gray-800 text-md font-extrabold py-2"> John Doe </p>
                <Image className="pr-0 w-[16px] h-[16px]" src={`/assets/light/assistant/check_circle.svg`} alt="" width={100} height={100} />
            </div>
            <div className="truncate">
                <strong className="bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-transparent bg-clip-text">$2499</strong>
                <span className="text-sm ms-1">per post</span>
            </div>
        </div>
    )

}

export default MemberCard