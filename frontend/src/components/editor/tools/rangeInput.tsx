import { Fragment } from "react";

export interface RangeInputProps {
  property: string;
  value: number;
  onChange: (value: number) => void;
  // Array of size 2 like [min, max]
  range?: number[];
  step?: number;
}

export const RangeInput = ({ property, value, onChange, range, step }: RangeInputProps) => {
  range = range || [1, 100];
  step = step || 1;
  return (
    <Fragment>
      <p className="text-violet-50">
        {property}:<br></br>
      </p>
      <input
        className="accent-violet-500"
        type="range"
        min={range[0]}
        max={range[1]}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className="text-violet-50"> {value}</span>
    </Fragment>
  );
};
