import assert from 'assert'

import summarize from './summarize.mjs'
import * as typed_array from './typed_array.mjs'

function maxStringLength(arr) {
  let max = 0
  for (let i = 0; i < arr.length; ++i) {
    const len = (arr[i] || '').toString().length
    if (len > max) max = len
  }
  return max
}

function getNumDigits(value) {
  assert(value >= 0)
  return value === 0 ? 1
    : Math.max(Math.floor(Math.log10(value) + 1), 1)
}

function getWidth(min, max) {
  return getNumDigits(Math.trunc(Math.max(Math.abs(min), Math.abs(max))))
}

/**
 * Computes the max fractional decimal precision for floating point numbers.
 *
 * Returns the number of decimal digits required to render the significant
 * fractional part of all finite values in `arr`, without trailing zero
 * digits.
 */
function getPrecision(arr) {
  assert(typed_array.isFloatArray(arr))

  const len = arr.length
  let prec = 0
  let scale = 1
  const precMax = arr instanceof Float32Array ? 8 : 16
  const eps = 2 * (arr instanceof Float32Array ? 5.96e-8 : 1.1e-16)

  for (let i = 0; i < len; ++i) {
    const val = arr[i]
    if (val !== 0 && Number.isFinite(val))
      while (prec < precMax) {
        const scaled = Math.abs(val) * scale
        let diff = scaled - Math.trunc(scaled)
        if (diff > 0.5) diff = 1 - diff
        if (diff / scaled < eps) break
        else {
          prec = prec + 1
          scale = scale * 10
        }
      }
  }
  return prec
}

export function pad(string, width, pad=' ', position=1) {
  string = string || ''
  assert(0 <= position && position <= 1)
  if (string.length < width) {
    const total = width - string.length
    const left = Math.round((1 - position) * total)
    return pad.repeat(left) + string + pad.repeat(total - left)
  }
  else return string
}

export function elide(string, width, ellipsis='\u2026', position=1) {
  const len = string.length
  if (len <= width) return string
  else {
    const keep = width - ellipsis.length
    const left = Math.round(position * keep)
    return string.slice(0, left) + ellipsis + string.slice(len - keep + left)
  }
}

export function palide(string, width, ellipsis='\u2026', pad=' ', elidePosition=1, padPosition=1) {
  string = string || ''
  return (
      string.length < width ? this.pad(string, width, pad, padPosition)
    : string.length > width ? this.elide(string, width, ellipsis, elidePosition)
    : string
  )
}

export function formatter(width, precision=null) {
  const len = precision === null ? width : width + precision + 1
  const fmt = num => {
    if (Number.isFinite(num)) {
      if (precision !== null)
        num = num.toFixed(precision)
      num = num.toString()
      const point = num.lastIndexOf('.')
      if (num.length < len) num = ' '.repeat(len - num.length) + num
      return num
    }
    else if (num) {
      const ret = num.toString()
      return ret + ' '.repeat(Math.max(0, len - ret.length))
    }
    else
      return ' '.repeat(len)
  }
  fmt.width = len
  return fmt
}

export function guess(arr) {
  const summary = summarize(arr)

  if (typed_array.isNumberArray(arr)) {
    const sign = summary.min < 0 ? 1 : 0
    const width = getWidth(summary.min, summary.max)
    const prec = typed_array.isFloatArray(arr) ? getPrecision(arr) : undefined
    return formatter(sign + width, prec)
  }
  else return formatter(summary.maxLength)
}
