import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";

export interface EraseToolConfiguration extends ToolConfiguration {
  radius: number;
}

export const EraseToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<EraseToolConfiguration>) => {
  return (
    <div>
      <p className="text-violet-50 text-lg">
        Radius :<br></br>
      </p>
      <input
        type="range"
        min="1"
        max="100"
        value={configuration.radius}
        onChange={(e) => {
          setConfiguration({
            ...configuration,
            radius: Number(e.target.value),
          });
        }}
      />
      <span className="text-violet-50 text-lg"> {configuration.radius}</span>
    </div>
  );
};

const ERASE_ICON = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.0443 3.12928C11.6657 2.05312 13.0417 1.6844 14.1179 2.30572L18.881 5.05572C19.9572 5.67705 20.3259 7.05312 19.7046 8.12928L14.8882 16.4715C14.6811 16.8303 14.2224 16.9532 13.8637 16.7461L13.647 16.621L12.5239 18.5662C12.3168 18.9249 11.8581 19.0478 11.4994 18.8407L5.87024 15.5907C5.51152 15.3836 5.38862 14.9249 5.59572 14.5662L6.7188 12.621L6.50245 12.4961C6.14373 12.289 6.02082 11.8303 6.22793 11.4715L11.0443 3.12928ZM12.348 15.871L8.01784 13.371L7.26976 14.6667L11.5999 17.1667L12.348 15.871ZM13.9641 15.072L13.7753 14.963C13.7663 14.9573 13.7571 14.9517 13.7478 14.9464L8.11866 11.6964C8.10934 11.691 8.09995 11.6858 8.0905 11.6809L7.90197 11.572L12.3434 3.87928C12.5505 3.52056 13.0092 3.39766 13.3679 3.60476L18.131 6.35476C18.4898 6.56187 18.6127 7.02056 18.4056 7.37928L13.9641 15.072Z"
      fill="#F5F3FF"
    />
    <path
      d="M5.25 20.5C4.83579 20.5 4.5 20.8358 4.5 21.25C4.5 21.6642 4.83579 22 5.25 22H18.75C19.1642 22 19.5 21.6642 19.5 21.25C19.5 20.8358 19.1642 20.5 18.75 20.5H5.25Z"
      fill="#F5F3FF"
    />
  </svg>
);

export const ERASE_TOOL: Tool<EraseToolConfiguration> = {
  name: "Erase",
  icon: ERASE_ICON,
  initialConfiguration: { radius: 10 },
  configurationComponent: EraseToolConfigurationComponent,
};
