
import * as express from 'express'

const app = express()

app.get('/', function (req, res) {
    res.send('Hello World, node env:' + process.env.NODE_ENV);
})
  
app.listen(process.env.PORT || 3000);
