import { ActionButton } from "./actionButton";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import RedoRoundedIcon from "@mui/icons-material/RedoRounded";

export const UndoRedoSelector = () => {
  return (
    <div className="flex gap-4">
      <ActionButton
        icon={<UndoRoundedIcon style={{ color: "black" }} />}
        onClick={() => {}} // TODO : remplacer fonction pour gerer logique undo
        style="bg-violet-300 border-gray-800"
      />
      <ActionButton
        icon={<RedoRoundedIcon style={{ color: "black" }} />}
        onClick={() => {}} // TODO : remplacer fonction pour gerer logique redo
        style="bg-violet-300 border-gray-800"
      />
    </div>
  );
};
