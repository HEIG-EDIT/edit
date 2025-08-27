import { useCallback } from "react";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import {
  Layer,
  LayerId,
  LayerUpdateCallback,
} from "@/models/editor/layers/layer";
import useLayersReordering from "@/hooks/useLayersReordering";

export default function useLayersState() {
  const {
    state: layers,
    setState: setLayers,
    setVirtualState: setVirtualLayers,
    commitVirtualState: commitVirtualLayers,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo(Array<Layer>());

  /// Find the layer's state and it's index in the list from it's id
  const findLayer = useCallback(
    (layerId: string): [number, Layer] => {
      for (const [i, layer] of layers.entries()) {
        if (layer.id === layerId) {
          return [i, layer];
        }
      }

      throw Error(`Could not find layer with id ${layerId}`);
    },
    [layers],
  );

  const updateLayer = useCallback(
    (
      layerId: LayerId,
      callback: LayerUpdateCallback,
      virtual: boolean = false,
    ) => {
      const [i, layer] = findLayer(layerId);
      const newLayer = callback(layer);

      const fun = virtual ? setVirtualLayers : setLayers;

      fun((prev: Layer[]) => [
        ...prev.slice(0, i),
        newLayer,
        ...prev.slice(i + 1),
      ]);
    },
    [findLayer, setLayers, setVirtualLayers],
  );

  const editSelectedLayers = (
    callback: LayerUpdateCallback,
    virtual: boolean = false,
  ) => {
    const fun = virtual ? setVirtualLayers : setLayers;
    fun((prev) => {
      return prev.map((layer) => {
        if (!layer.isSelected) {
          return layer;
        }
        return callback(layer);
      });
    });
  };

  const deleteSelectedLayers = () => {
    setLayers((prev) => {
      const result = [];
      for (const layer of prev) {
        if (!layer.isSelected) {
          result.push(layer);
        }
      }
      return result;
    });
  };

  const duplicateSelectedLayers = () => {
    setLayers((prev) => {
      const result = [];
      for (const layer of prev) {
        result.push(layer);
        if (layer.isSelected) {
          result.push(Layer.duplicate(layer));
        }
      }
      return result;
    });
  };

  const addLayer = (layer: Layer) => {
    setLayers((prev) => [...prev, layer]);
  };

  const layersReorderingLogic = useLayersReordering(layers, setLayers);

  return {
    layers,
    setVirtualLayers,
    commitVirtualLayers,
    undo,
    redo,
    canUndo,
    canRedo,

    setLayers,
    updateLayer,
    addLayer,

    editSelectedLayers,
    deleteSelectedLayers,
    duplicateSelectedLayers,

    layersReorderingLogic,
  };
}
