
import React from "react"
import Image from "next/image"

const Benefits: React.FC = () => {
  return (
    <div id="benefits" className="flex max-[1135px]:flex-col items-center w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-full gap-[60px] mx-auto text-white max-[1135px]:py-[80px]" >
      <div className="benefits-left max-[650px]:w-[230px] gap-[33px] flex flex-col">
        <div className="flex flex-col gap-[13px]">
          <h1 className="text-[60px] max-[1135px]:text-[40px] leading-[66px] max-[1135px]:leading-[44px] text-white font-semibold">Benefits</h1>
          <p className="text-[16px] leading-[24px] text-[#9CA3AF] w-full">
            Lorem ipsum dolor sit amet consectetur. Lacus faucibus vivamus
            ut nunc commodo massa diam amet. Consequat eu nibh aliquam diam
            eget mauris tempor posuere.
          </p>
        </div>
        <Image className="sss w-full rounded-[40px] max-[1135px]:h-[230px] max-[650px]:w-[230px] max-[1135px]:object-cover" src="/images/chatbot.png" alt="Chatbot image" width={1000} height={1000} />
      </div>
      <div className="benefits-right max-[650px]:w-[230px] flex flex-col gap-[50px]">
        {/* First row */}
        <div className="row flex justify-between items-center gap-[24px] max-[1135px]:flex-col  max-[1135px]:items-start">
          <Image className="w-[60px] h-[60px]" src="/images/avatar1.png" alt="Avatar for AI Driven Business" width={300} height={300} />
          <div className="flex flex-col gap-[8px] w-full">
            <h4 className="text-[24px] max-[1135px]:text-[20px] leading-[29.05px] max-[1135px]:leading-[24.2px]">
              AI Driven Business Growth
            </h4>
            <p className="text-[16px] leading-[24px] text-[#9CA3AF] ">
              Lorem ipsum dolor sit amet consectetur. Quis arcu accumsan
              enim sem phasellus dis ullamcorper.
            </p>
          </div>
        </div>

        {/* Second row */}
        <div className="row flex justify-between items-center gap-[24px] max-[1135px]:flex-col  max-[1135px]:items-start">
          <Image className="w-[60px] h-[60px]" src="/images/avatar2.png" alt="Avatar for Save Time" width={100} height={100} />
          <div className="flex flex-col gap-[8px] w-full">
            <h4 className="text-[24px] max-[1135px]:text-[20px] leading-[29.05px] max-[1135px]:leading-[24.2px]">Save Time</h4>
            <p className="text-[16px] leading-[24px] text-[#9CA3AF]">
              Lorem ipsum dolor sit amet consectetur. Quis arcu accumsan
              enim sem phasellus dis ullamcorper.
            </p>
          </div>
        </div>

        {/* Third row */}
        <div className="row flex justify-between items-center gap-[24px] max-[1135px]:flex-col  max-[1135px]:items-start">
          <Image src="/images/avatar3.png" className="w-[60px] h-[60px]" alt="Avatar for Super Fast AI " width={100} height={100} />
          <div className="flex flex-col gap-[8px] w-full">
            <h4 className="text-[24px] max-[1135px]:text-[20px] leading-[29.05px] max-[1135px]:leading-[24.2px]">
              Super Fast AI Response
            </h4>
            <p className="text-[16px] leading-[24px] text-[#9CA3AF]">
              Lorem ipsum dolor sit amet consectetur. Quis arcu accumsan
              enim sem phasellus dis ullamcorper.
            </p>
          </div>
        </div>

        {/* Firth row */}
        <div className="row flex justify-between items-center gap-[24px] max-[1135px]:flex-col  max-[1135px]:items-start">
          <Image className="w-[60px] h-[60px]" src="/images/avatar4.png" alt="Avatar for Best Quality" width={100} height={100} />
          <div className="flex flex-col gap-[8px] w-full">
            <h4 className="text-[24px] max-[1135px]:text-[20px] leading-[29.05px] max-[1135px]:leading-[24.2px]">
              Best Quality Services
            </h4>
            <p className="text-[16px] leading-[24px] text-[#9CA3AF]">
              Lorem ipsum dolor sit amet consectetur. Quis arcu accumsan
              enim sem phasellus dis ullamcorper.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Benefits;
