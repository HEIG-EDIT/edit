import { Project } from "@/models/api/project/project";
import { ProjectComponent } from "./projectComponent";

export const ListProjects = ({ projects }: { projects: Project[] }) => {
  return (
    <div className="flex flex-wrap gap-4">
      {projects.map((p: Project) => {
        return (
          <div key={p.projectId}>
            <ProjectComponent project={p} />
          </div>
        );
      })}
    </div>
  );
};
