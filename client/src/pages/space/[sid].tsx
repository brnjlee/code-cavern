import React, { useState } from "react";
import { useRouter } from "next/router";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { useSession, signIn, signOut } from "next-auth/react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
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
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Cross2Icon } from "@radix-ui/react-icons";
import { FaPython } from "react-icons/fa";
import { MdTextSnippet } from "react-icons/md";
import clsx from "clsx";

import Item from "../../components/Item";
import TabContainer from "../../components/TabContainer";
import FilesPanel from "../../components/FilesPanel";
import Sidebar from "../../components/Sidebar";
import Login from "../../components/Login";
import { curateDocuments, genUniqueId } from "../../utils/utils";
import { Tab, TabParents } from "../../types";
import CreateSpaceModal from "@/components/CreateSpaceModal";

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

type ActiveTabs = {
  [key: string]: UniqueIdentifier;
};

const fetcher = (...args) => fetch(...args).then((res) => res.json());
const fetchWithArg = ([url, arg]) => fetch(url, {}).then((res) => res.json());

async function createSpace(url: string, { arg }: { arg: any }) {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });
}

export default () => {
  const { data: session, status } = useSession();
  // const { data, error, isLoading } = useSWR(
  //   session ? ["/api/spaces", session.token] : null,
  //   ([url, token]) => fetchWithToken(url, token)
  // );
  const { sid } = useRouter().query;
  const {
    data: spaces,
    error: spacesError,
    isLoading: spacesIsLoading,
  } = useSWR("/api/spaces", fetcher);
  const {
    data: docs,
    error: documentsError,
    isLoading: documentsIsLoading,
  } = useSWR(sid ? `/api/spaces/${sid}` : null, fetcher, {
    onSuccess(documents, key, config) {
      setSidebarTabs(curateDocuments(documents));
    },
  });
  const { trigger: createSpaceTrigger } = useSWRMutation(
    "/api/spaces",
    createSpace,
    {
      onSuccess(data, key, config) {
        setCreateModalOpen(false);
      },
      onError(err, key, config) {
        console.info(err);
      },
    }
  );

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [draggedTab, setDraggedTab] = useState<DraggedTab | null>(null);
  const [sidebarTabs, setSidebarTabs] = useState<Tab[]>(DEFAULT_TABS);
  const [tabParents, setTabParents] = useState<TabParents>({});
  const [activeTabs, setActiveTabs] = useState<ActiveTabs>({});
  const [hoveringOver, setHoveringOver] = useState<HoveringOver>({
    containerId: "",
    hover: "",
  });
  const [layout, setLayout] = useState<Panel>({
    type: "horizontal",
    id: genUniqueId(),
    panels: [],
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

  const handleCloseTab = (
    itemId: string,
    tabIdx: number,
    containerId: string
  ) => {
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
    popTabParent(itemId, containerId);
  };

  const renderLayout = (root: Panel, isRoot: boolean) => {
    if (root.type === "panel") {
      return (
        <Panel className="bg-slate-100 shadow-lg">
          <TabContainer
            key={root.id}
            tabs={root.tabs || []}
            activeItemId={activeTabs[root.id]}
            setActiveItemId={(itemId) =>
              setActiveTabs({ ...activeTabs, [root.id]: itemId })
            }
            containerId={root.id || ""}
            hoveringOver={
              hoveringOver.containerId === root.id ? hoveringOver.hover : ""
            }
            closeTab={(itemId, tabIdx) =>
              handleCloseTab(itemId, tabIdx, root.id)
            }
          />
        </Panel>
      );
    }
    const resizeHandleClass = root.type === "horizontal" ? "w-2" : "h-2";
    return (
      <Panel
        className={clsx(isRoot && "py-5 pr-5", "bg-slate-100 overflow-visible")}
      >
        <PanelGroup direction={root.type} className="overflow-visible">
          {root.panels?.map((child: Panel, i: number) => (
            <>
              {renderLayout(child, false)}
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
      const newPanelId = genUniqueId();
      if (
        directionTable[targetArea as keyof DirectionTable] ===
        (targetRoot.type === "root" ? "horizontal" : targetRoot.type)
      ) {
        newPanel = {
          type: "panel",
          id: newPanelId,
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
              id: newPanelId,
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
      popTabParent(tab.itemId, sourceId);
      pushTabParent(tab.itemId, newPanelId);
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
          if (draggedTab) {
            popTabParent(draggedTab.itemId, draggedTab.originId);
          }
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
          pushTabParent(draggedTab.itemId, over.data.current?.parent);
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

  const handleOpenTab = (tab: Tab) => {
    if (tabParents[tab.itemId] && tabParents[tab.itemId].length) {
      setActiveTabs({
        ...activeTabs,
        [tabParents[tab.itemId][tabParents[tab.itemId].length - 1]]: tab.itemId,
      });
      return;
    }
    if (layout.panels?.length) {
      let layoutClone = JSON.parse(JSON.stringify(layout));
      let root = findFirstPanel(layoutClone);
      if (root && root.tabs) {
        root.tabs.push({
          ...tab,
          id: genUniqueId(),
        });
        setLayout(layoutClone);
        pushTabParent(tab.itemId, root.id);
      }
      return;
    }
    const rootId = genUniqueId();
    setLayout({
      ...layout,
      panels: [
        {
          type: "panel",
          id: rootId,
          tabs: [
            {
              ...tab,
              id: genUniqueId(),
            },
          ],
        },
      ],
    });
    pushTabParent(tab.itemId, rootId);
  };

  const pushTabParent = (itemId: UniqueIdentifier, rootId: string) => {
    setTabParents((prev) => ({
      ...prev,
      [itemId]: prev[itemId] ? [...prev[itemId], rootId] : [rootId],
    }));
    setActiveTabs((prev) => ({
      ...prev,
      [rootId]: itemId,
    }));
  };

  const popTabParent = (itemId: UniqueIdentifier, rootId: string) => {
    setTabParents((prev) => ({
      ...prev,
      [itemId]: prev[itemId].filter((p) => p !== rootId),
    }));
    setActiveTabs((prev) => ({
      ...prev,
      [rootId]: getFirstTab(itemId, rootId),
    }));
  };
  const getFirstTab = (avoidId: UniqueIdentifier, rootId: string) => {
    for (let itemId in tabParents) {
      if (itemId != avoidId && tabParents[itemId].includes(rootId)) {
        return itemId;
      }
    }
    return "";
  };
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const renderItem = (
    <Item
      id={draggedTab?.name ?? ""}
      className="bg-gray-200 px-2 py-1 text-sm rounded flex items-center"
    >
      {draggedTab?.type === "TEXT" ? (
        <MdTextSnippet className="text-yellow-500 mr-1.5 text-base" />
      ) : (
        <FaPython className="text-cyan-500 mr-1.5 text-base" />
      )}
      <span className="font-semibold text-slate-600">{draggedTab?.name}</span>
      <button
        className={clsx(
          "h-5 w-5 ml-1 flex justify-center items-center hover:bg-gray-100 rounded-full p-[3px]"
        )}
      >
        <Cross2Icon className={"text-black"} />
      </button>
    </Item>
  );
  if (status === "loading") {
    return <p>Hang on there...</p>;
  }
  if (spacesError || documentsError) return <div>failed to load</div>;
  if (spacesIsLoading) return <div>loading...</div>;

  return (
    <div className="h-screen bg-slate-300">
      {status === "authenticated" ? (
        <div className="h-full flex">
          <Sidebar
            spaces={spaces}
            active={sid}
            openCreateModal={() => setCreateModalOpen(true)}
          />
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <PanelGroup direction="horizontal">
              <Panel
                defaultSize={15}
                maxSize={20}
                className="bg-slate-100 rounded-l-xl"
              >
                {!documentsIsLoading ? (
                  <FilesPanel
                    tabs={sidebarTabs}
                    openTab={handleOpenTab}
                    openedTabs={tabParents}
                  />
                ) : null}
              </Panel>
              <PanelResizeHandle className="w-2 bg-slate-100" />
              {renderLayout(layout, true)}
            </PanelGroup>
            <DragOverlay>{draggedTab ? renderItem : null}</DragOverlay>
          </DndContext>

          <CreateSpaceModal
            show={createModalOpen}
            close={() => setCreateModalOpen(false)}
            createSpace={(spaceData) => createSpaceTrigger(spaceData)}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Login />
        </div>
      )}
    </div>
  );
};
