import { Project } from "@/models/api/project/project";
import { ProjectComponent } from "./projectComponent";

export const ListProjects = ({ projects }: { projects: Project[] }) => {
  const newProject = {
    projectId: 0,
    projectName: "New project",
    createdAt: new Date(),
    lastSavedAt: null,
    // TODO : gerer peut-etre autrement image pour new project...
    thumbnail:
      "iVBORw0KGgoAAAANSUhEUgAAAKAAAABaCAMAAAAIGK1gAAAAIGNIUk0AAHomAACAhAAA+gAAAIDoAAB1MAAA6mAAADqYAAAXcJy6UTwAAAELUExURfXz//Ty//b0//b2//b1//Pw/9/R/9C5/9bD/+zm//X0//Lu/8ap/5hh/41Q/5FW/7CG/+jf/9nH/5Ze/4xO/41P/8Ch//Tx/8it/45S/45R/4xP/7CI//Hu/8aq//j4/8er/7GJ//f2//Xy//Lv/+PW/9nG/9jF/7eR/6d4/9bC/9jG/93O/+/q/8Gg/5pj/49T/5Na/62C/+TY/8ux/5BV/7OL//Dr/7aQ/6Bu/+ng/8Sn/6yA/+7o/66E/59s/9nI/+zl/8Wo/8ar/62B/6Bv/8Sm/8Wp/+PX//f3/8eq/7GI//Ht/9O+/5JY/7mW/+3n/7ON/49U/6Jw/+DS/821/7qX/8Ol/////7suF2kAAAABYktHRFjttcSOAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAB3RJTUUH6QgaEBsocu7cwAAAAVlJREFUaN7t2FlPg0AUhuEBwdqxjlpBZah7677butR9r1q17v//nzi01wcTm/Fg8r0h3DAXT84kEEYIhBBCCKG/yhFuj2fuWc0Rfm+uLy+zK+wvDKjBoWFuBplbHAmUCkfHuCFU3niktI5LE9wQEjipDTAEEEAAAQSQGwIggNwQAAHkhgAIIDck00BHuB7V1HQCjGf8WXKJmLPuK1fmF4iKi+0JLi2vUCtW89I2cW19YzOi0klKk8+jre0dyxOU1Vqo9K9T8e6eZeF+3IXP7P9BXdqd4KFWKXXGlFJwdGx3gLJ+UvtpG9Menp7Z9ZnOcxcFosurRKeub6gFt9WGsHwAa94RrqS6u2+/Bx/Kko71gDgTXxIAAQQQQAABBBBAAAEEEEBuyP8Fdn47S01uCAl8fAq1Cp59bghZ6+U1Dt/euRlkjmh9fH417B5fdSmU5uJWIIQQQghlqW8hPV+/ROIrXwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNS0wOC0yNlQxNjoyNzo0MCswMDowMMoJ530AAAAldEVYdGRhdGU6bW9kaWZ5ADIwMjUtMDgtMjZUMTY6Mjc6NDArMDA6MDC7VF/BAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI1LTA4LTI2VDE2OjI3OjQwKzAwOjAw7EF+HgAAAABJRU5ErkJggg==",
    roles: [],
  };

  return (
    <div className="flex flex-wrap gap-4">
      <ProjectComponent project={newProject} />
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
