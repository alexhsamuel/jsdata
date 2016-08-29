`use strict`

const data = require('data/data')
const fs = require('fs')
const io = require('data/io')
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

read(open('benchmark/filter-sum.json'))
  .then(recs => {
    const cols = transpose(recs)
    // Replace ordinary with typed arrays.
    for (const key of cols.keys()) cols.set(key, io.toTypedArray(cols.get(key)))
    // FIXME: Check.
    const length = cols.values().next().value.length
    const table = new data.Table(new data.IndexKey(length), [...cols.entries()])
    console.log(table.toString())
  })
  .catch(console.log)

