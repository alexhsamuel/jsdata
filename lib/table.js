'use strict'

const _             = require('underscore')
const assert        = require('assert')

const format        = require('./format.js')
const makeKey       = require('./key.js').makeKey
const permutation   = require('./permutation.js')
const Series        = require('./series.js').Series
const summarize     = require('./summarize.js')
const typed_array   = require('./typed-array.js')

//------------------------------------------------------------------------------

const FORMAT = format.formatter(8, 6)

class Table {
  constructor(key, columns) {
    const len = key.length
    this.key = key
    this.columns = _.mapObject(columns, a => typed_array.convert(a))

    // Create the 'cols' proxy member with getters for the cols as Series.
    this.cols = {}
    Object.entries(this.columns).forEach(([name, arr]) =>
      Object.defineProperty(this.cols, name, {
        enumerable: true,
        get: () => new Series(this.key, arr)
      })
    )
  }

  get length() { return this.key.length }
  get names() { return _.keys(this.columns) }
  get arrays() { return _.values(this.columns) }

  getAt(idx) {
    return _.mapObject(this.columns, a => a[idx])
  }

  get(...label) {
    return this.getAt(this.key.get(...label))
  }

  // FIXME: Do better with formatters.
  toString(labelFmt=FORMAT, fmts=null) {
    const lines = []
    const keySep = ' | '
    if (fmts === null)
      fmts = _.values(this.columns).map(format.guess)

    // Header.
    lines.push(
      format.palide('key', labelFmt.width) + keySep
      + this.names.map((n, i) => format.palide(n, fmts[i].width)).join(' '))
    // Underline
    lines.push(
      '='.repeat(labelFmt.width) + keySep
      + fmts.map(f => '-'.repeat(f.width)).join(' '))

    const arrays = _.values(this.columns)
    for (let i = 0; i < this.length; ++i)
      lines.push(
        labelFmt(this.key.getAt(i)) + keySep
        + arrays.map((a, c) => fmts[c](a[i])).join(' '))

    lines.push('')
    return lines.join('\n')
  }

}

function makeTable(labels, cols) {
  const length = permutation.lengthMulti(_.values(cols))
  const [key, order] = makeKey(labels, length)
  if (order !== null) {
    const sort = _.bind(permutation.permute, order)
    cols = _.mapObject(cols, sort)
  }
  return new Table(key, cols)
}

//------------------------------------------------------------------------------

module.exports = {
  Table,
  makeTable,
}

