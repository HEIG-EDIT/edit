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

const THUMBNAIL_SIZE = {
  x: 160,
  y: 90,
};

export const exportToURI = (
  layerRef: React.RefObject<Layer | null>,
  thumbnail: boolean = false,
) => {
  let result: string;
  if (layerRef && layerRef.current) {
    const layer = layerRef.current;
    setTransformersVisibility(layer, false);
    // Hide stuff outside of the Canvas
    layerRef.current.clipFunc(function (ctx) {
      ctx.rect(0, 0, layer.width(), layer.height());
    });

    if (thumbnail) {
      const pixelRatio = THUMBNAIL_SIZE.x / layerRef.current.width();

      result = layerRef.current.toDataURL({
        pixelRatio: pixelRatio,
        height: THUMBNAIL_SIZE.y / pixelRatio, // To keep aspect ratio
      });
    } else {
      result = layerRef.current.toDataURL();
    }
    layerRef.current.clipFunc(undefined);
    setTransformersVisibility(layerRef.current, true);
    return result;
  }
  throw new Error("Could not get layer ref for export");
};

export const handleExport = (layerRef: React.RefObject<Layer | null>) => {
  const uri = exportToURI(layerRef, false);
  downloadURI(uri, "project.png");
};
