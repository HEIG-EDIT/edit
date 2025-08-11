import React, { ReactNode } from "react";

export interface EntryButtonProps {
  icon: ReactNode;
  text: string;
  onClick: () => void;
  style: string;
}

export const EntryButton = ({
  icon,
  text,
  onClick,
  style,
}: EntryButtonProps) => {
  return (
    <button
      className={`${style} rounded-xl p-2 w-full flex items-center justify-start gap-2`}
      onClick={onClick}
    >
      {icon}
      {text}
    </button>
  );
};
