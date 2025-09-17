import Image from "next/image"
import React from "react"

interface AiHistoryItemProps {
  category: string;
  time: string;
  content: string;
  active: boolean;
}

const AiHistoryItem: React.FC<AiHistoryItemProps> = ({ category, time, content, active }) => {
  return (
    <div className={`ai-history ${active && "active"} cursor-pointer w-full rounded-[8px] flex justify-between items-center py-[12px] px-[14px]`}>
      <div className="flex flex-col gap-[8px] text-left">
        <h4 className="text-[14px] text-[#09132C] font-semibold">{category}</h4>
        <p className="text-[#5A6A9D] text-[12px] truncate">{content}</p>
      </div>
      <div className="flex flex-col gap-[8px] items-end">
        <span className="text-[10px] text-[#6B7280]">{time}</span>
        <Image className="w-[16px] h-[16px]" src={`/assets/chat-check.svg`} alt="" width={100} height={100} />
      </div>
    </div>
  )
}

export default AiHistoryItem