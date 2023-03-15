import styles from "./index.module.css";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { withCursors, withYHistory, withYjs, YjsEditor } from "@slate-yjs/core";
import React, {
  useCallback,
  useEffect,
  useState,
  ReactNode,
  useRef,
} from "react";
import ReactDOM from "react-dom";
import { Range, createEditor, Descendant, Text, Transforms } from "slate";
import {
  getRemoteCaretsOnLeaf,
  getRemoteCursorsOnLeaf,
  useDecorateRemoteCursors,
} from "@slate-yjs/react";
import { RenderLeafProps, Slate, withReact } from "slate-react";
import { withListsReact, onKeyDown } from "@prezly/slate-lists";
import { motion, AnimatePresence } from "framer-motion";

import { FormatToolbar } from "../FormatToolbar";
import { withDefaultBreak } from "../../plugins/withDefaultBreak";
import { withNormalize } from "../../plugins/withNormalize";
import { withListsPlugin } from "../../plugins/withListsPlugin";
import { CustomEditable } from "../CustomEditable";
import { Leaf } from "../Leaf";
import { ConnectionToggle } from "../ConnectionToggle";
import { RemoteCursorOverlay } from "../RemoteCursorOverlay";
import { CommandList } from "../CommandList";
import { addAlpha, randomCursorData } from "../../utils/utils";
import { CursorData } from "../../types";
import * as Y from "yjs";

const COMMAND_KEY = "/";
type PortalProps = { children?: ReactNode };

function Portal({ children }: PortalProps) {
  return typeof document === "object"
    ? ReactDOM.createPortal(children, document.body)
    : null;
}

const renderDecoratedLeaf = (props: RenderLeafProps) => {
  getRemoteCursorsOnLeaf<CursorData, Text>(props.leaf).forEach((cursor) => {
    if (cursor.data) {
      props.children = (
        <span style={{ backgroundColor: addAlpha(cursor.data.color, 0.5) }}>
          {props.children}
        </span>
      );
    }
  });

  getRemoteCaretsOnLeaf<CursorData, Text>(props.leaf).forEach((caret) => {
    if (caret.data) {
      props.children = (
        <span className="relative">
          <span
            contentEditable={false}
            className="absolute top-0 bottom-0 w-0.5 left-[-1px]"
            style={{ backgroundColor: caret.data.color }}
          />
          <span
            contentEditable={false}
            className="absolute text-xs text-white left-[-1px] top-0 whitespace-nowrap rounded rounded-bl-none px-1.5 py-0.5 select-none"
            style={{
              backgroundColor: caret.data.color,
              transform: "translateY(-100%)",
            }}
          >
            {caret.data.name}
          </span>
          {props.children}
        </span>
      );
    }
  });
  return <Leaf {...props} />;
};

let provider: any = undefined;
let editor: any = undefined;
export default () => {
  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);
  const [target, setTarget] = useState<Range | null>();
  const [index, setIndex] = useState(0);
  const [command, setCommand] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    provider = new HocuspocusProvider({
      url: "ws://localhost:1234/collaboration/1",
      name: "",
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      connect: false,
    });
    const sharedType = provider.document.get("content", Y.XmlText) as Y.XmlText;
    editor = withListsReact(
      withListsPlugin(
        withDefaultBreak(
          // withNormalize(
          withReact(
            withYHistory(
              withCursors(
                withYjs(createEditor(), sharedType, { autoConnect: false }),
                provider.awareness,
                {
                  data: randomCursorData(),
                }
              )
            )
            // )
          )
        )
      )
    );
    // provider.connect();
    return () => {
      Transforms.deselect(editor);
      // if (provider) {
      // 	console.log('unload')
      // 	provider.disconnect();
      // }
    };
  }, []);

  const onChangeHandler = (value: Descendant[]) => {
    // setValue(value)
    // // closeCommandList()
    // const { selection } = editor
    // // console.log(selection)
    // // if (selection && selection.anchor)
    // if (selection && Range.isCollapsed(selection) && target) {
    //   console.log('test')
    //   const [start] = Range.edges(selection)
    //   const wordBefore = Editor.before(editor, start, { unit: 'word' })
    //   const before = wordBefore && Editor.before(editor, wordBefore)
    //   const beforeRange = before && Editor.range(editor, before, start)
    //   const beforeText = beforeRange && Editor.string(editor, beforeRange)
    //   const beforeMatch = beforeText && beforeText.match(/([^/]+$)/)
    //   console.log(beforeText, beforeMatch)
    //   if (beforeText) {
    //     if (beforeText[beforeText.length-1] === ' ') {
    //       closeCommandList()
    //       return
    //     }
    //     setCommand(beforeMatch ? beforeMatch[1] : '')
    //     return
    //   }
    // }
    // setTarget(null)
  };

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === COMMAND_KEY) {
      openCommandList();
    }
  };

  const openCommandList = () => {
    const { selection } = editor;
    setTarget(selection);
    document.addEventListener("click", closeCommandList);
  };
  const closeCommandList = () => {
    setTarget(null);
    document.removeEventListener("click", closeCommandList);
  };

  const DecoratedEditable = () => {
    const decorate = useDecorateRemoteCursors();
    return (
      <CustomEditable
        className="max-w-4xl w-full flex-col break-words"
        decorate={decorate}
        renderLeaf={renderDecoratedLeaf}
        onKeyDown={(event) => {
          onKeyDownHandler(event);
          onKeyDown(editor, event);
        }}
      />
    );
  };

  const toggleConnection = useCallback(() => {
    if (connected) {
      return provider.disconnect();
    }

    provider.connect();
  }, [provider, connected]);

  useEffect(() => {
    provider.connect();
    console.log("connect");
    return () => {
      console.log("disconnect");
      provider.disconnect();
    };
  }, [provider]);
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <div
      ref={containerRef}
      className="text-editor flex h-full justify-center overflow-y-auto"
    >
      {editor && (
        <>
          <Slate value={value} onChange={onChangeHandler} editor={editor}>
            {target && <CommandList target={target} close={closeCommandList} />}
            <FormatToolbar containerRef={containerRef} />
            <DecoratedEditable />
            {/* </RemoteCursorOverlay> */}
          </Slate>
          <ConnectionToggle connected={connected} onClick={toggleConnection} />
        </>
      )}
    </div>
  );
};
