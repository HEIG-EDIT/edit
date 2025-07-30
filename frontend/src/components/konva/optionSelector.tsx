import { Options, Option } from "../../app/konva/page";
import { Dispatch, SetStateAction } from "react";
import Image from "next/image";

type OptionSelectorProps = {
  option: Option;
  setOption: Dispatch<SetStateAction<Option>>;
};

export const OptionSelector = ({ option, setOption }: OptionSelectorProps) => {
  return (
    <div className="flex gap-2">
      {Object.keys(Options).map((key) => {
        const isSelected = Options[key] === option;
        const style = isSelected
          ? "bg-violet-500 border-violet-50"
          : "bg-gray-900 border-violet-500";

        return (
          <button
            className={`rounded-xl border-2 p-2 ${style}`}
            key={key}
            onClick={() => setOption(Options[key])}
          >
            <Image
              src={Options[key].iconPath}
              alt={`Icon of tool ${Options[key].name}`}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto"
            />
          </button>
        );
      })}
    </div>
  );
};
