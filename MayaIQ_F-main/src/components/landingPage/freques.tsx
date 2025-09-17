"use client"
import React, { useRef } from "react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import Link from "next/link";

const Freques: React.FC = () => {
  const sectionRef = useRef(null); // Reference to the section

  // init faqData for temporate
  const faqData = [
    {
      question: "Lorem Ipsum is simply dummy text of the printing",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry",
    },
    {
      question: "Lorem Ipsum is simply dummy text of the printing",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry",
    },
    {
      question: "Lorem Ipsum is simply dummy text of the printing",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry",
    },
    {
      question: "Lorem Ipsum is simply dummy text of the printing",
      answer:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry",
    },
    {
      question: "Lorem Ipsum is simply dummy text of the printing",
      answer: "Lorem Ipsum is simply dummy text of the printing",
    },
    // ... Add the rest of your FAQ data here
  ];

  return (<>
    <div id="faq" className="faq-section text-white w-[1120px] max-[1135px]:w-max mx-auto py-[80px] gap-[20px] flex items-center text-center"
      ref={sectionRef}>
      <div className="faq-container flex max-[650px]:w-[230px] justify-between gap-[50px] max-[1135px]:flex-col">
        <h1 className="faq-heading text-[60px] max-[1135px]:text-[40px] leading-[66px] max-[1135px]:leading-[44px] text-white text-left">
          Frequently Asked Questions
        </h1>
        <div className="faq-content flex gap-[7px] justify-between max-[1135px]:text-left max-[650px]:w-full">
          <Accordion variant="light" className="a-container w-[500px]">
            {faqData.map((faq, idx) => <AccordionItem className="text-left w-full py-[16px] border-b" key={`${idx}-faq`} title={faq.question}>
              {faq.answer}
            </AccordionItem>)}
          </Accordion>
        </div>
      </div>
    </div>

  </>
  );
};

export default Freques;
