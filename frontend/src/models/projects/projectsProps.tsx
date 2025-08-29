import { Project } from "../api/project/project";

export interface ProjectsProps {
  projects: Project[];
  updateProjectName: (id: number, newProjectName: string) => void;
  deleteProject: (id: number) => void;
}
