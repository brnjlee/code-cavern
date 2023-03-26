import { ElementType } from "../../types";
import { BsTypeH1, BsTypeH2, BsTypeH3, BsType } from "react-icons/bs";
import { GoListOrdered, GoListUnordered } from "react-icons/go";
import { RiDoubleQuotesL, RiCodeSSlashFill } from "react-icons/ri";

export const CommandOptions = [
  {
    value: ElementType.PARAGRAPH,
    label: "Text",
    description: "Start writing with plain text",
    icon: <BsType />,
    iconClass:
      "text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600",
    selectedClass: "bg-indigo-100",
  },
  {
    value: ElementType.HEADING_ONE,
    label: "Heading 1",
    description: "Big section heading",
    icon: <BsTypeH1 />,
    iconClass:
      "text-green-600 group-hover:bg-green-100 group-hover:text-green-700",
    selectedClass: "bg-green-100",
  },
  {
    value: ElementType.HEADING_TWO,
    label: "Heading 2",
    description: "Medium section heading",
    icon: <BsTypeH2 />,
    iconClass:
      "text-green-600 group-hover:bg-green-100 group-hover:text-green-700",
    selectedClass: "bg-green-100",
  },
  {
    value: ElementType.HEADING_THREE,
    label: "Heading 3",
    description: "Small section heading",
    icon: <BsTypeH3 />,
    iconClass:
      "text-green-600 group-hover:bg-green-100 group-hover:text-green-700",
    selectedClass: "bg-green-100",
  },
  {
    value: ElementType.ORDERED_LIST,
    label: "Numbered List",
    description: "Create a list with numbering",
    icon: <GoListOrdered />,
    iconClass:
      "text-orange-600 group-hover:bg-orange-100 group-hover:text-orange-700",
    selectedClass: "bg-orange-100",
  },
  {
    value: ElementType.UNORDERED_LIST,
    label: "Bulleted List",
    description: "Create a simple bulleted list",
    icon: <GoListUnordered />,
    iconClass:
      "text-yellow-500 group-hover:bg-yellow-100 group-hover:text-yellow-600",
    selectedClass: "bg-yellow-100",
  },
  {
    value: ElementType.BLOCK_QUOTE,
    label: "Quote",
    description: "Capture a quote",
    icon: <RiDoubleQuotesL />,
    iconClass:
      "text-blue-600 group-hover:bg-blue-100 group-hover:text-blue-700",
    selectedClass: "bg-blue-100",
  },
  {
    value: ElementType.INLINE_CODE,
    label: "Code",
    description: "Capture a code snippet",
    icon: <RiCodeSSlashFill />,
    iconClass:
      "text-cyan-600 group-hover:bg-cyan-100 group-hover:text-cyan-700",
    selectedClass: "bg-cyan-100",
  },
];
