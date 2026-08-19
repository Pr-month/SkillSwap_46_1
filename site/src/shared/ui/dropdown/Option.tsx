import { useRef } from "react";
import type { MouseEventHandler } from "react";
import type { OptionType } from "./types";
import clsx from "clsx";
import { useEnterOptionSubmit } from "./hooks/useEnterOptionSubmit";

import styles from "./Dropdown.module.css";

type OptionProps = {
  option: OptionType;
  onClick: (value: OptionType["value"]) => void;
};

export const Option = (props: OptionProps) => {
  const {
    option: { title, value, className },
    onClick,
  } = props;
  const optionRef = useRef<HTMLLIElement>(null);

  const handleClick =
    (clickedValue: OptionType["value"]): MouseEventHandler<HTMLLIElement> =>
    () => {
      onClick(clickedValue);
    };

  useEnterOptionSubmit({
    optionRef,
    value,
    onClick,
  });

  return (
    <li
      className={clsx(styles.option, styles[className || ""])}
      value={value}
      ref={optionRef}
      onClick={handleClick(value)}
      tabIndex={0}
    >
      {title}
    </li>
  );
};
