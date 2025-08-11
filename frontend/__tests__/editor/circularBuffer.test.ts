import "@testing-library/jest-dom";
import { CircularBuffer } from "@/components/editor/utils/CircularBuffer";

const bufferSizes = [1, 5, 10000];

test("Size of < 0 gives error", () => {
  expect(() => {
    new CircularBuffer(-42);
  }).toThrow(RangeError);
});

test("Size of 0 gives error", () => {
  expect(() => {
    new CircularBuffer(0);
  }).toThrow(RangeError);
});

it.each<number>(bufferSizes)(
  "Empty buffer has -1 start index",
  (bufferSize) => {
    const buffer = new CircularBuffer(bufferSize);
    expect(buffer.getStartIndex()).toBe(-1);
  },
);

it.each<number>(bufferSizes)("getCopy returns new object", (bufferSize) => {
  const originalBuffer = new CircularBuffer(bufferSize);
  const copiedBuffer = originalBuffer.getCopy();

  expect(copiedBuffer).not.toBe(originalBuffer);
});

it.each<number>(bufferSizes)(
  "1 element in buffer gives startIndex of 0",
  (bufferSize) => {
    const buffer = new CircularBuffer(bufferSize);
    buffer.push(1);

    expect(buffer.getStartIndex()).toBe(0);
  },
);

it.each<number>(bufferSizes)(
  "Exceeding capacity changes the startIndex",
  (bufferSize) => {
    const buffer = new CircularBuffer(bufferSize);
    for (let i = 0; i <= bufferSize; ++i) {
      buffer.push(true);
    }

    expect(buffer.getStartIndex()).toBe(1);
  },
);
