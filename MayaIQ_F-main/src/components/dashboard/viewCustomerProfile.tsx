 'use client'

 import toast from "react-hot-toast";
 import axios from "axios";
 import Image from "next/image";
 import React, { Suspense, useEffect, useState, useCallback } from "react";
 import { useSearchParams } from "next/navigation";
 import { useDispatch } from "react-redux";
 import { AppDispatch } from "@/redux/store";
 import { setIsLoading } from "@/redux/slices/stateSlice";
 import messages from "@/resource/const/messages";
 import { SERVER_URL, TOKEN_KEY } from "@/resource/const/const";
 import ProductCard from "../productCard";
 
 interface UserInfo {
   Name: string;
   Profession: string;
   Description: string;
   Email: string,
   Address: string,
   Photo_Name: string
 }
 
 interface Product {
   Id: number,
   Product_Name: string,
   Price: number,
   Photo_Name: string
 }
 
 const ViewCustomerProfile: React.FC = () => {
   const params = useSearchParams();
   const [detail, setDetail] = useState(false);
   const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
   const [productList, setProductList] = useState<Product[]>([]);
 
   const dispatch = useDispatch<AppDispatch>();
 
   const loadProfile = useCallback(async () => {
     try {
       dispatch(setIsLoading(true))
 
       const result = await axios.post(`${SERVER_URL}/api/private/get/profile/detail`, { User_Id: params.get("User") }, {
         headers: {
           "Accept": "application/json",
           "Content-type": "application/json",
           Authorization: localStorage.getItem(TOKEN_KEY) || '',
         }
       });
 
       setUserInfo(result.data.userDetail);
       setProductList([...result.data.productList]);
     } catch (error) {
       console.error("Error loading profile:", error);
       toast.error(messages.common.serverError);
     }
     dispatch(setIsLoading(false))
   }, [params]);
 
   useEffect(() => {
     if (params.get("User")) {
       setDetail(true);
       loadProfile();
     } else {
       setDetail(false);
     }
   }, [params, loadProfile]);
 
   if (!detail) {
     return null;
   }
   console.log(userInfo)
   return (
     <div className="fixed bg-white top-0 left-0 content-wrapper w-full pl-[280px] max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
       <div className="page-content relative w-full pt-[37px] flex flex-col gap-[12px] p-[24px] max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px] pb-[80px]">
         <div className="vendor-detail flex items-start justify-between gap-[120px]">
           <div className="flex flex-col gap-[20px]">
             <div>
               <h1 className="text-[40px] font-bold">{userInfo?.Name}</h1>
               <h4 className="text-[18px] font-semibold leading-[28px] bg-gradient-to-r from-[#0F00D4] to-[#B300C8] bg-clip-text text-transparent inline-block">{userInfo?.Profession}</h4>
             </div>
             <p className="text-[16px] leading-[24px]">{userInfo?.Description}</p>
             <div className="flex gap-[40px]">
               <button className="bg-gradient-to-r whitespace-nowrap items-center from-[#0F00D4] to-[#B300C8] flex rounded-[10px] px-[30px] py-[12px] gap-[8px]">
                 <Image src={`/assets/dark/sidebar/chats.svg`} alt="" width={14} height={14} priority />
                 <span className="text-white text-[14px]">Chat Now</span>
               </button>
               <div>
                 <p className="text-[14px] truncate gap-[4px] flex items-center justify-start">
                   <Image src={`/assets/light/dashboard/address.svg`} alt="map" width={100} height={100} style={{ width: "auto", height: "1.1em", display: "inline" }} priority />
                   {userInfo?.Address}
                 </p>
                 <p className="text-[14px] truncate gap-[4px] flex items-center justify-start">
                   <Image src={`/assets/light/dashboard/mail.svg`} alt="map" width={100} height={100} style={{ width: "auto", height: "1.1em", display: "inline" }} priority />
                   {userInfo?.Email}
                 </p>
               </div>
             </div>
           </div>
           <Image alt="" src={userInfo?.Photo_Name && userInfo.Photo_Name !== "null" ?
             `${SERVER_URL}/uploads/user/${userInfo.Photo_Name}` : "/default_product.png"} width={100} height={100} priority style={{ width: "405px", height: "196px", borderRadius: "10px" }} />
         </div>
         <hr />
         <div className="flex flex-col gap-[20px]">
           <h1 className="text-[30px] font-bold leading-[45px]">Product Services</h1>
           <div className="gap-[20px] grid grid-cols-4">
             {productList.length
               ? productList.map((product, idx) => <ProductCard key={`key=${idx}`} id={product.Id} product={product.Product_Name} price={product.Price} image={product.Photo_Name} />)
               : <h4>No Product Service</h4>}
           </div>
         </div>
       </div>
     </div>
   );
 };
 
 const ViewCustomerProfileWrapper: React.FC = () => {
   return (
     <Suspense fallback={<div>Loading...</div>}>
       <ViewCustomerProfile />
     </Suspense>
   );
 };
 
 export default ViewCustomerProfileWrapper;
 