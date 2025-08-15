import { LayerUpdateCallback } from "./layer";

export interface LayerConfigurationProps {
  name: string;
  isSelected: boolean;
  isVisible: boolean;
  updateLayer: (callback: LayerUpdateCallback) => void;
}
