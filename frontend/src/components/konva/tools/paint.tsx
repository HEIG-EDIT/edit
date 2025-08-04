// use https://casesandberg.github.io/react-color/

"use client";

import { useState } from "react";
import { Tool } from "../../../app/konva/page";

import { SliderPicker } from "react-color";

const PaintToolConfiguration = () => {
  const [radius, setRadius] = useState<number>(10);
  const [color, setColor] = useState<string>("#FF00FFFF");
  return (
    <div>
      <label htmlFor="radius" className="font-bold">
        Radius:<br></br>
      </label>
      <input
        type="range"
        id="radius"
        name="radius"
        min="1"
        max="100"
        value={radius}
        onChange={(e) => setRadius(Number(e.target.value))}
      />
      <span>{radius}</span>
      <SliderPicker
        color={color}
        onChangeComplete={(color) => setColor(color)}
      />
    </div>
  );
};

export const PaintTool: Tool = {
  name: "paint",
  iconPath: "/editor/toolbar/paint.svg",
  configurationComponent: <PaintToolConfiguration />,
};
