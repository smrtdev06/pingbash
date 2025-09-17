
'use client'
import React, { useRef, useState, useEffect, useCallback, Suspense } from "react";
import Sidebar from "@/components/sideBar";
import TabBar from "@/components/groups/TabBar";
import Popup from '@/components/groups/Popup';
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import axios from "axios";
import PageHeader from "@/components/pageHeader";
import GroupCard from "@/components/groups/GroupCard";
import { SERVER_URL, TOKEN_KEY, USER_ID_KEY } from "@/resource/const/const";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { setIsLoading } from "@/redux/slices/stateSlice";
import ViewVendorProfileWrapper from "@/components/dashboard/viewVendorProfile";
import PreLoading from "@/components/mask/preLoading";
import messages from "@/resource/const/messages"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
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
  ismember: boolean;
}

const GroupsContent: React.FC = () => {

  const [users, setUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [profileView, setProfileView] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(8)
  const [search, setSearch] = useState("")


  const [groups, setGroups] = useState<Group[]>([]);
  const [groupLists, setGroupLists] = useState<Group[]>([]);

  const [tabIndex, setTabIndex] = useState(0)
  const [openNewGroupPop, setOpenNewGroupPop] = useState(false);
  const [myId, setMyId] = useState(0);

  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const containerRef = useRef<HTMLDivElement>(null); // Define containerRef
  const inputGroupRef = useRef<HTMLInputElement | null>(null)


  const tabs = [
    {
      label: "All",
    },
    {
      label: "My Groups",
    },
    {
      label: "Joined Groups",
    },
  ];

  const getCurrentUserId = (): number => {
    let userId = localStorage.getItem(USER_ID_KEY);
    if (userId == null) {
      userId = "0";
    }
    setMyId(parseInt(userId));
    return parseInt(userId);
  };

  // To get the initial data for the users and the categegories for the dashboard
  const load = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private/get/groups/list`,
        {userId: getCurrentUserId()},
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        }
      );
      setGroups(res.data.groups);
      setGroupLists(res.data.groups);
    } catch (error) {
      // Handle error appropriately
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  // Calculate total pages
  const totalPages = Math.ceil(groupLists.length / itemsPerPage);

  // Handle Page change
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    if (params.get("User")) {
      setProfileView(true)
    } else {
      setProfileView(false)
      load();
    }
  }, [load]);

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
    if (tabIndex == 0) {
      setGroupLists(groups);
    } else if (tabIndex == 1) {
      setGroupLists(groups.filter((group) =>
        group.creater_id == myId
      ));
    } else {
      setGroupLists(groups.filter((group) =>
        group.ismember
      ));
    }
  }, [tabIndex, groups]);

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

  const createNewGroup = useCallback(async () => {
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private/add/groups/create`,
        {
          groupName: inputGroupRef.current?.value,
          createrId: localStorage.getItem(USER_ID_KEY)
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        }
      );
      setGroups(res.data.groups);
      toast.success(messages.group.createSuccess);
      setOpenNewGroupPop(false);
    } catch (error) {
      // Handle error appropriately
      toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const updateGroup = useCallback(async (groupId: number, type: string) => {
    let apiLink = "/delete/groups/delete";
    if (type == "delete") {
      apiLink = "/delete/groups/delete";
    } else if (type == "join") {
      apiLink = "/update/groups/join";
    } else if (type == "leave") {
      apiLink = "/update/groups/leave";
    }
    
    try {
      dispatch(setIsLoading(true));
      const res = await axios.post(`${SERVER_URL}/api/private${apiLink}`,
        {
          groupId: groupId,
          userId: localStorage.getItem(USER_ID_KEY)
        },
        {
          headers: {
            "Accept": "application/json",
            "Content-type": "application/json",
            Authorization: localStorage.getItem(TOKEN_KEY),
          },
        }
      );
      setGroups(res.data.groups);
      toast.success(res.data.message);
      setOpenNewGroupPop(false);
    } catch (error) {
      // Handle error appropriately
      toast.error(messages.common.serverError);
    }
    dispatch(setIsLoading(false));
  }, [dispatch]);

  const onCreateNewGroup = () => {
    if (inputGroupRef.current?.value == "") {
      inputGroupRef.current.focus();
      return;
    }
    createNewGroup();
  }

  const onDeleteGroup = (groupId: number) => {
    updateGroup(groupId, "delete");
  }

  const onJoinToGroup = (groupId: number) => {
    updateGroup(groupId, "join");
  }

  const onLeaveGroup = (groupId: number) => {
    updateGroup(groupId, "leave");
  }

  return (
    profileView ?
      <ViewVendorProfileWrapper />
      : <div className="page-container bg-white">
        <Sidebar />
        <div className="content-wrapper w-full pl-[280px] max-lg:px-0 h-screen overflow-y-auto overflow-x-hidden">
          <div className="page-content relative w-full flex flex-col gap-[8px] p-[24px] max-lg:px-[20px] max-lg:pt-0 max-lg:top-[102px]">
            <PageHeader />

            <div className="flex justify-between h-[40px]">
              <TabBar
                tabs={tabs}
                activeIndex={tabIndex}
                onTabClick={(index) => {
                  setTabIndex(index);
                }}
              />
              {tabIndex == 1 && <button className=" bg-gradient-to-r from-[#0F00D4] to-[#B300C8] text-white text-[14px] text-bold px-4 py-2 rounded-full"
                onClick={()=>!openNewGroupPop && setOpenNewGroupPop(true)}>
                Add New Group
              </button>}
            </div>

            {/* Search Area Start */}
            {/* <div className="search-box sticky top-0 bg-white z-10 px-[16px] py-[12px] gap-[10px] whitespace-nowrap rounded-[10px] flex items-center w-full border">
              <span className="hidden max-[810px]:flex"><FontAwesomeIcon icon={faSearch} className="text-[14px]" /></span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} className="outline-none inline-block w-full text-[14px]" placeholder="Search Email or username" />
            </div> */}
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
                {groupLists.map((group, idx) => (
                  <GroupCard
                    key={group.id}
                    groupId={group.id}
                    groupName={group.name}
                    groupCreaterId={group.creater_id}
                    ismember={group.ismember}
                    myId={myId}
                    onJoinGroup={(groupId: number) => {
                      onJoinToGroup(groupId);
                    }}
                    onLeaveGroup={(groupId: number) => {
                      onLeaveGroup(groupId);
                    }}
                    onDeleteGroup={(groupId: number) => {
                      onDeleteGroup(groupId);
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
                    {Math.min(currentPage * itemsPerPage, groupLists.length)} of{" "}
                    {users.length} Results
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
        <Popup isOpen={openNewGroupPop} onClose={() => setOpenNewGroupPop(false)}>
          <h2 className="text-xl font-semibold mb-2">Create New Group</h2>
          <input type="text" ref={inputGroupRef} className="w-full px-5 border border-gray-200 bg-gray-100 rounded-[12px] p-2" placeholder="Write a group name" />
          <button  className="h-[40px] mt-[20px] py-[2px] rounded-[12px] font-semibold text-white bg-gradient-to-r from-[#BD00FF] to-[#3A4EFF] w-full"
            onClick={() => onCreateNewGroup()}>Create</button>
        </Popup>
      </div>
  );
};

const Groups = () => (
  <Suspense fallback={<PreLoading />}>
    <GroupsContent />
  </Suspense>
);

export default Groups;
