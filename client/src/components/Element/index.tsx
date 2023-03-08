import { RenderElementProps } from "slate-react";
import React from "react";
import {ElementType} from '../../types'

export function Element({ element, attributes, children }: RenderElementProps) {
  switch (element.type) {
    case ElementType.HEADING_ONE:
      return (
        <h1 {...attributes} className="text-5xl my-5">
          {children}
        </h1>
      );
    case ElementType.HEADING_TWO:
      return (
        <h2 {...attributes} className="text-3xl my-2">
          {children}
        </h2>
      );
    case ElementType.HEADING_THREE:
      return (
        <h3 {...attributes} className="text-2xl my-2">
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
        <ol className="list-decimal list-inside" {...attributes}>{children}</ol>
      );
    case ElementType.UNORDERED_LIST:
      return (
        <ul className="list-disc list-inside" {...attributes}>{children}</ul>
      );
    case ElementType.LIST_ITEM:
      return (
        <li {...attributes}>{children}</li>
      );
    case ElementType.LIST_ITEM_TEXT:
      return (
        <span {...attributes}>{children}</span>
      );
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
