const error = require('../lib/error')
const User = require('../model/user')
const util = require('../lib/utils')

const crypto = require('crypto')

const attrsUser = ['name', 'first_surname', 'second_surname', 'nickname', 'password', 'email', 'birthday', 'studies', 'professions', 'prev_volunteering', 'role']
const attrParams = ['professions', 'studies']

exports.create = (req, res) => {
  const userData = util.pick(req.body, attrsUser)
  userData.password = crypto.createHash('md5').update(req.body.password).digest('hex')
  User
    .create(userData)
    .then((result) => res.status(201).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.getAll = (req, res) => {
  const params = util.pick(req.query, attrParams)
  User
    .getAll(params)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(err))
}

exports.get = (req, res) => {
  User
    .get(parseInt(req.params.id, 10))
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.update = (req, res) => {
  const userData = util.pick(req.body, attrsUser)
  User
    .updateById(parseInt(req.params.id, 10), userData)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.delete = (req, res) => {
  User
    .removeById(parseInt(req.params.id, 10))
    .then((result) => {res.status(200).json(result)})
    .catch((err) => res.status(400).send(error[err]()))
}
