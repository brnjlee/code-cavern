import React, { useEffect, useRef } from "react";

type Member = {
  id: string;
  member?: any;
  pendingEmail: string;
  role: string;
  createdAt: string;
};

const Member = ({ id, member, pendingEmail, role, createdAt }: Member) => {
  const getDate = (createdAt: string) => {
    const date = new Date(createdAt);
    const month = date.toLocaleString("default", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return month;
  };
  return (
    <div className="flex items-center rounded-lg mb-3">
      <img
        width={35}
        height={35}
        className="rounded-full mr-2 border border-slate-300"
        src={member ? member.image : "http://www.gravatar.com/avatar/?d=mp"}
        alt="user avatar"
      />
      <div className="flex flex-col justify-center">
        <span className="text-sm font-semibold text-slate-900">
          {member ? member.name : pendingEmail}
        </span>
        <span className="text-xs text-slate-400">
          Added {getDate(createdAt)}
        </span>
      </div>
    </div>
  );
};

export default Member;
