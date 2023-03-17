import React from "react";
import SortableItem from "../SortableItem";
import { FaPython } from "react-icons/fa";
import { MdTextSnippet } from "react-icons/md";
import { UniqueIdentifier } from "@dnd-kit/core";
import clsx from "clsx";
import { Tab } from "../../types";

type SortableTab = Tab & {
  parent: string;
  className: string;
  onClick: () => void;
  children?: React.ReactNode;
};
const SortableTab = ({
  id,
  itemId,
  name,
  type,
  parent,
  className,
  onClick,
  children,
}: SortableTab) => {
  return (
    <SortableItem
      id={id}
      itemId={itemId}
      name={name}
      type={type}
      parent={parent}
      onClick={onClick}
      className={clsx(
        className,
        "select-none rounded flex items-center transition-all"
      )}
    >
      {type === "text" ? (
        <MdTextSnippet className="text-yellow-500 mr-1.5 text-base" />
      ) : (
        <FaPython className="text-cyan-500 mr-1.5 text-base" />
      )}
      <span>{name}</span>
      {children}
    </SortableItem>
  );
};

export default SortableTab;
