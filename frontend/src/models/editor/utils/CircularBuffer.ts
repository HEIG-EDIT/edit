export class CircularBuffer<T> {
  private elements: Array<T>;
  /// The actual length of the buffer, including the overwritten elements
  private _length;

  /// Get the lowest index still stored in the buffer.
  /// Returns -1 if the buffer is empty.
  public getStartIndex = () => {
    if (this._length === 0) {
      return -1;
    }
    return Math.max(this._length - this.elements.length, 0);
  };

  /// Add a new element to the buffer, potentially overriding old values.
  /// @param element The element to add
  public push = (element: T) => {
    this.elements[this._length % this.elements.length] = element;
    this._length++;
  };

  public set = (index: number, value: T) => {
    if (index > this._length) {
      throw new RangeError("Cannot set value for out of bounds index");
    }
    if (index == this._length) {
      return this.push(value);
    }

    this.elements[index % this.elements.length] = value;
  };

  public get = (index: number) => {
    if (
      this._length === 0 ||
      index < this.getStartIndex() ||
      index >= this._length
    ) {
      throw new RangeError(`The requested index ${index} is out of bounds`);
    }

    return this.elements[index % this.elements.length];
  };

  public getCopy = () => {
    const result = new CircularBuffer<T>(this.elements.length);
    result._length = this._length;

    for (let i = 0; i < this.elements.length; ++i) {
      result.elements[i] = this.elements[i];
    }

    return result;
  };

  public get length() {
    return this._length;
  }

  constructor(capacity: number, initialValues: T[] = []) {
    if (capacity <= 0) {
      throw new RangeError("The buffer capacity must be > 0");
    }
    if (initialValues.length > capacity) {
      throw new RangeError(
        `Cannot initialize buffer of size ${capacity} with ${initialValues.length} values.`,
      );
    }

    this.elements = new Array<T>(capacity);
    this._length = 0;

    for (const value of initialValues) {
      this.push(value);
    }
  }
}
