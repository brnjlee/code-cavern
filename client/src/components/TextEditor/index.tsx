import styles from "./index.module.css";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { withCursors, withYHistory, withYjs, YjsEditor } from "@slate-yjs/core";
import React, {
  useCallback,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
import {
  Range,
  createEditor,
  Descendant,
  Text,
  Transforms,
  Editor,
  Element,
} from "slate";
import {
  getRemoteCaretsOnLeaf,
  getRemoteCursorsOnLeaf,
  useDecorateRemoteCursors,
} from "@slate-yjs/react";
import { RenderLeafProps, Slate, withReact } from "slate-react";
import { withListsReact, onKeyDown } from "@prezly/slate-lists";
import * as Y from "yjs";
import { UniqueIdentifier } from "@dnd-kit/core";
import useSWRMutation from "swr/mutation";
import { useSession } from "next-auth/react";

import { FormatToolbar } from "../FormatToolbar";
import { withDefaultBreak } from "@/plugins/withDefaultBreak";
import { withPreventDelete } from "@/plugins/withPreventDelete";
import { withListsPlugin } from "@/plugins/withListsPlugin";
import { CustomEditable } from "../CustomEditable";
import { Leaf } from "../Leaf";
import { ConnectionToggle } from "../ConnectionToggle";
import { RemoteCursorOverlay } from "../RemoteCursorOverlay";
import { CommandList } from "../CommandList";
import { addAlpha, cursorData } from "@/utils/utils";
import { CursorData, ElementType } from "@/types";
import { patcher } from "@/requests";
import useDebounce from "@/hooks/use-debounce";

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

const TextEditor = ({ id, name }: { id: UniqueIdentifier; name: string }) => {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState(name);
  const debouncedTitle = useDebounce(title, 1000);
  const [value, setValue] = useState<Descendant[]>([]);
  const [connected, setConnected] = useState(false);
  const [target, setTarget] = useState<Range | null>();
  const containerRef = useRef<HTMLDivElement>(null);
  const { trigger: updateDocumentTrigger } = useSWRMutation(
    `/api/documents/${id}`,
    patcher,
    {
      onSuccess(data, key, config) {},
      onError(err, key, config) {
        console.info(err);
      },
    }
  );
  useEffect(() => {
    updateDocumentTrigger({ name: debouncedTitle });
  }, [debouncedTitle]);

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: "ws://localhost:8080/collaborate",
        parameters: { id },
        name: "",
        onConnect: () => setConnected(true),
        onDisconnect: () => setConnected(false),
        connect: false,
        onSynced: ({ state }) => {
          console.info(state);
        },
      }),
    [id]
  );

  const editor = useMemo(() => {
    const sharedType = provider.document.get("content", Y.XmlText) as Y.XmlText;
    return withListsReact(
      withListsPlugin(
        withDefaultBreak(
          withPreventDelete(
            withReact(
              withYHistory(
                withCursors(
                  withYjs(createEditor(), sharedType, { autoConnect: false }),
                  provider.awareness,
                  {
                    data: cursorData(session?.user?.name || "Unknown user"),
                  }
                )
              )
            )
          )
        )
      )
    );
  }, [provider.document]);

  const onChangeHandler = (value: Descendant[]) => {
    setValue(value);
    const { selection } = editor;
    const [titleBlock] = Editor.nodes(editor, {
      match: (node) =>
        !Editor.isEditor(node) &&
        Element.isElement(node) &&
        node.type === ElementType.TITLE,
    });

    // // console.log(selection)
    // // if (selection && selection.anchor)
    if (selection && Range.isCollapsed(selection) && titleBlock) {
      setTitle(titleBlock[0].children[0].text);
    }
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
    const [titleBlock] = Editor.nodes(editor, {
      match: (node) =>
        !Editor.isEditor(node) &&
        Element.isElement(node) &&
        node.type === ElementType.TITLE,
    });
    if (!titleBlock) {
      setTarget(selection);
      document.addEventListener("click", closeCommandList);
    }
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
    return () => provider.disconnect();
  }, [provider]);
  useEffect(() => {
    YjsEditor.connect(editor);
    return () => YjsEditor.disconnect(editor);
  }, [editor]);

  return (
    <div
      ref={containerRef}
      className="text-editor bg-slate-600 text-white rounded-b flex h-full justify-center overflow-y-auto"
    >
      <div className="px-5 w-full max-w-5xl">
        <Slate value={value} onChange={onChangeHandler} editor={editor}>
          {target && (
            <CommandList
              target={target}
              close={closeCommandList}
              containerRef={containerRef}
            />
          )}
          <FormatToolbar containerRef={containerRef} />
          <DecoratedEditable />
        </Slate>
        {/* <ConnectionToggle connected={connected} onClick={toggleConnection} /> */}
      </div>
    </div>
  );
};

export default TextEditor;
