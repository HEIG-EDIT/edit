import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";

export const selectCursorType = ["Rectangle", "Circle", "Lasso"];

export interface SelectCursorToolConfiguration extends ToolConfiguration {
  type: string;
}

export const SelectCursorToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<SelectCursorToolConfiguration>) => {
  return (
    <div className="flex flex-row flex-wrap gap-4">
      {selectCursorType.map((type) => {
        const isSelected = type === configuration.type;
        const style = isSelected
          ? "bg-gray-900 border-violet-500"
          : "bg-violet-500 border-violet-50";

        return (
          <button
            className={`rounded-2xl border-2 p-2 ${style} text-violet-50 text-lg`}
            key={type}
            value={type}
            onClick={(e) => {
              setConfiguration({
                ...configuration,
                type: e.currentTarget.value,
              });
            }}
          >
            {type}
          </button>
        );
      })}
    </div>
  );
};

export const SELECT_CURSOR_TOOL: Tool<SelectCursorToolConfiguration> = {
  name: "Select-cursor",
  iconPath: "/editor/toolbar/select-cursor.svg",
  initialConfiguration: { type: selectCursorType[0] },
  configurationComponent: SelectCursorToolConfigurationComponent,
};
