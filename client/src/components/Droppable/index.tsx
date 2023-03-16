import React from "react";
import { useDroppable } from "@dnd-kit/core";

type DroppableProps = {
  children: React.ReactNode;
  id: string;
  parent?: string;
  className?: string;
};

function Droppable({ children, id, parent, className }: DroppableProps) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: {
      parent,
    },
  });

  return (
    <div ref={setNodeRef} className={className}>
      {children}
    </div>
  );
}

export default Droppable;
