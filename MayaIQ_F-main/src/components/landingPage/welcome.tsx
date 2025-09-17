import React from "react";
import ButtonComponent from "../buttonGroup";
import WhyPingBash from "./whyPingBash";
import Image from "next/image";

const Welcome: React.FC = () => {
  return (
    <div className="gap-[30px] flex flex-col">
      {/* This is a part for Welcome To MayalQ */}
      <div className="text-container flex flex-col items-center w-[1120px] mx-auto max-[1135px]:w-[620px] max-[650px]:w-[85%] gap-[60px] px-[80px] max-[1135px]:px-0 pt-[50px] ">
        <div className="flex flex-col items-center gap-[10px] max-[650px]:w-full">
          <div className="text-[48px]  max-[650px]:text-[32px] max-[1135px]:leading-[51.36px] text-white text-center font-semibold leading-[85.6px]">
            A Free Chatbox for your website
          </div>
          <div className=" text-[22px] leading-[28.8px] font-semibold text-[#9CA3AF] max-[1135px]:text-[16px] max-[1135px]:leading-[25.6px]">
            Create a free group chatbox in seconds
          </div>
        </div>
        <WhyPingBash />
        <ButtonComponent />
      </div>

      {/* This is a part for laptop image area */}
      
    </div>
  );
};

export default Welcome;
