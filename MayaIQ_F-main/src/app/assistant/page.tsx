'use client'

import React, { Suspense, useEffect, useState, useCallback, useRef } from "react";
import SideBar from "@/components/sideBar";
import PageHeader from "@/components/pageHeader";
import Image from "next/image";
import PreLoading from "@/components/mask/preLoading";
import AiHistoryItem from "@/components/assistant/aiHistoryItem";
import toast from "react-hot-toast";

import axios from "axios";
import { useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setIsLoading } from "@/redux/slices/stateSlice";
import messages from "@/resource/const/messages";
import { SERVER_URL, CHAT_KEY, TOKEN_KEY } from "@/resource/const/const";
import MessageField from "@/components/assistant/messageField";

import OpenAIApi from "openai";

const openai = new OpenAIApi({
  apiKey: CHAT_KEY,
  dangerouslyAllowBrowser: true,
});


interface UserInfo {
  Id: number
  Name: string
  Email: string
  Description: string
  Address: string
  Gemometry: JSON
  Role: number
  Profession: string
  Photo_Name: string
}

interface Product {
  Id: number,
  User_Id: number,
  Price: number,
  Product_Name: string,
  Photo_Name: string,
}

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const AssistantContent: React.FC = () => {
  //Set the initial Data from the database
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);

  //Input Message field
  const [inputMsg, setInputMsg] = useState("")
  const inputMsgRef = useRef<HTMLInputElement | null>(null)
  const [chats, setChats] = useState<ChatMessage[]>([{ role: "assistant", content: "Hi, how can I help you?" }]);

  //User Nav 
  // const [userNavShow, setUserNavShow] = useState(params.get("User") ? false : true)
  const [userNavShow, setUserNavShow] = useState(false)

  const params = useSearchParams();
  const role = params.get("Role");
  const dispatch = useDispatch<AppDispatch>()

  /***********************************************************************************************
   * Start: To set the initial data for users and products list for PingBash 
   */
  const loadInitialData = useCallback(async () => {
    try {
      dispatch(setIsLoading(true))
      console.log(params.get("Role"))
      const result = await axios.post(`${SERVER_URL}/api/private/get/assistant/initial`, {
        Role:
          params.get("Role") === "Vendor"
            ? 0
            : params.get("Role") === "Customer"
              ? 1
              : 2,
      }, {
        headers: {
          "Accept": "application/json",
          "Content-type": "application/json",
          Authorization: localStorage.getItem(TOKEN_KEY) || '',
        }
      });

      setUserInfo(result.data.users)
      setProductList(result.data.products)

    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false))
  }, [])

  useEffect(() => {
    loadInitialData()
  }, [])

  // console.log(userInfo, productList)
  console.log(chats)
  /***********************************************************************************************
   * End: To set the initial data for users and products list for PingBash
   */

  // The action for the message send action
  const sendMsgHandler = async () => {
    if (inputMsg.length > 0) {
      const token = localStorage.getItem(TOKEN_KEY)
      console.log(inputMsg)

      let msgs = chats
      msgs.push({ role: "user", content: inputMsg })
      setChats(msgs)

      await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
             `You are a chatbot for MayaIQ. /
              You have lists of Users with their information. /
              Here are lists of Users: ${JSON.stringify(userInfo)}. /
              You also have Products information: ${JSON.stringify(productList)}. /
              In more detail, Products table shows the Product Name which was developed by Users /
              Here, Users has Id item and this Id item is same as the Products' User_Id item /
              Answer user questions using the Users and Products information. /
              Once someone asks you with more detailed address, you need to answer with Users' Geometry item /
              Provide detailed information as JSON if requested. /
              You need to provide his all information as JSON format /
              Answer format must include the summmary answer first /
              summary answer must be conversational and easy for users to understand /
              And then, Users and Products information must be included /
              But If there is not user in Users list currently, this means that there is no proper one for ther user's request /
              Finally, I hope the answer to be JSON format /
              `
          },
          ...chats,
        ]
      })
        .then((res) => {
          console.log(res.choices[0].message.content);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
  return (
    <div className="page-container bg-white">
      <SideBar />
      <div className="content-wrapper w-full pl-[280px] max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden py-[12px] px-[14px]">
        <div className="page-content w-full pt-[37px] flex flex-col gap-[12px] p-[24px] relative max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px] max-[810px]:pb-[20px]">
          <PageHeader />

          <div className="flex justify-stretch gap-[40px] w-full relative h-[75vh]">
            <aside className={`w-[267px] pr-[5px] flex flex-col gap-[24px] overflow-y-auto overflow-x-hidden duration-500 ${userNavShow ? "flex max-[810px]:w-full" : "max-[810px]:hidden"}`}>
              <button className="bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-white rounded-[8px] py-[20px] text-[16px] whitespace-nowrap">
                + New Request
              </button>
              <hr />
              <div className="flex flex-col gap-[14px] h-[65vh] overflow-y-auto">
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={true} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
                <AiHistoryItem category={"sdf"} content={"sadf"} time={"234"} active={false} />
              </div>
            </aside>
            <section className={`flex flex-col justify-between border rounded-[10px] w-[calc(100%-267px)] duration-500 ${userNavShow ? "max-[810px]:hidden" : "max-[810px]:w-full"}`}>
              <nav className="border-b w-full py-[16px] px-[20px] gap-[10px]">
                <h4 className="flex items-center text-[24px] gap-[4px] text-[#09132C] font-semibold">
                  <Image className="w-[24px] h-[24px]" src={`/assets/light/sidebar/assistant.svg`} alt="" width={100} height={100} />
                  <span>PingBash</span>
                </h4>
                <p className="flex items-center gap-[4px] text-[12px] text-[#6E7FA9]"><span className="inline-block w-[8px] h-[8px] bg-[#00BF63] rounded-full"></span> Online</p>
              </nav>
              <article className="h-full shadow-inner shadow-slate-200 overflow-y-auto flex flex-col gap-[30px] px-[20px]">
                <MessageField />
              </article>
              <nav className="p-[20px] border-t">
                <div className="border rounded-full flex gap-[10px] p-[12px] pl-5 justify-between text-[14px]">
                  <input type="text" ref={inputMsgRef} onKeyDown={(e) => e.keyCode === 13 && sendMsgHandler()} value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} className="w-full outline-none" placeholder="Write a message" />
                  <button onClick={sendMsgHandler} className="px-[26px] py-[3px] rounded-full font-semibold text-white bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF]">Send</button>
                </div>
              </nav>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const Assistant: React.FC = () => {
  return (
    <Suspense fallback={<PreLoading />}>
      <AssistantContent />
    </Suspense>
  )
}
export default Assistant;
