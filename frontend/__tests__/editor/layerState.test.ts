import "@testing-library/jest-dom";
import useLayersState from "@/hooks/useLayersState";
import { renderHook } from "@testing-library/react";
import { act } from "react";
import { Layer } from "@/models/editor/layers/layer";

const LAYERS_COUNTS = [1, 5, 20];

const renderLayersState = () => {
  return renderHook(() => useLayersState());
};

test("Default layers state is empty", () => {
  const { result } = renderLayersState();

  expect(result.current.layers.length).toBe(0);
});

it.each(LAYERS_COUNTS)("Add layer adds new layer(s)", (layersCount) => {
  const { result } = renderLayersState();
  for (let i = 0; i < layersCount; ++i) {
    act(() => {
      result.current.addLayer(new Layer());
    });
  }

  expect(result.current.layers.length).toBe(layersCount);
});

it.each(LAYERS_COUNTS)("Add layer adds new layer at the end", (layersCount) => {
  const { result } = renderLayersState();

  const layers = [];
  for (let i = 0; i < layersCount; ++i) {
    layers.push(new Layer());
    act(() => {
      result.current.addLayer(layers[i]);
    });
  }

  const newLayer = new Layer();
  act(() => {
    result.current.addLayer(newLayer);
  });

  expect(result.current.layers.length).toBe(layersCount + 1);
  expect(result.current.layers[layersCount]).toBe(newLayer);

  for (let i = 0; i < layersCount; ++i) {
    expect(result.current.layers[i]).toBe(layers[i]);
  }
});

it.each(LAYERS_COUNTS)(
  "Update layer doesn't change the layer count",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        result.current.addLayer(new Layer());
      });
    }

    const extraLayer = new Layer();
    act(() => {
      result.current.addLayer(extraLayer);
    });
    act(() => {
      result.current.updateLayer(extraLayer.id, (layer) => {
        layer.name = "A super original update";
        return layer;
      });
    });

    expect(result.current.layers.length).toBe(layersCount + 1);
  },
);

it.each(LAYERS_COUNTS)(
  "Update layer only changes selected layer",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        result.current.addLayer(new Layer());
      });
    }

    const NEW_NAME = "A very original layer name";

    const extraLayer = new Layer();
    act(() => {
      result.current.addLayer(extraLayer);
    });
    act(() => {
      result.current.updateLayer(extraLayer.id, (layer) => {
        layer.name = NEW_NAME;
        return layer;
      });
    });

    for (let i = 0; i < layersCount; ++i) {
      expect(result.current.layers[i].name).not.toBe(NEW_NAME);
    }
    expect(result.current.layers[layersCount].name).toBe(NEW_NAME);
  },
);

it.each(LAYERS_COUNTS)(
  "Edit selected layers does not touch non-selected layers",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        result.current.addLayer(new Layer());
      });
    }
    const DUMMY_NAME = "A non default layer name";

    act(() => {
      result.current.editSelectedLayers((layer) => {
        layer.name = DUMMY_NAME;
        return layer;
      });
    });
    for (let i = 0; i < layersCount; ++i) {
      expect(result.current.layers[i].name).not.toBe(DUMMY_NAME);
    }
  },
);

it.each(LAYERS_COUNTS)(
  "Delete selected layers does not touch non-selected layers",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        result.current.addLayer(new Layer());
      });
    }
    act(() => {
      result.current.deleteSelectedLayers();
    });

    expect(result.current.layers.length).toBe(layersCount);
  },
);

it.each(LAYERS_COUNTS)(
  "Delete selected layers removes selected layers",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        const layer = new Layer();
        layer.isSelected = true;
        result.current.addLayer(layer);
      });
    }

    act(() => {
      result.current.deleteSelectedLayers();
    });

    expect(result.current.layers.length).toBe(0);
  },
);

it.each(LAYERS_COUNTS)(
  "Duplicate selected layers does not touch non-selected layers",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        result.current.addLayer(new Layer());
      });
    }
    act(() => {
      result.current.duplicateSelectedLayers();
    });

    expect(result.current.layers.length).toBe(layersCount);
  },
);

it.each(LAYERS_COUNTS)(
  "Duplicate selected layers duplicates all selected layers",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        const layer = new Layer();
        layer.isSelected = true;
        result.current.addLayer(layer);
      });
    }

    act(() => {
      result.current.duplicateSelectedLayers();
    });

    expect(result.current.layers.length).toBe(2 * layersCount);
  },
);

it.each(LAYERS_COUNTS)(
  "Duplicate selected layers preserves ordering",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        const layer = new Layer(`${i}`);
        layer.isSelected = true;
        result.current.addLayer(layer);
      });
    }
    act(() => {
      result.current.duplicateSelectedLayers();
    });

    for (let i = 0; i < result.current.layers.length; i += 2) {
      expect(result.current.layers[i].name).toBe(
        result.current.layers[i + 1].name,
      );
    }
  },
);

it.each(LAYERS_COUNTS)(
  "Duplicate selected layers gives new layer new id",
  (layersCount) => {
    const { result } = renderLayersState();
    for (let i = 0; i < layersCount; ++i) {
      act(() => {
        const layer = new Layer();
        layer.isSelected = true;
        result.current.addLayer(layer);
      });
    }

    act(() => {
      result.current.duplicateSelectedLayers();
    });

    for (let i = 0; i < layersCount; i += 2) {
      expect(result.current.layers[i].id).not.toBe(
        result.current.layers[i + 1].id,
      );
    }
  },
);
