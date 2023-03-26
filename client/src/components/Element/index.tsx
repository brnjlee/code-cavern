import { RenderElementProps } from "slate-react";
import React from "react";
import { ElementType } from "../../types";

export function Element({ element, attributes, children }: RenderElementProps) {
  switch (element.type) {
    case ElementType.TITLE:
      return (
        <h1
          {...attributes}
          className="element title text-[2.5rem] my-5 font-bold"
        >
          {children}
        </h1>
      );
    case ElementType.HEADING_ONE:
      return (
        <h1 {...attributes} className="element text-3xl mb-2 mt-8 font-medium">
          {children}
        </h1>
      );
    case ElementType.HEADING_TWO:
      return (
        <h2
          {...attributes}
          className="element text-2xl mb-2 mt-5 font-semibold"
        >
          {children}
        </h2>
      );
    case ElementType.HEADING_THREE:
      return (
        <h3 {...attributes} className="element text-xl my-2 mt-3 font-semibold">
          {children}
        </h3>
      );
    case ElementType.INLINE_CODE:
      return (
        <code {...attributes} className="border-2 bg-gray-100">
          {children}
        </code>
      );
    case ElementType.ORDERED_LIST:
      return (
        <ol className="list-decimal list-inside" {...attributes}>
          {children}
        </ol>
      );
    case ElementType.UNORDERED_LIST:
      return (
        <ul className="list-disc list-inside" {...attributes}>
          {children}
        </ul>
      );
    case ElementType.LIST_ITEM:
      return <li {...attributes}>{children}</li>;
    case ElementType.LIST_ITEM_TEXT:
      return <span {...attributes}>{children}</span>;
    case ElementType.BLOCK_QUOTE:
      return (
        <blockquote {...attributes} className="mb-2 text-gray-400 flex text-lg">
          <p className="my-1">{children}</p>
        </blockquote>
      );
    default:
      return (
        <p {...attributes} className="mb-2">
          {children}
        </p>
      );
  }
}
