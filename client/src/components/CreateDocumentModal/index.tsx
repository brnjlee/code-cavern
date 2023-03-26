import React, { useEffect, useRef } from "react";
import clsx from "clsx";
import { BsFileEarmarkTextFill, BsFileEarmarkCodeFill } from "react-icons/bs";
type CreateDocumentModal = {
  show: boolean;
  onClickOutside: () => void;
  createDocument: (value: string) => void;
};
const options = [
  {
    value: "TEXT",
    label: "Text",
    description: "Start writing in rich text",
    icon: <BsFileEarmarkTextFill />,
    iconClass:
      "text-indigo-500 group-hover:bg-indigo-200 group-hover:text-indigo-600",
  },
  {
    value: "CODE",
    label: "Code",
    description: "Develop code in any language",
    icon: <BsFileEarmarkCodeFill />,
    iconClass:
      "text-green-600 group-hover:bg-green-200 group-hover:text-green-700",
  },
];
const CreateDocumentModal = ({
  show,
  onClickOutside,
  createDocument,
}: CreateDocumentModal) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside && onClickOutside();
      }
    };
    if (show) {
      document.addEventListener("click", handleClickOutside, true);
    } else {
      document.removeEventListener("click", handleClickOutside, true);
    }
  }, [show]);

  const renderOptions = options.map(
    ({ value, label, description, icon, iconClass }) => (
      <div
        className="group flex p-1 rounded-lg w-full items-center hover:bg-slate-100 transition-all"
        role="button"
        tabIndex={0}
        onClick={() => createDocument(value)}
      >
        <div
          className={clsx(
            iconClass,
            "transition-all flex items-center justify-center w-8 min-w-[2rem] h-8 bg-slate-100 rounded-lg mr-2"
          )}
        >
          {icon}
        </div>
        <div className="flex flex-col justify-center whitespace-nowrap overflow-hidden ">
          <span className="text-sm font-semibold">{label}</span>
          <span className="text-xs text-slate-400">{description}</span>
        </div>
      </div>
    )
  );
  return (
    <div
      ref={ref}
      className={clsx(
        show
          ? "opacity-100 visible scale-100 bottom-[4rem]"
          : "opacity-0 invisible scale-90 bottom-[3rem]",
        "transition-all absolute w-[calc(100%-20px)] bg-white flex flex-col p-1 rounded-lg shadow-xl border border-slate-200"
      )}
    >
      <div className="text-xs text-gray-400 p-1 mb-1 font-semibold">
        Document types
      </div>
      {renderOptions}
    </div>
  );
};

export default CreateDocumentModal;
