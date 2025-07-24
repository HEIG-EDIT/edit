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

      <div className="grid h-xl grid-flow-row grid-rows-8 grid-cols-1 lg:grid-rows-2 lg:grid-cols-8 gap-4">
        <div className="bg-gray-600 rounded-2xl flex row-span-4 flex-col lg:flex-row lg:flex-1 lg:row-span-7 lg:col-span-5 p-4 items-center">
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
          <div className="text-xl content-center w-full px-4">
            <TextCard>
              Compose images to make complex scenes with layers.
            </TextCard>
            <TextCard>
              Easily stack images and adjust opacity or fully hide layers.
            </TextCard>
          </div>
        </div>

        <div className="bg-gray-600  rounded-2xl p-4 row-span-3 lg:row-span-7 lg:col-span-3">
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
          <div className="w-full max-w-lg row-span-1 p-4">
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

        <div className="bg-gray-600 rounded-2xl  p-4 lg:row-span-1 lg:col-span-8 ">
          <div className="md:row-start-2 bg-gray-600 flex md:flex-col lg:flex-row items-center">
            <div className="text-center overflow-hidden">
              <TextCard>
                Easily fix mistakes or undo bad ideas. Securely save projects with the click of a button.
              </TextCard>
            </div>
            <Image
              src="/landing_page/undo_redo.png"
              alt="Toolbar overview"
              width={418}
              height={144}
              className="h-full max-w-[200px] w-auto rounded-2xl p-2 "
            />
          </div>
        </div>
      </div>

    </OutsideCard>
  );
};
