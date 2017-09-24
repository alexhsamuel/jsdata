(function () {
  'use strict'

  const _ = require('underscore')
  const assert = require('assert')
  const binary_search = require('binary-search')

  const format = require('data/format')
  const permutation = require('data/permutation')
  const summarize = require('data/summarize')

  const FORMAT = format.formatter(8, 6)

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

    get(label) {
      const idx = binary_search(this.labels, label, permutation.cmp)
      assert(idx >= 0)  // FIXME: Throw.
      return idx
    }

    getAt(idx) {
      return this.labels[idx]
    }
  }

  class IndexKey {
    constructor(length) {
      this.length_ = length
    }

    get length() { return this.length_ }

    get(label) {
      const idx = +label
      assert(Number.isInteger(idx))  // FIXME: Throw.
      assert(0 <= idx && idx < this.length)
      return label
    }

    getAt(idx) {
      return idx
    }
  }

  class Series {
    constructor(labels, values) {
      assert.equal(labels.length, values.length)
      this.labels = labels
      this.values = values
    }

    get(label) {
      const idx = this.labels.get(label)
      return this.values[idx]
    }

    get length() { return this.values.length }

    // FIXME: Is this reasonable?
    get key() { return this.labels instanceof Key ? this.labels : undefined }

    get summary() { return summarize(this.values) }

    toString(labelFmt=FORMAT, fmt=FORMAT) {
      const lines = []

      // Header.
      lines.push(
          format.palide('key', labelFmt.width) + ' '
        + format.palide('value', fmt.width))
      // Underline.
      lines.push('\u2501'.repeat(labelFmt.width) + '\u252d' + '\u2500'.repeat(fmt.width))

      for (let i = 0; i < this.length; ++i)
        lines.push(
          labelFmt(this.labels.getAt(i)) + '\u2502' + fmt(this.values[i]))

      lines.push('')
      return lines.join('\n')
    }

  }

  function makeSeries(labels, values) {
    assert.equal(labels.length, values.length)
    let sort
    [labels, sort] = permutation.sort(labels)
    values = permutation.permute(sort, values)
    return new Series(new Key(labels), values)
  }

  class Table {
    constructor(labels, columns) {
      const len = labels.length
      this.labels = labels
      this.columns = columns

      this.cols = {}
      for (let [name, arr] of columns)
        if (name)
          Object.defineProperty(
            this.cols, name, {
              enumerable: true,
              get: () => new Series(this.labels, arr)
            })
        else
          console.warn('empty name')  // FIXME
    }

    get length() { return this.labels.length }
    get names() { return this.columns.map(([n, _]) => n) }
    get arrays() { return this.columns.map(([_, a]) => a) }

    // FIXME: Do better with formatters.
    toString(labelFmt=FORMAT, fmts=null) {
      const lines = []
      const keySep = ' | '
      if (fmts === null)
        fmts = this.arrays.map(format.guess)

      // Header.
      lines.push(
        format.palide('key', labelFmt.width) + keySep
        + this.names.map((n, i) => format.palide(n, fmts[i].width)).join(' '))
      // Underline
      lines.push(
        '='.repeat(labelFmt.width) + keySep
        + this.names.map((n, i) => '-'.repeat(fmts[i].width)).join(' '))

      for (let i = 0; i < this.length; ++i)
        lines.push(
          labelFmt(this.labels.getAt(i)) + keySep
          + this.arrays.map((a, c) => fmts[c](a[i])).join(' '))

      lines.push('')
      return lines.join('\n')
    }

  }


  module.exports = {
    IndexKey,
    Key,
    Series,
    Table,
    makeSeries,
  }

}).call(this)
