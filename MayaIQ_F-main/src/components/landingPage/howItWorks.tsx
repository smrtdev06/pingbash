import React from "react";
import Image from "next/image";

const HowItWorks: React.FC = () => {
  return (
    <>
      {/* This is for How it works page */}
      <div id="how-it-works" className="text-white w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-full h-[566px] max-[1135px]:h-auto mx-auto flex flex-col gap-[60px] justify-center">
        <div className="how-title flex flex-col gap-[20px] w-[634px] max-[1135px]:w-[620px] max-[650px]:w-[230px] mx-auto">
          <h1 className="title-header text-[60px] max-[1135px]:text-[40px] leading-[66px] max-[1135px]:leading-[44px] font-semibold text-center">
            How It Works?
          </h1>
          <p className="title-content text-center text-[16px] leading-[24px] text-[#D1D5DB]">
            PingBash Description Here.
          </p>
        </div>

        <div className="how-content flex max-[1135px]:flex-col mx-auto justify-between gap-[60px] w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-[230px]">
          {/* Content1 */}
          <div className="gap-[16px] flex flex-col w-[333px] max-[1135px]:w-full">
            <div className="content-header flex gap-[16px] items-center">
              <Image src="/images/union1.png" className="w-[60px] h-[60px]" alt="Union1" width={100} height={100} priority />
              <span className="title text-[24px] leading-[29.05px] font-semibold whitespace-nowrap truncate">
                Ask AI for Vendors
              </span>
            </div>
            <hr className="border border-[#7749e2]" />
            <div className="content-text text-[#9CA3AF] text-[16px] leading-[24px]">
              Lorem ipsum dolor sit amet consectetur. Quis arcu accumsan enim
              sem phasellus dis ullamcorper. Lorem ipsum dolor sit amet
              consectetur. Quis arcu accumsan enim sem phasellus dis
              ullamcorper.
            </div>
          </div>

          {/* Content2 */}
          <div className="gap-[16px] flex flex-col w-[333px] max-[1135px]:w-full">
            <div className="content-header flex gap-[16px] items-center">
              <Image src="/images/union2.png" alt="Union2" width={100} height={100} priority className="w-[60px] h-[60px]" />
              <span className="title text-[24px] leading-[29.05px] font-semibold whitespace-nowrap truncate">Select Vendor</span>
            </div>
            <hr className="border border-[#7749e2]" />
            <div className="content-text text-[#9CA3AF] text-[16px] leading-[24px]">
              Lorem ipsum dolor sit amet consectetur. Quis arcu accumsan enim
              sem phasellus dis ullamcorper. Lorem ipsum dolor sit amet
              consectetur. Quis arcu accumsan enim sem phasellus dis
              ullamcorper.
            </div>
          </div>

          {/* Content 3 */}
          <div className="gap-[16px] flex flex-col w-[333px] max-[1135px]:w-full">
            <div className="content-header flex gap-[16px] items-center">
              <Image src="/images/union3.png" alt="Union3" width={100} height={100} priority className="w-[60px] h-[60px]" />
              <span className="title text-[24px] leading-[29.05px] font-semibold whitespace-nowrap truncate">Book Service</span>
            </div>
            <hr className="border border-[#7749e2]" />
            <div className="content-text text-[#9CA3AF] text-[16px] leading-[24px]">
              Lorem ipsum dolor sit amet consectetur. Quis arcu accumsan enim
              sem phasellus dis ullamcorper. Lorem ipsum dolor sit amet
              consectetur. Quis arcu accumsan enim sem phasellus dis
              ullamcorper.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HowItWorks;
