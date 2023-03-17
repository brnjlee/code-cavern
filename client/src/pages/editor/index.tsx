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
import { FaPython } from "react-icons/fa";
import { MdTextSnippet } from "react-icons/md";
import clsx from "clsx";

import Item from "../../components/Item";
import TabContainer from "../../components/TabContainer";
import SidebarPanel from "../../components/SidebarPanel";
import { genUniqueId } from "../../utils/utils";
import { Tab } from "../../types";

const DEFAULT_TABS = [
  {
    type: "code",
    name: "test9.py",
    itemId: "500",
    id: genUniqueId(),
  },
  {
    type: "code",
    name: "test2.py",
    itemId: "501",
    id: genUniqueId(),
  },
  {
    type: "code",
    name: "test3.py",
    itemId: "502",
    id: genUniqueId(),
  },
  {
    type: "code",
    name: "test4.py",
    itemId: "503",
    id: genUniqueId(),
  },
  {
    type: "text",
    name: "a.md",
    itemId: "1",
    id: genUniqueId(),
  },
  {
    type: "text",
    name: "test6.md",
    itemId: "2",
    id: genUniqueId(),
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
  id: string;
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
    id: genUniqueId(),
    panels: [
      {
        type: "panel",
        id: genUniqueId(),
        tabs: DEFAULT_TABS,
      },
    ],
  });

  const collapseContainer = (
    grandParent: Panel | null,
    parent: Panel | null,
    containerId: string
  ) => {
    const containerIdx = indexOfPanel(parent?.panels, containerId);
    if (containerIdx !== -1) {
      parent?.panels?.splice(containerIdx, 1);
      if (parent?.panels?.length === 1 && grandParent && grandParent.panels) {
        const wrapperIdx = indexOfPanel(grandParent.panels, parent.id);
        if (wrapperIdx !== -1) {
          grandParent.panels[wrapperIdx] = parent.panels[0];
        }
      }
    }
  };

  const handleCloseTab = (tabIdx: number, containerId: string) => {
    const closeTab = (
      grandParent: Panel | null,
      parent: Panel | null,
      root: Panel
    ) => {
      if (root.type === "panel" && root.id === containerId) {
        root.tabs?.splice(tabIdx, 1);
        if (!root.tabs?.length) {
          collapseContainer(grandParent, parent, containerId);
        }
        return;
      } else if (root.panels) {
        root.panels.forEach((child) => closeTab(parent, root, child));
      }
    };
    let layoutClone = JSON.parse(JSON.stringify(layout));
    closeTab(null, null, layoutClone);
    setLayout(layoutClone);
  };

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
            closeTab={(tabIdx) => handleCloseTab(tabIdx, root.id)}
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
            (e) => e.itemId !== tab.itemId
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
              id: genUniqueId(),
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

  const indexOfPanel = (
    panels: Panel[] | undefined,
    id: string | undefined
  ) => {
    if (!panels || !id) return -1;
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
          root.tabs = root.tabs?.filter(
            (e) => e.itemId !== active.data.current?.id
          );
        } else if (root.id === over?.data.current?.parent) {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          const overIdx = root.tabs
            .map((e) => e.itemId)
            .indexOf(over?.data.current?.id);
          const newIdx =
            overIdx >= 0 ? overIdx + modifier : root.tabs.length + 1;
          root.tabs = [
            ...root.tabs.slice(0, newIdx),
            {
              id: active.id,
              itemId: active.data.current?.id,
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
          containerId: over.data.current?.parent,
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
      itemId: active.data.current?.id,
      name: active.data.current?.name,
      type: active.data.current?.type,
      id: active.id,
    });
  };

  const handleDragEnd = (event: DragOverEvent) => {
    const { active, over } = event;
    const mutateTabs = (root: Panel) => {
      if (root.type === "panel" && root.id === active.data.current?.parent) {
        const oldIdx = root.tabs
          .map((e) => e.itemId)
          .indexOf(active.data.current?.id);
        const newIdx = root.tabs
          .map((e) => e.itemId)
          .indexOf(over?.data.current?.id);
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
      {draggedTab?.type === "text" ? (
        <MdTextSnippet className="text-yellow-500 mr-1.5 text-base" />
      ) : (
        <FaPython className="text-cyan-500 mr-1.5 text-base" />
      )}
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
    <div className="h-screen bg-slate-200 p-10">
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <PanelGroup direction="horizontal">
          <Panel defaultSize={15} maxSize={20}>
            <SidebarPanel tabs={DEFAULT_TABS} />
          </Panel>
          <PanelResizeHandle className="w-2" />
          <Panel>{renderLayout(layout)}</Panel>
        </PanelGroup>
        <DragOverlay>{draggedTab ? renderItem : null}</DragOverlay>
      </DndContext>
    </div>
  );
};
