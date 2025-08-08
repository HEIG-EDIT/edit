import { OutsideCard } from "@/components/outsideCard";
import { Tool, ToolConfiguration } from "@/app/editor/page";
import { useState } from "react";

// TODO : gerer les states et mettre les difnitions des types ailleurs

interface BlackWhiteConfiguration {}

interface GaussianBlurConfiguration {
  blurAmount: number;
}

interface ColorAndToneConfiguration {
  saturation: number;
  brightness: number;
  contrast: number;
  hue: number;
}

interface InvertConfiguration {}

interface PixelateConfiguration {
  amount: number;
}

// TODO : definir une liste de types possibles (horizontal, vertical ou none) quelque part accessible par parent ?!
interface FlipConfiguration {
  type: string;
}

interface ThresholdConfiguration {}

interface SharpenConfiguration {}

type AdjustToolSubconfiguration =
  | BlackWhiteConfiguration
  | GaussianBlurConfiguration
  | ColorAndToneConfiguration
  | InvertConfiguration
  | PixelateConfiguration
  | FlipConfiguration
  | ThresholdConfiguration
  | SharpenConfiguration;

const BlackWhiteConfigurationSubcomponent: React.FC<{
  configuration: BlackWhiteConfiguration;
  setConfiguration: (config: BlackWhiteConfiguration) => void;
}> = ({ configuration, setConfiguration }) => {
  return <div>BlackWhite</div>;
};

const GaussianBlurConfigurationSubcomponent: React.FC<{
  configuration: GaussianBlurConfiguration;
  setConfiguration: (config: GaussianBlurConfiguration) => void;
}> = ({ configuration, setConfiguration }) => {
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

const ColorAndToneConfigurationSubcomponent: React.FC<{
  configuration: ColorAndToneConfiguration;
  setConfiguration: (config: ColorAndToneConfiguration) => void;
}> = ({ configuration, setConfiguration }) => {
  return <div>ColorAndTone</div>;
};

const InvertConfigurationSubcomponent: React.FC<{
  configuration: InvertConfiguration;
  setConfiguration: (config: InvertConfiguration) => void;
}> = ({ configuration, setConfiguration }) => {
  return <div>Invert</div>;
};

const PixelateConfigurationSubcomponent: React.FC<{
  configuration: PixelateConfiguration;
  setConfiguration: (config: PixelateConfiguration) => void;
}> = ({ configuration, setConfiguration }) => {
  return <div>Pixelate</div>;
};

const FlipConfigurationSubcomponent: React.FC<{
  configuration: FlipConfiguration;
  setConfiguration: (config: FlipConfiguration) => void;
}> = ({ configuration, setConfiguration }) => {
  const flipTypes = ["Vertical", "Horizontal", "None"];

  return (
    <div className="flex flex-col">
      {flipTypes.map((type) => {
        const isSelected = type === configuration.type;
        const style = isSelected
          ? "bg-violet-500 border-violet-50"
          : "bg-gray-900 border-violet-500";
        return (
          <button
            className={`rounded-xl border-2 p-2 ${style} text-violet-50 text-lg`}
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

const ThresholdConfigurationSubcomponent: React.FC<{
  configuration: ThresholdConfiguration;
  setConfiguration: (config: ThresholdConfiguration) => void;
}> = ({ configuration, setConfiguration }) => {
  return <div>Threshold</div>;
};

const SharpenConfigurationSubcomponent: React.FC<{
  configuration: SharpenConfiguration;
  setConfiguration: (config: SharpenConfiguration) => void;
}> = ({ configuration, setConfiguration }) => {
  return <div>Sharpen</div>;
};

const BlackWhiteConfiguration: AdjustToolConfiguration<BlackWhiteConfiguration> =
  {
    filterName: "Black/white",
    initialConfiguration: {},
    configurationSubcomponent: BlackWhiteConfigurationSubcomponent,
  };

const GaussianBlurConfiguration: AdjustToolConfiguration<GaussianBlurConfiguration> =
  {
    filterName: "Gaussian blur",
    initialConfiguration: { blurAmount: 3 },
    configurationSubcomponent: GaussianBlurConfigurationSubcomponent,
  };

const ColorAndToneConfiguration: AdjustToolConfiguration<ColorAndToneConfiguration> =
  {
    filterName: "Color & tone",
    initialConfiguration: { saturation: 1, brightness: 1, contrast: 1, hue: 1 },
    configurationSubcomponent: ColorAndToneConfigurationSubcomponent,
  };

const InvertConfiguration: AdjustToolConfiguration<InvertConfiguration> = {
  filterName: "Invert",
  initialConfiguration: {},
  configurationSubcomponent: InvertConfigurationSubcomponent,
};

const PixelateConfiguration: AdjustToolConfiguration<PixelateConfiguration> = {
  filterName: "Pixelate",
  initialConfiguration: { amount: 10 },
  configurationSubcomponent: PixelateConfigurationSubcomponent,
};

const FlipConfiguration: AdjustToolConfiguration<FlipConfiguration> = {
  filterName: "Flip (mirror)",
  initialConfiguration: { type: "None" },
  configurationSubcomponent: FlipConfigurationSubcomponent,
};

const ThresholdConfiguration: AdjustToolConfiguration<ThresholdConfiguration> =
  {
    filterName: "Threshold",
    initialConfiguration: {},
    configurationSubcomponent: ThresholdConfigurationSubcomponent,
  };

const SharpenConfiguration: AdjustToolConfiguration<SharpenConfiguration> = {
  filterName: "Sharpen",
  initialConfiguration: {},
  configurationSubcomponent: SharpenConfigurationSubcomponent,
};

export interface AdjustToolConfiguration<
  T extends AdjustToolSubconfiguration = AdjustToolSubconfiguration,
> {
  filterName: string;
  initialConfiguration: T;
  configurationSubcomponent: React.FC<{
    configuration: T;
    setConfiguration: (config: T) => void;
  }>;
}

interface Props {
  configuration: AdjustToolConfiguration;
  setConfiguration: (config: AdjustToolConfiguration) => void;
}

const FiltersConfiguration: Record<string, any> = {
  [BlackWhiteConfiguration.filterName]: BlackWhiteConfiguration,
  [GaussianBlurConfiguration.filterName]: GaussianBlurConfiguration,
  [ColorAndToneConfiguration.filterName]: ColorAndToneConfiguration,
  [InvertConfiguration.filterName]: InvertConfiguration,
  [PixelateConfiguration.filterName]: PixelateConfiguration,
  [FlipConfiguration.filterName]: FlipConfiguration,
  [ThresholdConfiguration.filterName]: ThresholdConfiguration,
  [SharpenConfiguration.filterName]: SharpenConfiguration,
};

const AdjustToolConfigurationComponent: React.FC<Props> = ({
  configuration,
  setConfiguration,
}) => {
  const [nameSelectedFilterConfiguration, setNameSelectedFilterConfiguration] =
    useState<string>(BlackWhiteConfiguration.filterName);
  const [filtersConfiguration, setFiltersConfiguration] = useState<
    Record<string, AdjustToolSubconfiguration>
  >({
    [BlackWhiteConfiguration.filterName]:
      BlackWhiteConfiguration.initialConfiguration,
    [GaussianBlurConfiguration.filterName]:
      GaussianBlurConfiguration.initialConfiguration,
    [ColorAndToneConfiguration.filterName]:
      ColorAndToneConfiguration.initialConfiguration,
    [InvertConfiguration.filterName]: InvertConfiguration.initialConfiguration,
    [PixelateConfiguration.filterName]:
      PixelateConfiguration.initialConfiguration,
    [FlipConfiguration.filterName]: FlipConfiguration.initialConfiguration,
    [ThresholdConfiguration.filterName]:
      ThresholdConfiguration.initialConfiguration,
    [SharpenConfiguration.filterName]:
      SharpenConfiguration.initialConfiguration,
  });

  const AdjustToolConfigurationSubcomponent =
    FiltersConfiguration[nameSelectedFilterConfiguration]
      .configurationSubcomponent;

  return (
    <div>
      <span className="text-violet-50 text-lg">
        Filters : <br />
      </span>
      <select
        className="bg-violet-500 text-violet-50 text-lg rounded p-2"
        value={
          nameSelectedFilterConfiguration
        } /* TODO : a modifer une fois que ok */
        onChange={(e) => {
          /* TODO : a modifer une fois que ok */
          const selected = e.target.value;
          setNameSelectedFilterConfiguration(selected);
          setConfiguration(FiltersConfiguration[selected]);
        }}
      >
        {Object.keys(FiltersConfiguration).map((filterName) => (
          <option key={filterName}>{filterName}</option>
        ))}
      </select>
      <OutsideCard>
        <AdjustToolConfigurationSubcomponent
          configuration={filtersConfiguration[nameSelectedFilterConfiguration]}
          setConfiguration={(newConfig: any) => {
            setFiltersConfiguration((prev) => ({
              ...prev,
              [nameSelectedFilterConfiguration]: newConfig,
            }));
          }}
        />
      </OutsideCard>
    </div>
  );
};

export const AdjustTool: Tool = {
  name: "Adjust",
  iconPath: "/editor/toolbar/adjust.svg",
  initialConfiguration: { filter: FiltersConfiguration[0] },
  configurationComponent: AdjustToolConfigurationComponent as React.FC<{
    configuration: ToolConfiguration;
    setConfiguration: (config: ToolConfiguration) => void;
  }>,
};
