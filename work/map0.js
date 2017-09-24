dat = require('data/data')
ops = require('data/operations')

s = dat.sample
console.log('' + s)
console.log()

s = ops.map(s, a => 2 * a - 1)
console.log('' + s)

