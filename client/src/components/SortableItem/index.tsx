import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Tab } from "../../types";
type SortableItemProps = Tab & {
  children: React.ReactNode;
  parent: string;
  className: string;
  disabled: boolean;
  onClick: () => void;
};
const SortableItem = ({
  children,
  itemId,
  id,
  name,
  type,
  disabled,
  parent,
  className,
  onClick,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled, data: { id: itemId, name, type, parent } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        onClick();
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

export default SortableItem;
