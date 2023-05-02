import React, { useEffect, useRef, useState, useCallback } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import RandomColor from "randomcolor";
import { WebsocketProvider } from "y-websocket";
import { WebrtcProvider } from "../../utils/yjs/y-webrtc";
import dynamic from "next/dynamic";

import { ConnectionToggle } from "../../components/ConnectionToggle";
import setMode from "./languageMapper";
import { cursorData } from "@/utils/utils";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSession } from "next-auth/react";

let yCodemirror: any = null;
if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
  yCodemirror = require("y-codemirror");
  require("../../utils/codemirror");
}
const Uncontrolled = dynamic(
  () => import("react-codemirror2").then((m) => m.UnControlled),
  {
    ssr: false,
  }
);

let provider: any = null;
const CodeEditor = ({ id }: { id: UniqueIdentifier }) => {
  const { data: session, status } = useSession();
  const [EditorRef, setEditorRef] = useState(null);
  const [code, setCode] = useState("");
  const [connected, setConnected] = useState(false);
  const [lang, setLang] = useState("javascript");

  const handleEditorDidMount = (editor) => {
    setEditorRef(editor);
  };
  useEffect(() => {
    if (EditorRef) {
      const ydoc = new Y.Doc();
      provider = new WebrtcProvider(id.toString(), ydoc);
      const yText = ydoc.getText("codemirror");
      const yUndoManager = new Y.UndoManager(yText);
      const awareness = provider.awareness;
      const color = RandomColor();
      awareness.setLocalStateField(
        "user",
        cursorData(session?.user?.name || "Unknown user")
      );
      const getBinding = new yCodemirror.CodemirrorBinding(
        yText,
        EditorRef,
        awareness,
        {
          yUndoManager,
        }
      );
      provider.connect();
      setConnected(true);
      return () => {
        if (provider) {
          setConnected(false);
          provider.disconnect();
          ydoc.destroy();
        }
      };
    }
  }, [EditorRef, id]);
  // const toggleConnection = useCallback(() => {
  //   if (connected) {
  //     setConnected(false);
  //     return provider.disconnect();
  //   }
  //   setConnected(true);
  //   provider.connect();
  // }, [provider, connected]);

  return (
    <div className="flex h-full w-full rounded-b overflow-y-auto text-base">
      <Uncontrolled
        onChange={(editor, data, value) => {
          setCode(value);
        }}
        autoScroll
        options={{
          mode: setMode(lang),
          theme: "ayu-mirage",
          lineWrapping: true,
          smartIndent: true,
          lineNumbers: true,
          foldGutter: true,
          tabSize: 2,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          autoCloseTags: true,
          matchBrackets: true,
          autoCloseBrackets: true,
          extraKeys: {
            "Ctrl-Space": "autocomplete",
          },
        }}
        editorDidMount={(editor) => {
          handleEditorDidMount(editor);
          editor.setSize("100vw", "100%");
        }}
      />
      {/* <ConnectionToggle connected={connected} onClick={toggleConnection} /> */}
    </div>
  );
};

export default CodeEditor;
