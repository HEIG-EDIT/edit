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

/// The attributes that are saved on disk for the JSON export of projects.
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

/// The configuration of the filters applied to the layer. These are set
/// by the "adjust" tool
export class FiltersConfig {
  gaussianBlur: GaussianBlurConfiguration = GaussianBlur.initialConfiguration;
  colorAndTone: ColorAndToneConfiguration = ColorAndTone.initialConfiguration;
  pixelate: PixelateConfiguration = Pixelate.initialConfiguration;
  threshold: ThresholdConfiguration = Threshold.initialConfiguration;
}

export class Layer {
  name: string;
  id: LayerId; // UUID
  /// Attribute allowing pixel-level manipulation of images
  imageData: ImageData | null = null;
  image: HTMLImageElement;
  /// Whether or not the layer is selected, i.e. whether or not modifications
  /// applided by tools are applied to the layer.
  isSelected: boolean = false;

  /// Ref to the underlying Konva component, enables manipulation through the
  /// "regular" Konva API instead of the "react-konva" API.
  groupRef: RefObject<Konva.Group | null>;

  /// If false, the layer is hidden on the canvas
  isVisible: boolean = true;
  /// The current position of the layer relative to the canvas, (0, 0) represents the top left.
  position: Vector2d = {
    x: 0,
    y: 0,
  };
  /// The position of the layer relative to the canvas at the start of a dragging operation
  /// (i.e. moving the layer on the canvas)
  positionBeforeDrag: Vector2d = {
    x: 0,
    y: 0,
  };
  /// The scale of the layer on both axis, used when resizing the layers
  scale: Vector2d = {
    x: 1,
    y: 1,
  };
  /// The rotation in degrees of the layer
  rotation: number = 0;

  /// The lines drawn free-hand with the paint brush tool, or the eraser tool
  lines: Array<Line> = [];
  /// The filters applied to the layer with the adjust tool.
  filters: Array<Filter> = [];
  filtersConfig: FiltersConfig = new FiltersConfig();

  /// The size of the layer's image
  size: Vector2d;

  /// Counter to give unique names to empty layers
  static emptyLayerCounter: number = 0;

  /// Deep copy of a layer, used with the duplication button. Note that this funciton
  /// gives the resulting layer a new ID which is mandatory as layers cannot have
  /// duplicated IDs.
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

  /// Create a Layer from one read from a serailized JSON project.
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

  /// Constructor used to add new layers.
  /// @param name The name of the layer, used only when creating from an image
  /// @param image The initial layer image read from the user's disk
  /// @param width The width of a new empty layer
  /// @param height The height of a new empty layer
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

/// Callback type used for layer updates within React, usually taking the previous
/// layer object as an argument and returning the updated layer.
export type LayerUpdateCallback = (layer: Layer) => Layer;
