import { ReactNode } from "react";

export const OutsideCard = ({ children }: { children: ReactNode }) => {
  return <div className="bg-gray-800 rounded-lg p-4">{children}</div>;
};
