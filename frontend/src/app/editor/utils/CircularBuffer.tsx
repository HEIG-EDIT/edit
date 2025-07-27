class CircularStack<T> {
    buffer: Array<T>
    startIndex: number
    topIndex: number

    constructor(size: number) {
        this.buffer = new Array<T>(size)
        this.startIndex = 0
        this.topIndex = 0
    }

    private hasIndex(index: number) {
        return (
            index < this.startIndex ||
            index >= this.startIndex + this.buffer.length
        )
    }

    set(index: number, value: T) {
        if (!this.hasIndex(index)) {
            return
        }

        this.buffer[index] = value
    }

    get(index: number): T | undefined {
        if (!this.hasIndex(index)) {
            return undefined
        }

        return this.buffer[index - this.startIndex]
    }

    push(value: T) {}
}
