export class CircularBuffer<T> {
  private elements: Array<T>;
  /// The actual length of the buffer, including the overwritten elements
  private length;

  /// Get the lowest index still stored in the buffer.
  /// Returns -1 if the buffer is empty.
  public getStartIndex = () => {
    if (this.length === 0) {
      return -1;
    }
    return Math.max(this.length - this.elements.length, 0);
  };

  /// Add a new element to the buffer, potentially overriding old values.
  /// @param element The element to add
  public push = (element: T) => {
    this.elements[this.length % this.elements.length] = element;
    this.length++;
  };

  public get = (index: number) => {
    if (
      this.length === 0 ||
      index < this.getStartIndex() ||
      index >= this.length
    ) {
      throw new RangeError(`The requested index ${index} is out of bounds`);
    }

    return this.elements[index % this.elements.length];
  };

  public getCopy = () => {
    let result = new CircularBuffer<T>(this.elements.length);
    result.length = this.length;

    for (let i = 0; i < this.elements.length; ++i) {
      result.elements[i] = this.elements[i];
    }

    return result;
  };

  constructor(capacity: number) {
    if (capacity <= 0) {
      throw new RangeError("The buffer capacity must be > 0");
    }
    this.elements = new Array<T>(capacity);
    this.length = 0;
  }
}
