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
    targetId: string,
    targetArea: UniqueIdentifier,
    tab: Tab
  ) => {
    let panelAdded = false;
    const mutateLayout = (root: Panel) => {
      if (root.panels) {
        const targetIdx = indexOfPanel(root.panels, targetId);
        const sourceIdx = indexOfPanel(root.panels, originId);
        if (sourceIdx != -1) {
          root.panels[sourceIdx].tabs = root.panels[sourceIdx].tabs?.filter(
            (e) => e.id !== tab.id
          );
        }
        if (targetIdx != -1 && !panelAdded) {
          panelAdded = true;
          let newPanel: Panel;
          if (
            directionTable[targetArea as keyof DirectionTable] === root.type
          ) {
            newPanel = {
              type: "panel",
              id: genUniqueId(),
              tabs: [tab],
            };
            if (targetArea === "right" || targetArea === "bottom") {
              root.panels.splice(targetIdx + 1, 0, newPanel);
            } else {
              root.panels.splice(targetIdx, 0, newPanel);
            }
          } else {
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
            if (targetArea === "right" || targetArea === "bottom") {
              newPanel.panels.unshift(root.panels[targetIdx]);
            } else {
              newPanel.panels.push(root.panels[targetIdx]);
            }
            root.panels.splice(targetIdx, 1, newPanel);
          }
        }

        root.panels.forEach((child) => mutateLayout(child));
      }
    };
    let layoutClone = JSON.parse(JSON.stringify(layout));
    mutateLayout(layoutClone);
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
    const transferTab = (root) => {
      if (root.type === "panel") {
        if (root.id === active.data.current?.parent) {
          root.tabs = root.tabs?.filter((e) => e.id !== active.id);
        } else if (root.id === over?.data.current?.parent) {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          const overIdx = root.tabs.map((e) => e.id).indexOf(over?.id);
          const newIdx =
            overIdx >= 0 ? overIdx + modifier : root.tabs.length + 1;
          root.tabs = [
            ...root.tabs.slice(0, newIdx),
            {
              id: active.id,
              type: active.data.current?.type,
              name: active.data.current?.name,
            },
            ...root.tabs.slice(newIdx, root.tabs.length),
          ];
        }
      } else if (root.panels) {
        root.panels.forEach((child) => transferTab(child));
      }
    };
    if (!over || !active) return;
    const isSortable = over?.data.current?.name;
    if (isSortable) {
      if (active.data.current?.parent !== over.data.current?.parent) {
        transferTab(layout);
      }
    } else {
      const targetArea = over?.id.split("-").pop();
      if (targetAreas.has(targetArea)) {
        setHoveringOver({
          containerId: over.data.current.parent,
          hover: targetArea,
        });
        return;
      }
    }
    setHoveringOver({
      containerId: "",
      hover: "",
    });
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
          active.data.current.parent,
          hoveringOver.containerId,
          hoveringOver.hover,
          draggedTab
        );
      } else if (active.id !== over.id) {
        // ADD LOGIC WHEN PARENTS ARE NOT EQUAL
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
