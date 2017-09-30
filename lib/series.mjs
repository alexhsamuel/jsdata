import assert from 'assert'

import { Key } from './key.mjs'
import * as permutation from './permutation.mjs'

export class Series {
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

export function makeSeries(labels, values) {
  assert.equal(labels.length, values.length)
  let sort
  [labels, sort] = permutation.sort(labels)
  values = permutation.permute(sort, values)
  return new Series(new Key(labels), values)
}
