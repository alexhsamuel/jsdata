(function () {
  const _now = require('performance-now')
  now = () => _now() * 1E-3;

  /**
   * Times invocation of zero-argument `fn`.
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

  function makeRaw({target=1, numTrials=0, minTrials=5, maxTrials=1024, numWarmUp=1}) {
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
        while (
          times.length < minTrials 
          || (now() - start < target && times.length < maxTrials)) {
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
      const result = results[0]
      const wrong = results.filter(e => e != result)  // FIXME: Doesn't work.
      if (wrong.length > 0)
        console.warn('varying results in timed function:', wrong)

      return [times, result];
    }
  }

  function make(timerArgs = {percentile: [0.05, 0.10, 0.15]}) {
    const rawTimer = makeRaw(timerArgs)

    return function (fn, ...args) {
      const name = fn.name
      const [times, result] = rawTimer(fn, ...args)

      console.log(times)
      const sorted = times.sort()
      const num = sorted.length
      const getPct = p => sorted[Math.round(num * p)]
      console.log(args)
      const [pct_lo, pct, pct_hi] = timerArgs.percentile
      const time = getPct(pct)
      const timeErr = getPct(pct_hi) - getPct(pct_lo)
      const size = args.length > 0 ? args[0].length : 0
      const totalSize = args.reduce((s, a) => s + (a.length || 0), 0)

      return {
        function: name,
        size: size,
        totalSize: totalSize,
        trials: num,
        time: time,
        timeErr: timeErr
      }
    }
  }

  module.exports = {
    MSEC: 1E-3,
    USEC: 1E-6,
    NSEC: 1E-6,
    
    make: make,
    makeRaw: makeRaw,
    now: now,
    time: time,
  }

}).call(this)


