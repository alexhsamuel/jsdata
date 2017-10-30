'use strict'

const _             = require('underscore')

//------------------------------------------------------------------------------

const TypedArray = Object.getPrototypeOf(Int8Array.prototype)

const FLOAT32_MIN = -3.40282347e+38
const FLOAT32_MAX =  3.40282347e+38

function isArray(arr) {
  return arr instanceof TypedArray
}

function isIntArray(arr) {
  return (
       arr instanceof Int8Array  || arr instanceof Uint8Array
    || arr instanceof Int16Array || arr instanceof Uint16Array
    || arr instanceof Int32Array || arr instanceof Uint32Array
  )
}

function isFloatArray(arr) {
  return arr instanceof Float32Array || arr instanceof Float64Array
}

function isNumberArray(arr) {
  return this.isIntArray(arr) || this.isFloatArray(arr)
}

/**
 * Returns a type guess for values in `seq`.
 *
 * Considers the types of elements of `seq`, and, for numerical values,
 * the range.  Does not consider precision for numerical values.
 */
function scanType(vals) {
  const scanner = new TypeScanner()
  scanner.scan(vals)
  return scanner.type
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
function convert(seq, type=null) {
  if (type === null) {
    type = scanType(seq)
    // Even if the _range_ fits in f32, precision is less; use f64 anyway
    // to avoid surprises.
    if (type == 'f32')
      type = 'f64'
  }
  return CONVERTERS[type](seq)
}

class TypeScanner {
  constructor() {
    this.length = 0
    this.bool = true
    this.num = true
    this.int = true
    this.min = null
    this.max = null
  }

  scan(vals) {
    for (const val of vals) {
      const type = typeof x
      this.num   = this.num  && type === 'number'
      this.bool  = this.bool && type === 'boolean'
      if (this.num) {
        this.int = this.int && Number.isInteger(x)
        if (x > this.max)
          this.max = x
        if (x < this.min)
          this.min = x
      }
      else if (!this.bool)
        break
    }
  }

  scanString(val) {
    this.length += 1

    if (this.bool) {
      const lower = val.toLowerCase()
      if (!(lower == 'true' || lower == 'false'))
        this.bool = false
    }

    if (this.num) {
      const lower = val.toLowerCase()
      if (lower == 'nan' || lower == 'infinity' || lower == '-infinity')
        this.int = false
      else {
        const num = +val
        if (isNaN(num))
          this.num = this.int = false
        else {
          this.int = this.int && Number.isInteger(num)
          if (this.max === null)
            this.min = this.max = num
          else if (num < this.min)
            this.min = num
          else if (num > this.max)
            this.max = num
        }
      }
    }
  }

  get type() {
    return (
      this.num && this.int ? (
        0 <= this.min ? (
            this.max < (1 <<  8) ? 'u8'
          : this.max < (1 << 16) ? 'u16'
          : 'u32'
        )
        : (
            (-1 <<  7) <= this.min && this.max < (1 <<  7) ? 'i8'
          : (-1 << 15) <= this.min && this.max < (1 << 15) ? 'i16'
          : 'i32'
        )
      )
      : this.num ? (
        FLOAT32_MIN < this.min && this.max < FLOAT32_MAX ? 'f32'
        : 'f64'
      )
      : this.bool ? 'b'
      : 'o'
    )
  }

}

/**
 * Creates a new uninitialized array.
 */
function newArray(type, len) {
  switch (type) {
  case 'b':   return new Int8Array(len)
  case 'i8':  return new Int8Array(len)
  case 'u8':  return new Uint8Array(len)
  case 'i16': return new Int16Array(len)
  case 'u16': return new Uint16Array(len)
  case 'i32': return new Int32Array(len)
  case 'u32': return new Uint32Array(len)
  case 'f32': return new Float32Array(len)
  case 'f64': return new Float64Array(len)
  case 'o':   return new Array(len)
  default: throw 'invalid type: ' + type
  }
}

//------------------------------------------------------------------------------

module.exports = {
  TypedArray,
  isArray,
  isIntArray,
  isFloatArray,
  isNumberArray,
  scanType,
  convert,
  TypeScanner,
  newArray,
}

