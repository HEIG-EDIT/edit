import { StartButton } from "@/components/landing_page/startButton";
import { OutsideCard } from "@/components/outsideCard";
import { TextCard } from "./textCard";

export const QuickSummary = () => {
  return (
    <OutsideCard>
      <p className="text-violet-50 font-bold text-4xl mb-8">
        Easy Digital Image Toolkit
      </p>
      <div className="bg-gray-600 rounded-2xl mb-4">
        <div className="bg-violet-300 rounded-2xl p-4">
          <p className="text-gray-800 font-bold text-xl">
            Design, modify, combine and improve images right in your browser
          </p>
        </div>
        <TextCard>
          Let your imagination loose and easily create professional grade (or
          not) illustrations in minutes. Store projects on the cloud and work
          from anywhere.
        </TextCard>
        <TextCard>
          Easily import images in various formats into multiple layers and
          export compositions with a configurable size.
        </TextCard>
      </div>
      <div className="flex justify-center pt-4">
        <StartButton />
      </div>
    </OutsideCard>
  );
};
