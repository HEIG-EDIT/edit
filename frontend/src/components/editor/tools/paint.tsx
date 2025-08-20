// use https://casesandberg.github.io/react-color/

import { ChromePicker } from "react-color";
import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import BrushRoundedIcon from "@mui/icons-material/BrushRounded";
import { useRef } from "react";
import { useEditorContext } from "../editorContext";
import { v2Sub } from "@/models/editor/layers/layerUtils";
import { Layer } from "@/models/editor/layers/layer";

export interface PaintToolConfiguration extends ToolConfiguration {
  radius: number;
  color: string;
}

export const PaintToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<PaintToolConfiguration>) => {
  const isDrawing = useRef(false);
  const {
    editSelectedLayers,
    getCanvasPointerPosition,
    setToolEventHandlers,
    commitVirtualLayers,
  } = useEditorContext();

  const getLayerCursorPosition = (layer: Layer) => {
    return v2Sub(getCanvasPointerPosition(), layer.position);
  };

  const handleMouseDown = () => {
    isDrawing.current = true;

    editSelectedLayers((layer) => {
      const pointPosition = getLayerCursorPosition(layer);
      return {
        ...layer,
        lines: layer.lines.concat([
          {
            points: [pointPosition.x, pointPosition.y],
            color: configuration.color,
            width: configuration.radius,
            tool: null,
          },
        ]),
      };
    }, true);
  };

  const handleMouseMove = () => {
    if (!isDrawing.current) {
      return;
    }

    // TODO: Restrict drawing to inside the layer
    editSelectedLayers((layer) => {
      console.log("layer", layer);
      const pointPosition = getLayerCursorPosition(layer);
      const lines = layer.lines.slice();
      const currentLine = lines[lines.length - 1];
      currentLine.points = currentLine.points.concat([
        pointPosition.x,
        pointPosition.y,
      ]);

      layer.lines = lines;
      return layer;
    }, true);
  };

  const handleMouseUp = () => {
    if (isDrawing.current) {
      isDrawing.current = false;
      commitVirtualLayers();
    }
  };

  setToolEventHandlers({
    mouseDown: handleMouseDown,
    mouseMove: handleMouseMove,
    mouseUp: handleMouseUp,
  });

  return (
    <div>
      <p className="text-violet-50">
        Radius :<br></br>
      </p>
      <input
        type="range"
        min="1"
        max="100"
        value={configuration.radius}
        onChange={(e) => {
          setConfiguration({
            ...configuration,
            radius: Number(e.target.value),
          });
        }}
      />
      <span className="text-violet-50"> {configuration.radius}</span>
      <p className="text-violet-50">
        Color :<br></br>
      </p>
      <ChromePicker
        color={configuration.color}
        onChangeComplete={(color) => {
          setConfiguration({ ...configuration, color: color.hex });
        }}
        disableAlpha={true}
      />
    </div>
  );
};

export const PAINT_TOOL: Tool<PaintToolConfiguration> = {
  name: "Paint",
  icon: <BrushRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: { radius: 59, color: "#799ed2" },
  configurationComponent: PaintToolConfigurationComponent,
};
