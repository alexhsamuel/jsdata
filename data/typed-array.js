(function () {
  TypedArray = Object.getPrototypeOf(Int8Array.prototype)

  module.exports = {
    TypedArray,

    isArray(arr) {
      return arr instanceof TypedArray
    },

    isIntArray(arr) {
      return (
           arr instanceof Int8Array  || arr instanceof Uint8Array
        || arr instanceof Int16Array || arr instanceof Uint16Array
        || arr instanceof Int32Array || arr instanceof Uint32Array
      )
    },

    isFloatArray(arr) {
      return arr instanceof Float32Array || arr instanceof Float64Array
    },

    isNumberArray(arr) { 
      return this.isIntArray(arr) || this.isFloatArray(arr) 
    },

  }
}).call(this)
