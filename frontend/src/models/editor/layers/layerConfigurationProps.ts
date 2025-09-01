import { LayerUpdateCallback } from "./layer";

/// Props passed to each individual layers shown in the LayerManagement component
/// showing the current layers in the canvas.
export interface LayerConfigurationProps {
  name: string;
  isSelected: boolean;
  isVisible: boolean;
  updateLayer: (callback: LayerUpdateCallback, virtual?: boolean) => void;
}
