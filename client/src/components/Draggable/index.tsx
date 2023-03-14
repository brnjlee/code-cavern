import React from "react";
import { useDraggable } from "@dnd-kit/core";
type DraggableProps = {
	children: React.ReactNode;
	id: string;
	className: string;
};
function Draggable({ children, id, className }: DraggableProps) {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id,
	});
	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
		  }
		: undefined;

	return (
		<button
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className={className}
		>
			{children}
		</button>
	);
}

export default Draggable;
