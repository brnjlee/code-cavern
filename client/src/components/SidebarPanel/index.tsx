import React from "react";
import { Tab } from "../../types";
import { FaPython } from "react-icons/fa";
import { MdTextSnippet } from "react-icons/md";
import SortableTab from "../SortableTab";
type SidebarPanel = {
  tabs: Tab[];
};
const SidebarPanel = ({ tabs }: SidebarPanel) => {
  const renderTabs = tabs
    .sort((a, b) => (a.name > b.name ? 1 : -1))
    .map(({ type, name, id }) => (
      <SortableTab
        key={id}
        id={id + "-sidebar"}
        name={name}
        type={type}
        parent={"sidebar"}
        onClick={() => {}}
        className=" hover:bg-gray-200 pl-2 pr-1 py-1 text-base"
      />
    ));
  return (
    <div className="h-full bg-white rounded p-5">
      <h3 className="font-bold mb-2">Files</h3>
      {renderTabs}
    </div>
  );
};
export default SidebarPanel;
