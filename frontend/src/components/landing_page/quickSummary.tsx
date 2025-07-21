import { StartButton } from "./startButton";
import { OutsideCard } from "../outsideCard";

export const QuickSummary = () => {
  return (
    <OutsideCard>
      <p className="text-violet-50 font-bold text-xl mb-4">
        Easy Digital Image Toolkit
      </p>
      <div className="bg-gray-600 rounded-lg mb-4">
        <div className="bg-violet-300 rounded-lg p-4">
          <p className="text-grey-800 font-semibold">
            Design, modify, combine and improve images right in your browser
          </p>
        </div>
        <p className="text-violet-50 p-4 font-thin">
          Let your imagination loose and easily create professional grade (or
          not) illustrations in minutes. Store projects on the cloud and work
          from anywhere.
          <br />
          <br />
          Easily import images in various formats into multiple layers and
          export compositions with a configurable size.
        </p>
      </div>
      <div className="flex justify-center">
        <StartButton />
      </div>
    </OutsideCard>
  );
};
