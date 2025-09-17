import React from "react"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook, faInstagram, faLinkedin, faXTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons"
import Link from "next/link"

const Footer: React.FC = () => {
  return (
    <div className="flex flex-col gap-[44px] py-[80px]">

      {/* This is for Ready To Get Started */}
      <div className="ready-container w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-[230px] mx-auto text-white py-[100px] px-[60px] max-[1135px]:px-[20px] flex flex-col gap-[40px] bg-gradient-to-r from-[#0F00D4] to-[#B300C8] rounded-[40px]">
        <div className="ready-title w-[651px] max-[1135px]:w-full flex flex-col mx-auto gap-[20px]">
          <h2 className="text-[60px] max-[1135px]:text-[40px] leading-[66px] max-[1135px]:leading-[44px] text-center font-semibold">Ready To Get Started?</h2>
          <p className="text-[16px] leading-[24px] text-center text-[#D1D5DB] max-[1135px]:w-full font-semibold">
            PingBash Description Here.
          </p>
        </div>
        {/* For the buttons Get Started and Join as a Business*/}
        <div className="button-container w-10/12 mx-auto max-[650px]:w-full grid grid-cols-2 max-[650px]:grid-cols-1 gap-[20px]">
          <Link className="border py-[17px] max-[650px]:py-[14px] text-[18px] max-[650px]:w-full text-center bg-white rounded-full font-semibold" href="/auth?Collection=login&Role=Customer"><span className="bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-transparent bg-clip-text">Get Started</span></Link>
          {/* <Link className="border py-[17px] max-[650px]:py-[14px] text-[18px] max-[650px]:w-full text-center border-white rounded-full font-semibold" href="/auth?Collection=login&Role=Vendor"><span>Join as a Business</span></Link> */}
        </div>
      </div>


      <div className="pre-footer flex-wrap flex max-[650px]:flex-col max-[1135px]:gap-[32px] w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-[230px] mx-auto justify-between max-[1135px]:justify-center items-center text-white">
        <div className="footer-image flex items-center gap-[12px]">
          <Image src="/logo-orange.png" alt="PingBash" className=" h-[56px] w-[56px]" width={100} height={100} priority />
          <p className="company-name text-[23px] font-semibold">PingBash</p>
        </div>
        <div className="footer-center flex gap-[32px] justify-center items-center whitespace-nowrap ">
          <div className="flex max-[650px]:flex-col gap-[24px] w-full text-center">
            <a href="#benefits" className="text-[14px] font-semibold text-[#D1D5DB]">
              Benefits</a>
            <a href="#how-it-works" className="text-[14px] font-semibold text-[#D1D5DB]">
              How it Works</a>
            <a href="#testimonials" className="text-[14px] font-semibold text-[#D1D5DB]"
            >Services</a>
            <a href="#testimonials" className="text-[14px] font-semibold text-[#D1D5DB]"
            >Testimonials</a>
            <a href="#faq" className="text-[14px] font-semibold text-[#D1D5DB]"
            >FAQ </a>
          </div>
        </div>
        <div className="footer-right flex items-center gap-[19.6px]">
          <Link href="https://www.facebook.com"><FontAwesomeIcon className="text-[24.5px]" icon={faFacebook} /></Link>
          <Link href="https://www.linkedin.com"><FontAwesomeIcon className="text-[24.5px]" icon={faLinkedin} /></Link>
          <Link href="https://www.twitter.com"><FontAwesomeIcon className="text-[24.5px]" icon={faXTwitter} /></Link>
          <Link href="https://www.instagram.com"><FontAwesomeIcon className="text-[24.5px]" icon={faInstagram} /></Link>
          <Link href="https://www.youtube.com"><FontAwesomeIcon className="text-[24.5px]" icon={faYoutube} /></Link>
        </div>
      </div>

      <div className="additional-div w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-[230px] mx-auto flex flex-col gap-[32px] justify-between items-center text-gray-300 ">
        <hr className="border-[#D1D5DB] w-full border-[1px]" />
        <div className="flex max-[1135px]:flex-col max-[1135px]:gap-[24px] justify-between w-full items-center text-[16px] text-[#D1D5DB]">
          <div className="additional-left inline-block text-[16px]">© 2024. All rights reserved.</div>
          <div className="additional-right flex max-[650px]:flex-col max-[650px]:items-center gap-[24px] whitespace-nowrap ">
            <a className="py-2" href="#">Privacy Policy</a>
            <a className="py-2" href="#">Terms of Service</a>
            <a className="py-2" href="#" >Cookies Settings</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
