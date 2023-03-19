import React from "react";
import clsx from "clsx";
import { FiPlus } from "react-icons/fi";

import Tooltip from "../Tooltip";

const Sidebar = ({
  active,
  onClick,
}: {
  active: string;
  onClick: (id: string) => void;
}) => {
  const SidebarItems = [
    { id: "1", name: "Project 1", label: "bs" },
    { id: "2", name: "Project 2", label: "tp" },
    { id: "3", name: "Project 3", label: "kl" },
  ];
  const renderSidebarItems = SidebarItems.map(({ id, name, label }) => (
    <Tooltip key={id} className="mb-2" label={name} direction="right">
      <SidebarItem
        name={label}
        onClick={() => onClick(id)}
        selected={active === id}
      />
    </Tooltip>
  ));
  return (
    <div className="w-[4.5rem] flex flex-col py-6 pl-[0.85rem] relative">
      {renderSidebarItems}
      <Tooltip className="mb-2" label={"Add workspace"} direction="right">
        <SidebarItem
          onClick={() => {}}
          selected={false}
          bgClass="bg-slate-100 hover:bg-green-600 text-green-600 hover:text-slate-100"
        >
          <FiPlus className="h-6 w-6 " />
        </SidebarItem>
      </Tooltip>
    </div>
  );
};

const SidebarItem = ({
  name,
  onClick,
  selected,
  children,
  bgClass = "bg-slate-400 hover:bg-slate-100 hover:text-slate-600",
}: {
  name?: string;
  onClick: () => void;
  selected: boolean;
  children?: React.ReactNode;
  bgClass?: string;
}) => {
  return (
    <div
      className={clsx(
        selected
          ? "rounded-l-[1.4rem] rounded-r-none bg-slate-100 w-full"
          : bgClass + " " + "hover:rounded-[1rem] text-white",
        "rounded-[1.4rem] flex items-center font-bold h-[2.8rem] w-[2.8rem] cursor-pointer transition-all"
      )}
      onClick={onClick}
    >
      <div className=" flex items-center justify-center w-[2.8rem] h-[2.8rem]">
        {name || children}
      </div>
      <div
        className={clsx(
          selected ? "h-[71px] w-[0.8rem]" : "h-0 w-0",
          "absolute bg-slate-100 right-0 transition-all"
        )}
      >
        <svg className="absolute w-full h-full">
          <circle id="c" r="13" x="100%" fill="rgb(203 213 225)" />
          <use xlinkHref="#c" y="100%" />
        </svg>
      </div>
    </div>
  );
};

export default Sidebar;
