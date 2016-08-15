"use strict"

const _now = require("performance-now")

const MSEC = 1E-3
const USEC = 1E-6
const NSEC = 1E-9
const now = () => _now() * MSEC

let allEqual = arr => arr.every(e => e === arr[0])

/**
 * Times invocation of `fn`.
 *
 * @return
 *   An array of the runtime in sec and the return value.
 */
function time(fn) {
  const start = now()
  const result = fn()
  const end = now()
  return [end - start, result]
}

function log_time(fn) {
  let [elapsed, _] = time(fn)
  elapsed = (elapsed / MSEC).toFixed(1)
  console.log(`elapsed: ${elapsed} ms`)
}

function timer({target=1, numTrials=0, minTrials=3, numWarmUp=1, percentile=[0.05, 0.10, 0.15]}) {
  return function (fn, ...args) {
    const call = () => fn(...args)
    const results = []
    const times = []

    // Warm up.
    for (let i = 0; i < numWarmUp; ++i) results.push(call())

    // Trial loop.
    if (numTrials === 0) {
      const start = now()
      // FIXME: Expensive for tiny fn.
      while (times.length < minTrials || now() - start < target) {
        const [elapsed, result] = time(call)
        times.push(elapsed)
        results.push(result)
      }
    }    
    else 
      for (let i = 0; i < numTrials; ++i) {
        const [elapsed, result] = time(call)
        times.push(elapsed)
        results.push(result)
      }

    // Check results.
    if (!allEqual(results))
      console.warn('varying results in timed function')

    if (false) {
      const fs = require('fs')
      fs.writeFile('arr0.csv', times.join('\n') + '\n')
    }

    const sorted = times.sort()
    const num = sorted.length
    const get_pct = p => sorted[Math.round(num * p)]
    const [pct_lo, pct, pct_hi] = percentile
    const val = get_pct(pct)
    const err = get_pct(pct_hi) - get_pct(pct_lo)

    const valFmt = (val / MSEC).toFixed(3)
    const errFmt = (err / MSEC).toFixed(3)
    let output = `${num} trials: (${valFmt} ± ${errFmt}) ms`

    const size = args[0].length
    if (size) {
      const perFmt = (val / size / NSEC).toFixed(2)
      output += ` | size: ${size}: ${perFmt} ns/el`
    }

    console.log(output)
  }
  
}

//------------------------------------------------------------------------------

const N = 1024 * 1024
const arr0 = new Float64Array(N)
const arr1 = new Float64Array(N)
for (let i = 0; i < N; ++i) {
  arr0[i] = i
  arr1[i] = 2 * (i % 2) - 1
}

function cross0(arr0, arr1) {
  let result = 0
  for (let i = 0; i < arr0.length; ++i)
    result = result + arr0[i] * arr1[i]  // note: node 6.3.1 can't optimize +=
  return result
}

function cross1(arr0, arr1) {
  // FIXME: Broken.
  return zip([arr0, arr1]).reduce((r, [e0, e1]) => r + e0 * e1, 0)
}

function cross2(arr0, arr1) {
  return arr0.reduce((r, e, i) => r + e * arr1[i])
}

//------------------------------------------------------------------------------

const v8 = require("v8-natives")

const cross = cross0

console.log('optimizing')
console.log(v8.getOptimizationStatus(cross))
v8.optimizeFunctionOnNextCall(cross)
cross(arr0, arr1)
console.log(v8.getOptimizationStatus(cross))

timer({numWarmUp: 32, target: 1})(cross, arr0, arr1)

if (false) {
  for (let i = 0; i < 8; ++i) log_time(() => cross(arr0, arr1))

  console.log('optimizing')
  console.log(v8.getOptimizationStatus(cross))
  v8.optimizeFunctionOnNextCall(cross)
  cross(arr0, arr1)
  console.log(v8.getOptimizationStatus(cross))

  for (let i = 0; i < 8; ++i) log_time(() => cross(arr0, arr1))
}

