import React from "react";
import SortableItem from "../SortableItem";
import { FaPython } from "react-icons/fa";
import { MdTextSnippet } from "react-icons/md";
import { BsFileEarmarkTextFill } from "react-icons/bs";
import { UniqueIdentifier } from "@dnd-kit/core";
import clsx from "clsx";
import { Tab } from "../../types";

type SortableTab = Tab & {
  parent: string;
  className: string;
  onClick: () => void;
  disabled: boolean;
  children?: React.ReactNode;
};
const SortableTab = ({
  name,
  type,
  className,
  children,
  ...props
}: SortableTab) => {
  return (
    <SortableItem
      name={name}
      type={type}
      {...props}
      className={clsx(
        className,
        "select-none rounded flex items-center transition-all text-slate-300 hover:text-white"
      )}
    >
      {type === "TEXT" ? (
        <BsFileEarmarkTextFill className="text-yellow-500 mr-1.5 text-base" />
      ) : (
        <FaPython className="text-cyan-500 mr-1.5 text-base" />
      )}
      <span className="font-[500] text-[15px]">
        {name.length ? name : "Untitled"}
      </span>
      {children}
    </SortableItem>
  );
};

export default SortableTab;
