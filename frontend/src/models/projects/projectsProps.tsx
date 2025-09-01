import { Project } from "../api/project/project";

/// Props for all of the projects in the project selection page
export interface ProjectsProps {
  projects: Project[];
  updateProjectName: (id: number, newProjectName: string) => void;
  deleteProject: (id: number) => void;
}
