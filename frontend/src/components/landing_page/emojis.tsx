import Image from "next/image";

export const Emojis = () => {
  return (
    <Image
      src="/landing_page/emojis.png"
      alt="Emojis"
      width={0}
      height={0}
      sizes="100vw"
      className="w-full h-auto"
    />
  );
};
