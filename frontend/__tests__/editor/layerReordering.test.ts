import { Layer } from "@/models/editor/layers/layer";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import useLayersState from "@/hooks/useLayersState";

const MOVABLE_LAYERS_COUNTS = [5, 20];
const LAYERS_COUNTS = [0, 1, ...MOVABLE_LAYERS_COUNTS];

// Helper to create layersState with a set number of layers
const renderLayersState = (
  layersCount: number,
  selectedCount: number = 0,
  selectAtFront: boolean = true,
) => {
  const { result } = renderHook(() => useLayersState());

  for (let i = 0; i < layersCount; ++i) {
    act(() => {
      const layer = new Layer();
      if (selectedCount > 0) {
        --selectedCount;
        layer.isSelected = true;
      }

      result.current.addLayer(layer, !selectAtFront);
    });
  }

  return result;
};

it.each(LAYERS_COUNTS)(
  "Cannot move layers when no layer is selected",
  (layersCount) => {
    const result = renderLayersState(layersCount, 0);
    const { canMoveLayersForward, canMoveLayersBackward } =
      result.current.layersReorderingLogic;

    expect(canMoveLayersForward).toBe(false);
    expect(canMoveLayersBackward).toBe(false);
  },
);

it.each(LAYERS_COUNTS)(
  "Cannot move layers when all layers are selected",
  (layersCount) => {
    const result = renderLayersState(layersCount, layersCount);
    const { canMoveLayersForward, canMoveLayersBackward } =
      result.current.layersReorderingLogic;

    expect(canMoveLayersForward).toBe(false);
    expect(canMoveLayersBackward).toBe(false);
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Can move a single selected layer at the back forward",
  (layersCount) => {
    const result = renderLayersState(layersCount, 1, false);
    const { canMoveLayersForward } = result.current.layersReorderingLogic;

    expect(canMoveLayersForward).toBe(true);
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Can move a single selected layer at the front backward",
  (layersCount) => {
    const result = renderLayersState(layersCount, 1, true);
    const { canMoveLayersBackward } = result.current.layersReorderingLogic;

    expect(canMoveLayersBackward).toBe(true);
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Can move multiple selected layers at the back forward",
  (layersCount) => {
    const result = renderLayersState(layersCount, layersCount - 1, false);
    const { canMoveLayersForward } = result.current.layersReorderingLogic;

    expect(canMoveLayersForward).toBe(true);
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Can move multiple selected layers at the front backward",
  (layersCount) => {
    const result = renderLayersState(layersCount, layersCount - 1, true);
    const { canMoveLayersBackward } = result.current.layersReorderingLogic;

    expect(canMoveLayersBackward).toBe(true);
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Moving layer at the back forward",
  (layersCount) => {
    const result = renderLayersState(layersCount, 1, false);
    const initialLayers = result.current.layers;
    act(() => {
      result.current.layersReorderingLogic.moveLayersForward();
    });

    expect(result.current.layers[0]).toBe(initialLayers[1]);
    expect(result.current.layers[1]).toBe(initialLayers[0]);
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Moving layer at the front backward",
  (layersCount) => {
    const result = renderLayersState(layersCount, 1, true);
    const initialLayers = result.current.layers;
    act(() => {
      result.current.layersReorderingLogic.moveLayersBackward();
    });

    const frontLayerI = layersCount - 1;

    expect(result.current.layers[frontLayerI]).toBe(
      initialLayers[frontLayerI - 1],
    );
    expect(result.current.layers[frontLayerI - 1]).toBe(
      initialLayers[frontLayerI],
    );
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Bring layer at the back to the front",
  (layersCount) => {
    const result = renderLayersState(layersCount, 1, false);
    const initialLayers = result.current.layers;
    act(() => {
      result.current.layersReorderingLogic.bringLayersToFront();
    });

    expect(result.current.layers[layersCount - 1]).toBe(initialLayers[0]);
    for (let i = result.current.layers.length - 2; i >= 0; --i) {
      expect(result.current.layers[i]).toBe(initialLayers[i + 1]);
    }
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Sending layer at the front to the back",
  (layersCount) => {
    const result = renderLayersState(layersCount, 1, true);
    const initialLayers = result.current.layers;
    act(() => {
      result.current.layersReorderingLogic.sendLayersToBack();
    });

    const frontLayerI = layersCount - 1;

    expect(result.current.layers[0]).toBe(initialLayers[frontLayerI]);
    for (let i = 1; i < result.current.layers.length; ++i) {
      expect(result.current.layers[i]).toBe(initialLayers[i - 1]);
    }
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Moving multiple layers forward works",
  (layersCount) => {
    const result = renderLayersState(layersCount, layersCount - 1, false);
    const initialLayers = result.current.layers;
    act(() => {
      result.current.layersReorderingLogic.moveLayersForward();
    });

    // Only unselected layer is now at the back
    expect(result.current.layers[0]).toBe(initialLayers[layersCount - 1]);
    for (let i = 1; i < result.current.layers.length; ++i) {
      expect(result.current.layers[i]).toBe(initialLayers[i - 1]);
    }
  },
);

it.each(MOVABLE_LAYERS_COUNTS)(
  "Moving multiple layers forward works",
  (layersCount) => {
    const result = renderLayersState(layersCount, layersCount - 1, true);
    const initialLayers = result.current.layers;
    act(() => {
      result.current.layersReorderingLogic.moveLayersBackward();
    });

    // Only unselected layer is now at the front
    expect(result.current.layers[layersCount - 1]).toBe(initialLayers[0]);
    for (let i = result.current.layers.length - 2; i >= 0; --i) {
      expect(result.current.layers[i]).toBe(initialLayers[i + 1]);
    }
  },
);
