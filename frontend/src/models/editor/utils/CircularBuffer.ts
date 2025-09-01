/// Generic circular buffer of fixed configurable size.
export class CircularBuffer<T> {
  /// Buffer holding the elements
  private elements: Array<T>;
  /// The actual length of the buffer, including the overwritten elements
  private _length;

  /// Get the lowest index still stored in the buffer.
  /// @returns -1 if the buffer is empty, or the lowest accessible index otherwise.
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

  /// Set the value at a given index
  /// @param index The index in the circular buffer at which the value should be set
  /// @param value The new value to store at the index.
  public set = (index: number, value: T) => {
    if (index > this._length) {
      throw new RangeError("Cannot set value for out of bounds index");
    }
    if (index == this._length) {
      return this.push(value);
    }

    this.elements[index % this.elements.length] = value;
  };

  /// Get the value at a given index
  /// @param index The index for which to get the value
  /// @returns The value at the given index
  /// @throws RangeError if the given index is out of the buffer's bounds
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

  /// Get a shallow copy of the buffer
  /// @returns The copied buffer
  public getCopy = () => {
    const result = new CircularBuffer<T>(this.elements.length);
    result._length = this._length;

    for (let i = 0; i < this.elements.length; ++i) {
      result.elements[i] = this.elements[i];
    }

    return result;
  };

  /// Getter for the total length of the buffer, including overwritten elements.
  public get length() {
    return this._length;
  }

  /// Create a new buffer with a set capacity.
  /// @param capacity The maximum number of elements that can be held by the buffer
  ///                 simultaneously. Must be greater than 0.
  /// @param initialValues The initial state of the buffer, default is an empty array
  /// @throws RangeError If the capacity is <= 0 or if the initialValues cannot be held by the buffer
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
