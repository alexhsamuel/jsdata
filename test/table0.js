dat = require('data/data')

tbl = new dat.Table(
  new dat.Key(new Int8Array([0, 3, 5, 6, 8, 11, 15, 22])),
  [
    ['x', new Float64Array([-3, 5, 4, -2, 0, 4, 3, 2])],
    ['y', new Float64Array([13, 5, 4, 12, 0, 4, 3, 2])],
    ['z', new Float64Array([5.2, 0.2, 0, -5.5, 6.3, 1, 11.1, 42.0])],
  ])

console.log('' + tbl)

console.log('' + tbl.columns.y)

             
