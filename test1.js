d = require('./data.js')
ops = require('./operations.js')

s0 = d.makeSeries([2, 5, 3, 1, 0], [2.2, 5.5, 3.3, 1.1, 0.0])
s1 = ops.add(s0, 10)
console.log(s1.toString())
console.log()

s2 = ops.sub(ops.mul(s1, 2), 1)
console.log(s2.toString())
