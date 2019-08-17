
const express = require('express');

const app = express();

app.get('/', function (req, res) {
    debugger;
    console.info('hello world');

    res.send('Hello World, node env:' + process.env.NODE_ENV);
})

app.listen(process.env.PORT || 3000);
