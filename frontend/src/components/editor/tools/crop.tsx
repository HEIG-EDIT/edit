import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import CropRoundedIcon from "@mui/icons-material/CropRounded";
import {
  Image as KonvaImage,
  Group as KonvaGroup,
  Line as KonvaLine,
  Transformer as KonvaTransformer,
  Rect as KonvaRect,
} from "react-konva";
import { useEffect, useRef } from "react";
import { Layer, LayerId } from "@/models/editor/layers/layer";
import Konva from "konva";
import { useEditorContext } from "../editorContext";

export type CropToolConfiguration = ToolConfiguration;

export const CropToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<CropToolConfiguration>) => {
  // TODO : to remove, just for eslink check
  console.log(configuration);
  console.log(setConfiguration);

  return (
    <p className="text-violet-50"> No configuration available for this tool!</p>
  );
};


interface CropToolTransformerProps {
  groupRef: React.RefObject<Konva.Group>;
  layerId: LayerId;
  cropRef: React.RefObject<Konva.Rect | null>;
};

// Custom component to wrap a transformer used to crop layers
export const CropToolTransformer = ({ groupRef, layerId, cropRef }: CropToolTransformerProps) => {
  const { updateLayer } = useEditorContext();

  const isCropping = useRef(false);
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (groupRef.current) {
      transformerRef.current?.nodes([cropRef.current])
    }
  })

  const handleTransformEnd = (e) => {
    console.log('event', e)
    updateLayer(layerId, (layer) => {
      const node = cropRef?.current;
      console.log(node.scaleX(), node.scaleY())

      return {
        ...layer,
        size: {
          x: layer.size.x * node.scaleX(),
          y: layer.size.y * node.scaleY(),
        }
      };
    });
  };

  return (
    <>
      <KonvaTransformer
        onTransformStart={() => {
          isCropping.current = true;
        }}
        ref={transformerRef}
        onTransformEnd={handleTransformEnd}
        enabledAnchors={["top-center", "middle-right", "bottom-center", "middle-left"]}
        rotateEnabled={false}
      />
    </>
  )
}

export const CROP_TOOL: Tool<CropToolConfiguration> = {
  name: "Crop",
  icon: <CropRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: {},
  configurationComponent: CropToolConfigurationComponent,
};
