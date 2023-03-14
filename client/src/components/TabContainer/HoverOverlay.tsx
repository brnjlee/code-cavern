import React from "react";
import clsx from "clsx";

const HoverOverlay = (at: string) => {
	const className = () => {
		switch (at) {
			case "top":
				return "h-1/2";
			case "bottom":
				return;
			case "right":
				return;
			case "left":
				return;
		}
	};
	return <div className={clsx("absolute opacity-50 bg-blue-400", className)} />;
};

export default HoverOverlay;
