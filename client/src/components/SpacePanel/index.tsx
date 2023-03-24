import React from "react";
import { MdPersonAdd } from "react-icons/md";

type SpacePanel = {
  name: string;
};

const SpacePanel = ({ name }: SpacePanel) => {
  return (
    <div className="absolute top-0 w-full pr-4 h-[3rem] flex items-center justify-between bg-slate-100">
      <div className="bg-white w-full flex items-center justify-between rounded-lg shadow-sm border border-slate-200">
        <div></div>
        <h1 className="font-bold text-slate-700">{name}</h1>
        <button
          type="button"
          onClick={() => {}}
          className="transition-all flex p-2 hover:bg-gray-100 rounded-lg text-slate-500 text-xl mr-2 hover:text-slate-800"
        >
          <MdPersonAdd />
        </button>
      </div>
    </div>
  );
};

export default SpacePanel;
