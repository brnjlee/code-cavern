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

import Item from "@/components/Item";
import TabContainer from "@/components/TabContainer";
import FilesPanel from "@/components/FilesPanel";
import Sidebar from "@/components/Sidebar";
import Login from "@/components/Login";
import { curateDocuments, genUniqueId } from "@/utils/utils";
import { Tab, TabParents } from "@/types";
import CreateSpaceModal from "@/components/CreateSpaceModal";
import SpacePanel from "@/components/SpacePanel";
import InviteModal from "@/components/InviteModal";
import { fetcher, poster } from "@/requests";

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

export default () => {
  const { data: session, status } = useSession();
  const { sid } = useRouter().query;
  const {
    data: spaces,
    error: spacesError,
    isLoading: spacesIsLoading,
  } = useSWR("/api/spaces", fetcher);
  const {
    data: space,
    error: documentsError,
    isLoading: documentsIsLoading,
  } = useSWR(sid ? `/api/spaces/${sid}` : null, fetcher, {
    onSuccess(space, key, config) {
      setSidebarTabs(curateDocuments(space.documents));
      setActiveSpaceName(space.name);
    },
  });
  const { trigger: createSpaceTrigger } = useSWRMutation(
    "/api/spaces",
    poster,
    {
      onSuccess(data, key, config) {
        setShowCreateModal(false);
      },
      onError(err, key, config) {
        console.info(err);
      },
    }
  );
  const { trigger: createDocumentTrigger } = useSWRMutation(
    "/api/documents",
    poster,
    {
      onSuccess(document, key, config) {
        setShowCreateDocumentModal(false);
        setSidebarTabs((prev) => [...prev, ...curateDocuments([document])]);
      },
      onError(err, key, config) {
        console.info(err);
      },
    }
  );

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateDocumentModal, setShowCreateDocumentModal] = useState(false);
  const [draggedTab, setDraggedTab] = useState<DraggedTab | null>(null);
  const [sidebarTabs, setSidebarTabs] = useState<Tab[]>([]);
  const [tabParents, setTabParents] = useState<TabParents>({});
  const [activeTabs, setActiveTabs] = useState<ActiveTabs>({});
  const [activeSpaceName, setActiveSpaceName] = useState("");
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
        <Panel className="bg-slate-600">
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
    const resizeHandleClass =
      root.type === "horizontal"
        ? "w-1 border-r-2 border-slate-700 hover:w-2"
        : "h-1 border-b-2 border-slate-700 hover:h-2";
    return (
      <Panel className={clsx("bg-slate-600 overflow-visible relative")}>
        <PanelGroup direction={root.type} className="overflow-visible">
          {root.panels?.map((child: Panel, i: number) => (
            <>
              {renderLayout(child, false)}
              {i < root.panels.length - 1 ? (
                <PanelResizeHandle
                  className={clsx(
                    resizeHandleClass,
                    "hover:bg-slate-400 transition-all"
                  )}
                />
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
    const isSortable = over?.data.current?.name !== undefined;
    console.info(over?.data.current?.name);
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
  if (spacesIsLoading) return <div>loading...</div>;
  return (
    <div className="h-screen bg-slate-900">
      {status === "authenticated" && !spacesError ? (
        <div className="h-full flex">
          <Sidebar
            spaces={spaces}
            active={sid}
            openCreateModal={() => setShowCreateModal(true)}
          />
          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {!documentsError ? (
              <PanelGroup direction="horizontal">
                <Panel defaultSize={15} maxSize={20}>
                  {!documentsIsLoading ? (
                    <div className="flex flex-col h-full bg-slate-700">
                      <SpacePanel
                        name={activeSpaceName}
                        openInviteModal={() => setShowInviteModal(true)}
                      />
                      <FilesPanel
                        tabs={sidebarTabs}
                        openTab={handleOpenTab}
                        openedTabs={tabParents}
                        showCreateDocumentModal={showCreateDocumentModal}
                        setShowCreateDocumentModal={(state) =>
                          setShowCreateDocumentModal(state)
                        }
                        createDocument={(value) =>
                          createDocumentTrigger({ type: value, spaceId: sid })
                        }
                      />
                    </div>
                  ) : null}
                </Panel>
                <PanelResizeHandle className="w-2 bg-slate-700">
                  <div className="h-[3rem] border-b-2 border-slate-800"></div>
                </PanelResizeHandle>
                {renderLayout(layout, true)}
              </PanelGroup>
            ) : (
              <div>{documentsError?.info.error}</div>
            )}
            <DragOverlay>{draggedTab ? renderItem : null}</DragOverlay>
          </DndContext>

          <CreateSpaceModal
            show={showCreateModal}
            close={() => setShowCreateModal(false)}
            createSpace={(spaceData) => createSpaceTrigger(spaceData)}
          />
          <InviteModal
            show={showInviteModal}
            space={space}
            onClickOutside={() => setShowInviteModal(false)}
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
