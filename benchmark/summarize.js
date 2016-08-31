"use strict"

const _             = require('underscore')
const benchmark     = require('./benchmark')
const data          = require('data/data')

const args = benchmark.parseCommandLine()

function summarize(arr) {
  let min
  let max
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

if (false) {
  // Check result!
  const len = 1024
  const arr = benchmark.randomF64(len)
  console.log(summarize(arr))
}

args.output(args.lengths.map(len => {
  const arr = benchmark.randomF64(len)
  const res = benchmark.time(summarize, arr)
  Object.assign(res, 
    {operation: 'summary', type: 'f64', length: len, mem_size: len * 8})
  return res
}))


