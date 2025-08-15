interface ConfigurationButtonProps {
  icon: React.ElementType;
  onClick: () => void;
}

export const ConfigurationButton = ({
  icon: Icon,
  onClick,
}: ConfigurationButtonProps) => {
  return (
    <button
      className="bg-violet-500 rounded-full p-2 border-2 border-violet-50 cursor-pointer"
      onClick={onClick}
    >
      <Icon style={{ color: "white" }} />
    </button>
  );
};
