
'use client'
import React, { useRef, useState, useEffect, useCallback, Suspense } from "react";
import Sidebar from "@/components/sideBar";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";
import PageHeader from "@/components/pageHeader";
import VendorCard from "@/components/vendorCard";
import { SERVER_URL, TOKEN_KEY, USER_ID_KEY } from "@/resource/const/const";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setIsLoading } from "@/redux/slices/stateSlice";
import ViewVendorProfileWrapper from "@/components/dashboard/viewVendorProfile";
import PreLoading from "@/components/mask/preLoading";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import messages from "@/resource/const/messages"
import { group } from "console";
interface User {
  Id: number;
  Name: string;
  Address: string;
  Geometry: string;
  Profession: string;
  Email: string;
  Role: number;
  Photo_Name: string;
}

interface Category {
  Id: number;
  Profession: string;
}

interface Group {
  id: number;
  name: string;
  creater_id: number;
  members: String[];
}

const DashboardComponent: React.FC = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentUsers, setCurrentUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [profileView, setProfileView] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [search, setSearch] = useState("")
  const [myGroups, setMyGroups] = useState<Group[]>([]);

  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const selectedCategory = params.get("Category");
  const dispatch = useDispatch<AppDispatch>();

  const containerRef = useRef<HTMLDivElement>(null); // Define containerRef

  const getRoleValue = (role: string | null): number => {
    switch (role) {
      case "Vendor":
        return 1;
      case "Customer":
        return 0;
      default:
        return 2;
    }
  };

  const getCurrentUserId = (): string => {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (userId == null) {
      userId = "0";
    }
    return userId;
  };

  // To get the initial data for the users and the categegories for the dashboard
  const load = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private/get/dashboard/list`,
        { Role: getRoleValue(params.get("Role")),
          UserId: getCurrentUserId()
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        }
      );
      setUsers(res.data.users);
      setFilteredUsers(res.data.users);
      setSearch("");
    } catch (error) {
      // Handle error appropriately
    }
    dispatch(setIsLoading(false));
  }, [params, dispatch]);

  const loadGroups = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private/get/groups/listWithMembers`,
        { 
          userId: getCurrentUserId()
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        }
      );
      setMyGroups(res.data.groups);
    } catch (error) {
      // Handle error appropriately
    }
    dispatch(setIsLoading(false));
  }, [params, dispatch]);

  useEffect(() => { //((user.Name)?.indexOf(search) > -1 || (user.Email)?.indexOf(search) > -1)
    let searchRes = search == "" ? users : users.filter(user => (user.Name)?.indexOf(search) > -1 || (user.Email)?.indexOf(search) > -1);
    // Slice data to display on current page
    setFilteredUsers(searchRes);
    const currUsers = searchRes.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    setCurrentUsers(currUsers);
  }, [search, currentPage]);

  useEffect(() => { //((user.Name)?.indexOf(search) > -1 || (user.Email)?.indexOf(search) > -1)
    const currUsers = filteredUsers.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    setCurrentUsers(currUsers);
  }, [filteredUsers]);

  // Calculate total pages
  useEffect(() => { //((user.Name)?.indexOf(search) > -1 || (user.Email)?.indexOf(search) > -1)
    setTotalPages(Math.ceil(filteredUsers.length / itemsPerPage));
  }, [filteredUsers, itemsPerPage]);  

  // Handle Page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle Category click
  const handleCategoryClick = (category: string) => {
    router.push(`${path}?Role=${params.get("Role")}&Category=${category}`);
    setCurrentPage(1);  // Reset to the first page when category changes
  };

  useEffect(() => {
    if (params.get("User")) {
      setProfileView(true)
    } else {
      setProfileView(false)
      load();
      loadGroups();
    }
  }, [load, params]);

  // start Mouse action for the category list
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  // handle Mouse Move event for the category List
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // The multiplier can be adjusted for sensitivity
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove]);
  // end mouse action

  useEffect(() => {
    const resizeHandler = () => {
      if (window.innerWidth > 1470) setItemsPerPage(8)
      else if (window.innerWidth > 1220 && window.innerWidth < 1470) setItemsPerPage(6)
      else if (window.innerWidth > 768 && window.innerWidth < 1220) setItemsPerPage(4)
      else setItemsPerPage(3)
    }

    window.addEventListener("resize", resizeHandler)

    return () => {
      window.removeEventListener("resize", resizeHandler)
    }
  }, []);

  const onAddUseToGroup = async (userId: number, groupId: number) => {
    let apiLink = "/update/groups/addUser";    
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private${apiLink}`,
        {
          groupId: groupId,
          userId: userId,
          createrId: getCurrentUserId()
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        }
      );
      setMyGroups(res.data.groups);
      toast.success(res.data.message);
    } catch (error) {
      // Handle error appropriately
      toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  }

  return (
    profileView ?
      <ViewVendorProfileWrapper />
      : <div className="page-container bg-white">
        <Sidebar />
        <div className="content-wrapper w-full pl-[280px] max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
          <div className="page-content relative w-full flex flex-col gap-[12px] p-[24px] max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px]">
            <PageHeader />
            {/* Search Area Start */}
            <div className="search-box sticky top-0 bg-white z-10 px-[16px] py-[12px] gap-[10px] whitespace-nowrap rounded-[10px] flex items-center w-full border">
              <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={faSearch} className="text-[14px]" /></span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none inline-block w-full text-[14px]" placeholder="Search Email or username" />
            </div>
            {/* Search Area End*/}
            {/* Start category nav bar */}
            {/* <div
              ref={containerRef}
              className="category-container overflow-hidden"
              onMouseDown={handleMouseDown}
              style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            >
              <ul className="flex gap-7 text-[16px] whitespace-nowrap select-none">
                <li onClick={() => handleCategoryClick("All")}
                  className={`py-[7px] cursor-pointer px-[20px] border border-gray-400 rounded-full ${selectedCategory === "All" || !selectedCategory ? "text-white bg-gradient-to-r from-[#0F00D4] to-[#B300C8]" : ""}`}>
                  All
                </li>
                {categoryList.map((cat, idx) => (
                  <li key={idx}
                    className={`py-[7px] px-[20px] cursor-pointer border border-gray-400 rounded-full ${selectedCategory === cat.Profession ? "text-white bg-gradient-to-r from-[#0F00D4] to-[#B300C8]" : ""}`}
                    onClick={() => handleCategoryClick(cat.Profession)}>
                    {cat.Profession}
                  </li>
                ))}
              </ul>
            </div> */}
            {/* End category nav bar */}
            <hr className="border border-gray-600" />

            {/* Start profile list */}
            <div className="user-cart-group-container flex flex-col gap-[46px]">
              <div className="cart-container grid grid-cols-4 max-[1480px]:grid-cols-3 max-[1220px]:grid-cols-2 gap-y-[30px] max-md:grid-cols-1 gap-x-[20px]">
                {currentUsers.map((user, idx) => (
                  <VendorCard
                    key={idx}
                    name={user.Name}
                    category={user.Profession}
                    address={user.Address}
                    email={user.Email}
                    id={user.Id}
                    photo={user.Photo_Name}
                    myGroups={myGroups.filter(group => !group.members.includes(user.Id.toString()))}
                    onAddToGroup={(userId: number, groupId: number) => {
                      onAddUseToGroup(userId, groupId);
                    }}
                  />
                ))}
              </div>

              {/* Start pagination */}
              <div className="flex flex-col gap-[16px]">
                <hr className="border border-gray-600" />
                <div className="flex justify-between items-center flex-wrap">
                  <span className="whitespace-nowrap text-[14px]">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{" "}
                    {filteredUsers.length} Results
                  </span>
                  <ul className="border border-gray-400 text-[14px] text-gray-400 flex rounded-md">
                    <li
                      className={`p-1 px-3 ${currentPage === 1 ? "text-gray-300" : "cursor-pointer"}`}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <li
                        key={i}
                        className={`p-1 px-3 border-x ${currentPage === i + 1 ? "text-black" : "cursor-pointer"}`}
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </li>
                    ))}
                    <li
                      className={`p-1 px-3 ${currentPage === totalPages ? "text-gray-300" : "cursor-pointer"}`}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </li>
                  </ul>
                </div>
              </div>
              {/* End pagination */}
            </div>
            {/* End profile list */}

          </div>
        </div>
      </div>
  );
};

const Dashboard = () => (
  <Suspense fallback={<PreLoading />}>
    <DashboardComponent />
  </Suspense>
);

export default Dashboard;
