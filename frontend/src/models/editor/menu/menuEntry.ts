import { ReactNode } from "react";

export interface MenuEntry {
  name: string;
  button: {
    icon: ReactNode;
    text: string;
    onClick: () => void;
  };
  associatedComponent: React.FC;
}
