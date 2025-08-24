// use https://konvajs.org/docs/react/Canvas_Export.html#how-to-save-a-drawing-from-react-konva

import { Stage } from "konva/lib/Stage";

export function downloadURI(uri: string, name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const handleExport = ({
  stageRef,
}: {
  stageRef: React.RefObject<Stage | null>;
}) => {
  if (stageRef && stageRef.current) {
    const uri = stageRef.current.toDataURL();
    downloadURI(uri, "project.png");
  }
};
