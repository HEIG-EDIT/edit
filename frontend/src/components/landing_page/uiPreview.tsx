import Image from "next/image";
import { OutsideCard } from "../outsideCard";
import { TextCard } from "./textCard";

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
          className="w-full h-auto rounded-2xl border-4 border-violet-300"
        />
      </div>
      <p className="text-violet-50 font-bold text-2xl flex justify-center my-12">
        Feature rich software with a pleasant interface
      </p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="bg-gray-600 rounded-2xl p-4 flex flex-col lg:flex-row lg:flex-1 items-center">
          <div className=" bg-gray-800 rounded-2xl overflow-hidden w-full max-w-xs mx-auto lg:mx-0">
            <Image
              src="/landing_page/layers_panel.jpg"
              alt="Layers panel overview"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-2xl"
            />
          </div>
          <div className="text-xl content-center w-full px-4 ">
            <TextCard>
              Compose images to make complex scenes with layers.
            </TextCard>
            <TextCard>
              Easily stack images and adjust opacity or fully hide layers.
            </TextCard>
          </div>
        </div>
        <div className="bg-gray-600 rounded-2xl p-4 flex flex-col">
          <div className=" bg-gray-800 rounded-2xl mb-2 overflow-hidden">
            <Image
              src="/landing_page/toolbar.jpg"
              alt="Toolbar overview"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-2xl p-2"
            />
          </div>
          <div className="w-full max-w-lg p-4">
          <TextCard>
              Comprehensive set of tools for easy manipulation and editing of
              images.
          </TextCard>
          <TextCard>
              Move, crop, resize, draw and add filters to make the visuals of
              your dreams.
          </TextCard>
          </div>
        </div>
      </div>
    </OutsideCard>
  );
};
