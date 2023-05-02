import React from "react";
import { MdPersonAdd } from "react-icons/md";

type SpacePanel = {
  name: string;
  openInviteModal: () => void;
};

const SpacePanel = ({ name, openInviteModal }: SpacePanel) => {
  return (
    <div className="h-[3rem] min-h-[3rem] w-full flex items-center pl-5 justify-between border-b-2 border-b-slate-800">
      <div className="flex items-center">
        <img
          width={35}
          height={35}
          className="rounded-lg mr-2 border border-slate-300"
          src={"http://www.gravatar.com/avatar/?d=mp"}
          alt="space image"
        />
        <h1 className="font-bold text-slate-100">{name}</h1>
      </div>
      <button
        type="button"
        onClick={openInviteModal}
        className="transition-all flex p-[5px] hover:bg-gray-100 rounded-lg text-slate-500 mr-2 font-semibold text-sm hover:text-slate-800 items-center"
      >
        <MdPersonAdd className="text-lg" />
      </button>
    </div>
  );
};

export default SpacePanel;
