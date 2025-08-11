import { ReactNode } from "react";

export interface ActionButtonProps {
  icon: ReactNode;
  onClick: () => void;
  style: string;
}

export const ActionButton = ({ icon, onClick, style }: ActionButtonProps) => {
  return (
    <button
      className={`rounded-xl border-2 p-2 ${style}`}
      onClick={() => onClick()}
    >
      {icon}
    </button>
  );
};
