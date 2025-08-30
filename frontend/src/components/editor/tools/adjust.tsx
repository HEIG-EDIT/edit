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
  pixelSize: number;
}

export interface FlipConfiguration extends FilterConfiguration {
  horizontalFlip: boolean;
  verticalFlip: boolean;
}

export interface ThresholdConfiguration extends FilterConfiguration {
  threshold: number;
}

export const BlackWhiteConfigurationSubcomponent = () => {
  return <div></div>;
};

export const BlackWhite: Filter<BlackWhiteConfiguration> = {
  name: "Black/white",
  initialConfiguration: {
    applyTool: (layer: Layer) => {
      console.log("Applying grayscale");
      return {
        ...layer,
        filters: [...layer.filters, Konva.Filters.Grayscale],
      };
    },
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
      };
    },
  },
  configurationComponent: GaussianBlurConfigurationSubcomponent,
};

export const ColorAndToneConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<ColorAndToneConfiguration>) => {
  return (
    <div>
      <RangeInput
        property="Saturation"
        value={configuration.saturation}
        step={0.01}
        range={[-5, 5]}
        onChange={(value) => {
          setConfiguration({ ...configuration, saturation: value });
        }}
      />
      <RangeInput
        property="Brightness"
        value={configuration.brightness}
        step={0.01}
        range={[-1, 1]}
        onChange={(value) => {
          setConfiguration({ ...configuration, brightness: value });
        }}
      />
      <RangeInput
        property="Contrast"
        value={configuration.contrast}
        step={1}
        range={[-100, 100]}
        onChange={(value) => {
          setConfiguration({ ...configuration, contrast: value });
        }}
      />
      <RangeInput
        property="Hue"
        value={configuration.hue}
        step={1}
        range={[0, 359]}
        onChange={(value) => {
          setConfiguration({ ...configuration, hue: value });
        }}
      />
      <RangeInput
        property="Opacity"
        value={configuration.opacity}
        step={0.001}
        range={[0, 1]}
        onChange={(value) => {
          setConfiguration({ ...configuration, opacity: value });
        }}
      />
    </div>
  );
};

export const ColorAndTone: Filter<ColorAndToneConfiguration> = {
  name: "Color & tone",
  initialConfiguration: {
    saturation: 0,
    brightness: 0,
    contrast: 0,
    hue: 0,
    opacity: 1,
    applyTool(layer, config) {
      const FILTERS = [
        Konva.Filters.RGBA,
        Konva.Filters.Brighten,
        Konva.Filters.Contrast,
        Konva.Filters.HSL,
      ];
      const { saturation, brightness, contrast, hue, opacity } =
        config as ColorAndToneConfiguration;

      layer.groupRef.current?.brightness(brightness);
      layer.groupRef.current?.contrast(contrast);
      layer.groupRef.current?.saturation(saturation);
      layer.groupRef.current?.hue(hue);
      layer.groupRef.current?.opacity(opacity);

      // These filters should only be added once
      for (const filter_ of FILTERS) {
        if (!layer.filters.includes(filter_)) {
          console.log("Adding filter");
          layer.filters = [...layer.filters, filter_];
        }
      }
      return layer;
    },
  },
  configurationComponent: ColorAndToneConfigurationSubcomponent,
};

export const InvertConfigurationSubcomponent = () => {
  return <div></div>;
};

export const Invert: Filter<InvertConfiguration> = {
  name: "Invert",
  initialConfiguration: {
    applyTool: (layer) => {
      return {
        ...layer,
        filters: [...layer.filters, Konva.Filters.Invert],
      };
    },
  },
  configurationComponent: InvertConfigurationSubcomponent,
};

export const PixelateConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<PixelateConfiguration>) => {
  return (
    <div>
      <RangeInput
        property="Pixel size"
        value={configuration.pixelSize}
        onChange={(value) => {
          setConfiguration({ ...configuration, pixelSize: value });
        }}
      />
    </div>
  );
};

export const Pixelate: Filter<PixelateConfiguration> = {
  name: "Pixelate",
  initialConfiguration: {
    pixelSize: 5,
    applyTool: (layer, config) => {
      const pixConfig = config as PixelateConfiguration;
      layer.groupRef.current?.pixelSize(pixConfig.pixelSize);
      return {
        ...layer,
        filters: [...layer.filters, Konva.Filters.Pixelate],
      };
    },
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
          checked={configuration.horizontalFlip}
          onChange={(e) => {
            setConfiguration({
              ...configuration,
              horizontalFlip: e.target.checked,
            });
          }}
        />
      </label>
      <label>
        Vertical:{" "}
        <input
          type="checkbox"
          checked={configuration.verticalFlip}
          onChange={(e) => {
            setConfiguration({
              ...configuration,
              verticalFlip: e.target.checked,
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
    horizontalFlip: false,
    verticalFlip: false,
    applyTool: (layer, config) => {
      const { horizontalFlip: horizontal_flip, verticalFlip: vertical_flip } =
        config as FlipConfiguration;
      const xScale = horizontal_flip ? -1 : 1;
      const yScale = vertical_flip ? -1 : 1;
      layer = {
        ...layer,
        scale: {
          x: layer.scale.x * xScale,
          y: layer.scale.y * yScale,
        },
      };
      return {
        ...layer,
        // The layer is flipped around the origin, we need to adjust the postion
        position: {
          x:
            layer.position.x +
            (horizontal_flip ? layer.size.x * -layer.scale.x : 0),
          y:
            layer.position.y +
            (vertical_flip ? layer.size.y * -layer.scale.y : 0),
        },
      };
    },
  },
  configurationComponent: FlipConfigurationSubcomponent,
};

export const ThresholdConfigurationSubcomponent = ({
  configuration,
  setConfiguration,
}: FilterConfigurationProps<ThresholdConfiguration>) => {
  return (
    <div>
      <RangeInput
        property="Threshold"
        value={configuration.threshold}
        onChange={(value) => {
          setConfiguration({
            ...configuration,
            threshold: value,
          });
        }}
        range={[0, 1]}
        step={0.01}
      />
    </div>
  );
};

export const Threshold: Filter<ThresholdConfiguration> = {
  name: "Threshold",
  initialConfiguration: {
    threshold: 0.5,
    applyTool: (layer, config) => {
      const { threshold } = config as ThresholdConfiguration;
      layer.groupRef.current?.threshold(threshold);
      return {
        ...layer,
        filters: [...layer.filters, Konva.Filters.Threshold],
      };
    },
  },
  configurationComponent: ThresholdConfigurationSubcomponent,
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
      layer.groupRef.current?.cache();
      return subConfig.applyTool(layer, subConfig);
    });
  };

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
        <button
          className="bg-violet-500 p-2 rounded-xl text-violet-50 border-2 border-violet-50"
          onClick={handleApply}
        >
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
