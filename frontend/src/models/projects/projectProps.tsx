import { Project } from "../api/project/project";

export interface ProjectProps {
  project: Project;
  updateProjectName: (id: number, newProjectName: string) => void;
  deleteProject: (id: number) => void;
}
