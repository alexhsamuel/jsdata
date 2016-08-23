(function () {

  const _           = require('underscore')
  const callTimer   = require('data/call-timer')
  const data        = require('data/data')
  const timer       = callTimer.timer()

  module.exports = {

    parseCommandLine() {
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

      return {lengths}
    },

    randomF64(len) {
      const arr = new Float64Array(len)
      for (let i = 0; i < len; ++i) arr[i] = Math.random()
      return arr
    },

    randomKey(len) {
      const key = new Uint32Array(len)
      let k = 0
      for (let i = 0; i < len; ++i) {
        key[i] = k
        k += 1 + Math.round((Math.random() * 4))
      }
      return new data.Key(key)  // sorted by construction
    },

    randomSeries(len, num) {
      const key = this.randomKey(len)
      return _.times(num, () => new data.Series(key, this.randomF64(len)))
    },

    time(fn, ...args) {
      const res = timer(fn, ...args)
      Object.assign(res, callTimer.getEnvInfo())  // FIXME: Use object spread when available.
      return res
    },

  }

}).call(this)
