"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface Cursal {
  id: number;
  content: string;
  avatar: string;
  name: string;
  country: string;
}

const Testimonials: React.FC = () => {
  const [cursals, setCursals] = useState<Cursal[]>([
    {
      id: 1,
      content:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin pellentesque. Varius eu libero commodo integer aliquet elit. Accumsan velit enim ullamcorper consectetur sed eget varius lacus.",
      avatar: "avatar1.png",
      name: "Annette Black",
      country: "United States",
    },
    {
      id: 2,
      content:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin pellentesque. Varius eu libero commodo integer aliquet elit. Accumsan velit enim ullamcorper consectetur sed eget varius lacus.",
      avatar: "avatar2.png",
      name: "Esther Howard",
      country: "United States",
    },
    {
      id: 3,
      content:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin pellentesque. Varius eu libero commodo integer aliquet elit. Accumsan velit enim ullamcorper consectetur sed eget varius lacus.",
      avatar: "avatar3.png",
      name: "Davies Martin",
      country: "United States",
    },
    {
      id: 4,
      content:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin pellentesque. Varius eu libero commodo integer aliquet elit. Accumsan velit enim ullamcorper consectetur sed eget varius lacus.",
      avatar: "avatar4.png",
      name: "Davies Martin",
      country: "United States",
    },
    {
      id: 5,
      content:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin pellentesque. Varius eu libero commodo integer aliquet elit. Accumsan velit enim ullamcorper consectetur sed eget varius lacus.",
      avatar: "avatar5.png",
      name: "Ronald Howard",
      country: "United States",
    },
    {
      id: 6,
      content:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin pellentesque. Varius eu libero commodo integer aliquet elit. Accumsan velit enim ullamcorper consectetur sed eget varius lacus.",
      avatar: "avatar7.png",
      name: "Davies Martin",
      country: "United States",
    },
    {
      id: 7,
      content:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin pellentesque. Varius eu libero commodo integer aliquet elit. Accumsan velit enim ullamcorper consectetur sed eget varius lacus.",
      avatar: "avatar7.png",
      name: "Ronald Howard",
      country: "United States",
    },
    // Add more cursals as needed
  ]);

  // ******************To make the Cursals response when clicking next and previous buttons***************************
  const imageDivRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePreviousClick = () => {
    const container = imageDivRef.current;
    if (container && cardRef.current) {
      container.scrollTo({
        left: container.scrollLeft - cardRef.current.clientWidth - 20,
        behavior: "smooth",
      });
    }
  };

  const handleNextClick = () => {
    const container = imageDivRef.current;
    if (container && cardRef.current) {
      container.scrollTo({
        left: container.scrollLeft + cardRef.current.clientWidth + 20,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = imageDivRef.current;
    const handleScroll = () => {
      // Do something on scroll
    };
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, []); // Empty dependency array to ensure effect runs only once

  return (
    <div id="testimonials" className="Testimonials h-[667px] max-[1135px]:h-auto py-[80px] text-white flex max-[1135px]:flex-col gap-[20px] items-center">
      <div className="flex flex-col w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-[230px] gap-[40px] mx-auto">
        <div className="flex items-center w-full mx-auto justify-between">
          <div className="flex flex-col gap-[13px] w-[868px]">
            <p>
              <span className="text-[20px] leading-[24px] font-semibold inline-block bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent">TESTIMONIALS</span>
            </p>
            <div className="text-[60px] max-[1135px]:text-[40px] leading-[66px] max-[1135px]:leading-[44px] font-semibold">
              What Our Users Say About Us
            </div>
          </div>
          <div className="right-side flex gap-[20px] max-[1135px]:hidden">
            <button onClick={handlePreviousClick}>
              <Image src="/images/previous.png" alt="previous" width={100} height={100} className="w-[50px] h-[50px]" />
            </button>
            <button onClick={handleNextClick}>
              <Image src="/images/next.png" alt="next" width={100} height={100} className="w-[50px] h-[50px]" />
            </button>
          </div>
        </div>
        <div
          className="sider-bar gap-[20px] flex flex-nowrap overflow-x-hidden duration-300"
          ref={imageDivRef}
        >
          {cursals.map((cursal) => (
            <div
              key={cursal.id}
              ref={cardRef}
              className="cursor-pointer select-none flex-shrink-0 w-[540px] max-[1135px]:w-[580px] max-[650px]:w-[220px] h-[364px] max-[1135px]:h-[360px] max-[650px]:h-auto bg-[#09003F] hover:bg-opacity-70 text-white py-[40px] px-[30px] rounded-[20px] border border-blue-500"
            >
              <div className="stars mt-5 w-full">
                <Image src="/images/stars.png" className="float-left w-1/2" alt="stars" width={200} height={200} style={{ width: "auto", height: "auto" }} />
              </div>
              <div className="feelings mt-5 float-left">
                <p className="">{cursal.content}</p>
              </div>
              <div className="personal float-left flex items-center mt-5">
                <div className="avatars w-14 h-14 rounded-full">
                  <Image className="w-14 h-14 rounded-full" src={`/images/avatars/${cursal.avatar}`} alt={`${cursal.avatar}`} width={100} height={100} style={{ width: "auto", height: "auto" }} />
                </div>
                <div className="nameCountry ml-5 text-base">
                  <div className="name font-bold">{cursal.name}</div>
                  <div className="country">{cursal.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="right-side gap-[20px] hidden max-[1135px]:flex">
          <button onClick={handlePreviousClick}>
            <Image src="/images/previous.png" alt="previous" width={100} height={100} className="w-[50px]" />
          </button>
          <button onClick={handleNextClick}>
            <Image src="/images/next.png" alt="next" width={100} height={100} className="w-[50px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
