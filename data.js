(function () {
  const assert = require('assert')
  const binary_search = require('binary-search')

  const permutation = require('./permutation.js')

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
      assert(permutation.isSorted(arr))
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
      [keyArr, sort] = permutation.sort(keyArr)
      arr = permutation.permute(sort, arr)
      return new Series(new Key(keyArr), arr)
    }
  }

  module.exports = {
    Key: Key,
    Series: Series
  }

}).call(this)

