import { ToolSelector } from "@/components/editor/toolbar/toolSelector";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import {
  Dispatch,
  Fragment,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { ActionButton } from "@/components/actionButton";
import { UndoRedoSelector } from "./undoRedoSelector";
import { useEditorContext } from "../editorContext";
import { handleExport, handleThumbnail } from "../saveProject";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import useOnClickOutside from "@/hooks/useOnClickOutside";

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
  const { layerRef } = useEditorContext();

  const params = useParams();

  const [hasError, setHasError] = useState<boolean>(false);
  const [savePopUpDisplay, setSavePopUpDisplay] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const saveProject = async () => {
    try {
      await api.patch("/api/projects/save", {
        projectId: Number(params.projectId),
        jsonProject: "TODO",
        thumbnailBase64: handleThumbnail(layerRef),
      });
      setHasError(false);
    } catch {
      setHasError(true);
    } finally {
      setSavePopUpDisplay(true);
    }
  };

  const handleClickOutside = useCallback(() => {
    setSavePopUpDisplay(false);
  }, [setSavePopUpDisplay]);

  useOnClickOutside(containerRef, handleClickOutside);

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
        onClick={() => {
          saveProject();
        }}
        style="bg-violet-500 border-gray-800 border-violet-50"
      />
      <ActionButton
        icon={<FileDownloadRoundedIcon style={{ color: "white" }} />}
        onClick={() => handleExport(layerRef)}
        style="bg-violet-500 border-gray-800 border-violet-50"
      />
      <div className="border-l border-violet-50 h-6 mx-2 rounded" />
      <ActionButton
        icon={<MenuRoundedIcon style={{ color: "white" }} />}
        onClick={() => setMenuDisplay(true)}
        style="bg-violet-500 border-gray-800 border-violet-50"
      />
      {/* TODO : gerer le cas ou le user quitte cette page avant la save pop up */}
      {savePopUpDisplay && (
        <Fragment>
          <div className="fixed inset-0 bg-black opacity-80 z-50" />
          <div className="fixed inset-0 flex justify-center items-center z-100">
            <div
              className="relative bg-gray-600 rounded-2xl border border-violet-300 p-4"
              ref={containerRef}
            >
              <p className="text-violet-50 font-bold">
                {hasError
                  ? "The project could not be saved, try later..."
                  : "Project successfully saved!"}
              </p>
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
};
