import { LayerUpdateCallback } from "./layer";

export type LayerConfigurationProps = {
  name: string;
  isSelected: boolean;
  isVisible: boolean;
  updateLayer: (callback: LayerUpdateCallback) => void;
};
