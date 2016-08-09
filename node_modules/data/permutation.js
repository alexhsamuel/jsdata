(function () {
  const assert = require('assert')

  const SORTED = Symbol('sorted')
  const UNIQUE = Symbol('unique')
  const IDENTITY = Symbol('identity permutation')

  function getArrType(len) {
    return len < 256 ? Uint8Array : len < 65536 ? Uint32Array : Uint64Array
  }

  function newArr(len) {
    return new (getArrType(len))(len)
  }

  module.exports = {

    cmp: (a, b) => a - b,

    /**
     * Returns the inverse permutation.
     */
    invert(perm) {
      if (perm === IDENTITY) return perm

      const len = perm.length
      const inv = new perm.constructor(length)
      for (let i = 0; i < length; ++i) inv[perm[i]] = i
      return inv
    },

    /**
     * Permutes array `arr` by `perm`.
     *
     * If this is the identity permutation, returns `arr`, otherwise a new array.
     */
    permute(perm, arr) {
      if (perm === IDENTITY) return arr

      const len = perm.length
      assert.equal(arr.length, len)
      const permuted = new arr.constructor(len)
      for (let i = 0; i < len; ++i) permuted[i] = arr[perm[i]]
      return permuted
    },

    isUnique(arr) {
      assert(this.isSorted(arr))
      const len = arr.length
      if (arr === IDENTITY || arr[UNIQUE] || len < 2) return true

      let val = arr[0]
      for (let i = 1; i < len; ++i) {
        if (arr[i] === val) return false
        val = arr[i]
      }

      // Looks good.  Mark it unique, for next time.
      arr[UNIQUE] = true

      return true
    },

    isSorted(arr) {
      const len = arr.length
      if (arr === IDENTITY || arr[SORTED] || len < 2) return true

      let val = arr[0]
      for (let i = 1; i < len; ++i) {
        if (arr[i] < val) return false
        val = arr[i]
      }

      // Looks good.  Mark it sorted, for next time.
      arr[SORTED] = true

      return true
    },

    /**
     * Returns the permutation that sorts `arr`.
     */
    argsort(arr) {
      const len = arr.length
      if (this.isSorted(arr)) return IDENTITY

      const perm = newArr(len)
      for (let i = 0; i < len; ++i) perm[i] = i
      perm.sort((i, j) => arr[i] - arr[j])
      return perm
    },

    /**
     * Returns sorted `arr` and its sort permutation.
     */
    sort(arr) {
      const perm = this.argsort(arr)
      const sorted = this.permute(perm, arr)
      sorted[SORTED] = true
      return [sorted, perm]
    },

  }

}).call(this);
