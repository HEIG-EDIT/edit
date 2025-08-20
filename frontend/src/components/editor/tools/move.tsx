import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import { CANVAS_DRAG_MOUSE_BUTTON, KonvaMouseEvent, PRIMARY_MOUSE_BUTTON } from "@/models/editor/utils/events";
import OpenWithRoundedIcon from "@mui/icons-material/OpenWithRounded";
import { useEditorContext } from "../editorContext";

export type MoveToolConfiguration = ToolConfiguration;

export const MoveToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<MoveToolConfiguration>) => {
  // TODO : to remove, just for eslink check
  console.log(configuration);
  console.log(setConfiguration);

  return (
    <div>
      <p className="text-violet-50">
        {" "}
        No configuration available for this tool!
      </p>
    </div>
  );
};

const { editSelectedLayers } = useEditorContext();

const handleMouseDown = (e: KonvaMouseEvent) => {
  e.evt.preventDefault();
  if (e.evt.button == PRIMARY_MOUSE_BUTTON) {
    setLayerDragStartPosition(getCanvasPointerPosition());
    isHoldingPrimary.current = true;

    editSelectedLayers(layer => {
      if (!layer.isSelected) {
        return layer;
      }
      return {
        ...layer,
        positionBeforeDrag: {
          x: layer.position.x,
          y: layer.position.y,
        },
      };
    }, true)
  }
};


export const MOVE_TOOL: Tool<MoveToolConfiguration> = {
  name: "Move",
  icon: <OpenWithRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: {},
  configurationComponent: MoveToolConfigurationComponent,
};
