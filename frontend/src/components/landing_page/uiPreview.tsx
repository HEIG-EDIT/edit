import Image from "next/image";
import { OutsideCard } from "../outsideCard";

export const UiPreview = () => {
  return (
    <OutsideCard>
      <div className="mb-4 overflow-hidden">
        <Image
          src="/landing_page/full_ui.jpg"
          alt="Full UI overview"
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto rounded-lg border-4 border-violet-300"
        />
      </div>
      <p className="text-violet-50 font-bold text-2xl flex justify-center mb-4">
        Feature rich software with a pleasant interface
      </p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="bg-gray-600 rounded-lg p-4 flex flex-col lg:flex-row lg:flex-1 items-center">
          <div className=" bg-gray-800 rounded-lg overflow-hidden w-full lg:w-1/2 max-w-xs mx-auto lg:mx-0">
            <Image
              src="/landing_page/layers_panel.jpg"
              alt="Layers panel overview"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-lg"
            />
          </div>
          <div className="w-full lg:w-1/2 p-4">
            <p className="text-violet-50 text-xs text-center">
              Compose images to make complex scenes with layers.
              <br />
              <br />
              Easily stack images and adjust opacity or fully hide layers.
            </p>
          </div>
        </div>
        <div className="bg-gray-600 rounded-lg p-4 flex flex-col">
          <div className=" bg-gray-800 rounded-lg overflow-hidden">
            <Image
              src="/landing_page/toolbar.jpg"
              alt="Toolbar overview"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-lg p-2"
            />
          </div>
          <div className="w-full p-4">
            <p className="text-violet-50 text-xs text-center mt-12">
              Comprehensive set of tools for easy manipulation and editing of
              images.
              <br />
              <br />
              Move, crop, resize, draw and add filters to make the visuals of
              your dreams.
            </p>
          </div>
        </div>
      </div>
    </OutsideCard>
  );
};
