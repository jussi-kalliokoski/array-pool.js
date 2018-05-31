// @flow

/**
 * ArrayPool is a class for pooling and reusing array capacity.
 *
 * @param poolSize The number of arrays to initially allocate.
 * @param initialSize The size of the arrays to allocate. The value will grow dynamically when the pool detects that the capacity is overflown.
 */
module.exports = class ArrayPool /*::<T>*/ {
  /*::
  _poolSize : number
  _initialSize : number
  _arrays : Array<Array<T>>
  */
  constructor(poolSize /*: number */ = 0, initialSize /*: number */ = 0) {
    this._poolSize = 0;
    this._initialSize = initialSize;
    this._arrays = /*::(*/ [] /*: Array<Array<T>> */ /*::)*/;

    for (let i = 0; i < poolSize; i++) {
      this._arrays.push(this._create());
    }
  }

  /**
   * Gets an array from the pool.
   */
  get() /*: Array<T> */ {
    if (this._arrays.length > 0) {
      return this._arrays.pop();
    }

    return this._create();
  }

  /**
   * Releases an array back to the pool. IMPORTANT: The array can no longer be safely used after this.
   *
   * @param array The array to release.
   */
  release(array /*: Array<T> */) {
    if (this._initialSize < array.length) {
      this._initialSize = array.length;
    }

    array.length = 0;
    this._arrays.push(array);
  }

  /**
   * Returns the number of arrays allocated into the pool.
   */
  size() /*: number */ {
    return this._poolSize;
  }

  _create() /*: Array<T> */ {
    this._poolSize++;
    const array = new Array(this._initialSize);
    array.length = 0;
    return /*::(*/ array /*: Array<T> */ /*::)*/;
  }
};
