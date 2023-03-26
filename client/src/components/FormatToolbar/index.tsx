import {
  FontBoldIcon,
  FontItalicIcon,
  StrikethroughIcon,
} from "@radix-ui/react-icons";
import React, { ReactNode, useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { Editor, Text, Range, Transforms, Element } from "slate";
import { ListsEditor } from "@prezly/slate-lists";
import { useSlate } from "slate-react";
import { FormatButton } from "./FormatButton";
import { Select } from "../Select";
import { FormatOptions } from "./FormatOptions";
import clsx from "clsx";
import { ElementType } from "@/types";

type PortalProps = { children?: ReactNode };

function Portal({ children }: PortalProps) {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
}

export const FormatToolbar = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement>;
}) => {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const editor = useSlate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;
    const [titleBlock] = Editor.nodes(editor, {
      match: (node) =>
        !Editor.isEditor(node) &&
        Element.isElement(node) &&
        node.type === ElementType.TITLE,
    });

    if (!el) {
      return;
    }
    setShow(
      !!selection &&
        !Range.isCollapsed(selection) &&
        Editor.string(editor, selection) !== "" &&
        !titleBlock
    );
    if (!selection || !show) {
      // el.style.opacity = '0'
      el.removeAttribute("style");
      return;
    }
    const isSameElement = selection.anchor.path[0] == selection.focus.path[0];
    setSelectedType(
      isSameElement ? editor.children[selection.anchor.path[0]].type : ""
    );
    const domSelection = window.getSelection();
    if (!domSelection?.rangeCount) {
      return;
    }

    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() ?? {
      top: 0,
      left: 0,
    };
    el.style.opacity = "1";
    el.style.top = `${rect.top - containerRect.top - 5}px`;
    el.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
  });

  const changeElementType = (editor: Editor, type: string) => {
    ListsEditor.unwrapList(editor);
    Transforms.setNodes(editor, { type });
    setShow(false);
    Transforms.deselect(editor);
  };

  return mounted ? (
    <div
      ref={ref}
      className={clsx(
        show ? "visible opacity-100" : "invisible opacity-0",
        "absolute translate-x-[-50%] z-10 flex flex-row rounded bg-white shadow-3xl border border-gray-200 overflow-hidden transition-opacity"
      )}
      onMouseDown={(e) => e.preventDefault()}
    >
      {!!selectedType && (
        <Select
          value={selectedType}
          items={FormatOptions}
          onValueChange={(type) => changeElementType(editor, type)}
        />
      )}

      <FormatButton format="bold" Icon={FontBoldIcon} />
      <FormatButton format="italic" Icon={FontItalicIcon} />
      <FormatButton format="strikethrough" Icon={StrikethroughIcon} />
    </div>
  ) : null;
};
