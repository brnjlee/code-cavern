import React from "react";
import { useDroppable } from "@dnd-kit/core";

type DroppableProps = {
  children: React.ReactNode;
  id: string;
  parent?: string;
  type?: string;
  className?: string;
};

function Droppable({ children, id, parent, type, className }: DroppableProps) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      parent,
      type,
    },
  });

  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

export default Droppable;
