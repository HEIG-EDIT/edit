interface ConfigurationButtonProps {
  icon: React.ElementType;
  onClick: () => void;
  text?: string;
}

export const ConfigurationButton = ({
  icon: Icon,
  onClick,
  text,
}: ConfigurationButtonProps) => {
  return (
    <button
      className="bg-violet-500 rounded-full p-2 border-2 border-violet-50 cursor-pointer"
      onClick={onClick}
    >
      <Icon style={{ color: "white" }} />
      {text && (
        <div>
          <p className="text-violet-50">{text}</p>
        </div>
      )}
    </button>
  );
};
