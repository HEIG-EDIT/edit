import { Tool, ToolConfiguration } from "../../../app/konva/page";

export interface SelectCursorToolConfiguration {}

interface SelectCursorToolConfigurationProps {
  configuration: SelectCursorToolConfiguration;
  setConfiguration: (config: SelectCursorToolConfiguration) => void;
}

const SelectCursorToolConfiguration: React.FC<
  SelectCursorToolConfigurationProps
> = ({ configuration, setConfiguration }) => {
  return (
    <div>
      <p className="text-violet-50 text-lg">
        {" "}
        No configuration available for this tool!
      </p>
    </div>
  );
};

export const SelectCursorTool: Tool = {
  name: "select-cursor",
  iconPath: "/editor/toolbar/select-cursor.svg",
  initialConfiguration: {},
  configurationComponent: SelectCursorToolConfiguration as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
