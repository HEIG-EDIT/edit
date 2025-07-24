import Image from "next/image";
import { OutsideCard } from "../outsideCard";

export const ProjectSelection = () => {
  return (
    <OutsideCard>
      <p className="text-violet-50 font-bold text-2xl flex justify-center mb-4">
        Store your projects securely and work from anywhere
      </p>
      <div className="overflow-hidden mb-4">
        <Image
          src="/landing_page/project_selection.jpg"
          alt="Project selection overview"
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto rounded-lg border-4 border-violet-300"
        />
      </div>
      <div className="bg-gray-600 rounded-lg mx-6 p-4">
        <div className="flex flex-col lg:flex-row lg:divide-x lg:divide-violet-50 divide-y lg:divide-y-0 divide-violet-50">
          <p className="text-violet-50 text-sm text-center lg:pr-6 pb-4 lg:pb-0 lg:flex-1">
            Create new projects anytime. Change the sorting behavior to easily
            find your work.
          </p>
          <p className="text-violet-50 text-sm text-center lg:pl-6 pt-4 lg:pt-0 lg:flex-1">
            Save your work and continue later. Connect to your account to access
            your projects on any computer.
          </p>
        </div>
      </div>
    </OutsideCard>
  );
};
