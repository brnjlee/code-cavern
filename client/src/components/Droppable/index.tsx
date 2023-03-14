import React from "react";
import { useDroppable } from "@dnd-kit/core";

type DroppableProps = {
	children: React.ReactNode;
	id: string;
	className: string;
};

function Droppable({ children, id, className }: DroppableProps) {
	const { isOver, setNodeRef } = useDroppable({
		id: id,
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
