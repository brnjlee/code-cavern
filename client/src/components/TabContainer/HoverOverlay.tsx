import React, { useCallback } from "react";
import clsx from "clsx";
import {UniqueIdentifier
} from "@dnd-kit/core";

const HoverOverlay = ({ hoveringOver }: {
	hoveringOver: UniqueIdentifier;
}) => {
	const className = () => {
		switch (hoveringOver) {
			case "top":
				return "opacity-50 top-0 bottom-1/2 left-0 right-0";
			case "bottom":
				return "opacity-50 top-1/2 bottom-0 left-0 right-0";
			case "right":
				return "opacity-50 top-0 bottom-0 left-1/2 right-0";
			case "left":
				return "opacity-50 top-0 bottom-0 left-0 right-1/2";
		}
	};
	return (
		<div
			className={clsx(
				"transition-all opacity-0 absolute bg-blue-300 z-10",
				className()
			)}
		/>
	);
};

export default HoverOverlay;
