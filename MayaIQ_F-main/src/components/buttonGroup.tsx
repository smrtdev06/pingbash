"use client";

import React, { useState } from "react";
import Link from "next/link";
import LegalModal from "./legalModal";

const ButtonGroup: React.FC = () => {
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  return (
    <>
      <div className="text-center w-5/12 mx-auto max-[650px]:w-full justify-center grid grid-cols-1 max-[650px]:grid-cols-1 gap-[20px]">
        <Link
          // buyer auth or login
          href="/auth?Collection=login&Role=Customer"
          className="py-[17px] max-[650px]:py-[12px] w-full gap-[10px] text-[20px] leading-[30px] rounded-full text-white md:block whitespace-nowrap bg-gradient-to-r from-[#0F00D4] to-[#B300C8]"
        >
          Get Started
        </Link>
        
        {/* Legal Links */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-4">
          <button
            onClick={() => setIsPrivacyModalOpen(true)}
            className="text-sm text-gray-400 hover:text-white transition-colors duration-200 underline"
          >
            Privacy Policy
          </button>
          <span className="text-gray-400 hidden sm:inline">•</span>
          <button
            onClick={() => setIsTermsModalOpen(true)}
            className="text-sm text-gray-400 hover:text-white transition-colors duration-200 underline"
          >
            Terms and Conditions
          </button>
        </div>
        
        {/* <Link
          href="/auth?Collection=login&Role=Vendor"
          className="py-[17px] max-[650px]:py-[12px] w-full gap-[10px] text-[20px] leading-[30px] rounded-full text-white md:block whitespace-nowrap border border-[#B300C8]"
        >
          Join as a Business
        </Link> */}
      </div>

      {/* Legal Modals */}
      <LegalModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        type="privacy"
      />
      <LegalModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        type="terms"
      />
    </>
  );
};

export default ButtonGroup;
