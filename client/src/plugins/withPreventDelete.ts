import { Editor, Element, Point, Range, Transforms } from "slate";
import { TextDirection, TextUnit } from "slate/dist/interfaces/types";
import { ElementType } from "../types";
export const withPreventDelete = (editor: Editor) => {
  const { deleteForward, deleteBackward, deleteFragment } = editor;
  editor.deleteForward = (unit: TextUnit) => {
    const { selection } = editor;
    const [titleBlock] = Editor.nodes(editor, {
      match: (node) =>
        !Editor.isEditor(node) &&
        Element.isElement(node) &&
        node.type === ElementType.TITLE,
    });
    let atLastChar = false;
    if (selection) {
      const point = Editor.end(editor, selection.anchor.path.slice(0, -1));
      atLastChar = Point.equals(point, selection.focus);
    }
    if (
      !!titleBlock &&
      Element.isElement(titleBlock[0]) &&
      (atLastChar || Editor.isEmpty(editor, titleBlock[0]))
    ) {
      return;
    }

    deleteForward(unit);
  };
  editor.deleteBackward = (unit: TextUnit) => {
    const { selection } = editor;
    let atFirstChar = false;
    if (selection) {
      const point = Editor.start(editor, selection.anchor.path.slice(0, -1));
      atFirstChar = Point.equals(point, selection.focus);
    }
    if (editor.sharedRoot.length <= 2 && atFirstChar) {
      return;
    }
    deleteBackward(unit);
  };
  editor.deleteFragment = (direction?: TextDirection) => {
    const { selection } = editor;
    const [titleBlock] = Editor.nodes(editor, {
      match: (node) =>
        !Editor.isEditor(node) &&
        Element.isElement(node) &&
        node.type === ElementType.TITLE,
    });
    if (
      titleBlock &&
      selection &&
      selection.anchor.path[0] !== selection.focus.path[0]
    ) {
      return;
    }
    deleteFragment(direction);
  };

  return editor;
};
