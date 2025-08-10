import { OutsideCard } from "@/components/outsideCard";
import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import { SubToolConfiguration } from "@/models/editor/tools/subToolConfiguration";
import { SubToolConfigurationProps } from "@/models/editor/tools/subToolConfigurationProps";
import { SubTool } from "@/models/editor/tools/subTool";

export interface BlackWhiteConfiguration extends SubToolConfiguration {}

export interface GaussianBlurConfiguration extends SubToolConfiguration {
  blurAmount: number;
}

export interface ColorAndToneConfiguration extends SubToolConfiguration {
  saturation: number;
  brightness: number;
  contrast: number;
  hue: number;
}

export interface InvertConfiguration extends SubToolConfiguration {}

export interface PixelateConfiguration extends SubToolConfiguration {
  amount: number;
}

// TODO : definir plusieurs attributs avec boolean
export interface FlipConfiguration extends SubToolConfiguration {
  horizontal_flip: boolean;
  vertical_flip: boolean;
}

export interface ThresholdConfiguration extends SubToolConfiguration {}

export interface SharpenConfiguration extends SubToolConfiguration {}

export const BlackWhiteConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: SubToolConfigurationProps<BlackWhiteConfiguration>) => {
  return <div>Black/white</div>;
};

export const BlackWhite: SubTool<BlackWhiteConfiguration> = {
  name: "Black/white",
  initialConfiguration: {},
  configurationComponent: BlackWhiteConfigurationSubcomponent,
};

export const GaussianBlurConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: SubToolConfigurationProps<GaussianBlurConfiguration>) => {
  return (
    <div>
      <p className="text-violet-50 text-lg">
        Blur amount :<br></br>
      </p>
      <input
        type="range"
        min="1"
        max="100"
        value={configuration.blurAmount}
        onChange={(e) => {
          setConfiguration({
            ...configuration,
            blurAmount: Number(e.target.value),
          });
        }}
      />
      <span className="text-violet-50 text-lg">
        {" "}
        {configuration.blurAmount}
      </span>
    </div>
  );
};

export const GaussianBlur: SubTool<GaussianBlurConfiguration> = {
  name: "Gaussian blur",
  initialConfiguration: { blurAmount: 10 },
  configurationComponent: GaussianBlurConfigurationSubcomponent,
};

export const ColorAndToneConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: SubToolConfigurationProps<ColorAndToneConfiguration>) => {
  return <div>ColorAndTone</div>;
};

export const ColorAndTone: SubTool<ColorAndToneConfiguration> = {
  name: "Color & tone",
  initialConfiguration: { saturation: 1, brightness: 2, contrast: 3, hue: 4 },
  configurationComponent: ColorAndToneConfigurationSubcomponent,
};

export const InvertConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: SubToolConfigurationProps<InvertConfiguration>) => {
  return <div>Invert</div>;
};

export const Invert: SubTool<InvertConfiguration> = {
  name: "Invert",
  initialConfiguration: {},
  configurationComponent: InvertConfigurationSubcomponent,
};

export const PixelateConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: SubToolConfigurationProps<PixelateConfiguration>) => {
  return <div>Pixelate</div>;
};

export const Pixelate: SubTool<PixelateConfiguration> = {
  name: "Pixelate",
  initialConfiguration: {
    amount: 5,
  },
  configurationComponent: PixelateConfigurationSubcomponent,
};

export const FlipConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: SubToolConfigurationProps<FlipConfiguration>) => {
  return (
    <div>
      <label>
        Horizontal:{" "}
        <input
          type="checkbox"
          checked={configuration.horizontal_flip}
          onChange={(e) => {
            setConfiguration({
              ...configuration,
              horizontal_flip: e.target.checked,
            });
          }}
        />
      </label>
      <label>
        Vertical:{" "}
        <input
          type="checkbox"
          checked={configuration.vertical_flip}
          onChange={(e) => {
            setConfiguration({
              ...configuration,
              vertical_flip: e.target.checked,
            });
          }}
        />
      </label>
    </div>
  );
};

export const Flip: SubTool<FlipConfiguration> = {
  name: "Flip (mirror)",
  initialConfiguration: {
    horizontal_flip: false,
    vertical_flip: false,
  },
  configurationComponent: FlipConfigurationSubcomponent,
};

export const ThresholdConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: SubToolConfigurationProps<ThresholdConfiguration>) => {
  return <div>Threshold</div>;
};

export const Threshold: SubTool<ThresholdConfiguration> = {
  name: "Threshold",
  initialConfiguration: {},
  configurationComponent: ThresholdConfigurationSubcomponent,
};

export const SharpenConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: SubToolConfigurationProps<SharpenConfiguration>) => {
  return <div>Sharpen</div>;
};

export const Sharpen: SubTool<SharpenConfiguration> = {
  name: "Sharpen",
  initialConfiguration: {},
  configurationComponent: SharpenConfigurationSubcomponent,
};

export const ADJUST_SUB_TOOLS: Record<string, SubTool<any>> = {
  [BlackWhite.name]: BlackWhite,
  [GaussianBlur.name]: GaussianBlur,
  [ColorAndTone.name]: ColorAndTone,
  [Invert.name]: Invert,
  [Pixelate.name]: Pixelate,
  [Flip.name]: Flip,
  [Threshold.name]: Threshold,
  [Sharpen.name]: Sharpen,
};

const ADJUST_INITIAL_CONFIGURATION: Record<string, SubToolConfiguration> = {};

for (let subTool of Object.values(ADJUST_SUB_TOOLS)) {
  ADJUST_INITIAL_CONFIGURATION[subTool.name] = subTool.initialConfiguration;
}

export interface AdjustToolConfiguration extends ToolConfiguration {
  filterType: string;
  subConfigurations: Record<string, SubToolConfiguration>;
}

// TODO : ajouter un bouton pour save sous-configuration et pop up si chgmt de filtre alors que sous-configuration pas save
export const AdjustToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<AdjustToolConfiguration>) => {
  const AdjustToolConfigurationSubcomponent =
    ADJUST_SUB_TOOLS[configuration.filterType].configurationComponent;

  return (
    <div>
      <span className="text-violet-50 text-lg">
        Filters : <br />
      </span>
      <select
        className="bg-violet-500 text-violet-50 text-lg rounded p-2"
        value={configuration.filterType}
        onChange={(e) => {
          setConfiguration({ ...configuration, filterType: e.target.value });
        }}
      >
        {Object.keys(ADJUST_SUB_TOOLS).map((filterName) => (
          <option key={filterName}>{filterName}</option>
        ))}
      </select>
      <OutsideCard>
        <AdjustToolConfigurationSubcomponent
          configuration={
            configuration.subConfigurations[configuration.filterType]
          }
          setConfiguration={(config: SubToolConfiguration) => {
            setConfiguration({
              ...configuration,
              subConfigurations: {
                ...configuration.subConfigurations,
                [configuration.filterType]: config,
              },
            });
          }}
        />
      </OutsideCard>
    </div>
  );
};

export const ADJUST_TOOL: Tool<AdjustToolConfiguration> = {
  name: "Adjust",
  iconPath: "/editor/toolbar/adjust.svg",
  initialConfiguration: {
    filterType: Object.keys(ADJUST_SUB_TOOLS)[0],
    subConfigurations: ADJUST_INITIAL_CONFIGURATION,
  },
  configurationComponent: AdjustToolConfigurationComponent,
};
