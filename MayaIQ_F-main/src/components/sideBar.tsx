import React, { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { RootState, AppDispatch } from '../redux/store';
import { useDispatch, useSelector } from "react-redux";
import { setIsExpanded, setIsLoading, setShowFeedback } from '../redux/slices/stateSlice';
import Feedback from "./mask/feedback";
import Confirm from "./mask/Confirm";
import chat_const from "@/resource/const/chat_const";
import { socket } from "@/resource/utils/chat";
import { TOKEN_KEY } from "@/resource/const/const";

const SideBar: React.FC = () => {

  const [logoutConfirm, setLogoutConfirm] = useState(false)

  const param = useSearchParams();
  const path = usePathname();
  const router = useRouter()

  const isExpanded = useSelector((state: RootState) => state.state.isExpanded);
  const dispatch = useDispatch<AppDispatch>();

  const active = "bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-white";

  const Logout = async () => {
    dispatch(setIsLoading(true))
    socket.emit(chat_const.USER_OUT, localStorage.getItem(TOKEN_KEY));
    await localStorage.removeItem(TOKEN_KEY)
    router.push("/")
    dispatch(setIsLoading(false))
  }

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) router.push(`/auth?Role=${param.get("Role")}&Collection=login`)
  }, [])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className={`LeftBar z-30 w-[280px] flex flex-col gap-[40px] absolute h-screen px-[20px] pt-[40px] duration-300 left-0 ${isExpanded ? "max-lg:left-0" : "max-lg:-left-[280px]"} top-0 overflow-y-auto overflow-x-hidden bg-[#F3F4F6] scroll-auto`}>
        {/* start Logo */}
        <div>
          <Link href={"/"} className="flex items-center">
            <Image className=" w-10" src="/logo-orange.png" width={100} height={100} style={{ width: "auto", height: "auto" }} alt="logo" priority />
            <span className="px-2 text-[23px] text-block font-bold">PingBash</span>
          </Link>
        </div>
        {/* end Logo */}

        {/* start navbar */}
        <ul className="flex flex-col gap-[20px]">
          <li>
            <Link onClick={() => dispatch(setIsExpanded(false))} href={`/inbox`} className={`flex cursor-pointer items-center p-2 ${path === "/inbox" ? active : ""} rounded-lg`}>
              <Image src={`/assets/${path === "/inbox" ? "dark" : "light"}/sidebar/vendors.svg`} alt="vendor" width={100} height={100} style={{ width: "auto", height: "auto" }} priority />
              <span className="px-2">Inbox</span>
            </Link>
          </li>
          {/* <li>
            <Link onClick={() => dispatch(setIsExpanded(false))} href={`/dashboard?Role=${param.get("Role")}`} className={`flex cursor-pointer items-center p-2 ${path === "/dashboard" ? active : ""} rounded-lg`}>
              <Image src={`/assets/${path === "/dashboard" ? "dark" : "light"}/sidebar/vendors.svg`} alt="vendor" width={100} height={100} style={{ width: "auto", height: "auto" }} priority />
              <span className="px-2">{param.get("Role") === "Customer" ? "Explore" : "Customer"}</span>
            </Link>
          </li> */}
          {/* <li>
            <Link onClick={() => dispatch(setIsExpanded(false))} href={`/groups?Role=${param.get("Role")}`} className={`flex cursor-pointer items-center p-2 ${path === "/groups" ? active : ""} rounded-lg`}>
              <Image src={`/assets/${path === "/groups" ? "dark" : "light"}/sidebar/vendors.svg`} alt="vendor" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              <span className="px-2">Groups</span>
            </Link>
          </li> */}
          <li>
            <Link onClick={() => {dispatch(setIsExpanded(false))}} href={`/groupChat`} className={`flex cursor-pointer items-center p-2 ${path === "/groupChat" ? active : ""} rounded-lg`}>
              <Image src={`/assets/${path === "/groupChat" ? "dark" : "light"}/sidebar/vendors.svg`} alt="vendor" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              <span className="px-2">Groups</span>
            </Link>
          </li>
          {/* <li>
            <Link onClick={() => dispatch(setIsExpanded(false))} href={`/chats?Role=${param.get("Role")}`} className={`flex cursor-pointer items-center p-2 ${path === "/chats" ? active : ""} rounded-lg`}>
              <Image src={`/assets/${path === "/chats" ? "dark" : "light"}/sidebar/chats.svg`} alt="vendor" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              <span className="px-2">Chats</span>
            </Link>
          </li> */}
          {/* <li>
            <Link onClick={() => dispatch(setIsExpanded(false))} href={`/assistant?Role=${param.get("Role")}`} className={`flex cursor-pointer items-center p-2 ${path === "/assistant" ? active : ""} rounded-lg`}>
              <Image src={`/assets/${path === "/assistant" ? "dark" : "light"}/sidebar/assistant.svg`} alt="vendor" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              <span className="px-2">AI Assistant</span>
            </Link>
          </li> */}
          <hr className="border border-gray-300" />
          <li>
            <Link onClick={() => dispatch(setIsExpanded(false))} href={`/profile?Role=${param.get("Role")}`} className={`flex cursor-pointer items-center p-2 ${path === "/profile" ? active : ""} rounded-lg`}>
              <Image src={`/assets/${path === "/profile" ? "dark" : "light"}/sidebar/profile.svg`} alt="vendor" width={100} height={100} style={{ width: "auto", height: "auto" }} />
              <span className="px-2">My Profile</span>
            </Link>
          </li>
          <li onClick={(e) => setLogoutConfirm(true)} className={`flex cursor-pointer items-center p-2 rounded-lg`}>
            <Image src={`/assets/light/sidebar/logout.svg`} alt="vendor" width={100} height={100} style={{ width: "auto", height: "auto" }} />
            <span className="px-2">Log out</span>
          </li>
        </ul>
        {/* end navbar */}

        {/* start feedback */}
        {/* <div className="rounded-lg select-none mt-16 p-3 px-4 bg-gradient-to-r from-[#0e00d43f] to-[#b400c83f]">
          <h4 className="font-semibold text-sm line py-1">How can we get better?</h4>
          <p className="text-sm leading-4">Write a suggestion and send it to use to let us improve!</p>
          <p onClick={() => dispatch(setShowFeedback(true))} className="cursor-pointer bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-sm font-bold text-transparent bg-clip-text">Click Here <span className="inline text-[20px]">&#8599;</span></p>
        </div> */}
        {/* end feedback */}
      </div>
      <div onClick={() => dispatch(setIsExpanded(false))} className={`absolute z-10 w-screen duration-500 hidden  h-screen ${isExpanded ? "max-lg:block" : "max-lg:hidden"}`}></div>
      <Feedback />
      <Confirm isShow={logoutConfirm} close={setLogoutConfirm} msg="Do you really want to log out?" callback={Logout} />

    </Suspense>
  );
};

export default SideBar;