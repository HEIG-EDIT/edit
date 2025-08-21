import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import { LayerConfiguration } from "@/components/editor/layers/layerConfiguration";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { ConfigurationButton } from "@/components/editor/layers/configurationButton";
import { Fragment, useCallback, useRef, useState } from "react";
import AddToPhotosRoundedIcon from "@mui/icons-material/AddToPhotosRounded";
import CollectionsRoundedIcon from "@mui/icons-material/CollectionsRounded";
import { EntryButton } from "../menu/entryButton";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import { LayersManagementProps } from "@/models/editor/layers/layersManagementProps";
import { Layer, LayerUpdateCallback } from "@/models/editor/layers/layer";
import { LayerReordering } from "./layerReordering";

// FIXME: Maybe pass only required information
// I don't know if this impacts performance, I think the component is re-rendered
// whenever an attribute of Layer is updated, even if it's not used in here.
export const LayersManagement = ({
  layers,
  updateLayer,
  setLayers,
}: LayersManagementProps) => {
  const [isNewLayerDisplayed, setIsNewLayerDisplayed] =
    useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleClickOutside = useCallback(() => {
    setIsNewLayerDisplayed(false);
  }, [setIsNewLayerDisplayed]);

  useOnClickOutside(containerRef, handleClickOutside);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result as string;
      img.onload = () => {
        setLayers((prev) => [...prev, new Layer(file.name, img)]);
      };
    };
    reader.readAsDataURL(file);
  };

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
      <div className="flex flex-row p-2 gap-4 items-center">
        <div
          className="flex flex-col gap-2 w-5/6 max-h-64 overflow-y-auto
        [&::-webkit-scrollbar]:w-3
        [&::-webkit-scrollbar-track]:bg-gray-400
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:border-2
        [&::-webkit-scrollbar-thumb]:border-gray-900
        [&::-webkit-scrollbar-thumb]:bg-gray-600 
        [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {layers.toReversed().map((layer: Layer) => (
            <div className="pr-4" key={layer.id}>
              <LayerConfiguration
                name={layer.name}
                updateLayer={(
                  callback: LayerUpdateCallback,
                  virtual: boolean = true,
                ) => {
                  updateLayer(layer.id, callback, virtual);
                }}
                isSelected={layer.isSelected}
                isVisible={layer.isVisible}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col w-1/6 justify-center">
          {layers.length > 1 && (
            <LayerReordering layers={layers} setLayers={setLayers} />
          )}
        </div>
      </div>
    </Fragment>
  );

  const addLayer = (
    <div className="flex flex-col p-2 gap-2">
      <EntryButton
        icon={<AddToPhotosRoundedIcon />}
        text={"Import image"}
        onClick={handleUploadClick}
        style="bg-violet-50 border-2 border-violet-500"
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <EntryButton
        icon={<CollectionsRoundedIcon />}
        text={"Empty layer"}
        onClick={() => {}}
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
