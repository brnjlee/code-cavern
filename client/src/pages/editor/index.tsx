import React, { useEffect, useRef, useState, useCallback } from "react";
import {PanelGroup, Panel, PanelResizeHandle} from 'react-resizable-panels'

import TextEditor from "../../components/TextEditor";
import TabContainer from "../../components/TabContainer";
const DEFAULT_TABS = [
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
]
export default () => {
	const [layout, setLayout] = useState({
		type: "root",
		panels: [
			{
				type: "panel",
				tabs: DEFAULT_TABS
			},
			{
				type: "vertical",
				panels: [
					{
						type: "panel",
						tabs: DEFAULT_TABS
					},
					{
						type: "panel",
						tabs: DEFAULT_TABS
					},
				]
			}
		]
	})

	const renderLayout = () => {
		return traverseLayout(layout)
	}

	const traverseLayout = (root) => {
		if (root.type === "panel") {
			return <Panel><TabContainer /></Panel>
		}
		const resizeHandleClass = root.type === "horizontal" || root.type === 'root' ? "w-2" : "h-2" 
		if (root.type === "root") {
			return (
				<PanelGroup autoSaveId="persistence" direction='horizontal'>
					{root.panels.map((child, i) => (
						<>
							{traverseLayout(child)}
							{i < root.panels.length-1 ? <PanelResizeHandle className={resizeHandleClass}/> : null}
						</>
					))}
				</PanelGroup>
			)
		}
		return (
			<Panel>
				<PanelGroup direction={root.type}>
					{root.panels.map((child, i) => (
						<>
							{traverseLayout(child)}
							{i < root.panels.length-1 ? <PanelResizeHandle className={resizeHandleClass}/> : null}
						</>
					))}
				</PanelGroup>
			</Panel>
		)
	}
	console.info(traverseLayout(layout))

	return (
		<div className="h-screen p-10">
			{traverseLayout(layout)}
		</div>
	);
};
