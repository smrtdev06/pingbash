import React from "react";
import ButtonComponent from "../buttonGroup";
import Image from "next/image";

const GetBestService: React.FC = () => {
  return (
    <div className="get-best-service h-[1027px] max-[1135px]:h-auto w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-auto flex flex-col gap-[40px] py-[80px] justify-center mx-auto">
      <Image src="/assets/atom.svg" alt="image for AI driven" width={100} height={100} priority className="inline-block mx-auto w-[543px] max-[650px]:w-[230px]" />
      <div className="content text-white flex max-[1135px]:flex-col max-[1135px]:w-[620px] max-[650px]:w-[230px] mx-auto gap-[20px] justify-center items-center">
        <div className="discription-wrapper w-[868px] flex flex-col gap-[20px] max-[1135px]:w-full items-center">
          <h1 className="text-[60px] max-[1135px]:text-[40px] w-full text-center leading-[66px] max-[1135px]:leading-[44px] font-semibold">
            Get Best Service Peoples In Seconds With PingBash
          </h1>
          <p className="text-center text-[16px] min-[1125px]:w-[634px] w-full leading-[24px] mx-auto text-[#D1D5DB]">
            PingBash Description Here.
          </p>
          <ButtonComponent />
        </div>
      </div>
    </div>
  );
};

export default GetBestService;