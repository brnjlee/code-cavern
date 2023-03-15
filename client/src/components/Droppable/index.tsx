import React from "react";
import { useDroppable } from "@dnd-kit/core";

type DroppableProps = {
  children: React.ReactNode;
  id: string;
  parent: string;
  className: string;
};

function Droppable({ children, id, parent, className }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      parent,
    },
  });
  const style = {
    color: isOver ? "green" : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children}
    </div>
  );
}

export default Droppable;
