import React, { useCallback } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { IoClose } from "react-icons/io5";
import clsx from "clsx";
import { FiPlus } from "react-icons/fi";

import Droppable from "../Droppable";
import SortableTab from "../SortableTab";

import HoverOverlay from "./HoverOverlay";
import CodeEditor from "../CodeEditor";
import TextEditor from "../TextEditor";
import { Tab } from "../../types";

type TabContainer = {
  tabs: Tab[];
  activeItemId: UniqueIdentifier;
  setActiveItemId: (itemId: UniqueIdentifier) => void;
  containerId: string;
  hoveringOver: UniqueIdentifier;
  closeTab: (itemId: UniqueIdentifier, tabIdx: number) => void;
};

const TabContainer = ({
  tabs,
  activeItemId,
  setActiveItemId,
  containerId,
  hoveringOver,
  closeTab,
}: TabContainer) => {
  const hoverContainers = [
    {
      containerId,
      type: "left",
      className: "row-span-2",
    },
    {
      containerId,
      type: "top",
      className: "col-span-3",
    },
    {
      containerId,
      type: "right",
      className: "row-span-2",
    },
    {
      containerId,
      type: "bottom",
      className: "col-span-3",
    },
  ];
  const activeTab = useCallback(() => {
    return (
      tabs.find((t) => t.itemId === activeItemId) ?? {
        type: "NONE",
        itemId: "-1",
        name: "",
      }
    );
  }, [activeItemId, tabs]);

  const renderTabs = tabs.map(({ type, name, id, itemId }, tabIdx) => (
    <SortableTab
      key={id}
      disabled={tabs.length === 1}
      itemId={itemId}
      id={id}
      name={name}
      type={type}
      parent={containerId}
      onClick={() => setActiveItemId(itemId)}
      className={clsx(
        activeItemId === itemId ? "bg-slate-800 pl-4 pr-3" : "bg-slate-700",
        "text-sm  hover:bg-slate-800 pl-2 pr-1 ml-1.5 h-7"
      )}
    >
      <button
        className={clsx(
          "transition-all h-5 w-5 ml-1 flex justify-center hover:bg-white hover:text-red-500 rounded-lg p-[3px] text-slate-500"
        )}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          closeTab(itemId, tabIdx);
        }}
      >
        <IoClose />
      </button>
    </SortableTab>
  ));

  const renderHoverContainers = hoverContainers.map(
    ({ containerId, type, className }) => (
      <Droppable
        key={containerId + type}
        id={containerId + type}
        parent={containerId}
        type={type}
        className={clsx("h-full", className)}
      >
        {/* {parent === id ? draggableMarkup : "Drop here"} */}
      </Droppable>
    )
  );

  const renderContent = () => {
    const active = activeTab();
    switch (active.type) {
      case "CODE":
        return <CodeEditor id={active.itemId} />;
      case "TEXT":
        return <TextEditor id={active.itemId} name={active.name} />;
    }
  };

  return (
    <div className="relative h-full flex flex-col">
      <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
        <div className="bg-slate-600 h-[3rem] min-h-[3rem] border-b-2 border-slate-700 flex items-center">
          {renderTabs}
        </div>
      </SortableContext>
      <div className="top-10 absolute h-[calc(100%-2.5rem)] right-0 left-0 grid grid-cols-5 grid-rows-2">
        {renderHoverContainers}
      </div>

      <HoverOverlay hoveringOver={hoveringOver} />
      {renderContent()}
    </div>
  );
};

export default TabContainer;
