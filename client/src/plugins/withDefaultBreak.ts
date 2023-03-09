import { Editor, Transforms } from "slate";
import {ElementType} from '../types'

export const withDefaultBreak = (editor: Editor) => {
  editor.insertBreak = () => {
    const { selection, insertBreak } = editor
    if (selection) {
      Transforms.insertNodes(editor, {
        children: [{text: ""}],
        type: ElementType.PARAGRAPH
      })
      return
    }
    insertBreak()
  }

  return editor;
}
