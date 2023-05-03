import React, { useEffect, useRef, useState, useMemo } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import RandomColor from "randomcolor";
import dynamic from "next/dynamic";

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

const CodeEditor = ({ id }: { id: UniqueIdentifier }) => {
  const { data: session, status } = useSession();
  const [EditorRef, setEditorRef] = useState(null);
  const [code, setCode] = useState("");
  const [lang, setLang] = useState("javascript");

  const handleEditorDidMount = (editor: any) => {
    setEditorRef(editor);
  };

  const provider = useMemo(
    () =>
      new HocuspocusProvider({
        url: "ws://localhost:8080/collaborate",
        parameters: { id },
        name: "",
        connect: false,
        onSynced: ({ state }) => {
          console.info(state);
        },
        broadcast: false,
      }),
    [id]
  );
  useEffect(() => {
    if (EditorRef) {
      const yText = provider.document.getText("codemirror");
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
      return () => {
        if (provider) {
          provider.disconnect();
        }
      };
    }
  }, [EditorRef, provider.document]);

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
    </div>
  );
};

export default CodeEditor;
