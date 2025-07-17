import { StartButton } from "./startButton";

export const QuickSummary = () => {
  return (
    <div className="bg-gray-800 rounded-lg w-[600px] overflow-hidden">
      <p className="text-violet-50 font-bold text-xl p-4">
        Easy Digital Image Toolkit
      </p>
      <div className="bg-gray-600 rounded-lg m-6">
        <div className="bg-violet-300 rounded-lg">
          <p className="text-grey-800 p-4 font-semibold">
            Design, modify, combine and improve images right in your browser
          </p>
        </div>
        <p className="text-violet-50 p-4 font-thin">
          Let your imagination loose and easily create professional grade (or
          not) illustrations in minutes. Store projects on the cloud and work
          from anywhere.
          <br />
          Easily import images in various formats into multiple layers and
          export compositions with a configurable size.
        </p>
      </div>
      <div className="pb-4 flex justify-center">
        <StartButton />
      </div>
    </div>
  );
};
