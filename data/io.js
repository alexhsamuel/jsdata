(function () {
  const assert = require('assert')

  TYPES = {
    I8      : Symbol('i8'),
    U8      : Symbol('u8'),
    I16     : Symbol('i16'),
    U16     : Symbol('u16'),
    I32     : Symbol('i32'),
    U32     : Symbol('u32'),
    F32     : Symbol('f32'),
    F64     : Symbol('f64'),
    BOOL    : Symbol('bool'),
    STRING  : Symbol('string'),
  }

  const FLOAT32_MIN = -3.40282347e+38
  const FLOAT32_MAX =  3.40282347e+38

  function getType({length, boolean, number, integer, min, max}) {
    if (length === 0) return TYPES.STRING
    if (boolean) return TYPES.BOOL
    if (number && integer)
      if (min >= 0)
        return (
            max < 1 <<  8 ? TYPES.U8
          : max < 1 << 16 ? TYPES.U16
          : max <= 0x7fffffff ? TYPES.U32
          : null  // FIXME: ??
        )
      else
        return (
            -1 <<  7 <= min && max < 1 <<  7 ? TYPES.I8
          : -1 << 15 <= min && max < 1 << 15 ? TYPES.I16
          : -1 << 31 <= min && max <= 0x7fffffff ? TYPES.I32
          : null  // FIXME: ??
        )
    else if (number)
      return (
          min === null ? TYPES.F32
        : FLOAT32_MIN <= min && max <= FLOAT32_MAX ? TYPES.F32
        : TYPES.F64
      )
    else return TYPES.STRING
  }

  module.exports = {

    ColumnScan: class {
      constructor() {
        this.length = 0
        this.boolean = true
        this.number = true
        this.integer = true
        this.min = null
        this.max = null
      }

      scan(val) {
        this.length += 1

        if (this.boolean) {
          const lower = val.toLowerCase().trim()
          if (lower == 'true' || lower == 'false') {
            this.number = this.integer = false
            return
          }
          else this.boolean = false
        }

        if (this.number) {
          const lower = val.toLowerCase().trim()
          if (lower == 'nan' || lower == 'infinity' || lower == '-infinity') {
            this.integer = false
            return
          }

          const num = +val
          if (isNaN(num)) {
            this.number = this.integer = false
            return
          }

          this.integer = this.integer && Number.isInteger(num)

          if (this.max === null || num < this.min) this.min = num
          if (this.min === null || num > this.max) this.max = num
        }
      }

      get type() { return getType(this) }

    },

    /**
     * Creates a new uninitialized array.
     */
    newArray(type, len) {
      switch (type) {
      case TYPES.BOOL:throw 'not implemented'  // FIXME
      case TYPES.I8:  return new Int8Array(len)
      case TYPES.U8:  return new Uint8Array(len)
      case TYPES.I16: return new Int16Array(len)
      case TYPES.U16: return new Uint16Array(len)
      case TYPES.I32: return new Int32Array(len)
      case TYPES.U32: return new Uint32Array(len)
      // Use a f64 array, for precision.
      // FIXME: Can we figure out when f32 is good enough?
      case TYPES.F32: return new Float64Array(len)
      case TYPES.F64: return new Float64Array(len)
      case TYPES.STRING: return new Array(len)  // FIXME
      default: throw 'invalid type: ' + type
      }
    },

    /**
     * Determines the type for an iterable of `values`.
     */
    scanType(values) {
      let length = 0
      let boolean = true
      let number = true
      let integer = true
      let min = null
      let max = null

      for (const val of values) {
        ++length
        const type = typeof val
        if (boolean) {
          if (type === 'boolean') continue
          else boolean = false
        }

        if (number) {
          if (type === 'number') {
            if (integer && !Number.isInteger(val)) integer = false
            if (val < min) min = val
            if (val > max) max = val
          }
          else number = false
        }
      }

      return getType({length, boolean, number, integer, min, max})
    },

    /**
     * Converts an untyped array to a typed array.
     */
    toTypedArray(arr) {
      const type = this.scanType(arr)
      switch (type) {
      case TYPES.BOOL:throw 'not implemented'  // FIXME
      case TYPES.I8:  return new Int8Array(arr)
      case TYPES.U8:  return new Uint8Array(arr)
      case TYPES.I16: return new Int16Array(arr)
      case TYPES.U16: return new Uint16Array(arr)
      case TYPES.I32: return new Int32Array(arr)
      case TYPES.U32: return new Uint32Array(arr)
      case TYPES.F32: return new Float32Array(arr)
      case TYPES.F64: return new Float64Array(arr)
      case TYPES.STRING: return new Array(...arr)  // FIXME
      default: throw 'invalid type: ' + type
      }
    },

  }

}).call(this)
