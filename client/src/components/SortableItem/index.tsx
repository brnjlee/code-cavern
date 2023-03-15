import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
type SortableItemProps = {
  children: React.ReactNode;
  id: UniqueIdentifier;
  name: string;
  type: string;
  parent: string;
  className: string;
  onClick: () => void;
};
const SortableItem = ({
  children,
  id,
  name,
  type,
  parent,
  className,
  onClick,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, data: { name, type, parent } });

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
