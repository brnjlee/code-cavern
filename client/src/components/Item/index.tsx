import React, { forwardRef } from "react";

type ItemProps = {
	id: string | null;
	children: React.ReactNode;
	className: string;
};

const Item = forwardRef(({ id, children, className }: ItemProps, ref) => {
	return (
		<div ref={ref} className={className}>
			{children}
		</div>
	);
});

export default Item;
