(function () {

  const _           = require('underscore')
  const callTimer   = require('data/call-timer')
  const data        = require('data/data')
  const format      = require('data/format')
  const timer       = callTimer.timer()

  function outputTable(results) {
    head = (f, n) => format.palide(n, f.width)
    undl = f => '-'.repeat(f.width)
    
    f1 = format.formatter(9)
    f2 = format.formatter(3, 6)
    f3 = format.formatter(4, 1)
    f4 = format.formatter(5, 1)
    console.log(
      head(f1, 'length'),
      head(f2, 'time'),
      head(f3, 'rate'), '    ',
      head(f4, 'bandwidth'), '     '
    )
    console.log(undl(f1), undl(f2), undl(f3), "    ", undl(f4), "     ")
    for (res of results)
      console.log(
        f1(res.length),
        f2(res.time),
        f3(res.length / res.time / 1048576), "Mi/s",
        f4(res.mem_size / res.time / 1048576), "MiB/s"
      )
  }

  function outputJson(results) {
    for (res of results) console.log(JSON.stringify(res))
  }

  module.exports = {

    parseCommandLine() {
      const args = process.argv.slice()
      if (args[0].endsWith('node')) args.shift()
      args.shift()

      let output = outputTable
      while (args[0].startsWith('--')) {
        const arg = args.shift()
        if (arg == '--json') output = outputJson
        else {
          console.error('invalid option: ' + arg)
          process.exit(2)
        }
      }

      let lengths
      if (args.length === 1) lengths = [args[0]]
      else if (args.length === 2) lengths = _.range(+args[0], +args[1])
      else {
        console.error(`usage: ${args[0]} SIZE [ SIZE1 ]`)
        process.exit(2)
      }
      lengths = lengths.map(l => 1 << l)

      return {lengths, output}
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
