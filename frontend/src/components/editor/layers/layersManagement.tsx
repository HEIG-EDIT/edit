import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import { LayerConfiguration } from "@/components/editor/layers/layerConfiguration";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { ConfigurationButton } from "@/components/editor/layers/configurationButton";

import { Layer, LayerId, LayerUpdateCallback } from "@/components/editor/types";

type LayersManagementProps = {
  layers: Layer[];
  updateLayer: (id: LayerId, callback: LayerUpdateCallback) => Layer;
};

// FIXME: Maybe pass only required information
// I don't know if this impacts performance, I think the component is re-rendered
// whenever an attribute of Layer is updated, even if it's not used in here.
export const LayersManagement = ({
  layers,
  updateLayer,
}: LayersManagementProps) => {
  return (
    <div className="bg-gray-800 rounded-2xl">
      <div className="bg-violet-300 rounded-2xl p-2 flex flex-row gap-4 mb-2">
        <LayersRoundedIcon />
        <p className="text-grey-800 font-semibold text-xl">Layers</p>
      </div>
      <div className="p-4">
        <div className="bg-gray-600 rounded-2xl">
          <div className="flex flex-row gap-4 justify-center items-center p-2">
            <ConfigurationButton icon={AddRoundedIcon} />
            <ConfigurationButton icon={ContentCopyRoundedIcon} />
            <ConfigurationButton icon={DeleteForeverRoundedIcon} />
          </div>
          <div className="flex flex-col gap-2 p-2">
            {layers.map((layer: Layer) => (
              <LayerConfiguration
                name={layer.name}
                key={layer.id}
                updateLayer={(callback: LayerUpdateCallback) => {
                  updateLayer(layer.id, callback);
                }}
                isSelected={layer.isSelected}
                isVisible={layer.isVisible}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
