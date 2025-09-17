import React from "react";
import ButtonComponent from "../buttonGroup";
import Image from "next/image";

const Easily = () => {
  return (
    <>
      {/* This is a part for Easily Find Best quality service People with AI */}
      <div className="easily_part flex w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-[230px] max-[1135px]:flex-col items-center justify-center gap-[60px] h-[636px] max-[1135px]:h-auto mx-auto py-[80px]">
        <div className="w-[620px] max-[650px]:w-full flex flex-col gap-[25px] justify-center items-center shrink">
          <div className="easily_tagline text-white text-[60px] max-[1135px]:text-[40px] leading-[66px] max-[1135px]:leading-[44px] font-semibold">
            Easily Find Best quality service
          </div>
          <div className="text-[16px] leading-[24px] text-[#9CA3A] text-[#9CA3AF]">
            PingBash Description Here.
          </div>

          {/* This is a part for buttons */}
          <ButtonComponent />
        </div>

        <Image src="/assets/chatbot.svg" alt="" width={300} height={300} className="w-[406px] h-[476px] max-[650px]:w-[480px] inline-block" priority />
      </div>
    </>
  );
};

export default Easily;
