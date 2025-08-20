import { Layer } from "./layer";

export interface LayerReorderingProps {
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
}
