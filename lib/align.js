'use strict'

const _             = require('underscore')
const assert        = require('assert')

const permutation   = require('./permutation.js')
const Series        = require('./series.js').Series

//------------------------------------------------------------------------------

// FIXME: We need signed here.
function getArrType(len) {
  return len < 128 ? Int8Array : len < 32768 ? Int32Array : Int64Array
}

function newArr(len) {
  return new (getArrType(len))(len)
}

/**
 * Returns indices of `arrs1` that aligns with `arrs0`.
 */
function leftAlign(arrs0, arrs1) {
  if (arrs0 === arrs1)
    return permutation.IDENTITY
  if (arrs0.length != arrs1.length)
    throw 'keys of different dimensionality'

  // Keep only arrays that are not the same.
  const [a0, a1] = _.unzip(
    _.zip(arrs0, arrs1).filter(([a0, a1]) => a0 !== a1))

  const l0 = permutation.lengthMulti(a0)
  const l1 = permutation.lengthMulti(a1)

  const algn = newArr(l0)
  var i1 = 0
  var x1 = _.pluck(a1, i1)
  var c = 0
  for (var i0 = 0; i0 < l0; ++i0) {
    const x0 = _.pluck(a0, i0)
    c = permutation.cmp(x0, x1)
    while (i1 < l1 && c > 0) {
      x1 = _.pluck(a1, ++i1)
      c = permutation.cmp(x0, x1)
    }
    algn[i0] = c == 0 ? i1 : -1
  }
  return algn
}

// FIXME: Combine with permute().
function take(arr, algn, def) {
  const len = algn.length
  const res = new arr.constructor(len)
  for (let i = 0; i < len; ++i) 
    res[i] = algn[i] < 0 ? def : arr[algn[i]]
  return res
}

//------------------------------------------------------------------------------

module.exports = {
  newArr,  // FIXME
  leftAlign,
  take,  // FIXME
}

