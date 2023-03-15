import React, { useEffect, useRef, useState, useCallback } from "react";
import {PanelGroup, Panel, PanelResizeHandle} from 'react-resizable-panels'

import TabContainer from "../../components/TabContainer";
import {genUniqueId} from '../../utils/utils';

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

const directionTable = {
	right: "horizontal",
	left: "horizontal",
	top: "vertical",
	bottom: "vertical",
}

type Panel = {
	type: string;
	id?: string;
	tabs?: any[]
	panels?: (Panel)[]
}
export default () => {
	const [layout, setLayout] = useState<Panel>({
		type: "root",
		panels: [
			{
				type: "panel",
				id: genUniqueId(),
				tabs: DEFAULT_TABS
			},
		]
	})

	const renderLayout = (root, direction) => {
		if (root.type === "panel") {
			return <Panel ><TabContainer createContainer={(targetArea) => handleCreateContainer(direction, root.id, targetArea)}/></Panel>
		}
		const resizeHandleClass = root.type === "horizontal" || root.type === 'root' ? "w-2" : "h-2" 
		if (root.type === "root") {
			return (
				<PanelGroup direction='horizontal'>
					{root.panels.map((child, i) => (
						<>
							{renderLayout(child, 'horizontal')}
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
							{renderLayout(child, root.type)}
							{i < root.panels.length-1 ? <PanelResizeHandle className={resizeHandleClass}/> : null}
						</>
					))}
				</PanelGroup>
			</Panel>
		)
	}

	const handleCreateContainer = (direction:string, originId:string, targetArea:string) => {
		const mutateClone = (root) => {
			if (root.panels) {
				const idx = indexOfPanel(root.panels, originId)
				if (idx != -1) {
					let newPanel
					if (directionTable[targetArea] === direction) {
						newPanel = {
							type: "panel",
							id: genUniqueId(),
							tabs: DEFAULT_TABS
						}
						if (targetArea === "right" || targetArea === "bottom") {
							root.panels.splice(idx+1, 0, newPanel)
							return
						}
						root.panels.splice(idx, 0, newPanel)
						return
					}
					newPanel = {
						type: directionTable[targetArea],
						panels: [
							{
								type: "panel",
								id: genUniqueId(),
								tabs: DEFAULT_TABS
							}
						]
					}
					console.info(root.panels[idx])
					if (targetArea === "right" || targetArea === "bottom") {
						newPanel.panels.push({...root.panels[idx]})
					} else {
						newPanel.panels.unshift({...root.panels[idx]})
					}
					root.panels.splice(idx, 1, newPanel)
					return
				}
				root.panels.forEach((child) => mutateClone(child))
			}
		}
		let layoutClone = JSON.parse(JSON.stringify(layout))
		mutateClone(layoutClone)
		console.info(layoutClone)
		setLayout(layoutClone)
	}

	const indexOfPanel = (panels:(Panel)[], id:string) => {
		for (let i = 0; i < panels.length; i++) {
			const root = panels[i]
			if (root.id === id) {
				return i
			}
		}
		return -1
	}

	return (
		<div className="h-screen p-10">
			{renderLayout(layout, '')}
		</div>
	);
};
