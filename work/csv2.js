const csv = require('fast-csv')
const fs = require('fs')

fs.createReadStream('test/testcsv-1Mi.csv')
  .pipe(csv())
  .on('data', function(data){
    // console.log(data)
  })
  .on('end', function(){
    console.log('done')
  })

