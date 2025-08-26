import { ActionButton } from "@/components/actionButton";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";
import colors from "tailwindcss/colors";

interface UndoRedoSelectorProps {
  undo: () => void;
  canUndo: boolean;
  redo: () => void;
  canRedo: boolean;
}

export const UndoRedoSelector = ({
  undo,
  canUndo,
  redo,
  canRedo,
}: UndoRedoSelectorProps) => {
  const getStyle = (canUse: boolean) =>
    `${
      canUse ? "bg-gray-900 border-violet-500" : "bg-gray-500 border-gray-900"
    }`;

  const getIconColor = (canUse: boolean) =>
    canUse ? colors.white : colors.gray[400];

  return (
    <div className="flex gap-4">
      <ActionButton
        icon={<UndoRoundedIcon style={{ color: getIconColor(canUndo) }} />}
        onClick={undo}
        style={getStyle(canUndo)}
        disabled={!canUndo}
      />
      <ActionButton
        icon={<RedoRoundedIcon style={{ color: getIconColor(canRedo) }} />}
        onClick={redo}
        style={getStyle(canRedo)}
        disabled={!canRedo}
      />
    </div>
  );
};
