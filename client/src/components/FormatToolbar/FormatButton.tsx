import clsx from "clsx";
import React from "react";
import { Editor, Text, Transforms, Node } from "slate";
import { useSlate } from "slate-react";

const isFormatActive = (editor: Editor, format: string) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => Text.isText(n) && !n[format],
    mode: "all",
  });
  return !match;
}

const toggleFormat = (editor: Editor, format: string) => {
  const isActive = isFormatActive(editor, format);
  Transforms.setNodes(
    editor,
    { [format]: isActive ? null : true },
    { match: Text.isText, split: true }
  );
}

type FormatButtonProps = {
  format: string;
  Icon: any;
};

export const FormatButton = ({ format, Icon }: FormatButtonProps) => {
  const editor = useSlate();
  const active = isFormatActive(editor, format);


  return (
    <button
      className={clsx(
        "h-8 w-8 flex justify-center items-center hover:bg-gray-200"
      )}
      type="button"
      onMouseDown={(event) => {
        event.preventDefault();
        toggleFormat(editor, format);
      }}
    >
      <Icon className={active ? "text-blue-500" : "text-black"} />
    </button>
  );
}
