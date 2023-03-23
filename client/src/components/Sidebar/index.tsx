import React from "react";
import clsx from "clsx";
import { FiPlus, FiLogOut } from "react-icons/fi";
import Link from "next/link";
import { signOut } from "next-auth/react";

import Tooltip from "../Tooltip";

const Sidebar = ({
  spaces,
  active,
  openCreateModal,
}: {
  spaces: any[];
  active?: string;
  openCreateModal: () => void;
}) => {
  const renderSidebarItems = spaces.map(({ id, name }) => (
    <Tooltip key={id} className="mb-2" label={name} direction="right">
      <Link href={`/space/${id}`}>
        <SidebarItem
          name={name[0]}
          selected={active === String(id)}
          className="bg-slate-400 hover:bg-slate-100 hover:text-slate-600 text-white"
        />
      </Link>
    </Tooltip>
  ));
  return (
    <div className="w-[4.5rem] flex flex-col py-6 pl-[0.85rem] relative">
      {renderSidebarItems}
      <Tooltip className="mb-2" label={"Add workspace"} direction="right">
        <SidebarItem
          onClick={openCreateModal}
          selected={false}
          className="bg-slate-100 hover:bg-green-600 text-green-600 hover:text-slate-100"
        >
          <FiPlus className="h-6 w-6 " />
        </SidebarItem>
      </Tooltip>
      <Tooltip className="mb-2" label={"Sign out"} direction="right">
        <SidebarItem
          onClick={() =>
            signOut({
              callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/login`,
            })
          }
          selected={false}
          className="bg-slate-100 hover:bg-green-600 text-green-600 hover:text-slate-100"
        >
          <FiLogOut className="h-6 w-6 " />
        </SidebarItem>
      </Tooltip>
    </div>
  );
};

const SidebarItem = ({
  name,
  selected,
  children,
  className,
  onClick,
}: {
  name?: string;
  selected: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        selected
          ? "rounded-l-[1.4rem] rounded-r-none bg-slate-100 w-full"
          : className + " " + "hover:rounded-[1rem]",
        "rounded-[1.4rem] flex items-center font-bold h-[2.8rem] w-[2.8rem] cursor-pointer transition-all"
      )}
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
