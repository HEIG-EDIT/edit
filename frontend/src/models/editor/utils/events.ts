import KonvaEventObject from "konva";

// Left click
export const PRIMARY_MOUSE_BUTTON = 0;

// Middle click
export const CANVAS_DRAG_MOUSE_BUTTON = 1;

export type KonvaMouseEvent = KonvaEventObject.KonvaEventObject<MouseEvent>;
export type KonvaScrollEvent = KonvaEventObject.KonvaEventObject<WheelEvent>;

export const MOUSE_DOWN = "mouseDown"
export const MOUSE_MOVE = "mouseMove"
export const MOUSE_UP = "mouseUp"

export type EventType = typeof MOUSE_DOWN | typeof MOUSE_MOVE | typeof MOUSE_UP;
