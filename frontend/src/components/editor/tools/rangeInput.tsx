import { Fragment } from "react";

export interface RangeInputProps {
  property: string;
  value: number;
  onChange: (value: number) => void;
}

export const RangeInput = ({ property, value, onChange }: RangeInputProps) => {
  return (
    <Fragment>
      <p className="text-violet-50">
        {property} :<br></br>
      </p>
      <input
        className="accent-violet-200"
        type="range"
        min="1"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Fragment>
  );
};
