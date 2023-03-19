import React from "react";
import { Tab } from "../../types";
import SortableTab from "../SortableTab";
import { TabParents } from "../../types";
type FilesPanel = {
  tabs: Tab[];
  openTab: (tab: Tab) => void;
  openedTabs: TabParents;
};
const FilesPanel = ({ tabs, openTab, openedTabs }: FilesPanel) => {
  const renderTabs = tabs
    .sort((a, b) => (a.name > b.name ? 1 : -1))
    .map(({ type, name, id, itemId }) => (
      <SortableTab
        key={id}
        id={id}
        itemId={itemId}
        name={name}
        type={type}
        disabled={false}
        parent={"sidebar"}
        onClick={() => openTab({ type, name, id, itemId })}
        className=" group hover:bg-gray-200 pl-2 pr-1 py-1 text-base"
      >
        {/* {openedTabs[itemId]?.length ? (
          <div className="absolute left-3 w-1 h-1 ml-auto bg-slate-300 rounded-[2rem] group-hover:w-2 transition-all" />
        ) : null} */}
      </SortableTab>
    ));
  return (
    <div className="h-full rounded p-5 relative">
      <h3 className="font-bold mb-2 text-slate-600">Files</h3>
      {renderTabs}
    </div>
  );
};
export default FilesPanel;
