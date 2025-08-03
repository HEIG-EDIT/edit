import Image from "next/image";
import { OutsideCard } from "../outsideCard";
import { TextCard } from "./textCard";

export const ProjectSelection = () => {
  return (
    <OutsideCard>
      <p className="text-violet-50 font-bold text-2xl flex justify-center mb-8">
        Store your projects securely and work from anywhere
      </p>
      <div className="bg-gray-600 rounded-2xl mx-6 p-4">
        <div className="overflow-hidden mb-8">
          <Image
            src="/landing_page/project_selection.jpg"
            alt="Project selection overview"
            width={0}
            height={0}
            sizes="100vw"
            className="w-full h-auto rounded-2xl border-4 border-violet-300"
          />
        </div>
        <div className="content-around flex flex-col lg:flex-row lg:divide-x lg:divide-violet-50 divide-y lg:divide-y-0 divide-violet-50">
          <TextCard>
            Create new projects anytime. Change the sorting behavior to easily
            find your work.
          </TextCard>
          <TextCard>
            Save your work and continue later. Connect to your account to access
            your projects on any computer.
          </TextCard>
        </div>
      </div>
    </OutsideCard>
  );
};
