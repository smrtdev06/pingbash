"use client";
import React from "react";
import Image from "next/image";

interface Member {
  id: number;
  avatar: string;
  name: string;
  job: string;
  detail: string;
}

const PassionateTeam: React.FC = () => {
  const members: Member[] = [
    {
      id: 1,
      avatar: "avatar01.png",
      name: "Saul Ramirez",
      job: "Chief Executive Officer",
      detail:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin p",
    },
    {
      id: 2,
      avatar: "avatar02.png",
      name: "Saul Ramirez",
      job: "Chief Executive Officer",
      detail:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin p",
    },
    {
      id: 3,
      avatar: "avatar03.png",
      name: "Saul Ramirez",
      job: "Chief Executive Officer",
      detail:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin p",
    },
    {
      id: 4,
      avatar: "avatar04.png",
      name: "Saul Ramirez",
      job: "Chief Executive Officer",
      detail:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin p",
    },
    {
      id: 5,
      avatar: "avatar05.png",
      name: "Saul Ramirez",
      job: "Chief Executive Officer",
      detail:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin p",
    },
    {
      id: 6,
      avatar: "avatar06.png",
      name: "Saul Ramirez",
      job: "Chief Executive Officer",
      detail:
        "Lorem ipsum dolor sit amet consectetur. Mus pulvinar condimentum massa enim. In eget netus sollicitudin p",
    },
  ];

  return (
    <div className="passionateTeam w-[1120px] max-[1135px]:w-[620px] max-[650px]:w-[230px] items-center mx-auto flex flex-col gap-[60px] py-[80px] justify-center">
      <div className="team-title text-white w-[634px] max-[650px]:w-[230px] gap-[20px] flex flex-col">
        <h3 className="header text-[60px] max-[1135px]:text-[40px] text-center leading-[66px] max-[1135px]:leading-[44px] font-semibold">
          Our Passionate Team
        </h3>
        <p className="explanation text-[16px] leading-[24px] text-[#D1D5DB] text-center">
          PingBash Description Here.
        </p>
      </div>
      <div className="team-container text-white select-none gap-[60px] flex justify-between flex-wrap">
        {members.map((member) => (
          <div key={member.id} className="content w-[333px] max-[1135px]:w-[260px] max-[650px]:w-full flex flex-col gap-[24px]">
            <Image src={`/images/team/${member.avatar}`} alt={member.name} width={400} height={400} priority
              className="rounded-br-[70px] w-full bg-[#D9D9D9]" />
            <div className="flex flex-col gap-[6px] items-start">
              <p className="name text-[27px] font-semibold leading-[32.68px]">{member.name}</p>
              <p className="job text-[18px] leading-[27px] font-semibold text-[#F9FAFB]">{member.job}</p>
              <p className="detail text-[16px] leading-[25.6px] text-[#9CA3AF]">{member.detail}</p>
            </div>
          </div>
        ))}
        <div className="clear-both"></div>
      </div>
    </div>
  );
};

export default PassionateTeam;
