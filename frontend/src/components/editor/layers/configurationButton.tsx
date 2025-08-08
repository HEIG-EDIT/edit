interface ConfigurationButtonProps {
  icon: React.ElementType;
}

export const ConfigurationButton = ({
  icon: Icon,
}: ConfigurationButtonProps) => {
  return (
    <button className="bg-violet-500 rounded-full p-2 border-2 border-violet-50">
      <Icon style={{ color: "white" }} />
    </button>
  );
};
