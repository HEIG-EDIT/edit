import { OutsideCard } from "@/components/outsideCard";
import { Tool } from "@/models/editor/tools/tool";
import { ToolConfiguration } from "@/models/editor/tools/toolConfiguration";
import { ToolConfigurationProps } from "@/models/editor/tools/toolConfigurationProps";
import { FilterConfiguration } from "@/models/editor/tools/filterConfiguration";
import { FilterConfigurationProps } from "@/models/editor/tools/filterConfigurationProps";
import { Filter } from "@/models/editor/tools/subTool";
import ContrastRoundedIcon from "@mui/icons-material/ContrastRounded";
import { Layer } from "@/models/editor/layers/layer";

import Konva from "konva";
import { useEditorContext } from "../editorContext";
import { RangeInput } from "./rangeInput";

export type BlackWhiteConfiguration = FilterConfiguration;

export interface GaussianBlurConfiguration extends FilterConfiguration {
  blurAmount: number;
}

export interface ColorAndToneConfiguration extends FilterConfiguration {
  saturation: number;
  brightness: number;
  contrast: number;
  hue: number;
  opacity: number;
}

export type InvertConfiguration = FilterConfiguration;

export interface PixelateConfiguration extends FilterConfiguration {
  amount: number;
}

export interface FlipConfiguration extends FilterConfiguration {
  horizontal_flip: boolean;
  vertical_flip: boolean;
}

export type ThresholdConfiguration = FilterConfiguration;

export type SharpenConfiguration = FilterConfiguration;

export const BlackWhiteConfigurationSubcomponent = () => {
  return <div>Black/white</div>;
};

export const BlackWhite: Filter<BlackWhiteConfiguration> = {
  name: "Black/white",
  initialConfiguration: {
    applyTool: (layer: Layer) => {
      console.log('Applying grayscale')
      return {
        ...layer,
        filters: [...layer.filters, Konva.Filters.Grayscale]
      }
    }
  },
  configurationComponent: BlackWhiteConfigurationSubcomponent,
};

export const GaussianBlurConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<GaussianBlurConfiguration>) => {
  return (
    <div>
      <RangeInput
        property="Blur amount"
        value={configuration.blurAmount}
        onChange={(value) => {
          setConfiguration({
            ...configuration,
            blurAmount: Number(value),
          });
        }}
      />
    </div>
  );
};

export const GaussianBlur: Filter<GaussianBlurConfiguration> = {
  name: "Gaussian blur",
  initialConfiguration: {
    blurAmount: 10,
    applyTool: (layer: Layer, config) => {
      const blurConfig = config as GaussianBlurConfiguration;
      layer.groupRef.current?.blurRadius(blurConfig.blurAmount);
      return {
        ...layer,
        filters: [...layer.filters, Konva.Filters.Blur],
      }
    }
  },
  configurationComponent: GaussianBlurConfigurationSubcomponent,
};

export const ColorAndToneConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<ColorAndToneConfiguration>) => {
  console.log(configuration);
  console.log(setConfiguration);

  return (
    <div>
      <RangeInput
        property="Saturation"
        value={1}
        step={0.01}
        onChange={(value) => {
          setConfiguration({ ...configuration, saturation: value });
        }}
      />
      <RangeInput
        property="Brightness"
        value={1}
        step={0.01}
        onChange={(value) => {
          setConfiguration({ ...configuration, brightness: value })
        }}
      />
      <RangeInput
        property="Contrast"
        value={1}
        onChange={(value) => {
          setConfiguration({ ...configuration, contrast: value })
        }}
      />
    </div>
  )
};

export const ColorAndTone: Filter<ColorAndToneConfiguration> = {
  name: "Color & tone",
  initialConfiguration: {
    saturation: 1,
    brightness: 2,
    contrast: 3,
    hue: 4,
    opacity: 5,
    applyTool(layer, config) {
      const colorToneConfig = config as ColorAndToneConfiguration;
      return {
        ...layer,
        filters: []
      }
    }
  },
  configurationComponent: ColorAndToneConfigurationSubcomponent,
};

export const InvertConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<InvertConfiguration>) => {
  // TODO : to remove, just for eslink check
  console.log(configuration);
  console.log(setConfiguration);

  return <div>Invert</div>;
};

export const Invert: Filter<InvertConfiguration> = {
  name: "Invert",
  initialConfiguration: {},
  configurationComponent: InvertConfigurationSubcomponent,
};

export const PixelateConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<PixelateConfiguration>) => {
  return <div>Pixelate</div>;
};

export const Pixelate: Filter<PixelateConfiguration> = {
  name: "Pixelate",
  initialConfiguration: {
    amount: 5,
    applyTool: (layer, config) => {
      const pixConfig = config as PixelateConfiguration;
      return {

      }
    }
  },
  configurationComponent: PixelateConfigurationSubcomponent,
};

export const FlipConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<FlipConfiguration>) => {
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

export const Flip: Filter<FlipConfiguration> = {
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
}: FilterConfigurationProps<ThresholdConfiguration>) => {
  // TODO : to remove, just for eslink check
  console.log(configuration);
  console.log(setConfiguration);

  return <div>Threshold</div>;
};

export const Threshold: Filter<ThresholdConfiguration> = {
  name: "Threshold",
  initialConfiguration: {},
  configurationComponent: ThresholdConfigurationSubcomponent,
};

export const SharpenConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<SharpenConfiguration>) => {
  // TODO : to remove, just for eslink check
  console.log(configuration);
  console.log(setConfiguration);

  return <div>Sharpen</div>;
};

export const Sharpen: Filter<SharpenConfiguration> = {
  name: "Sharpen",
  initialConfiguration: {},
  configurationComponent: SharpenConfigurationSubcomponent,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ADJUST_SUB_TOOLS: Record<string, Filter<any>> = {
  [BlackWhite.name]: BlackWhite,
  [GaussianBlur.name]: GaussianBlur,
  [ColorAndTone.name]: ColorAndTone,
  [Invert.name]: Invert,
  [Pixelate.name]: Pixelate,
  [Flip.name]: Flip,
  [Threshold.name]: Threshold,
  [Sharpen.name]: Sharpen,
};

const ADJUST_INITIAL_CONFIGURATION: Record<string, FilterConfiguration> = {};

for (const subTool of Object.values(ADJUST_SUB_TOOLS)) {
  ADJUST_INITIAL_CONFIGURATION[subTool.name] = subTool.initialConfiguration;
}

export interface AdjustToolConfiguration extends ToolConfiguration {
  filterType: string;
  subConfigurations: Record<string, FilterConfiguration>;
}

// TODO : changement de tool amene a une sauvegarde de l'etat du projet (plus dans virtual)
export const AdjustToolConfigurationComponent = ({
  configuration,
  setConfiguration,
}: ToolConfigurationProps<AdjustToolConfiguration>) => {
  const { editSelectedLayers } = useEditorContext();

  const AdjustToolConfigurationSubcomponent =
    ADJUST_SUB_TOOLS[configuration.filterType].configurationComponent;
  const subConfig = configuration.subConfigurations[configuration.filterType];

  const handleApply = () => {
    editSelectedLayers((layer) => {
      layer.groupRef.current?.cache()
      return subConfig.applyTool(layer, subConfig);
    })
  }

  return (
    <div>
      <span className="text-violet-50">
        Filters : <br />
      </span>
      <select
        className="bg-violet-500 text-violet-50 rounded p-2"
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
          setConfiguration={(config: FilterConfiguration) => {
            setConfiguration({
              ...configuration,
              subConfigurations: {
                ...configuration.subConfigurations,
                [configuration.filterType]: config,
              },
            });
          }}
        />
        <button onClick={handleApply}>
          Apply
        </button>
      </OutsideCard>
    </div>
  );
};

export const ADJUST_TOOL: Tool<AdjustToolConfiguration> = {
  name: "Adjust",
  icon: <ContrastRoundedIcon style={{ color: "white" }} />,
  initialConfiguration: {
    filterType: Object.keys(ADJUST_SUB_TOOLS)[0],
    subConfigurations: ADJUST_INITIAL_CONFIGURATION,
  },
  configurationComponent: AdjustToolConfigurationComponent,
};
