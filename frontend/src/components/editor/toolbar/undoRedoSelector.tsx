import { ActionButton } from "./actionButton";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";

interface UndoRedoSelectorProps {
  undo: () => void;
  canUndo: boolean;
  redo: () => void;
  canRedo: boolean;
}

export const UndoRedoSelector = ({ undo, redo }: UndoRedoSelectorProps) => {
  return (
    <div className="flex gap-4">
      {/* TODO: Disable buttons when cannot undo or redo */}
      <ActionButton
        icon={<UndoRoundedIcon style={{ color: "white" }} />}
        onClick={undo}
        style="bg-gray-900 border-violet-500"
      />
      <ActionButton
        icon={<RedoRoundedIcon style={{ color: "white" }} />}
        onClick={redo}
        style="bg-gray-900 border-violet-500"
      />
    </div>
  );
};
