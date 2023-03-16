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
import clsx from "clsx";

import Draggable from "../Draggable";
import Droppable from "../Droppable";
import SortableItem from "../SortableItem";

import HoverOverlay from "./HoverOverlay";
import CodeEditor from "../CodeEditor";
import TextEditor from "../TextEditor";
import { Tab } from "../../types";

type TabContainer = {
  tabs: Tab[];
  containerId: string;
  hoveringOver: UniqueIdentifier;
};

const TabContainer = ({ tabs, containerId, hoveringOver }: TabContainer) => {
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [activeName, setActiveName] = useState(null);

  useEffect(() => {
    if (!tabs.map((e) => e.id).includes(activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs]);

  const hoverContainers = [
    [containerId + "-left", "row-span-2"],
    [containerId + "-top", "col-span-3"],
    [containerId + "-right", "row-span-2"],
    [containerId + "-bottom", "col-span-3"],
  ];
  // const [hoveringOver, setHoveringOver] = useState<UniqueIdentifier>("");
  const activeTab = useCallback(
    (id: UniqueIdentifier) => {
      return tabs.find((t) => t.id === id);
    },
    [activeTabId, tabs]
  );

  const renderTabs = tabs.map(({ type, name, id }) => (
    <SortableItem
      key={id}
      id={id}
      name={name}
      type={type}
      parent={containerId}
      onClick={() => setActiveTabId(id)}
      className={clsx(
        activeTabId === id && "bg-gray-400",
        "select-none bg-gray-200 pl-2 pr-1 py-1 ml-1.5 text-sm rounded flex items-center"
      )}
    >
      <span>{name}</span>
      <button
        className={clsx(
          "h-5 w-5 ml-1 flex justify-center items-center hover:bg-gray-100 rounded-full p-[3px]"
        )}
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
      >
        <Cross2Icon className={"text-black"} />
      </button>
    </SortableItem>
  ));

  const renderHoverContainers = hoverContainers.map(([id, className]) => (
    <Droppable
      key={id}
      id={id}
      parent={containerId}
      className={clsx("h-full", className)}
    >
      {/* {parent === id ? draggableMarkup : "Drop here"} */}
    </Droppable>
  ));

  const renderContent = () => {
    switch (activeTab(activeTabId)?.type) {
      case "code":
        return <CodeEditor />;
      case "text":
        return <TextEditor />;
    }
  };

  return (
    <div className="relative h-full bg-gray-200 rounded flex flex-col">
      <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
        <div className="bg-black h-10 flex items-center rounded-t">
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
