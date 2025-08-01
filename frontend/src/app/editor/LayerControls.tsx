interface LayerControlsProps {
  name: string;
  isVisible: boolean;
  toggleVisible: (event: any) => null;
}

export const LayerControlsComponent = ({
  name,
  isVisible,
  toggleVisible,
}: LayerControlsProps) => {
  console.log("Creating layer controls component");
  return (
    <div className={isVisible ? "bg-grey-200" : "bg-grey-50"}>
      {name}
      <button onClick={toggleVisible}>toggleVisible</button>
    </div>
  );
};
