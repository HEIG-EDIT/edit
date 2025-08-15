import { ToolSelector } from "@/components/editor/toolbar/toolSelector";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import { Dispatch, SetStateAction } from "react";
import { ActionButton } from "@/components/actionButton";
import { UndoRedoSelector } from "./undoRedoSelector";

export interface ToolBarProps {
  nameSelectedTool: string;
  setNameSelectedTool: Dispatch<SetStateAction<string>>;
  setMenuDisplay: Dispatch<SetStateAction<boolean>>;
  undo: () => void;
  canUndo: boolean;
  redo: () => void;
  canRedo: boolean;
}

export const Toolbar = ({
  nameSelectedTool,
  setNameSelectedTool,
  setMenuDisplay,
  undo,
  canUndo,
  redo,
  canRedo,
}: ToolBarProps) => {
  return (
    <div className="bg-gray-800 rounded-2xl justify-center items-stretch inline-flex p-2 gap-4">
      <ToolSelector
        nameSelectedTool={nameSelectedTool}
        setNameSelectedTool={setNameSelectedTool}
      />
      <div className="border border-violet-50 w-full my-2 rounded"></div>
      <UndoRedoSelector
        undo={undo}
        canUndo={canUndo}
        redo={redo}
        canRedo={canRedo}
      />
      <ActionButton
        icon={<SaveRoundedIcon style={{ color: "white" }} />}
        onClick={() => {}} // TODO : remplacer fonction pour ouvrir une save pop up
        style="bg-violet-500 border-gray-800 border-violet-50"
      />
      <div className="border border-violet-50 w-full my-2 rounded"></div>
      <ActionButton
        icon={<MenuRoundedIcon style={{ color: "white" }} />}
        onClick={() => setMenuDisplay(true)}
        style="bg-violet-500 border-gray-800 border-violet-50"
      />
    </div>
  );
};
