// Matches Konva's way of storing points: x coordinates on even indices, and y
// on odd indices.
type Points = Array<number>;

export interface Line {
  points: Points;
  color: string;
  width: number;
  tool: GlobalCompositeOperation;
}
