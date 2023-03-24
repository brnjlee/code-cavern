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
        activeItemId === itemId && "bg-slate-200 pl-4 pr-3",
        "text-sm bg-gray-100 hover:bg-gray-200 pl-2 pr-1 ml-1.5 h-7"
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
    switch (activeTab()?.type) {
      case "CODE":
        return <CodeEditor id={activeTab()?.itemId} />;
      case "TEXT":
        return <TextEditor id={activeTab()?.itemId} />;
    }
  };

  return (
    <div className="relative h-full border border-slate-200 rounded flex flex-col">
      <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
        <div className="bg-white h-10 flex items-center rounded-t">
          {renderTabs}
          <button
            type="button"
            onClick={() => {}}
            className={clsx(
              "transition-all text-slate-400 h-6 w-6 ml-1 flex justify-center items-center hover:text-slate-600 hover:bg-slate-200 rounded-lg p-[3px]"
            )}
          >
            <FiPlus className="h-4 w-4" />
          </button>
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
