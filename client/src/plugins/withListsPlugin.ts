import { ListType, withLists } from '@prezly/slate-lists';
import { BaseElement, Element, Node } from 'slate';
import {ElementType} from '../types'


export const withListsPlugin = withLists({
    isConvertibleToListTextNode(node: Node) {
        return Element.isElementType(node, ElementType.TEXT);
    },
    isDefaultTextNode(node: Node) {
        return Element.isElementType(node, ElementType.TEXT);
    },
    isListNode(node: Node, type?: ListType) {
        if (type) {
            return Element.isElementType(node, type);
        }
        return (
            Element.isElementType(node, ElementType.ORDERED_LIST) ||
            Element.isElementType(node, ElementType.UNORDERED_LIST)
        );
    },
    isListItemNode(node: Node) {
        return Element.isElementType(node, ElementType.LIST_ITEM);
    },
    isListItemTextNode(node: Node) {
        return Element.isElementType(node, ElementType.LIST_ITEM_TEXT);
    },
    createDefaultTextNode(props = {}) {
        return { children: [{ text: '' }], ...props, type: ElementType.TEXT };
    },
    createListNode(type: ListType = ListType.UNORDERED, props = {}) {
        const nodeType = type === ListType.ORDERED ? ElementType.ORDERED_LIST : ElementType.UNORDERED_LIST;
        return { children: [{ text: '' }], ...props, type: nodeType };
    },
    createListItemNode(props = {}) {
        return { children: [{ text: '' }], ...props, type: ElementType.LIST_ITEM };
    },
    createListItemTextNode(props = {}) {
        return { children: [{ text: '' }], ...props, type: ElementType.LIST_ITEM_TEXT };
    },
});