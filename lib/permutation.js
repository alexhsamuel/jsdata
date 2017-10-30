'use strict'

const _             = require('underscore')
const assert        = require('assert')

const SORTED        = Symbol('sorted')
const UNIQUE        = Symbol('unique')
const IDENTITY      = Symbol('identity permutation')

//------------------------------------------------------------------------------

function getArrType(len) {
  return len < 256 ? Uint8Array : len < 65536 ? Uint32Array : Uint64Array
}

function newArr(len) {
  return new (getArrType(len))(len)
}

const cmp = (a, b) => a > b ? 1 : a < b ? -1 : 0

/**
 * Returns the inverse permutation.
 */
function invert(perm) {
  if (perm === IDENTITY) return perm

  const len = perm.length
  const inv = new perm.constructor(length)
  for (let i = 0; i < length; ++i) inv[perm[i]] = i
  return inv
}

/**
 * Permutes array `arr` by `perm`.
 *
 * If this is the identity permutation, returns `arr`, otherwise a new array.
 */
function permute(perm, arr) {
  if (perm === IDENTITY) return arr

  const len = perm.length
  assert.equal(arr.length, len)
  const permuted = new arr.constructor(len)
  for (let i = 0; i < len; ++i) permuted[i] = arr[perm[i]]
  return permuted
}

function isUnique(arr) {
  assert(isSorted(arr))
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
}

function isSorted(arr) {
  const length = arr.length
  if (arr === IDENTITY || arr[SORTED] || length < 2)
    return true

  let val = arr[0]
  for (let i = 1; i < length; ++i) {
    if (arr[i] < val)
      return false
    val = arr[i]
  }

  // Looks good.  Mark it sorted, for next time.
  arr[SORTED] = true

  return true
}

// FIXME: Elsewhere.
function same(collection) {
  assert(collection.length > 0)
  const val = collection[0]
  assert(_.every(collection, v => v == val))
  return val
}

function lengthMulti(arrs) {
  return same(_.pluck(arrs, 'length'))
}

/**
 * Returns true if arrays are joinly sorted.
 */
function isSortedMulti(arrs) {
  if (arrs[SORTED])
    return true;
  const length = lengthMulti(arrs)
  if (length < 2)
    // FIXME: Check sorted!
    return true

  const get = i => arrs.map(a => a[i])
  let val = get(0)
  for (let i = 1; i < length; ++i) {
    const next = get(i)
    if (next < val)
      return false
    val = next
  }

  // Looks good.  Mark it as sorted, for next time.
  arrs[SORTED] = true

  return true
}

/**
 * Returns the permutation that sorts `arr`.
 */
function argsort(arr) {
  const len = arr.length
  if (isSorted(arr))
    return IDENTITY

  const perm = newArr(len)
  for (let i = 0; i < len; ++i) perm[i] = i
  perm.sort((i, j) => cmp(arr[i], arr[j]))
  return perm
}

/**
 * Returns sorted `arr` and its sort permutation.
 */
function sort(arr) {
  const perm = argsort(arr)
  const sorted = permute(perm, arr)
  sorted[SORTED] = true
  return [sorted, perm]
}

/**
 * Performs binary search for vals in parallel `arrs`.
 *
 * Returns `[match, idx]` where `match` indicates if a match is found, and
 * `idx` is either the match index or the insertion point.
 */
function argsearchMulti(arrs, vals) {
  const length = lengthMulti(arrs)
  assert(arrs.length == vals.length)

  let i0 = 0
  let i2 = length - 1
  while (i0 <= i2) {
    const i1 = (i0 + i2) >> 1
    const v = arrs.map(a => a[i1])
    const c = cmp(vals, v)
    if (c == 0)
      return [true, i1]
    else if (c == -1)
      i2 = i1 - 1
    else
      i0 = i1 + 1
  }
  return [false, i0]
}

//------------------------------------------------------------------------------

module.exports = {
  SORTED,
  UNIQUE,
  IDENTITY,
  newArr,
  cmp,
  invert,
  permute,
  isUnique,
  isSorted,
  same,
  lengthMulti,
  isSortedMulti,
  argsort,
  sort,
  argsearchMulti,
}

