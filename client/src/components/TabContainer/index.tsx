import React, { useState } from "react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	DragOverlay,
	useSensor,
	useSensors,
	rectIntersection,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Cross2Icon } from "@radix-ui/react-icons";
import clsx from "clsx";

import Draggable from "../Draggable";
import Droppable from "../Droppable";
import SortableItem from "../SortableItem";
import Item from "../Item";
import HoverOverlay from "./HoverOverlay";

const conatinerIds = new Set(["left", "top", "right", "bottom"]);

const containers = [
	["left", "bg-green-200 row-span-2"],
	["top", "bg-gray-500 col-span-3"],
	["right", "bg-green-200 row-span-2"],
	["bottom", "bg-gray-500 col-span-3"],
];
const TabContainer = () => {
	const [activeId, setActiveId] = useState(null);
	const [hoveringOver, setHoveringOver] = useState("");
	const [tabs, setTabs] = useState([
		"test1.py",
		"test2.py",
		"test3.py",
		"test4.py",
	]);
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	const [parent, setParent] = useState(null);
	const draggableMarkup = (
		<Draggable
			id="draggable"
			className="bg-gray-200 px-2 py-1 text-sm rounded flex items-center"
		>
			<span>test.py</span>
			<button
				className={clsx(
					"h-5 w-5 ml-1 flex justify-center items-center hover:bg-gray-100 rounded-full p-[3px]"
				)}
				type="button"
				onMouseDown={(event) => {
					event.preventDefault();
				}}
			>
				<Cross2Icon className={"text-black"} />
			</button>
		</Draggable>
	);
	const renderTabs = tabs.map((id) => (
		<SortableItem
			key={id}
			id={id}
			className="bg-gray-200 pl-2 pr-1 py-1 ml-1.5 text-sm rounded flex items-center"
		>
			<span>{id}</span>
			<button
				className={clsx(
					"h-5 w-5 ml-1 flex justify-center items-center hover:bg-gray-100 rounded-full p-[3px]"
				)}
				type="button"
				onMouseDown={(event) => {
					event.preventDefault();
				}}
			>
				<Cross2Icon className={"text-black"} />
			</button>
		</SortableItem>
	));

	const renderItem = (
		<Item
			id={activeId}
			className="bg-gray-200 px-2 py-1 text-sm rounded flex items-center"
		>
			<span>{activeId}</span>
			<button
				className={clsx(
					"h-5 w-5 ml-1 flex justify-center items-center hover:bg-gray-100 rounded-full p-[3px]"
				)}
			>
				<Cross2Icon className={"text-black"} />
			</button>
		</Item>
	);

	const renderContainers = containers.map(([id, className]) => (
		<Droppable key={id} id={id} className={clsx("h-full", className)}>
			{parent === id ? draggableMarkup : "Drop here"}
		</Droppable>
	));

	const handleDragOver = (event) => {
		const { over } = event;
		if (over && conatinerIds.has(over.id)) {
			setHoveringOver(over.id);
		} else {
			setHoveringOver("");
		}
	};
	const handleDragStart = (event) => {
		const { active } = event;

		setActiveId(active.id);
	};

	const handleDragEnd = (event) => {
		const { active, over } = event;
		if (over) {
			if (conatinerIds.has(over.id)) {
				console.log("move to ", over.id);
			} else if (active.id !== over.id) {
				setTabs((tabs) => {
					const oldIndex = tabs.indexOf(active.id);
					const newIndex = tabs.indexOf(over.id);

					return arrayMove(tabs, oldIndex, newIndex);
				});
			}
		}
		setActiveId(null);
		setHoveringOver("");
	};

	return (
		<div className="relative bg-gray-200 rounded grid h-full grid-cols-5 grid-rows-3 grid-rows-[2.5rem_auto]">
			<DndContext
				sensors={sensors}
				collisionDetection={rectIntersection}
				onDragOver={handleDragOver}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
					<div className="bg-black col-span-5 flex items-center">
						{renderTabs}
						{/* {parent === null ? draggableMarkup : null} */}
					</div>
				</SortableContext>
				<DragOverlay>{activeId ? renderItem : null}</DragOverlay>
				<HoverOverlay hoveringOver={hoveringOver} />
				{renderContainers}
			</DndContext>
		</div>
	);
};

export default TabContainer;
