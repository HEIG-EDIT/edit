import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";

// TODO : finaliser ui (si plusieurs type de select alors choisir icones, sinon mettre message "pas de config dispo")

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
            className={`rounded-2xl border-2 p-2 ${style} text-violet-50`}
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

const SELECT_CURSOR_ICON = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.30252 5.03998C4.90487 5.03998 4.58252 5.36233 4.58252 5.75998V7.31998C4.58252 7.71762 4.26016 8.03998 3.86252 8.03998C3.46487 8.03998 3.14252 7.71762 3.14252 7.31998V5.75998C3.14252 4.56704 4.10958 3.59998 5.30252 3.59998H6.86252C7.26016 3.59998 7.58252 3.92233 7.58252 4.31998C7.58252 4.71762 7.26016 5.03998 6.86252 5.03998H5.30252Z"
      fill="#F5F3FF"
    />
    <path
      d="M9.26251 4.31998C9.26251 3.92233 9.58486 3.59998 9.98247 3.59998H13.1025C13.5002 3.59998 13.8225 3.92233 13.8225 4.31998C13.8225 4.71762 13.5002 5.03998 13.1025 5.03998H9.98247C9.58486 5.03998 9.26251 4.71762 9.26251 4.31998Z"
      fill="#F5F3FF"
    />
    <path
      d="M15.5024 4.31998C15.5024 3.92233 15.8248 3.59998 16.2224 3.59998H17.7824C18.9754 3.59998 19.9424 4.56704 19.9424 5.75998V7.31998C19.9424 7.71762 19.6202 8.03998 19.2224 8.03998C18.8248 8.03998 18.5024 7.71762 18.5024 7.31998V5.75998C18.5024 5.36233 18.1802 5.03998 17.7824 5.03998H16.2224C15.8248 5.03998 15.5024 4.71762 15.5024 4.31998Z"
      fill="#F5F3FF"
    />
    <path
      d="M3.86252 9.71997C4.26016 9.71997 4.58252 10.0423 4.58252 10.44V13.56C4.58252 13.9576 4.26016 14.28 3.86252 14.28C3.46487 14.28 3.14252 13.9576 3.14252 13.56V10.44C3.14252 10.0423 3.46487 9.71997 3.86252 9.71997Z"
      fill="#F5F3FF"
    />
    <path
      d="M19.2224 9.71997C19.6202 9.71997 19.9424 10.0423 19.9424 10.44V13.56C19.9424 13.9494 19.6332 14.2667 19.2469 14.2796L18.5293 13.7553C18.5118 13.6932 18.5024 13.6277 18.5024 13.56V10.44C18.5024 10.0423 18.8248 9.71997 19.2224 9.71997Z"
      fill="#F5F3FF"
    />
    <path
      d="M11.6415 20.3047L11.4966 18.96H9.98247C9.58486 18.96 9.26251 19.2823 9.26251 19.68C9.26251 20.0776 9.58486 20.4 9.98247 20.4H11.6539C11.649 20.3684 11.6449 20.3366 11.6415 20.3047Z"
      fill="#F5F3FF"
    />
    <path
      d="M3.86252 15.96C4.26016 15.96 4.58252 16.2823 4.58252 16.68V18.24C4.58252 18.6376 4.90487 18.96 5.30252 18.96H6.86252C7.26016 18.96 7.58252 19.2823 7.58252 19.68C7.58252 20.0776 7.26016 20.4 6.86252 20.4H5.30252C4.10958 20.4 3.14252 19.4329 3.14252 18.24V16.68C3.14252 16.2823 3.46487 15.96 3.86252 15.96Z"
      fill="#F5F3FF"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.4903 11.7368C12.7372 11.5943 13.0449 11.6109 13.2751 11.779L19.5392 16.3551C19.7712 16.5246 19.8802 16.8159 19.8165 17.0962C19.7527 17.3764 19.5284 17.5919 19.2458 17.6444L16.9762 18.0656L18.185 20.1594C18.3838 20.5037 18.2658 20.9441 17.9215 21.1429C17.5771 21.3417 17.1368 21.2237 16.9379 20.8794L15.7289 18.7853L14.2286 20.5411C14.0419 20.7596 13.7432 20.8461 13.4685 20.7612C13.1939 20.6762 12.9962 20.4361 12.9654 20.1504L12.1345 12.4375C12.1039 12.1541 12.2435 11.8794 12.4903 11.7368ZM14.2183 18.3365L14.9645 17.4633C15.2857 17.0873 15.7262 16.833 16.2125 16.7427L17.3417 16.5332L13.7406 13.9024L14.2183 18.3365Z"
      fill="#F5F3FF"
    />
  </svg>
);

export const SELECT_CURSOR_TOOL: Tool<SelectCursorToolConfiguration> = {
  name: "Select-cursor",
  icon: SELECT_CURSOR_ICON,
  initialConfiguration: { type: selectCursorType[0] },
  configurationComponent: SelectCursorToolConfigurationComponent,
};
