const fs = require('fs');
console.log(process.env.TS_BIN_DIST_PATH);
fs.writeFileSync('./dist/test.ini', 'hello this is test');

