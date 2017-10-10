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
