/**
 * @author       Mykola
 * @published    June 21, 2024
 * @description
 ** This is the page for message field for PingBash
 */
'use client'

import React from "react"
import Image from "next/image"
import MemberCard from "./memberCard"

const MessageField: React.FC = () => {
    return <>
        {/* Message from user*/}
        <div className="flex justify-end mb-4">
            <div className="sm:w-3/6 mr-2 py-3 px-4 bg-gradient-to-r from-[#0f00d41a] to-[#b300c81a] rounded-bl-xl rounded-tl-xl rounded-tr-xl text-black text-xs">
                Hey MayalQ, I&apos;m heading to Dublin to launch my beauty products and need 50 TikTok influencers to promote them and a venue to meet them all tomorrow at 7pm.
            </div>
        </div>
        {/* Message from AI */}
        <div className="flex flex-row justity-start mb-4 gap-[16px]">

            <Image className="w-[40px] h-[40px]" src={`/assets/light/assistant/assistant.svg`} alt="" width={100} height={100} />
            {/* Maya AI Answer */}
            <div className="flex flex-col gap-[8px]">
                <p className="text-[#0b3048] mb-2"> Maya AI</p>
                <div className="flex flex-col gap-[20px] py-3 px-4 bg-gradient-to-r from-[#0f00d41a] to-[#b300c81a] rounded-bl-xl rounded-tl-xl rounded-tr-xl">
                    {/* Summary Content from AI */}
                    <p className="rounded-br-3xl rounded-tr-3xl rounded-tl-xl text-black text-sm font-normal">
                        Absolutely! Here&apos;s a list of 50 TikTok influencers. Please select the ones you&apos;d like me to invite. I&apos;ve also gathered options for nails salons iN close to your location. Additionally, I&apos;ve found all available venues that provide your favourite fruits s and can host your event tomorrow at 7pm. Choose which one you&apos;d like me to book. Let&apos;s make your launch and nail appointment perfect!
                    </p>
                    {/* Image field */}
                    <div className="flex flex-col gap-[10px] flex-wrap">
                        <p className="text-md font-extrabold">TikTok Influencers</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3 gap-4">
                            <MemberCard />
                            <MemberCard />
                            <MemberCard />
                            <MemberCard />
                            <MemberCard />
                            <MemberCard />
                            <MemberCard />
                            <MemberCard />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>

}

export default MessageField