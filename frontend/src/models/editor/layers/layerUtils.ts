import { Vector2d } from "konva/lib/types";

// Subtract two 2-dimensional vectors
export function v2Sub(first: Vector2d, second: Vector2d) {
  return {
    x: first.x - second.x,
    y: first.y - second.y,
  };
}

// Add two 2-dimensional vectors
export function v2Add(first: Vector2d, second: Vector2d) {
  return {
    x: first.x + second.x,
    y: first.y + second.y,
  };
}
