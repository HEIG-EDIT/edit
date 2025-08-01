interface LayerControlsProps {
  name: string;
  visible: boolean;
  toggleVisible: (event: any) => null;
}

export const LayerControlsComponent = ({
  name,
  visible,
  toggleVisible,
}: LayerControlsProps) => {
  console.log("Creating layer controls component");
  return (
    <div className={visible ? "bg-grey-200" : "bg-grey-50"}>
      {name + " "}
      <button onClick={toggleVisible}>toggleVisible</button>
    </div>
  );
};
