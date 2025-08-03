import { ReactNode } from "react";

export const OutsideCard = ({ children }: { children: ReactNode }) => {
  return <div className="bg-gray-800 rounded-2xl p-8">{children}</div>;
};
