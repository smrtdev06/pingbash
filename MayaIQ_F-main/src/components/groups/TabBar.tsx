import React from "react";

type Tab = {
  label: string;
};

interface TabBarProps {
  tabs: Tab[];
  activeIndex: number;
  onTabClick: (index: number) => void;
}

const TabBar: React.FC<TabBarProps> = ({ tabs, activeIndex, onTabClick }) => {
  return (
    <div className="flex">
      {/* Tab buttons */}
      <div className="flex border-b border-gray-300">
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`text-[16px] font-bold px-4 transition-colors duration-200 ${
              index === activeIndex
                ? "border-b-2 border-blue-700 text-blue-700"
                : "text-gray-700 hover:text-blue-700"
            }`}
            onClick={() => onTabClick(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {/* <div className="p-4">{tabs[activeIndex].content}</div> */}
    </div>
  );
};

export default TabBar;