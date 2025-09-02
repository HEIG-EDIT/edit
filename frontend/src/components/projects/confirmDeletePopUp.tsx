import api from "@/lib/api";
import React, { Dispatch, Fragment, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";
import { isAxiosError, statusMessage } from "@/lib/auth.tools";

export const ConfirmDeletePopUp = ({
  setConfirmDeleteDisplay,
  projectId,
  deleteProject,
}: {
  setConfirmDeleteDisplay: Dispatch<SetStateAction<boolean>>;
  projectId: number;
  deleteProject: (id: number) => void;
}) => {
  const [errorText, setErrorText] = useState<string | null>(null);

  const callDeleteProject = async (pid: number) => {
    try {
      setErrorText(null);
      const res = await api.delete<void>(`/projects/${pid}`, {
        headers: { "Cache-Control": "no-store" },
      });
      if (res.status === 204) {
        deleteProject(pid);
        setConfirmDeleteDisplay(false);
      } else {
        setErrorText("Unexpected response from server.");
      }
    } catch (e) {
      if (isAxiosError(e)) {
        setErrorText(statusMessage(e.response?.status));
      } else {
        setErrorText("An error occurred while deleting the project.");
      }
    }
  };

  return createPortal(
    <Fragment>
      <div className="fixed inset-0 bg-black opacity-80 z-50" />
      <div className="fixed inset-0 flex justify-center items-center z-100">
        <div className="relative bg-gray-600 rounded-2xl border border-violet-300 p-4">
          <p className="text-violet-50 font-bold mb-4">
            {errorText
              ? errorText
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
              onClick={() => void callDeleteProject(projectId)}
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
