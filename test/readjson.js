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

function scanArray(arr) {
  let boolean = true
  let number = true
  let integer = true
  let min = null
  let max = null

  for (const val of arr) {
    const type = typeof val
    if (boolean) {
      if (type === 'boolean') continue
      else boolean = false
    }

    if (number) {
      if (type === 'number') {
        if (integer && !Number.isInteger(val)) integer = false
        if (val < min) min = val
        if (val > max) max = val
      }
      else number = false
    }
  }

  // FIXME: Combine with `ColumnScan.type`.
  if (length === 0) return TYPES.STRING
  if (boolean) return TYPES.BOOL
  if (integer)
    if (min >= 0)
      return (
          max < 1 <<  8 ? TYPES.U8
        : max < 1 << 16 ? TYPES.U16
        : max <= 0x7fffffff ? TYPES.U32
        : null  // FIXME: ??
      )
    else
      return (
          -1 <<  7 <= min && max < 1 <<  7 ? TYPES.I8
        : -1 << 15 <= min && max < 1 << 15 ? TYPES.I16
        : -1 << 31 <= min && max <= 0x7fffffff ? TYPES.I32
        : null  // FIXME: ??
      )
  else if (number)
    return (
        min === null ? TYPES.F32
      : FLOAT32_MIN <= min && max <= FLOAT32_MAX ? TYPES.F32
      : TYPES.F64
    )
  else return TYPES.STRING
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

