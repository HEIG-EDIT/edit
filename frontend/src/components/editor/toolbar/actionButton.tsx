import { ReactNode } from "react";

export interface ActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  style: string;
  disabled: bool;
}

export const ActionButton = ({
  icon,
  onClick,
  style,
  disabled,
}: ActionButtonProps) => {
  return (
    <button
      className={`rounded-xl border-2 p-2 ${disabled ? "" : "cursor-pointer"} ${style}`}
      onClick={() => onClick()}
      disabled={disabled}
    >
      {icon}
    </button>
  );
};
