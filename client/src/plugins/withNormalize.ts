import { Editor, Transforms } from "slate";
import {ElementType} from '../types'

export function withNormalize(editor: Editor) {
  const { normalizeNode } = editor;

  // Ensure editor always has at least one child.
  editor.normalizeNode = (entry) => {
    const [node] = entry;
    if (!Editor.isEditor(node) || node.children.length > 0) {
      return normalizeNode(entry);
    }

    Transforms.insertNodes(
      editor,
      {
        type: ElementType.TEXT,
        children: [{ text: "" }],
      },
      { at: [0] }
    );
  };

  return editor;
}
