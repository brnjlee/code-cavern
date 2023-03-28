import React from "react";
import { MdPersonAdd } from "react-icons/md";

type SpacePanel = {
  name: string;
  openInviteModal: () => void;
};

const SpacePanel = ({ name, openInviteModal }: SpacePanel) => {
  return (
    <div className="absolute top-0 w-full pr-4 h-[3rem] flex items-center justify-between bg-slate-100">
      <div className="bg-white h-9 w-full flex items-center justify-between rounded-lg shadow-sm border border-slate-200">
        <div></div>
        <h1 className="font-bold text-slate-700">{name}</h1>
        <button
          type="button"
          onClick={openInviteModal}
          className="transition-all flex p-[5px] hover:bg-gray-100 rounded-lg text-slate-500 mr-2 font-semibold text-sm hover:text-slate-800 items-center"
        >
          <MdPersonAdd className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default SpacePanel;
