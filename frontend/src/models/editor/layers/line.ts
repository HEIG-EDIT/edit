// Matches Konva's way of storing points: x coordinates on even indices, and y
// on odd indices.
type Points = Array<number>;

/// Line drawn free-hand with the paint brush or eraser tool. Layers have a list of these.
export interface Line {
  points: Points;
  /// Hex color string
  color: string;
  width: number;
  /// "source-over" for paint brush, "destination-out" for eraser
  tool: GlobalCompositeOperation;
}
