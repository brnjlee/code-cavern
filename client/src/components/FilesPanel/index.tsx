import React, { useState } from "react";
import { Tab } from "../../types";
import SortableTab from "../SortableTab";
import { TabParents } from "../../types";
import { FiPlus } from "react-icons/fi";
import CreateDocumentModal from "../CreateDocumentModal";
type FilesPanel = {
  tabs: Tab[];
  openTab: (tab: Tab) => void;
  openedTabs: TabParents;
  createDocument: (value: string) => void;
  showCreateDocumentModal: boolean;
  setShowCreateDocumentModal: (state: boolean) => void;
};
const FilesPanel = ({
  tabs,
  openTab,
  openedTabs,
  createDocument,
  showCreateDocumentModal,
  setShowCreateDocumentModal,
}: FilesPanel) => {
  const renderTabs = tabs.map(({ type, name, id, itemId }) => (
    <SortableTab
      key={id}
      id={id}
      itemId={itemId}
      name={name}
      type={type}
      disabled={false}
      parent={"sidebar"}
      onClick={() => openTab({ type, name, id, itemId })}
      className=" group hover:bg-gray-600 pl-2 pr-1 py-1 text-base"
    >
      {/* {openedTabs[itemId]?.length ? (
          <div className="absolute left-3 w-1 h-1 ml-auto bg-slate-300 rounded-[2rem] group-hover:w-2 transition-all" />
        ) : null} */}
    </SortableTab>
  ));
  return (
    <div className="h-full p-3 flex flex-col relative">
      <div className="h-full">
        <h3 className="font-bold mb-2 text-slate-200">Files</h3>
        {renderTabs}
      </div>
      <div className="h-10 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setShowCreateDocumentModal(true)}
          className="transition-all flex items-center justify-center w-full font-semibold p-1 mb-2 bg-slate-900 hover:bg-slate-800 rounded text-slate-200 hover:text-white"
        >
          {/* <FiPlus className="" /> */}
          New Document
        </button>
        <CreateDocumentModal
          show={showCreateDocumentModal}
          onClickOutside={() => setShowCreateDocumentModal(false)}
          createDocument={createDocument}
        />
      </div>
    </div>
  );
};
export default FilesPanel;
