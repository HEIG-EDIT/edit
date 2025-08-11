import "@testing-library/jest-dom";
import { CircularBuffer } from "@/components/editor/utils/CircularBuffer";

test("Size of < 0 throws", () => {
  expect(() => {
    new CircularBuffer(-42);
  }).toThrow(RangeError);
});

test("Size of 0 throws", () => {
  expect(() => {
    new CircularBuffer(0);
  }).toThrow(RangeError);
});

const bufferSizes = [1, 5, 10000];

it.each<number>(bufferSizes)(
  "Empty buffer of size %i has -1 start index",
  (bufferSize) => {
    const buffer = new CircularBuffer(bufferSize);
    expect(buffer.getStartIndex()).toBe(-1);
  },
);

it.each<number>(bufferSizes)(
  "getCopy buffer of size %i returns new object",
  (bufferSize) => {
    const originalBuffer = new CircularBuffer(bufferSize);
    const copiedBuffer = originalBuffer.getCopy();

    expect(copiedBuffer).not.toBe(originalBuffer);
  },
);

it.each<number>(bufferSizes)(
  "1 element in buffer of size %i gives startIndex of 0",
  (bufferSize) => {
    const buffer = new CircularBuffer(bufferSize);
    buffer.push(1);

    expect(buffer.getStartIndex()).toBe(0);
  },
);

it.each<number>(bufferSizes)(
  "Exceeding capacity on buffer of size %i changes the startIndex",
  (bufferSize) => {
    const buffer = new CircularBuffer(bufferSize);
    for (let i = 0; i <= bufferSize; ++i) {
      buffer.push(true);
    }

    expect(buffer.getStartIndex()).toBe(1);
  },
);

const indices = [0, 1, 100];
const invalidIndices = [-1, -100, -100000];

const bufferSizesAndIndices = bufferSizes.flatMap((size) => {
  return [...indices, ...invalidIndices].map((i) => {
    return {
      size: size,
      index: i,
    };
  });
});

it.each(bufferSizesAndIndices)(
  "get index $index on empty buffer of size $size throws",
  ({ size, index }) => {
    const buffer = new CircularBuffer(size);

    expect(() => {
      buffer.get(index);
    }).toThrow(RangeError);
  },
);

const bufferSizesAndInvalidIndices = bufferSizes.flatMap((size) => {
  return invalidIndices.map((i) => {
    return {
      size: size,
      index: i,
    };
  });
});

it.each(bufferSizesAndInvalidIndices)(
  "get invalid index $index throws on full buffer of size $size",
  ({ size, index }) => {
    const buffer = new CircularBuffer(size);
    for (let i = 0; i < size; ++i) {
      buffer.push(true);
    }

    expect(() => {
      buffer.get(index);
    }).toThrow(RangeError);
  },
);

it.each(bufferSizes)(
  "get on buffer of size %i returns previously pushed values",
  (bufferSize) => {
    const buffer = new CircularBuffer(bufferSize);
    for (let i = 0; i < bufferSize; ++i) {
      buffer.push(i);
    }

    for (let i = 0; i < bufferSize; ++i) {
      expect(buffer.get(i)).toBe(i);
    }
  },
);
