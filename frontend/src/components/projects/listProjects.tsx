import { Project } from "@/models/api/project/project";
import { ProjectComponent } from "./projectComponent";
import { ProjectsProps } from "@/models/projects/projectsProps";

export const ListProjects = ({
  projects,
  updateProjectName,
  deleteProject,
}: ProjectsProps) => {
  return (
    <div className="flex flex-wrap gap-4">
      {projects.map((p: Project) => {
        return (
          <div key={p.projectId}>
            <ProjectComponent
              project={p}
              updateProjectName={updateProjectName}
              deleteProject={deleteProject}
            />
          </div>
        );
      })}
    </div>
  );
};
