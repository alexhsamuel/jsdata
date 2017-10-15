import assert from 'assert'
import _ from 'underscore'

import { makeKey } from './key.mjs'
import * as format from './format.mjs'
import * as permutation from './permutation.mjs'
import * as typed_array from './typed_array.mjs'

export class Series {
  constructor(key, values) {
    assert.equal(key.length, values.length)
    this.key = key
    this.values = typed_array.convert(values)
  }

  get(...label) {
    const idx = this.key.get(...label)
    return this.values[idx]
  }

  getAt(idx) {
    return this.values[idx]
  }

  get length() { return this.values.length }
  get summary() { return summarize(this.values) }

  toString() {
    const keyFmt = this.key.getFormat()
    const valFmt = format.guess(this.values)
    const lines = []

    // Header.
    lines.push(
        format.palide('key', keyFmt.width) + '   '
      + format.palide('value', valFmt.width))
    // Underline.
    lines.push('\u2501'.repeat(keyFmt.width)
      + '\u2501\u252d\u2500' + '\u2500'.repeat(valFmt.width))

    for (let i = 0; i < this.length; ++i)
      lines.push(
        keyFmt(this.key.getAt(i)) + ' \u2502 ' + valFmt(this.values[i]))

    lines.push('')
    return lines.join('\n')
  }

}

export function makeSeries(labels, values) {
  let [key, sort] = makeKey(labels, values.length)
  if (sort !== null)
    values = permutation.permute(sort, values)
  return new Series(key, values)
}
