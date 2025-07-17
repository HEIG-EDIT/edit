import Image from "next/image";

export const UiPreview = () => {
  return (
    <div className=" bg-gray-800 rounded-lg w-[1000px] overflow-hidden">
      <div className="m-6">
        <Image
          src="/landing_page/full_ui.jpg"
          alt="Full UI overview"
          width={1000}
          height={1000}
          className="rounded-lg border-3 border-violet-300"
        />
      </div>
      <div>
        <p className="text-violet-50 font-bold text-2xl flex justify-center pb-6">
          Feature rich software with a pleasant interface
        </p>
      </div>
      <div className="flex gap-4">
        <div className="bg-gray-600 rounded-lg w-3/5 flex flex-row items-center justify-between mb-7 ml-12">
          <div className=" bg-gray-800 rounded-lg basis-1/2 m-2">
            <Image
              src="/landing_page/layers_panel.jpg"
              alt="Layers panel overview"
              width={1000}
              height={1000}
              className="rounded-lg"
            />
          </div>
          <p className="text-violet-50 text-xs basis-1/2 m-3">
            Compose images to make complex scenes with layers.
            <br />
            <br />
            Easily stack images and adjust opacity or fully hide layers.
          </p>
        </div>
        <div className="bg-gray-600 rounded-lg w-2/5 flex flex-col justify-between mb-7 mr-12">
          <div className=" basis-1/2 m-2">
            <div className=" bg-gray-800 rounded-lg p-1 mt-2">
              <Image
                src="/landing_page/toolbar.jpg"
                alt="Toolbar overview"
                width={1000}
                height={1000}
                className="rounded-lg"
              />
            </div>
          </div>
          <p className="text-violet-50 text-xs basis-1/2 m-5">
            Comprehensive set of tools for easy manipulation and editing of
            images.
            <br />
            <br />
            Move, crop, resize, draw and add filters to make the visuals of your
            dreams.
          </p>
        </div>
      </div>
    </div>
  );
};
