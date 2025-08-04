import Image from "next/image";

type DevDescriptionProps = {
  name: string;
  imagePath: string;
  quote: string;
  role: string;
};

export const DevDescription = ({
  name,
  imagePath,
  quote,
  role,
}: DevDescriptionProps) => {
  return (
    <div>
      <div className="p-6">
        <Image
          src={imagePath}
          alt={name}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto"
        />
      </div>
      <p className="italic font-light text-violet-50 text-center">{quote}</p>
      <p className="font-medium text-violet-50 text-center">~</p>
      <p className="font-light text-violet-50 text-center">
        {name} ({role})
      </p>
    </div>
  );
};
