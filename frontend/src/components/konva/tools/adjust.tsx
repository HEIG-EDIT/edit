import { Tool, ToolConfiguration } from "../../../app/konva/page";

const filtersName = ["test", "Mono", "Sepia", "wip", "..."];
export interface AdjustToolConfiguration {
  filter: string;
}

interface AdjustToolConfigurationProps {
  configuration: AdjustToolConfiguration;
  setConfiguration: (config: AdjustToolConfiguration) => void;
}

const AdjustToolConfiguration: React.FC<AdjustToolConfigurationProps> = ({
  configuration,
  setConfiguration,
}) => {
  return (
    <div>
      <span className="text-violet-50 text-lg">
        Filters : <br />
      </span>
      <select
        className="bg-violet-500 text-violet-50 text-lg rounded p-2"
        value={configuration.filter}
        onChange={(e) => {
          setConfiguration({
            ...configuration,
            filter: e.target.value,
          });
        }}
      >
        {filtersName.map((filterName) => (
          <option key={filterName}>{filterName}</option>
        ))}
      </select>
    </div>
  );
};

export const AdjustTool: Tool = {
  name: "adjust",
  iconPath: "/editor/toolbar/adjust.svg",
  initialConfiguration: { filter: filtersName[0] },
  configurationComponent: AdjustToolConfiguration as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
