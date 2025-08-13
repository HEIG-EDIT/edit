import { ActionButton } from "./actionButton";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";

export const UndoRedoSelector = () => {
  return (
    <div className="flex gap-4">
      <ActionButton
        icon={<UndoRoundedIcon style={{ color: "white" }} />}
        onClick={() => {}} // TODO : remplacer fonction pour gerer logique undo
        style="bg-gray-900 border-violet-500"
      />
      <ActionButton
        icon={<RedoRoundedIcon style={{ color: "white" }} />}
        onClick={() => {}} // TODO : remplacer fonction pour gerer logique redo
        style="bg-gray-900 border-violet-500"
      />
    </div>
  );
};
