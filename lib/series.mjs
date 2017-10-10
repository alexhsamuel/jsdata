import assert from 'assert'

import { Key, IndexKey } from './key.mjs'
import * as format from './format.mjs'
import * as permutation from './permutation.mjs'

export class Series {
  constructor(key, values) {
    assert.equal(key.length, values.length)
    this.key = key
    this.values = values
  }

  get(label) {
    const idx = this.key.get(label)
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
  if (labels === null) {
    return new Series(new IndexKey(values.length), values)
  }
  else {
    assert.equal(labels.length, values.length)
    let sort
    [labels, sort] = permutation.sort(labels)
    values = permutation.permute(sort, values)
    return new Series(new Key(labels), values)
  }
}
