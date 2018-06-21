const express = require('express')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const dbLib = require('./lib/db')
const config = require('./lib/config')
const cors = require('cors')
const app = express()
const router = express.Router()

app.use(router)
router.use(logger('dev'))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))
router.use(cookieParser())

require('./routes/index')(router)
// app.use(cors())

// app.get('/users', function (req, res, next) {
//   res.json({msg: 'Aqui estan los users'})
// })

router.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

dbLib.connect(config.urlDb)
  .then(() => {
    app.listen(5000)
  })
  .catch(console.log)
module.exports = app
