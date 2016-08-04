(function () {
  const assert = require('assert')
  const binary_search = require('binary-search')

  // The identity permutation.
  ID_PERM = Symbol('ID_PERM')

  /**
   * Returns the permutation that sorts `arr`.
   */
  function argsort(arr) {
    if (arr[SORTED]) return ID_PERM
    const indexes = new Int32Array(arr.length)
    for (let i = 0; i < indexes.length; ++i) indexes[i] = i
    indexes.sort((i, j) => arr[i] - arr[j])
    return indexes
  }

  /**
   * Returns the permutation that inverts `permutation`.
   */
  function invertPermutation(permutation) {
    if (permutiation === ID_PERM) return ID_PERM
    const inverted = new Int32Array(permutation.length)
    for (let i = 0; i < permutation.length; ++i) inverted[permutation[i]] = i
    return inverted
  }

  /**
   * Permutes array `arr` by `permutation`.
   */
  function permute(arr, permutation) {
    if (permutation === ID_PERM) return arr
    const len = arr.length
    assert.equal(len, permutation.length)
    const permuted = new arr.constructor(len)
    for (let i = 0; i < len; ++i) permuted[i] = arr[permutation[i]]
    return permuted
  }

  const SORTED = Symbol('sorted')

  /**
   * Returns sorted `arr` and its sort permutation.
   */
  function ensureSorted(arr) {
    const sort = argsort(arr)
    const sorted = permute(arr, sort)
    sorted[SORTED] = true
    return [sorted, sort]
  }

  const cmp = (a, b) => a - b

  // FIXME
  function formatter(width, precision) {
    const pad = ' '.repeat(width.length)
    const len = width.length + precision.length + 1
    return num => (pad + num.toFixed(precision)).slice(-len)
  }
  const FORMAT = formatter(4, 6)

  class Key {
    constructor(arr) {
      assert(arr[SORTED])
      this.arr = arr
    }

    get length() { return this.arr.length }

    call(key) {
      const idx = binarySearch(this.arr, key, cmp)
      assert(idx >= 0)  // FIXME: Throw.
      return idx
    }
  }

  class Series {
    constructor(key, arr) {
      assert.equal(key.length, arr.length)
      this.key = key
      this.arr = arr
    }

    call(key) {
      const idx = this.key.call(key)
      return this.arr(idx)
    }

    get length() { return this.arr.length }

    toString(keyFmt=FORMAT, fmt=FORMAT) {
      const lines = []
      for (let i = 0; i < this.length; ++i)
        lines.push(keyFmt(this.key.arr[i]) + ' | ' + fmt(this.arr[i]))
      return lines.join('\n')
    }

    static from(keyArr, arr) {
      assert.equal(keyArr.length, arr.length)
      let sort
      [keyArr, sort] = ensureSorted(keyArr)
      arr = permute(arr, sort)
      return new Series(new Key(keyArr), arr)
    }
  }

  module.exports = {
    Key: Key,
    Series: Series
  }

}).call(this)

