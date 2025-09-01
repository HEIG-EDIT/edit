"use client";

import api from "@/lib/api";

import Konva from "konva";
import dynamic from "next/dynamic";
import React, { useState, useEffect, useRef, useMemo } from "react";

import { MOVE_TOOL } from "@/components/editor/tools/move";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";

import { ToolsManagement } from "@/components/editor/tools/toolsManagement";
import { LayersManagement } from "@/components/editor/layers/layersManagement";

import { Menu } from "@/components/menu/menu";
import { Toolbar } from "@/components/editor/toolbar/toolbar";

import { TOOLS, TOOLS_INITIAL_STATE } from "@/models/editor/utils/tools";

import {
  EditorContext,
  CanvasState,
  EventHandlers,
} from "@/components/editor/editorContext";
import type { Vector2d } from "konva/lib/types";

import { useParams, useRouter } from "next/navigation";
import { Project } from "@/models/editor/project";
import { LoadingComponent } from "@/components/api/loadingComponent";
import { ErrorComponent } from "@/components/api/errorComponent";
import { isAxiosError, statusMessage } from "@/lib/auth.tools";
import { useRequireAuthState } from "@/hooks/auth";
import useLayersState from "@/hooks/useLayersState";

const Canvas = dynamic(() => import("@/components/editor/canvas"), {
  ssr: false,
});

export interface LoadedImage {
  id: string;
  image: HTMLImageElement;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

for (const tool of Object.values(TOOLS)) {
  TOOLS_INITIAL_STATE[tool.name] = tool.initialConfiguration;
}

export default function EditorPage() {
  const router = useRouter();
  const authReady = useRequireAuthState(); // prevents flash while auth is being checked

  const params = useParams();
  const projectId = useMemo(() => String(params.projectId), [params.projectId]);

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);

  const {
    layers,
    commitVirtualLayers,
    undo,
    redo,
    canUndo,
    canRedo,

    setLayers,
    updateLayer,
    addLayer,

    editSelectedLayers,
    deleteSelectedLayers,
    duplicateSelectedLayers,

    layersReorderingLogic,
  } = useLayersState();

  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      setIsLoading(true);
      setHasError(false);
      setStatusNote(null);
      try {
        const res = await api.get<{ JSONProject: string | null }>(
          `/projects/${projectId}/json`,
          { headers: { "Cache-Control": "no-store" } },
        );
        if (res.status === 200) {
          if (res.data.JSONProject) {
            const project = await Project.fromJSON(res.data.JSONProject);
            setLayers(project.layers);
          } else {
            // Empty project is valid; just leave layers empty.
          }
        } else {
          setHasError(true);
          setStatusNote(statusMessage(res.status));
        }
      } catch (e) {
        setHasError(true);
        if (isAxiosError(e)) {
          const st = e.response?.status;
          setStatusNote(statusMessage(st));
          if (st === 403 || st === 404) {
            // No access / not found → go back to projects after a short delay
            setTimeout(() => router.replace("/projects"), 400);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadProject();
  }, [projectId, setLayers]);

  const [nameSelectedTool, setNameSelectedTool] = useState<string>(
    MOVE_TOOL.name,
  );
  const [toolsConfiguration, setToolsConfiguration] =
    useState<Record<string, ToolConfiguration>>(TOOLS_INITIAL_STATE);
  const [menuDisplay, setMenuDisplay] = useState<boolean>(false);

  const isHoldingPrimary = useRef(false);
  const isTransforming = useRef(false);

  const toolEventHandlers = useRef<EventHandlers>({});

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState<Vector2d>({ x: 0, y: 0 });

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ x: width, y: height });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // TODO : a supprimer des que gestion du state global ok
  useEffect(() => console.log(toolsConfiguration), [toolsConfiguration]);

  const layerRef = useRef<Konva.Layer>(null);

  const stageRef = useRef<Konva.Stage>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    position: { x: 0, y: 0 },
    scale: 1,
  });

  const setToolEventHandlers = (eventHandlers: EventHandlers) => {
    toolEventHandlers.current = eventHandlers;
  };

  const getCanvasPointerPosition = () => {
    const stagePosition = stageRef?.current?.getPointerPosition();
    if (!stagePosition)
      throw new Error("Could not get the stage pointer position");

    const canvas = canvasState;
    return {
      x: (stagePosition.x - canvas.position.x) / canvas.scale,
      y: (stagePosition.y - canvas.position.y) / canvas.scale,
    };
  };

  // ELBU UPDATED : Gated render: show loader / error until project is fetched
  if (isLoading || !authReady) {
    return (
      <main className="bg-gray-900 min-h-screen flex items-center justify-center">
        <LoadingComponent />
      </main>
    );
  }
  if (hasError) {
    return (
      <main className="bg-gray-900 min-h-screen flex items-center justify-center p-6">
        <div className="bg-gray-700 rounded-xl p-4 w-full max-w-xl">
          <ErrorComponent subject="project" />
          {statusNote && (
            <p className="mt-3 text-sm text-yellow-300">{statusNote}</p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-900 min-h-screen">
      <EditorContext
        value={{
          isHoldingPrimary,
          isTransforming,
          layers,
          updateLayer,
          addLayer,

          editSelectedLayers,
          deleteSelectedLayers,
          duplicateSelectedLayers,

          commitVirtualLayers,
          getCanvasPointerPosition,
          canvasState,
          setCanvasState,
          stageRef,
          layerRef,
          toolEventHandlers,
          setToolEventHandlers,

          layersReorderingLogic,
        }}
      >
        <div className="flex flex-row gap-4 px-4">
          <div className="w-1/3">
            <div className="flex flex-col gap-6">
              <ToolsManagement
                nameSelectedTool={nameSelectedTool}
                toolsConfiguration={toolsConfiguration}
                setToolsConfiguration={setToolsConfiguration}
              />
              <LayersManagement
                layers={layers}
                updateLayer={updateLayer}
                canvasSize={canvasSize}
              />
            </div>
          </div>
          <div className="w-2/3">
            <div className="flex flex-col gap-4 h-screen">
              <div className="h-5/6" ref={canvasContainerRef}>
                <Canvas
                  layers={layers}
                  commitVirtualLayers={commitVirtualLayers}
                  updateLayer={updateLayer}
                  nameSelectedTool={nameSelectedTool}
                  width={canvasSize.x}
                  height={canvasSize.y}
                />
              </div>
              <div className="flex justify-center">
                <Toolbar
                  undo={undo}
                  canUndo={canUndo}
                  redo={redo}
                  canRedo={canRedo}
                  nameSelectedTool={nameSelectedTool}
                  setNameSelectedTool={setNameSelectedTool}
                  setMenuDisplay={setMenuDisplay}
                  canvasSize={canvasSize}
                />
              </div>
            </div>
          </div>
        </div>
        {menuDisplay && <Menu setMenuDisplay={setMenuDisplay} />}
      </EditorContext>
    </main>
  );
}
