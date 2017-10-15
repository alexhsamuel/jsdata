import _ from 'underscore'

export const TypedArray = Object.getPrototypeOf(Int8Array.prototype)

export function isArray(arr) {
  return arr instanceof TypedArray
}

export function isIntArray(arr) {
  return (
       arr instanceof Int8Array  || arr instanceof Uint8Array
    || arr instanceof Int16Array || arr instanceof Uint16Array
    || arr instanceof Int32Array || arr instanceof Uint32Array
  )
}

export function isFloatArray(arr) {
  return arr instanceof Float32Array || arr instanceof Float64Array
}

export function isNumberArray(arr) {
  return this.isIntArray(arr) || this.isFloatArray(arr)
}

/**
 * Returns a type guess for values in `seq`.
 *
 * Considers the types of elements of `seq`, and, for numerical values,
 * the range.  Does not consider precision for numerical values.
 */
export function guess(seq) {
  var isInt    = true
  var isFloat  = true
  var isBool   = true
  var min      = null
  var max      = null

  for (const x of seq) {
    isInt      = isInt && Number.isInteger(x)
    isFloat    = isFloat && typeof x === 'number'
    isBool     = isBool && typeof x === 'boolean'
    if (!isInt && !isFloat && !isBool)
      break
    if (isInt || isFloat) {
      if (x > max)
        max = x
      if (x < min)
        min = x
    }
  }

  return (
    isInt ? (
      0 <= min ? (
          max < (1 <<  8) ? 'u8'
        : max < (1 << 16) ? 'u16'
        : 'u32'
      )
      : (
          (-1 <<  7) <= min && max < (1 <<  7) ? 'i8'
        : (-1 << 15) <= min && max < (1 << 15) ? 'i16'
        : 'i32'
      )
    )
    : isFloat ? (-3.4e+38 < min && max < 3.4e+38 ? 'f32' : 'f64')  // FIXME: Approximate.
    : isBool ? 'b'
    : 'o'
  )
}

const CONVERTERS = {
  u8  : a => Uint8Array.from(a),
  u16 : a => Uint16Array.from(a),
  u32 : a => Uint32Array.from(a),
  i8  : a => Int8Array.from(a),
  i16 : a => Int16Array.from(a),
  i32 : a => Int32Array.from(a),
  f32 : a => Float32Array.from(a),
  f64 : a => Float64Array.from(a),
  b   : a => Int8Array.from(a, x => x ? 1 : 0),
  o   : a => Array.from(a),
}

/**
 * Converts to a typed array.
 */
export function convert(seq, type=null) {
  if (type === null) {
    type = guess(seq)
    // Even if the _range_ fits in f32, precision is less; use f64 anyway
    // to avoid surprises.
    if (type == 'f32')
      type = 'f64'
  }
  return CONVERTERS[type](seq)
}
