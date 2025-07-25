import { Stage, Layer, Text, Rect, Circle } from "react-konva";

export const Canvas = () => {
  return (
    <Stage width={window.innerWidth} height={window.innerHeight}>
      <Layer>
        <Text text="Try to drag shapes" fontSize={15} />
        <Rect
          x={20}
          y={50}
          width={100}
          height={100}
          fill="red"
          shadowBlur={10}
          draggable
        />
        <Circle x={200} y={100} radius={50} fill="green" draggable />
      </Layer>
    </Stage>
  );
};
