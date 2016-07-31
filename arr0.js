"use strict"

const _now = require("performance-now")

const MSEC = 1E-3
const USEC = 1E-6
const NSEC = 1E-9
const now = () => _now() * MSEC

// ???
let zip = rows => rows[0].map((_, c) => rows.map(row => row[c]))

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

function timer({target=1, numTrials=0, minTrials=3, numWarmUp=1, discard=1}) {
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
      while (times.length < minTrials + discard * 2 || now() - start < target) {
        const [elapsed, result] = time(call)
        times.push(elapsed)
        results.push(result)
      }
    }    
    else 
      for (let i = 0; i < numTrials + 2 * discard; ++i) {
        const [elapsed, result] = time(call)
        console.log(elapsed, result)
        times.push(elapsed)
        results.push(result)
      }

    // Check results.
    if (!allEqual(results))
      console.warn('varying results in timed function')

    // Discard high and low.
    let sorted = times.sort()
    for (let i = 0; i < discard; ++i) {
      sorted.shift()
      sorted.pop()
    }

    // Calculate stats.
    // FIXME: Elsewhere.
    let trials = sorted.length
    let sum1 = 0
    let sum2 = 0
    for (const t of sorted) {
      sum1 += t
      sum2 += t * t
    }
    const mean = sum1 / trials
    const std = Math.sqrt(sum2 / trials - mean * mean)
    
    const meanFmt = (mean / MSEC).toFixed(1)
    const stdFmt = (std / MSEC).toFixed(1)
    let output = `${trials} trials: (${meanFmt} ± ${stdFmt}) ms`

    const size = args[0].length
    if (size) {
      const perFmt = (mean / size / NSEC).toFixed(1)
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

timer({numWarmUp: 64})(cross, arr0, arr1)

if (false) {
  for (let i = 0; i < 8; ++i) log_time(() => cross(arr0, arr1))

  console.log('optimizing')
  console.log(v8.getOptimizationStatus(cross))
  v8.optimizeFunctionOnNextCall(cross)
  cross(arr0, arr1)
  console.log(v8.getOptimizationStatus(cross))

  for (let i = 0; i < 8; ++i) log_time(() => cross(arr0, arr1))
}

