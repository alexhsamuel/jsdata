"use strict"

const _             = require('underscore')
const benchmark     = require('./benchmark')
const data          = require('data/data')
const ops           = require('data/operations')

const args = process.argv.slice()
if (args[0].endsWith('node')) args.shift()
let lengths
if (args.length === 2) lengths = [args[1]]
else if (args.length === 3) lengths = _.range(+args[1], +args[2])
else {
  console.error(`usage: ${args[0]} SIZE [ SIZE1 ]`)
  process.exit(2)
}
lengths = lengths.map(l => 1 << l)

function sum0(arr) {
  const len = arr.length
  let sum = 0;
  for (let i = 0; i < len; ++i) sum = sum + arr[i]
  return sum
}

function sum1(arr) {
  return arr.reduce((a, b) => a + b, 0)
}

for (const len of lengths) {
  {
    const arr = benchmark.randomF64(len)
    const res = benchmark.time(sum0, arr)
    res.length = len
    res.mem_size = len * 8
    console.log(JSON.stringify(res))
  }

  if (false) {  // too slow!
    const arr = benchmark.randomF64(len)
    const res = benchmark.time(sum1, arr)
    res.length = len
    res.mem_size = len * 8
    console.log(JSON.stringify(res))
  }

  {
    const [ser] = benchmark.randomSeries(len, 1)
    const res = benchmark.time(ops.sum, ser)
    res.name = 'ops.sum'
    res.length = len
    res.mem_size = len * 8
    console.log(JSON.stringify(res))
  }
}

