`use strict`

const data = require('data/data')
const fs = require('fs')
const readline = require('readline')

function open(filename) {
  return fs.createReadStream(filename)
}

function read(input) {
  return new Promise((resolve, reject) => {
    const lineReader = readline.createInterface({input: input})
    const values = []
    lineReader.on('line', line => values.push(JSON.parse(line)))
    lineReader.on('close', () => resolve(values))
  })
}

/**
 * Returns a `Map` from record name to an array of values.
 */
function transpose(records) {
  const cols = new Map()
  // FIXME: Need to deal with missing keys.
  for (const rec of records)
    for (const name in rec) {
      const val = rec[name]
      const vals = cols.get(name)
      if (vals === undefined) cols.set(name, [val])
      else vals.push(val)
    }
  return cols
}

function toArray(arr) {
  // FIXME: Utterly wrong.
  if (arr.length === 0) return arr
  const first = arr[0]
  if (Number.isInteger(first)) return new Int32Array(arr)
  else if (Number.isFinite(first)) return new Float64Array(arr)
  else return arr
}

read(open('benchmark/filter-sum.json'))
  .then(recs => {
    const cols = transpose(recs)
    for (const key of cols.keys()) cols.set(key, toArray(cols.get(key)))
    // FIXME: Check.
    const length = cols.values().next().value.length
    const table = new data.Table(new data.IndexKey(length), [...cols.entries()])
    console.log(table.toString())
  })
  .catch(console.log)

