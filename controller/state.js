const State = require('../model/state')
const util = require('../lib/utils')
const error = require('../lib/error')

const attrsState = ['prev_state_id', 'value', 'remote_id', 'remote_collection', 'field_name', 'user_id']

exports.create = (req, res) => {
  const stateData = util.pick(req.body, attrsState)
  State
    .create(stateData)
    .then((result) => res.status(201).json(result))
    .catch((err) => {
      res.status(400).send(error[err]())
    })
}
exports.getAll = (req, res) => {
  State
    .getAll()
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}
exports.get = (req, res) => {
  State
    .get(parseInt(req.params.id, 10))
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))   
}
exports.update = (req, res) => {
  const stateData = util.pick(req.body, ['show'])
  State
    .update(parseInt(req.params.id, 10), stateData)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
    
}
