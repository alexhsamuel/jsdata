(function () {
  const typedArray = require('data/typed-array')

  const SUMMARY = Symbol('summary')

  /**
   * Computes a summary of an array of floating point values.
   *
   * Returns an object with these keys:
   *
   *  - `len`: the array length
   *  - `numFinite`: the number of finite (not NaN or infinity) values
   *  - `numNan`: the number of NaN values
   *  - `sum`: the sum of finite values (computed in order)
   *  - `sum2`: the sum of squares of finite values (computed in order)
   */
  function summarizeFloat(arr) {
    let min = null
    let max = null
    const len = arr.length
    let numFinite = 0
    let numNaN = 0
    let sum = 0
    let sum2 = 0

    for (let i = 0; i < len; ++i) {
      const val = arr[i]
      if (Number.isFinite(val)) {
        if (numFinite === 0) min = max = val
        else if (val < min) min = val
        else if (val > max) max = val
        numFinite = numFinite + 1
        sum = sum + val
        sum2 = sum2 + val * val
      }
      else if (isNaN(val)) numNaN = numNaN + 1
    }

    return {len, numFinite, numNaN, min, max, sum, sum2}
  }

  function summarizeInt(arr) {
    const len = arr.length
    let min = len > 0 ? arr[0] : null
    let max = min
    let sum = 0
    let sum2 = 0

    for (let i = 0; i < len; ++i) {
      const val = arr[i]
      if (val < min) min = val
      else if (val > max) max = val
      sum = sum + val
      sum2 = sum2 + val * val
    }

    return {len, numFinite: len, numNaN: 0, min, max, sum, sum2}
  }

  function summarizeString(arr) {
    const len = arr.length
    let minLength = null
    let maxLength = null

    for (let i = 0; i < len; ++i) {
      const val = arr[i].toString()
      const length = val.length
      if (minLength === null) minLength = maxLength = length
      else if (length < minLength) minLength = length
      else if (length > maxLength) maxLength = length
    }

    return {len, minLength, maxLength}
  }

  module.exports = function (arr) {
    const cached = arr[SUMMARY]
    if (cached) return cached
    else return arr[SUMMARY] = (
        typedArray.isFloatArray(arr) ? summarizeFloat(arr)
      : typedArray.isIntArray(arr) ? summarizeInt(arr)
      : summarizeString(arr)
    )
  }

  module.exports.clear = function (arr) { arr[SUMMARY] = undefined }

}).call(this)
