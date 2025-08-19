import { ReactNode } from "react";

export interface ActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  style: string;
  disabled?: boolean;
}

export const ActionButton = ({
  icon,
  onClick,
  style,
  disabled = false,
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
