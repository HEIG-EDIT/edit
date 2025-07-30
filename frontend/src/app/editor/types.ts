type Point = Array<number>;

export interface Line {
  points: Array<Point>;
  color: string;
  width: number;
  tool: string | null;
}
