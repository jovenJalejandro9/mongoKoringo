const express = require('express')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const dbLib = require('./lib/db')
const config = require('./lib/config')

const app = express()
const router = express.Router()

app.use(router)
router.use(logger('dev'))
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))
router.use(cookieParser())

require('./routes/index')(router)

router.use((req, res, next) => {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

dbLib.connect(config.urlDb)
  .then(() => {
    app.listen(3000)
  })
//  que hago con el console?? a eslint no le mola mucho
  .catch(console.log)
module.exports = app
