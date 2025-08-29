import { Vector2d } from "konva/lib/types";
import { createRef, RefObject } from "react";
import { Line } from "./line";
import Konva from "konva";

export type LayerId = string;

export class Layer {
  name: string;
  id: LayerId; // UUID
  imageData: ImageData | null = null;
  image: HTMLImageElement;
  isSelected: boolean = false;

  // Refs to the underlying Konva components
  groupRef: RefObject<Konva.Group | null>;

  isVisible: boolean = true;
  position: Vector2d = {
    x: 0,
    y: 0,
  };
  positionBeforeDrag: Vector2d = {
    x: 0,
    y: 0,
  };
  scale: Vector2d = {
    x: 1,
    y: 1,
  };
  rotation: number = 0;
  lines: Array<Line> = []; // Lines drawn free-hand on a Layer

  size: Vector2d;

  static emptyLayerCounter: number = 0;

  static duplicate(other: Layer): Layer {
    const result = new Layer(
      other.name,
      other.image.cloneNode() as HTMLImageElement,
    );

    result.isVisible = other.isVisible;

    result.position = { ...other.position };
    result.scale = { ...other.scale };
    result.rotation = other.rotation;
    result.lines = [...other.lines];

    return result;
  }

  constructor(
    name: string | null = null,
    image: HTMLImageElement | null = null,
    width: number = 0,
    height: number = 0,
  ) {
    this.id = crypto.randomUUID();
    this.groupRef = createRef();

    if (name) {
      this.name = name;
    } else {
      // Layer is empty
      // TODO : demander nom pour layer vide ou ajouter possibilite de pouvoir renommer layer (toutes les layers)
      // TODO : fix car si toutes les layers supprimees et ajout layer vide alors layer vide avec numero x et pas sans numero (compteur pas remis a zero)
      const layerSuffix = Layer.emptyLayerCounter
        ? ` (${Layer.emptyLayerCounter})`
        : "";
      Layer.emptyLayerCounter++;

      this.name = `New layer${layerSuffix}`;
    }

    if (image) {
      this.image = image;
    } else {
      this.image = new Image(width, height);
    }

    this.size = {
      x: this.image.width,
      y: this.image.height,
    };
  }
}

export type LayerUpdateCallback = (layer: Layer) => Layer;
