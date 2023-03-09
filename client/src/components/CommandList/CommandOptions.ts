import {ElementType} from '../../types'
export const CommandOptions = [
  {value: ElementType.PARAGRAPH, label: 'Text', description: 'Start writing with plain text', image: 'https://www.notion.so/images/blocks/text/en-US.png'},
  {value: ElementType.HEADING_ONE, label: 'Heading 1', description: 'Big section heading',  image: 'https://www.notion.so/images/blocks/header.57a7576a.png'},
  {value: ElementType.HEADING_TWO, label: 'Heading 2', description: 'Medium section heading',  image: 'https://www.notion.so/images/blocks/subheader.9aab4769.png'},
  {value: ElementType.HEADING_THREE, label: 'Heading 3', description: 'Small section heading',  image: 'https://www.notion.so/images/blocks/subsubheader.d0ed0bb3.png'},
  {value: ElementType.ORDERED_LIST, label: 'Numbered List', description: 'Create a list with numbering',  image: 'https://www.notion.so/images/blocks/numbered-list.0406affe.png'},
  {value: ElementType.UNORDERED_LIST, label: 'Bulleted List', description: 'Create a simple bulleted list',  image: 'https://www.notion.so/images/blocks/bulleted-list.0e87e917.png'},
  {value: ElementType.BLOCK_QUOTE, label: 'Quote', description: 'Capture a quote',  image: 'https://www.notion.so/images/blocks/quote/en-US.png'},
  {value: ElementType.INLINE_CODE, label: 'Code', description: 'Capture a code snippet',  image: 'https://www.notion.so/images/blocks/code.a8b201f4.png'},
]