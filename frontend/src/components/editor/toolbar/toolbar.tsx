import { ToolSelector } from "@/components/editor/toolbar/toolSelector";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
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
    <div className="bg-gray-800 rounded-2xl p-2 flex flex-row items-center gap-4">
      <ToolSelector
        nameSelectedTool={nameSelectedTool}
        setNameSelectedTool={setNameSelectedTool}
      />
      <div className="border-l border-violet-50 h-6 mx-2 rounded" />
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
      <ActionButton
        icon={<FileDownloadRoundedIcon style={{ color: "white" }} />}
        onClick={() => {}} // TODO : appeler fonction
        style="bg-violet-500 border-gray-800 border-violet-50"
      />
      <div className="border-l border-violet-50 h-6 mx-2 rounded" />
      <ActionButton
        icon={<MenuRoundedIcon style={{ color: "white" }} />}
        onClick={() => setMenuDisplay(true)}
        style="bg-violet-500 border-gray-800 border-violet-50"
      />
    </div>
  );
};
