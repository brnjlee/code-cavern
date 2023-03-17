import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  Direction,
} from "react-resizable-panels";
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

type DraggedTab = Tab & {
  originId: string;
};
export default () => {
  const [draggedTab, setDraggedTab] = useState<DraggedTab | null>(null);
  const [sidebarTabs, setSidebarTabs] = useState<Tab[]>(DEFAULT_TABS);
  const [hoveringOver, setHoveringOver] = useState<HoveringOver>({
    containerId: "",
    hover: "",
  });
  const [layout, setLayout] = useState<Panel>({
    type: "horizontal",
    id: genUniqueId(),
    panels: [
      {
        type: "panel",
        id: genUniqueId(),
        tabs: [
          {
            type: "code",
            name: "test9.py",
            itemId: "500",
            id: genUniqueId(),
          },
        ],
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
    const resizeHandleClass = root.type === "horizontal" ? "w-2" : "h-2";
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
    sourceId: string,
    targetId: string,
    targetArea: UniqueIdentifier,
    tab: Tab
  ) => {
    let layoutClone = JSON.parse(JSON.stringify(layout));
    let [targetRoot, targetIdx] = findWrapper(layoutClone, targetId);
    let sourceRoot = findPanel(layoutClone, sourceId);

    if (sourceRoot) {
      sourceRoot.tabs = sourceRoot.tabs?.filter((e) => e.itemId !== tab.itemId);
    }
    if (targetRoot && targetRoot.panels) {
      let newPanel: Panel;
      if (
        directionTable[targetArea as keyof DirectionTable] ===
        (targetRoot.type === "root" ? "horizontal" : targetRoot.type)
      ) {
        newPanel = {
          type: "panel",
          id: genUniqueId(),
          tabs: [tab],
        };
        if (targetArea === "right" || targetArea === "bottom") {
          targetRoot.panels.splice(targetIdx + 1, 0, newPanel);
        } else {
          targetRoot.panels.splice(targetIdx, 0, newPanel);
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
          newPanel.panels?.unshift(targetRoot.panels[targetIdx]);
        } else {
          newPanel.panels?.push(targetRoot.panels[targetIdx]);
        }
        targetRoot.panels.splice(targetIdx, 1, newPanel);
      }
    }
    setLayout(layoutClone);
  };

  const findWrapper = (root: Panel, target: string): [Panel | null, number] => {
    if (root.panels) {
      let targetIdx = indexOfPanel(root.panels, target);
      if (targetIdx !== -1) {
        return [root, targetIdx];
      }
      for (let child of root.panels) {
        let [panel, idx]: [Panel | null, number] = findWrapper(child, target);
        if (panel) return [panel, idx];
      }
    }
    return [null, -1];
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
    if (!over || !active) return;
    const isSortable = over?.data.current?.name;
    if (isSortable) {
      if (active.data.current?.parent !== over.data.current?.parent) {
        let newLayout = JSON.parse(JSON.stringify(layout));
        let activeRoot = findPanel(newLayout, active.data.current?.parent);
        let overRoot = findPanel(newLayout, over?.data.current?.parent);
        if (activeRoot) {
          activeRoot.tabs = activeRoot.tabs?.filter(
            (e) => e.itemId !== active.data.current?.id
          );
        }
        if (draggedTab && overRoot && overRoot.tabs) {
          const isBelowOverItem =
            over &&
            active.rect.current.translated &&
            active.rect.current.translated.top >
              over.rect.top + over.rect.height;

          const modifier = isBelowOverItem ? 1 : 0;
          const overIdx = overRoot.tabs
            .map((e) => e.itemId)
            .indexOf(over?.data.current?.id);
          const newIdx =
            overIdx >= 0 ? overIdx + modifier : overRoot.tabs.length + 1;
          overRoot.tabs = [
            ...overRoot.tabs.slice(0, newIdx),
            {
              id: draggedTab.id,
              itemId: draggedTab.itemId,
              type: draggedTab.type,
              name: draggedTab.name,
            },
            ...overRoot.tabs.slice(newIdx, overRoot.tabs.length),
          ];
        }
        setLayout(newLayout);
      }
    } else if (targetAreas.has(over.data.current?.type)) {
      setHoveringOver({
        containerId: over.data.current?.parent,
        hover: over.data.current?.type,
      });
      return;
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
      originId: active.data.current?.parent,
    });
  };

  const findPanel = (root: Panel, target: string): Panel | undefined => {
    if (root.type === "panel" && root.id === target) {
      return root;
    } else if (root.panels) {
      for (let child of root.panels) {
        let panel: Panel | undefined = findPanel(child, target);
        if (panel) return panel;
      }
    }
  };

  const handleDragEnd = (event: DragOverEvent) => {
    const { active, over } = event;
    if (over && draggedTab) {
      if (draggedTab.originId === "sidebar") {
        const tabIdx = sidebarTabs.map((e) => e.id).indexOf(active.id);
        if (tabIdx !== -1) {
          let newTabs = [...sidebarTabs];
          newTabs[tabIdx].id = genUniqueId();
          setSidebarTabs(newTabs);
        }
      }
      if (targetAreas.has(hoveringOver.hover)) {
        handleCreateContainer(
          active.data.current?.parent,
          hoveringOver.containerId,
          hoveringOver.hover,
          {
            itemId: active.data.current?.id,
            name: active.data.current?.name,
            type: active.data.current?.type,
            id: active.id,
          }
        );
      } else if (active.id !== over.id) {
        let layoutClone = JSON.parse(JSON.stringify(layout));
        let root = findPanel(layoutClone, active.data.current?.parent);
        if (root && root.tabs) {
          const oldIdx = root.tabs
            .map((e) => e.itemId)
            .indexOf(active.data.current?.id);
          const newIdx = root.tabs
            .map((e) => e.itemId)
            .indexOf(over?.data.current?.id);
          root.tabs = arrayMove(root.tabs, oldIdx, newIdx);
          setLayout(layoutClone);
        }
      }
    }
    setDraggedTab(null);
    setHoveringOver({
      containerId: "",
      hover: "",
    });
  };

  const handleOpenTab = (tab: Tab) => {
    const findFirstPanel = (root: Panel): Panel | undefined => {
      if (root.tabs) {
        return root;
      } else if (root.panels) {
        for (let child of root.panels) {
          let panel: Panel | undefined = findFirstPanel(child);
          if (panel) return panel;
        }
      }
    };
    if (layout.panels?.length) {
      let layoutClone = JSON.parse(JSON.stringify(layout));
      let root = findFirstPanel(layoutClone);
      root?.tabs?.push({
        ...tab,
        id: genUniqueId(),
      });
      setLayout(layoutClone);
      return;
    }
    setLayout({
      ...layout,
      panels: [
        {
          type: "panel",
          id: genUniqueId(),
          tabs: [tab],
        },
      ],
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
            <SidebarPanel tabs={sidebarTabs} openTab={handleOpenTab} />
          </Panel>
          <PanelResizeHandle className="w-2" />
          {renderLayout(layout)}
        </PanelGroup>
        <DragOverlay>{draggedTab ? renderItem : null}</DragOverlay>
      </DndContext>
    </div>
  );
};
