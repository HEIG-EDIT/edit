import KonvaEventObject from "konva";

// Left click
export const PRIMARY_MOUSE_BUTTON = 0;

// Middle click
export const CANVAS_DRAG_MOUSE_BUTTON = 1;

export type KonvaMouseEvent = KonvaEventObject.KonvaEventObject<MouseEvent>;
export type KonvaScrollEvent = KonvaEventObject.KonvaEventObject<WheelEvent>;


