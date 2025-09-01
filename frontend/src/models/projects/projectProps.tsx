import { Project } from "../api/project/project";

/// Props for a single project's card in the project selection page.
export interface ProjectProps {
  project: Project;
  updateProjectName: (id: number, newProjectName: string) => void;
  deleteProject: (id: number) => void;
}
