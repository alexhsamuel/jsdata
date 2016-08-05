(function () {
  const assert = require('assert')
  const binary_search = require('binary-search')

  const permutation = require('./permutation.js')

  // FIXME
  function formatter(width, precision) {
    const pad = ' '.repeat(width.length)
    const len = width.length + precision.length + 1
    return num => (pad + num.toFixed(precision)).slice(-len)
  }
  const FORMAT = formatter(4, 6)

  /**
   * A set of labels consisting of a sorted unique array of values.
   */
  class Key {
    constructor(labels) {
      assert(permutation.isSorted(labels))
      assert(permutation.isUnique(labels))
      this.labels = labels
    }

    get length() { return this.labels.length }

    call(label) {
      const idx = binarySearch(this.labels, label, permutation.cmp)
      assert(idx >= 0)  // FIXME: Throw.
      return idx
    }

    get(label) { return call(label) }

    getAt(idx) {
      return this.labels[idx]
    }
  }

  class Series {
    constructor(labels, values) {
      assert.equal(labels.length, values.length)
      this.labels = labels
      this.values = values
    }

    call(label) {
      const idx = this.labels.call(label)
      return this.values(idx)
    }

    get length() { return this.values.length }

    toString(labelFmt=FORMAT, fmt=FORMAT) {
      const lines = []
      for (let i = 0; i < this.length; ++i)
        lines.push(
          labelFmt(this.labels.getAt(i)) + ' | ' + fmt(this.values[i]))
      return lines.join('\n')
    }

  }

  module.exports = {
    Key,
    Series,

    makeSeries(labels, values) {
      assert.equal(labels.length, values.length)
      let sort
      [labels, sort] = permutation.sort(labels)
      values = permutation.permute(sort, values)
      return new Series(new Key(labels), values)
    },

  }

}).call(this)
