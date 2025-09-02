import { Vector2d } from "konva/lib/types";
import { createRef, RefObject } from "react";
import { Line } from "./line";
import Konva from "konva";
import { Filter } from "konva/lib/Node";
import {
  ColorAndTone,
  ColorAndToneConfiguration,
  GaussianBlur,
  GaussianBlurConfiguration,
  Pixelate,
  PixelateConfiguration,
  Threshold,
  ThresholdConfiguration,
} from "@/components/editor/tools/adjust";

export type LayerId = string;

export interface SerializedLayer {
  id: LayerId;
  name: string;
  isVisible: boolean;
  isSelected: boolean;
  imageURL: string;
  position: Vector2d;
  scale: Vector2d;
  rotation: number;
  size: Vector2d;
}

export class FiltersConfig {
  gaussianBlur: GaussianBlurConfiguration = GaussianBlur.initialConfiguration;
  colorAndTone: ColorAndToneConfiguration = ColorAndTone.initialConfiguration;
  pixelate: PixelateConfiguration = Pixelate.initialConfiguration;
  threshold: ThresholdConfiguration = Threshold.initialConfiguration;
}

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
  filters: Array<Filter> = [];
  filtersConfig: FiltersConfig = new FiltersConfig();

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

  static async fromSerialized(serialized: SerializedLayer): Promise<Layer> {
    const {
      id,
      name,
      isVisible,
      isSelected,
      imageURL,
      position,
      scale,
      rotation,
      size,
    } = serialized;

    return new Promise<Layer>((resolve) => {
      const image = new Image();
      image.src = imageURL;

      image.onload = () => {
        let layer = new Layer(name, image);
        layer = {
          ...layer,
          id,
          isVisible,
          isSelected,
          position,
          scale,
          rotation,
          size,
        };
        resolve(layer);
      };
    });
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
