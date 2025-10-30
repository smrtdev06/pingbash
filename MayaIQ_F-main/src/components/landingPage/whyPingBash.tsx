import React from "react";
import ButtonComponent from "../buttonGroup";
import Image from "next/image";

const WhyPingBash: React.FC = () => {
    const descContents = [
        {id: 1, title: "Instant Group Chats", content: "Create and launch a group chat room in seconds."},
        {id: 2, title: "Fully Customizable", content: "Choose styles, colors, and layouts that match your brand or website aesthetic."},
        {id: 3, title: "Embed Anywhere", content: "Seamlessly add your chat to any site or blog. Just copy and paste."},
        {id: 4, title: "One-on-One Chat Mode", content: "Let users take conversations private with just one click, while staying inside the chat."},
        {id: 5, title: "User Blocking", content: "Keep it safe and respectful: users can block anyone instantly."},
        {id: 6, title: "Admin Control Panel", content: "Send broadcast notifications, manage users, and monitor your chat with ease."},
        {id: 7, title: "Mobile & Desktop Ready", content: "Works perfectly on phones, tablets, and desktops – no app install required."},
        {id: 8, title: "High Performance", content: "Built to handle thousands of users at once, even during peak traffic hours"},
        {id: 9, title: "No Downloads. No Hassle.", content: "100% web-based. Just paste into your site or app and you're good to go."},
        {id: 10, title: "Totally Free", content: "No hidden fees. PingBash is free to use and always will be."},
    ];
  return (
    <div className="gap-[30px] flex flex-col">
      {/* This is a part for Welcome To MayalQ */}
      <div className="text-container flex flex-col items-center w-[1120px] mx-auto max-[1135px]:w-[80%] max-[650px]:w-full gap-[30px] max-[1135px]:px-0 pt-[10px] ">
        <div className="p-2 max-w-ld mx-auto">
          {/* Intro Video */}
          <div className="mb-8 max-w-4xl mx-auto">
            <video 
              className="w-full rounded-lg shadow-2xl"
              controls
              preload="metadata"
            >
              <source src="/videos/intro.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <h2 className="text-3xl max-[650px]:text-2xl font-bold mb-4 text-[white]">🚀 Why PingBash?</h2>
          <ul className="space-y-4 text-[white] text-left text-[20px]">
            {descContents.map(cont => {
                return (<li className="shadow-sm"><span className="font-bold">
                {cont.title}</span><span className="font-normal text-[#AAAAAA]"> -  {cont.content} </span></li>);
            })}            
          </ul>
        </div>
      </div>

      {/* This is a part for laptop image area */}
      
    </div>
  );
};

export default WhyPingBash;
