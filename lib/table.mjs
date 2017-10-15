import _ from 'underscore'
import assert from 'assert'

import * as format from './format.mjs'
import { makeKey } from './key.mjs'
import * as permutation from './permutation.mjs'
import { Series } from './series.mjs'
import * as summarize from './summarize.mjs'

const FORMAT = format.formatter(8, 6)

export class Table {
  constructor(key, columns) {
    const len = key.length
    this.key = key
    this.columns = columns

    // Create the 'cols' proxy member with getters for the cols as Series.
    this.cols = {}
    Object.entries(columns).forEach(([name, arr]) =>
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
        labelFmt(this.key.getAt(i)) + keySep
        + this.arrays.map((a, c) => fmts[c](a[i])).join(' '))

    lines.push('')
    return lines.join('\n')
  }

}

export function makeTable(labels, cols) {
  const length = permutation.lengthMulti(_.values(cols))
  const [key, order] = makeKey(labels, length)
  if (order !== null) {
    const sort = _.bind(permutation.permute, order)
    cols = _.mapObject(cols, sort)
  }
  return new Table(key, cols)
}
