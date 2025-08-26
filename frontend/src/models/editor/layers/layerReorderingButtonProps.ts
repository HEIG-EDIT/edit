import { ElementType } from "react";

export interface LayerReorderingButtonProps {
  onClick: () => void;
  icon: ElementType;
  canUse: boolean;
}
