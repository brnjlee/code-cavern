import React, { useState } from "react";
import styles from "./index.module.css";

import clsx from "clsx";

interface tooltipProps {
  children: React.ReactElement;
  direction: string;
  label: string;
  className?: string;
}

const Tooltip = ({ className, children, direction, label }: tooltipProps) => {
  const [active, setActive] = useState(false);

  const showTip = () => {
    setActive(true);
  };

  const hideTip = () => {
    setActive(false);
  };
  return (
    <div
      className={clsx(className, "inline-block relative")}
      onMouseEnter={showTip}
      onMouseLeave={hideTip}
    >
      {children}
      <div
        className={clsx(
          styles[direction],
          active && styles.active,
          styles.Tooltip
        )}
      >
        {label}
      </div>
    </div>
  );
};

export default Tooltip;
