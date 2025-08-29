import api from "@/lib/api";
import React, { Dispatch, Fragment, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";

export const ConfirmDeletePopUp = ({
  setConfirmDeleteDisplay,
  projectId,
  deleteProject,
}: {
  setConfirmDeleteDisplay: Dispatch<SetStateAction<boolean>>;
  projectId: number;
  deleteProject: (id: number) => void;
}) => {
  const [hasError, setHasError] = useState<boolean>(false);

  const callDeleteProject = async (projectId: number) => {
    try {
      await api.delete(`/api/projects/${projectId}`);
      deleteProject(projectId);
      setConfirmDeleteDisplay(false);
    } catch {
      setHasError(true);
    }
  };

  return createPortal(
    <Fragment>
      <div className="fixed inset-0 bg-black opacity-80 z-50" />
      <div className="fixed inset-0 flex justify-center items-center z-100">
        <div className="relative bg-gray-600 rounded-2xl border border-violet-300 p-4">
          <p className="text-violet-50 font-bold mb-4">
            {hasError
              ? "Error while deleting project, try later..."
              : "Are you sure you want to delete this project? This action cannot be undone."}
          </p>
          <div className="flex flex-row gap-4 justify-end">
            <button
              className="bg-violet-50 border-2 border-violet-500 rounded-2xl p-2 w-auto cursor-pointer"
              onClick={() => setConfirmDeleteDisplay(false)}
            >
              Cancel
            </button>
            <button
              className="bg-violet-50 border-2 border-violet-500 rounded-2xl p-2 w-auto cursor-pointer"
              onClick={() => callDeleteProject(projectId)}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </Fragment>,
    document.body,
  );
};
