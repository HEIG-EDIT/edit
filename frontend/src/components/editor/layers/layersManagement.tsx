import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import { LayerConfiguration } from "@/components/editor/layers/layerConfiguration";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { ConfigurationButton } from "@/components/editor/layers/configurationButton";
import { Fragment, useRef, useState } from "react";
import AddToPhotosRoundedIcon from "@mui/icons-material/AddToPhotosRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import { EntryButton } from "../menu/entryButton";
import KeyboardReturnRoundedIcon from "@mui/icons-material/KeyboardReturnRounded";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { LayersManagementProps } from "@/models/editor/layers/layerManagementProps";
import { Layer, LayerUpdateCallback } from "@/models/editor/layers/layer";

// FIXME: Maybe pass only required information
// I don't know if this impacts performance, I think the component is re-rendered
// whenever an attribute of Layer is updated, even if it's not used in here.
export const LayersManagement = ({
  layers,
  updateLayer,
}: LayersManagementProps) => {
  const [isNewLayerDisplayed, setIsNewLayerDisplayed] =
    useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useOnClickOutside(containerRef, () => setIsNewLayerDisplayed(false));

  const displayLayers = (
    <Fragment>
      <div className="flex flex-row gap-4 justify-center items-center p-2">
        <ConfigurationButton
          icon={AddRoundedIcon}
          onClick={() => setIsNewLayerDisplayed(true)}
        />
        <ConfigurationButton icon={ContentCopyRoundedIcon} onClick={() => {}} />
        <ConfigurationButton
          icon={DeleteForeverRoundedIcon}
          onClick={() => {}}
        />
      </div>
      <div className="flex flex-col gap-2 p-2">
        {layers.toReversed().map((layer: Layer) => (
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
    </Fragment>
  );

  const addLayer = (
    <div className="flex flex-col p-2 gap-2">
      <EntryButton
        icon={<AddToPhotosRoundedIcon />}
        text={"Import image"}
        onClick={() => {}}
        style="bg-violet-50 border-2 border-violet-500"
      />
      <EntryButton
        icon={<CollectionsRoundedIcon />}
        text={"Empty layer"}
        onClick={() => {}}
        style="bg-violet-50 border-2 border-violet-500"
      />
      <EntryButton
        icon={<KeyboardReturnRoundedIcon />}
        text={"Cancel"}
        onClick={() => setIsNewLayerDisplayed(false)}
        style="bg-violet-50 border-2 border-violet-500"
      />
    </div>
  );

  return (
    <div className="bg-gray-800 rounded-2xl" ref={containerRef}>
      <div className="bg-violet-300 rounded-2xl p-2 flex flex-row gap-2 mb-2">
        <LayersRoundedIcon />
        <p className="text-grey-800 font-semibold">Layers</p>
      </div>
      <div className="p-4">
        <div className="bg-gray-600 rounded-2xl">
          {isNewLayerDisplayed ? addLayer : displayLayers}
        </div>
      </div>
    </div>
  );
};
