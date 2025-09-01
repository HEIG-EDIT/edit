import { useCallback } from "react";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import {
  Layer,
  LayerId,
  LayerUpdateCallback,
} from "@/models/editor/layers/layer";
import useLayersReordering, {
  LayersReorderingLogic,
} from "@/hooks/useLayersReordering";

export interface LayersStateResult {
  /// Array of layers, ordered from the back to the front
  layers: Layer[];

  /// Commit the virtual state of the layers to create a history step
  commitVirtualLayers: () => void;

  /// If canUndo, undo the last done step in the history
  undo: () => void;

  /// If canRedo, redo the last undone step in the history
  redo: () => void;

  /// True if undo can be performed
  canUndo: boolean;

  /// True if redo can be performed
  canRedo: boolean;

  /// Set all the layers of the canvas.
  /// @param newLayers The new state of the layers, or a callback returning the new state
  setLayers: React.Dispatch<Layer[]>;

  /// Update the layer with a given id
  /// @param id The id of the layer to update
  /// @param callback A callback returning the updated layer
  /// @param virtual If true, the change will be virtual, meaning that no step in the
  ///                history is created. False by default.
  updateLayer: (
    id: LayerId,
    callback: LayerUpdateCallback,
    virtual?: boolean,
  ) => void;

  /// Add a new layer
  /// @param layer The new layer to add
  /// @param atTheFront If true, the new layer is added at the front, otherwise
  ///                   it is added at the back of the canvas. True by default.
  addLayer: (layer: Layer, atTheFront?: boolean) => void;

  /// Apply a modification to all selected layers
  /// @param callback The callback to apply to all selected layers
  editSelectedLayers: (callback: LayerUpdateCallback) => void;

  /// Remove the selected layers
  deleteSelectedLayers: () => void;

  /// Duplicate the selected layers. The added layers will be right on top of the
  /// selected ones.
  duplicateSelectedLayers: () => void;

  /// The logic of the layers reordering.
  layersReorderingLogic: LayersReorderingLogic;
}

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

  const addLayer = (layer: Layer, atTheFront: boolean = true) => {
    if (atTheFront) {
      setLayers((prev) => [...prev, layer]);
    } else {
      setLayers((prev) => [layer, ...prev]);
    }
  };

  const layersReorderingLogic = useLayersReordering(
    layers,
    setLayers,
    deleteSelectedLayers,
  );

  const result: LayersStateResult = {
    layers,
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

  return result;
}
