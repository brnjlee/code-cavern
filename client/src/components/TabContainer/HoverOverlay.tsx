import React, { useCallback } from "react";
import clsx from "clsx";
type HoverOverlay = {
	hoveringOver: string;
};
const HoverOverlay = ({ hoveringOver }: HoverOverlay) => {
	console.log(hoveringOver);
	const className = () => {
		switch (hoveringOver) {
			case "top":
				return "top-0 bottom-1/2 left-0 right-0";
			case "bottom":
				return "top-1/2 bottom-0 left-0 right-0";
			case "right":
				return "top-0 bottom-0 left-1/2 right-0";
			case "left":
				return "top-0 bottom-0 left-0 right-1/2";
		}
	};
	return (
		<div
			className={clsx(
				"transition-all absolute opacity-50 bg-blue-300",
				className()
			)}
		/>
	);
};

export default HoverOverlay;
