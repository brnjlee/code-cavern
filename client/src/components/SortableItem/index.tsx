import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
type SortableItemProps = {
	children: React.ReactNode;
	id: string;
	className: string;
};
const SortableItem = ({ children, id, className }: SortableItemProps) => {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={className}
			{...attributes}
			{...listeners}
		>
			{children}
		</div>
	);
};

export default SortableItem;
