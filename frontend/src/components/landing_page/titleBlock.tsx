import { CustomButton } from "./customButton";

export const TitleBlock = () => {
  return (
    <div className="relative container mx-auto bg-gray-800 rounded-xl border-2 border-violet-300 min-h-16 mt-4">
      <p className="text-violet-50 text-2xl absolute top-1/2 -translate-y-1/2 ml-5">
        EDIT
      </p>
      <div className="absolute top-1/2 right-0 -translate-y-1/2 mr-5">
        <CustomButton />
      </div>
    </div>
  );
};
