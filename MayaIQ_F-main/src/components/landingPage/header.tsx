"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

const Header: React.FC = () => {
  const [isNavbarOpen, setIsNavbarOpen] = useState<boolean>(false);

  return (
    <div className="relative flex py-[16px] w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-[85%] mx-auto items-center text-white justify-between">
      <span className="items-center gap-[12px] hidden max-[1135px]:flex">
        <Image src="/logo-orange.png" alt="Logo-header" style={{ width: "56px", height: "56px" }} width={100} height={100} priority />
        <span className="font-semibold text-white text-[23px]">
          PingBash
        </span>
      </span>
      <Link href="/auth?Collection=login&Role=Customer" className="absolute right-[0px] z-[100] py-1 px-3 border bg-indigo-900 bg-opacity-40 border-white rounded-full inline-block max-[640px]:py-2 ">
            Sign in
          </Link>
      {/* start navbar */}
      <ul className={`min-[1135px]:flex text-white max-[1135px]:gap-[26px] w-full items-center gap-[12px] justify-center z-30 whitespace-nowrap relative max-[1135px]:fixed max-[1135px]:h-screen max-[1135px]:bg-[#060027] top-0 left-0  ${isNavbarOpen ? "max-[1135px]:flex max-[1135px]:flex-col" : "max-[1135px]:hidden"}`}>
        <div className="text-right hidden w-full max-[1135px]:block max-[1135px]:pt-[22px]">
          <span className=" cursor-pointer p-5" onClick={() => setIsNavbarOpen(false)}>&times;</span>
        </div>
        <li className=" max-[1135px]:hidden max-[1135px]:text-center flex items-center gap-[12px]">
          <Image src="/logo-orange.png" alt="Logo-header" style={{ width: "56px", height: "56px" }} width={100} height={100} priority />
          <span className="font-semibold text-white text-[23px]">
            PingBash
          </span>
        </li>
      </ul>
      {/* end navbar */}

      {/* Button for Navbar show/close */}
      <span onClick={() => setIsNavbarOpen(true)} className="mx-3 hidden max-[1135px]:inline-block cursor-pointer">
        {/* {isNavbarOpen ? "" : <FontAwesomeIcon icon={faBars} className="text-xl" />} */}
        {/*<Link href="/auth?Collection=login&Role=Customer" className="py-1 px-3 border bg-indigo-900 bg-opacity-40 border-white rounded-full inline-block max-[640px]:py-2 ">
            Sign in
          </Link>
          */}
      </span>
      <div onClick={() => setIsNavbarOpen(false)} className={`${!isNavbarOpen ? "hidden" : ""} top-0 left-0 max-[1135px]:fixed z-20 max-[650px]:w-screen max-[1135px]:h-screen`}></div>
    </div>
  );
};

export default Header;