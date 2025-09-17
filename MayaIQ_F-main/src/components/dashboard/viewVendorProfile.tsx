
'use client'

import toast from "react-hot-toast";
import axios from "axios";
import Image from "next/image";
import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setIsExpanded, setIsLoading } from "@/redux/slices/stateSlice";
import messages from "@/resource/const/messages";
import { SERVER_URL, TOKEN_KEY } from "@/resource/const/const";
import ProductCard from "../productCard";
import SideBar from "../sideBar";
import PageHeader from "../pageHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { setSelectedChatUser } from "@/redux/slices/messageSlice";
import { user } from "@nextui-org/react";

interface UserInfo {
  Id: number;
  Name: string;
  Profession: string;
  Description: string;
  Email: string;
  Address: string;
  Photo_Name: string;
}

interface Product {
  Id: number;
  Product_Name: string;
  Price: number;
  Photo_Name: string;
}

const ViewVendorProfile: React.FC = () => {
  const params = useSearchParams();
  const router = useRouter(); // Add this line
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [productList, setProductList] = useState<Product[]>([]);

  const dispatch = useDispatch<AppDispatch>();

  const loadProfile = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));

      const result = await axios.post(
        `${SERVER_URL}/api/private/get/profile/detail`,
        { User_Id: Number(params.get("User")) },
        {
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
            Authorization:
              localStorage.getItem(TOKEN_KEY) ||
              "",
          },
        }
      );

      setUserInfo(result.data.userDetail);
      setProductList([...result.data.products]);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  }, [params, dispatch]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Add this function to handle the "Chat Now" button click
  const chatNowTrigger = () => {
    if (userInfo) {
      dispatch(
        setSelectedChatUser({
          Id: userInfo.Id,
          Email: userInfo.Email,
          Photo_Name: userInfo.Photo_Name,
          Address: userInfo.Address,
          Name: userInfo.Name,
          Profession: userInfo.Profession,
        })
      );
      router.push(`/chats?Role=${params.get("Role")}&User=${userInfo.Id}`);
    }
  };

  return (
    <div className="page-container bg-white">
      <SideBar />
      <div className="content-wrapper w-full pl-[280px] max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
        <div className="page-content relative w-full pt-[37px] flex flex-col gap-[27px] px-[80px] max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px] pb-[80px]">
          {/* <PageHeader /> */}

          <div className="lg:hidden bg-white shadow-lg shadow-slate-500 fixed z-20 w-full flex left-0 top-0 justify-start items-center gap-[20px] px-[20px] py-[10px]">
            <a onClick={() => dispatch(setIsExpanded(true))}>
              <FontAwesomeIcon
                className="cursor-pointer hover:text-gray-700 w-[24px] h-[24px]"
                icon={faBars}
              />
            </a>
            <div className="flex gap-[12px] items-center whitespace-nowrap">
              <Image src={"/logo-orange.png"} alt="" width={100} height={100} style={{ width: "56px", height: "56px" }} priority
              />
              <span className="text-[23px] font-semibold">PingBash</span>
            </div>
          </div>
          <div className="vendor-detail flex items-start justify-between gap-[120px] max-[1265px]:flex-col">
            <div className="flex flex-col gap-[20px] max-[1265px]:w-full">
              <div>
                <h1 className="text-[40px] font-bold">{userInfo?.Name}</h1>
                <h4 className="text-[18px] font-semibold leading-[28px] bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent inline-block">
                  {userInfo?.Profession}
                </h4>
              </div>
              <p className="text-[16px] leading-[24px]">
                {userInfo?.Description}
              </p>
              <div className="flex gap-[40px] flex-wrap">
                <button
                  onClick={chatNowTrigger}
                  className="bg-gradient-to-r whitespace-nowrap items-center from-[#0F00D4] to-[#B300C8] flex rounded-[10px] px-[30px] py-[12px] gap-[8px]"
                >
                  <Image src={`/assets/dark/sidebar/chats.svg`} alt="" width={14} height={14} priority />
                  <span className="text-white text-[14px]">Chat Now</span>
                </button>
                <div>
                  <p className="text-[14px] truncate gap-[4px] flex items-center justify-start">
                    <Image
                      src={`/assets/light/dashboard/address.svg`}
                      alt="map"
                      width={100}
                      height={100}
                      style={{
                        width: "auto",
                        height: "1.1em",
                        display: "inline",
                      }}
                      priority
                    />
                    {userInfo?.Address}
                  </p>
                  <p className="text-[14px] truncate gap-[4px] flex items-center justify-start">
                    <Image src={`/assets/light/dashboard/mail.svg`} alt="map" width={100} height={100} style={{ width: "auto", height: "1.1em", display: "inline", }} priority />
                    {userInfo?.Email}
                  </p>
                </div>
              </div>
            </div>
            <Image alt="" className="w-[405px] h-[196px] rounded-[10px] max-[1265px]:mx-auto" src={userInfo?.Photo_Name && userInfo.Photo_Name !== "null" ? `${SERVER_URL}/uploads/users/${userInfo.Photo_Name}` : "/default_product.png"} width={100} height={100} priority />
          </div>
          <hr />
          <div className="flex flex-col gap-[20px]">
            <h1 className="text-[30px] font-bold leading-[45px]">
              Product Services
            </h1>
            <div className="gap-[20px] grid grid-cols-3 max-[1480px]:grid-cols-2 max-[1220px]:grid-cols-1">
              {productList.length ? (
                productList.map((product, idx) => (
                  <ProductCard
                    key={`key=${idx}`}
                    id={product.Id}
                    product={product.Product_Name}
                    price={product.Price}
                    image={product.Photo_Name}
                  />
                ))
              ) : (
                <h4>No Product Service</h4>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ViewVendorProfileWrapper: React.FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewVendorProfile />
    </Suspense>
  );
};

export default ViewVendorProfileWrapper;