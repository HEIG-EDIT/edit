import { CustomButton } from "../customButton";

export const NavBar = () => {
  return (
    <div className="bg-gray-800 rounded-xl border-2 border-violet-300 min-h-16 px-4 flex items-center justify-between">
      <p className="text-violet-50 text-2xl">EDIT</p>
      <CustomButton link="/" text="Start EDITing" />
    </div>
  );
};
