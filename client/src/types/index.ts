import { CursorEditor, YHistoryEditor, YjsEditor } from "@slate-yjs/core";
import { Descendant, BaseElement } from "slate";
import { ReactEditor } from "slate-react";
import { UniqueIdentifier } from "@dnd-kit/core";

export type Tab = {
  type: string;
  name: string;
  itemId: UniqueIdentifier;
  id: UniqueIdentifier;
};

export type Space = {
  id: number;
  name: string;
  documents: Document[];
};

export type Document = {
  id: number;
  type: string;
  name: string;
  data: any;
  spaceId: number;
};

export type TabParents = {
  [key: string]: string[];
};

export type CursorData = {
  name: string;
  color: string;
};

export type CustomText = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  paragraph: string;
};

export enum ElementType {
  TITLE = "title",
  PARAGRAPH = "paragraph",
  INLINE_CODE = "inline-code",
  HEADING_ONE = "heading-one",
  HEADING_TWO = "heading-two",
  HEADING_THREE = "heading-three",
  ORDERED_LIST = "ordered-list",
  UNORDERED_LIST = "unordered-list",
  LIST_ITEM = "list-item",
  LIST_ITEM_TEXT = "list-item-text",
  BLOCK_QUOTE = "block-quote",
}

export type Title = {
  type: ElementType.TITLE;
  children: Descendant[];
};
export type Paragraph = {
  type: ElementType.PARAGRAPH;
  children: Descendant[];
};

export type InlineCode = {
  type: ElementType.INLINE_CODE;
  children: Descendant[];
};

export type HeadingOne = {
  type: ElementType.HEADING_ONE;
  children: Descendant[];
};

export type HeadingTwo = {
  type: ElementType.HEADING_TWO;
  children: Descendant[];
};

export type HeadingThree = {
  type: ElementType.HEADING_THREE;
  children: Descendant[];
};

export type OrderedList = {
  type: ElementType.ORDERED_LIST;
  children: ListItem[];
};

export type UnorderedList = {
  type: ElementType.UNORDERED_LIST;
  children: ListItem[];
};

export type ListItem = {
  type: ElementType.LIST_ITEM;
  children: ListItemText[];
};

export type ListItemText = {
  type: ElementType.LIST_ITEM_TEXT;
  children: Descendant[];
};

export type BlockQuote = {
  type: ElementType.BLOCK_QUOTE;
  children: Descendant[];
};

export type CustomElement =
  | Title
  | Paragraph
  | InlineCode
  | HeadingOne
  | HeadingTwo
  | HeadingThree
  | OrderedList
  | UnorderedList
  | ListItem
  | ListItemText
  | BlockQuote;

export type CustomEditor = ReactEditor &
  YjsEditor &
  YHistoryEditor &
  CursorEditor<CursorData>;

declare module "slate" {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: { type: ElementType } & BaseElement;
    Text: CustomText;
  }
}
