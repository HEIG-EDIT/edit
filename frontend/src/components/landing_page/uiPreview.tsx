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

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="bg-gray-600 rounded-2xl flex flex-row w-full lg:w-1/2 items-center p-4">
          <div className="w-1/2 bg-gray-800 rounded-2xl">
            <Image
              src="/landing_page/layers_panel.png"
              alt="Layers panel overview"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-2xl border-4 border-violet-300"
            />
          </div>
          <div className="w-1/2">
            <TextCard>
              Compose images to make complex scenes with layers.
            </TextCard>
            <TextCard>
              Easily stack images and adjust opacity or fully hide layers.
            </TextCard>
          </div>
        </div>
        <div className="bg-gray-600 rounded-2xl flex flex-col w-full lg:w-1/2 items-center p-4">
          <div className="bg-gray-800 rounded-2xl flex flex-col">
            <Image
              src="/landing_page/toolbar.png"
              alt="Toolbar overview"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-2xl border-4 border-violet-300"
            />
          </div>
          <div className="flex flex-col">
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

      <div className="bg-gray-600 rounded-2xl flex flex-row w-full items-center">
        <div className="w-4/5">
          <TextCard>
            Easily fix mistakes or undo bad ideas. Securely save projects with
            the click of a button.
          </TextCard>
        </div>
        <div className="w-1/5">
          <div className="p-6">
            <Image
              src="/landing_page/undo_redo.png"
              alt="Undo / Redo overview"
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto rounded-2xl border-4 border-violet-300"
            />
          </div>
        </div>
      </div>
    </OutsideCard>
  );
};
