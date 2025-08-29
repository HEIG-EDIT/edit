// use https://konvajs.org/docs/react/Canvas_Export.html#how-to-save-a-drawing-from-react-konva

import { Layer } from "konva/lib/Layer";
import Konva from "konva";

export function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const setTransformersVisibility = (layer: Layer, visible: boolean) => {
  for (const child of layer.getChildren()) {
    if (child instanceof Konva.Transformer) {
      child.visible(visible);
    }
  }
};

export const handleExport = (layerRef: React.RefObject<Layer | null>) => {
  if (layerRef && layerRef.current) {
    console.log("children", layerRef.current.getChildren());
    setTransformersVisibility(layerRef.current, false);
    const uri = layerRef.current.toDataURL();
    downloadURI(uri, "project.png");
    setTransformersVisibility(layerRef.current, true);
  }
};
