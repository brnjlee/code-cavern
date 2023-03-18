import React, { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  DragOverlay,
  useSensor,
  useSensors,
  rectIntersection,
  DragOverEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Cross2Icon } from "@radix-ui/react-icons";
import { FaPython } from "react-icons/fa";
import { MdTextSnippet } from "react-icons/md";
import clsx from "clsx";

import Droppable from "../Droppable";
import SortableTab from "../SortableTab";

import HoverOverlay from "./HoverOverlay";
import CodeEditor from "../CodeEditor";
import TextEditor from "../TextEditor";
import { Tab } from "../../types";

type TabContainer = {
  tabs: Tab[];
  containerId: string;
  hoveringOver: UniqueIdentifier;
  closeTab: (tabIdx: number) => void;
};

const TabContainer = ({
  tabs,
  containerId,
  hoveringOver,
  closeTab,
}: TabContainer) => {
  const [activeTabId, setActiveTabId] = useState(null);
  const [activeName, setActiveName] = useState(null);

  useEffect(() => {
    if (!tabs.map((e) => e.id).includes(activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs]);

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
  // const [hoveringOver, setHoveringOver] = useState<UniqueIdentifier>("");
  const activeTab = useCallback(
    (id: UniqueIdentifier) => {
      return tabs.find((t) => t.id === id);
    },
    [activeTabId, tabs]
  );

  const renderTabs = tabs.map(({ type, name, id, itemId }, tabIdx) => (
    <SortableTab
      key={id}
      disabled={tabs.length === 1}
      itemId={itemId}
      id={id}
      name={name}
      type={type}
      parent={containerId}
      onClick={() => setActiveTabId(id)}
      className={clsx(
        activeTabId === id && "bg-slate-200 pl-4 pr-3",
        "text-sm bg-gray-100 hover:bg-gray-200 pl-2 pr-1 py-1 ml-1.5"
      )}
    >
      <button
        className={clsx(
          "h-5 w-5 ml-1 flex justify-center hover:bg-gray-100 rounded-full p-[3px]"
        )}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          closeTab(tabIdx);
        }}
      >
        <Cross2Icon className={"text-black"} />
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
    switch (activeTab(activeTabId)?.type) {
      case "code":
        return <CodeEditor />;
      case "text":
        return <TextEditor />;
    }
  };

  return (
    <div className="relative h-full shadow rounded flex flex-col">
      <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
        <div className="bg-white h-10 flex items-center rounded-t">
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
