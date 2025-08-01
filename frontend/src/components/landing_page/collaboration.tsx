import Image from "next/image";
import { OutsideCard } from "../outsideCard";

export const Collaboration = () => {
  return (
    <OutsideCard>
      <p className="text-violet-50 font-bold text-2xl flex justify-center mb-4">
        Collaborate with your team by sharing projects
      </p>
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="bg-gray-600 rounded-lg p-4">
          <p className="text-violet-50 text-sm">
            Share projects with your team for easy collaboration. Manage roles
            of all authorized users to restrict edition access.
            <br />
            <br />
            Create teams of users to easily give access to a project for a group
            of people Share projects with your team for easy collaboration.
            Manage roles of all authorized users to restrict edition access.
          </p>
        </div>
        <div className="overflow-hidden">
          <Image
            src="/landing_page/project_settings.jpg"
            alt="Project settings overview"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto rounded-lg border-4 border-violet-300"
          />
        </div>
      </div>
    </OutsideCard>
  );
};
