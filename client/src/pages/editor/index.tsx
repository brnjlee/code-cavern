import React, { useEffect, useRef, useState, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
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

import Item from "../../components/Item";
import TabContainer from "../../components/TabContainer";
import { genUniqueId } from "../../utils/utils";
import { Tab } from "../../types";

const DEFAULT_TABS = [
  {
    type: "code",
    name: "test1.py",
    id: "500",
  },
  {
    type: "code",
    name: "test2.py",
    id: "501",
  },
  {
    type: "code",
    name: "test3.py",
    id: "502",
  },
  {
    type: "code",
    name: "test4.py",
    id: "503",
  },
  {
    type: "text",
    name: "test5.md",
    id: "1",
  },
  {
    type: "text",
    name: "test6.md",
    id: "2",
  },
];

type DirectionTable = {
  right: string;
  left: string;
  top: string;
  bottom: string;
};

const directionTable: DirectionTable = {
  right: "horizontal",
  left: "horizontal",
  top: "vertical",
  bottom: "vertical",
};

const targetAreas = new Set<UniqueIdentifier>([
  "left",
  "top",
  "right",
  "bottom",
]);

type Panel = {
  type: string;
  id?: string;
  tabs?: Tab[];
  panels?: Panel[];
};
type HoveringOver = {
  containerId: string;
  hover: UniqueIdentifier;
};
export default () => {
  const [draggedTab, setDraggedTab] = useState<Tab | null>(null);
  const [hoveringOver, setHoveringOver] = useState<HoveringOver>({
    containerId: "",
    hover: "",
  });
  const [layout, setLayout] = useState<Panel>({
    type: "root",
    panels: [
      {
        type: "panel",
        id: genUniqueId(),
        tabs: DEFAULT_TABS,
      },
    ],
  });

  const renderLayout = (root: Panel) => {
    if (root.type === "panel") {
      return (
        <Panel>
          <TabContainer
            key={root.id}
            tabs={root.tabs || []}
            containerId={root.id || ""}
            hoveringOver={
              hoveringOver.containerId === root.id ? hoveringOver.hover : ""
            }
          />
        </Panel>
      );
    }
    const resizeHandleClass =
      root.type === "horizontal" || root.type === "root" ? "w-2" : "h-2";
    if (root.type === "root") {
      return (
        <PanelGroup direction="horizontal">
          {root.panels.map((child: Panel, i: number) => (
            <>
              {renderLayout(child)}
              {i < root.panels.length - 1 ? (
                <PanelResizeHandle className={resizeHandleClass} />
              ) : null}
            </>
          ))}
        </PanelGroup>
      );
    }
    return (
      <Panel>
        <PanelGroup direction={root.type}>
          {root.panels.map((child: Panel, i: number) => (
            <>
              {renderLayout(child)}
              {i < root.panels.length - 1 ? (
                <PanelResizeHandle className={resizeHandleClass} />
              ) : null}
            </>
          ))}
        </PanelGroup>
      </Panel>
    );
  };

  const handleCreateContainer = (
    originId: string,
    targetArea: UniqueIdentifier,
    tab: Tab
  ) => {
    const mutateClone = (root: Panel) => {
      if (root.panels) {
        const idx = indexOfPanel(root.panels, originId);
        if (idx != -1) {
          let newPanel: Panel;
          const tabIdx = root.panels[idx].tabs
            ?.map((e) => e.id)
            .indexOf(tab.id);
          root.panels[idx].tabs?.splice(tabIdx, 1);
          if (
            directionTable[targetArea as keyof DirectionTable] === root.type
          ) {
            newPanel = {
              type: "panel",
              id: genUniqueId(),
              tabs: [tab],
            };
            if (targetArea === "right" || targetArea === "bottom") {
              root.panels.splice(idx + 1, 0, newPanel);
              return;
            }
            root.panels.splice(idx, 0, newPanel);
            return;
          }
          newPanel = {
            type: directionTable[targetArea as keyof DirectionTable],
            panels: [
              {
                type: "panel",
                id: genUniqueId(),
                tabs: [tab],
              },
            ],
          };
          // console.info(root.panels[idx]);
          if (targetArea === "right" || targetArea === "bottom") {
            newPanel.panels.unshift(root.panels[idx]);
          } else {
            newPanel.panels.push(root.panels[idx]);
          }
          root.panels.splice(idx, 1, newPanel);
          return;
        }
        root.panels.forEach((child) => mutateClone(child));
      }
    };
    let layoutClone = JSON.parse(JSON.stringify(layout));
    mutateClone(layoutClone);
    setLayout(layoutClone);
  };

  const indexOfPanel = (panels: Panel[], id: string) => {
    for (let i = 0; i < panels.length; i++) {
      const root = panels[i];
      if (root.id === id) {
        return i;
      }
    }
    return -1;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    const targetArea = over?.id.split("-").pop();
    if (over && targetAreas.has(targetArea)) {
      setHoveringOver({
        containerId: over.data.current.parent,
        hover: targetArea,
      });
    } else {
      setHoveringOver({
        containerId: "",
        hover: "",
      });
    }
    console.log(hoveringOver);
  };
  const handleDragStart = (event: DragOverEvent) => {
    const { active } = event;
    setDraggedTab({
      id: active.id,
      name: active.data.current.name,
      type: active.data.current.type,
    });
  };

  const handleDragEnd = (event: DragOverEvent) => {
    const { active, over } = event;
    const mutateTabs = (root: Panel) => {
      if (root.type === "panel" && root.id === active.data.current?.parent) {
        const oldIdx = root.tabs.map((e) => e.id).indexOf(active.id);
        const newIdx = root.tabs.map((e) => e.id).indexOf(over.id);
        root.tabs = arrayMove(root.tabs, oldIdx, newIdx);
        return;
      } else if (root.panels) {
        root.panels.forEach((child) => mutateTabs(child));
      }
    };
    if (over && draggedTab) {
      if (targetAreas.has(hoveringOver.hover)) {
        handleCreateContainer(
          active.data.current?.parent,
          hoveringOver.hover,
          draggedTab
        );
      } else if (active.id !== over.id) {
        // ADD LOGIC WHEN PARENTS ARE NOT EQUAL
        console.log("swap");
        let layoutClone = JSON.parse(JSON.stringify(layout));
        mutateTabs(layoutClone);
        setLayout(layoutClone);
      }
    }
    setDraggedTab(null);
    setHoveringOver({
      containerId: "",
      hover: "",
    });
  };
  const renderItem = (
    <Item
      id={draggedTab?.name ?? ""}
      className="bg-gray-200 px-2 py-1 text-sm rounded flex items-center"
    >
      <span>{draggedTab?.name}</span>
      <button
        className={clsx(
          "h-5 w-5 ml-1 flex justify-center items-center hover:bg-gray-100 rounded-full p-[3px]"
        )}
      >
        <Cross2Icon className={"text-black"} />
      </button>
    </Item>
  );

  return (
    <div className="h-screen p-10">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {renderLayout(layout)}
        <DragOverlay>{draggedTab ? renderItem : null}</DragOverlay>
      </DndContext>
    </div>
  );
};
