const Visit = require('../model/visit')
const util = require('../lib/utils')
const error = require('../lib/error')


const attrsVisit = ['sheet_id', 'date', 'user_id', 'state']
const attrParams = ['zone', 'help']

exports.create = (req, res) => {
  const visitData = util.pick(req.body, attrsVisit.slice(0, -3))
  Visit
    .create(visitData)
    .then((result) => res.status(201).json(result))
    .catch((err) => res.status(400).send(error[err]()))
  }
exports.getAll = (req, res) => {
  const params = util.pick(req.query, attrParams)
  Visit
    .getAll(params)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.get = (req, res) => {
  Visit
    .get(parseInt(req.params.id, 10))
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}
exports.update = (req, res) => {
  const visitData = util.pick(req.body, attrsVisit)
  Visit
    .updateById(parseInt(req.params.id, 10), visitData)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.delete = (req, res) => {
  Visit
    .removeById(parseInt(req.params.id, 10))
    .then((result) => {res.status(200).json(result)})
    .catch((err) => res.status(400).send(error[err]()))
}
