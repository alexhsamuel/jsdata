(function () {
  const data = require('data/data')
  const io = require('data/io')
  const readline = require('readline')

  function readJsonLines(input) {
    return new Promise((resolve, reject) => {
      const lineReader = readline.createInterface({input: input})
      const values = []
      lineReader.on('line', line => values.push(JSON.parse(line)))
      lineReader.on('close', () => resolve(values))
    })
  }

  // FIXME: Elsewhere.
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

  module.exports = {

    /**
     * Reads JSON records from text input.
     *
     * Reads one line at a time from input stream `input`, parses each as
     * JSON, and constructs a table treating each as a row record.  Returns
     * a promise for this table.
     */
    readRecords(input) {
      return readJsonLines(input)
        .then(recs => {
          const cols = transpose(recs)
          // Replace ordinary with typed arrays.
          for (const key of cols.keys()) {
            const arr = io.toTypedArray(cols.get(key))
            cols.set(key, arr)
          }
          // FIXME: Check.
          const length = cols.values().next().value.length
          return new data.Table(new data.IndexKey(length), [...cols.entries()])
        })
    },

  }

}).call(this)
