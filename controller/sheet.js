
const error = require('../lib/error')
const util = require('../lib/utils')
const Sheet = require('../model/sheet')

const attrParams = ['name', 'first_surname','tel', 'zone', 'address', 'second_surname', 'birthday', 'id_number', 'complete', 'family_inCharge', 'family_information', 'education_center',
  'medical_therapies', 'medical_diagnose', 'medical_mobility', 'medical_wheel_chair', 'medical_comunication',
  'medical_tests', 'medical_treatment', 'home_own_rent', 'home_material', 'economic_familiar_income', 'economic_external_support']
  
const compFields = ['name','tel', 'first_surname', 'zone', 'address', 'second_surname', 'birthday', 'id_number', 'complete', 'urgent_comment', 'important_comment','money_comment',
 'noSponsored', 'wheel_chair' ]
const otherFields = ['lat', 'long', 'complete']

exports.create = (req, res) => {
  const sheetData = util.pick(req.body, compFields)
  Sheet
    .create(sheetData)
    .then((result) => res.status(201).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.getAll = (req, res) => {
  const params = util.pick(req.query, attrParams)
  Sheet
    .getAll(params)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.get = (req, res) => {
  Sheet
    .get(parseInt(req.params.id, 10))
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.update = (req, res) => {
  const sheetData = util.pick(req.body, [...compFields,...otherFields])
  Sheet
    .updateById(parseInt(req.params.id, 10), sheetData)
    .then((result) => res.status(200).json(result))
    .catch((err) => res.status(400).send(error[err]()))
}

exports.delete = (req, res) => {
  Sheet
    .removeById(parseInt(req.params.id, 10))
    .then((result) => { res.status(200).json(result) })
    .catch((err) => res.status(400).send(error[err]()))
}
