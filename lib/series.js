'use strict'

const _             = require('underscore')
const assert        = require('assert')

const align         = require('./align.js')
const makeKey       = require('./key.js').makeKey
const format        = require('./format.js')
const permutation   = require('./permutation.js')
const typed_array   = require('./typed-array.js')

//------------------------------------------------------------------------------

class Series {
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

function makeSeries(labels, values) {
  let [key, sort] = makeKey(labels, values.length)
  if (sort !== null)
    values = permutation.permute(sort, values)
  return new Series(key, values)
}

function joinLeft(keyed, ser, def) {
  const lkey = keyed.key
  const rkey = ser.key
  const algn = align.leftAlign(lkey.labels, rkey.labels)
  return new Series(lkey, align.take(ser.values, algn, def))
}

//------------------------------------------------------------------------------

module.exports = {
  Series,
  makeSeries,
  joinLeft,
}

