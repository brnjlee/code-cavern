import React, { useState, useCallback} from "react";
import {
	DndContext,
	KeyboardSensor,
	PointerSensor,
	DragOverlay,
	useSensor,
	useSensors,
	rectIntersection,
	DragOverEvent,
	UniqueIdentifier
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
import CodeEditor from "../CodeEditor";
import TextEditor from "../TextEditor";

type Tab = {
	type: string;
	name: string;
	id: UniqueIdentifier
}
type TabContainer = {
	createContainer: (targetArea:string) => void
}

const conatinerIds = new Set<UniqueIdentifier>(["left", "top", "right", "bottom"]);

const containers = [
	["left", "row-span-2"],
	["top", "col-span-3"],
	["right", "row-span-2"],
	["bottom", "col-span-3"],
];
const TabContainer = ({createContainer}: TabContainer) => {
	const [activeTabId, setActiveTabId] = useState('500');
	const [activeName, setActiveName] = useState(null);
	const [hoveringOver, setHoveringOver] = useState<UniqueIdentifier>("");
	const [tabs, setTabs] = useState<Tab[]>([
		{
			type: "code",
			name: "test1.py",
			id: "500"
		},{
			type: "code",
			name: "test2.py",
			id: "501"
		},{
			type: "text",
			name: "test3.md",
			id: "1"
		},{
			type: "text",
			name: "test1.md",
			id: "2"
		},
	]);
	const activeTab = useCallback((id:UniqueIdentifier) => {
		return tabs.find(t => t.id === id)
	}, [activeTabId, tabs])
	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {distance: 10}
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	const renderTabs = tabs.map(({type, name, id}) => (
		<SortableItem
			key={id}
			id={id}
			onClick={() => setActiveTabId(id)}
			className={clsx(activeTabId === id && "bg-gray-400","select-none bg-gray-200 pl-2 pr-1 py-1 ml-1.5 text-sm rounded flex items-center")}
		>
			<span>{name}</span>
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
			id={activeName}
			className="bg-gray-200 px-2 py-1 text-sm rounded flex items-center"
		>
			<span>{activeName}</span>
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
			{/* {parent === id ? draggableMarkup : "Drop here"} */}
		</Droppable>
	));

	const renderContent = () => {
		switch(activeTab(activeTabId)?.type) {
			case "code":
				return <CodeEditor />
			case "text":
				return <TextEditor />
		}
	}

	const handleDragOver = (event:DragOverEvent) => {
		const { over } = event;
		if (over && conatinerIds.has(over.id)) {
			setHoveringOver(over.id);
		} else {
			setHoveringOver("");
		}
	};
	const handleDragStart = (event:DragOverEvent) => {
		const { active } = event;
		const target = activeTab(active.id)
		if (target) {
			setActiveName(target.name);
		}

	};

	const handleDragEnd = (event:DragOverEvent) => {
		const { active, over } = event;
		if (over) {
			if (conatinerIds.has(over.id)) {
				console.log("move to ", over.id);
				createContainer(over.id)
			} else if (active.id !== over.id) {
				setTabs((tabs) => {
					const oldIndex = tabs.map(e => e.id).indexOf(active.id);
					const newIndex = tabs.map(e => e.id).indexOf(over.id);

					return arrayMove(tabs, oldIndex, newIndex);
				});
			}
		}
		setActiveName(null);
		setHoveringOver("");
	};

	return (
		<div className="relative h-full bg-gray-200 rounded flex flex-col">
			<DndContext
				sensors={sensors}
				collisionDetection={rectIntersection}
				onDragOver={handleDragOver}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
			>
				<SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
					<div className="bg-black h-10 flex items-center rounded-t">
						{renderTabs}
					</div>
				</SortableContext>
				<div className="top-10 absolute h-[calc(100%-2.5rem)] right-0 left-0 grid grid-cols-5 grid-rows-2">
					{renderContainers}
				</div>
				<DragOverlay>{activeName ? renderItem : null}</DragOverlay>
				<HoverOverlay hoveringOver={hoveringOver} />
				{
					renderContent()
				}
			</DndContext>
		</div>
	);
};

export default TabContainer;
