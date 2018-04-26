const util = require('../lib/utils')
const User = require('../model/user')
const Sheet = require('../model/sheet')
const dbLib = require('../lib/db')

const attrsVisit = ['sheet_id', 'user_id', 'date', 'state']

const col = db => db.collection('visits')

module.exports = {
  create: (data) => {
    if (!util.checkFields(attrsVisit.slice(0, -3), data)) {
      return Promise.reject('noInfoCreateVisit')
    }
    const visit = Object.assign({}, data)
    return dbLib.get()
      .then((db) => Promise.all([Sheet.get(data.sheet_id), col(db).find({}).toArray(), util.nextId('visits')]))
      .then(([sheet, visits, nextId]) => {
        if (sheet === null) return Promise.reject('noSheet')
        if (module.exports.checkVisitPending(data.sheet_id, visits)) return Promise.reject('existentVisit')
        visit.id = nextId
        visit.state = 'pending'
        return dbLib.get()
      })
      .then((db) => col(db).insertOne(util.prepareData(visit, attrsVisit)).then(() => col(db).find().toArray()))
  },
  getAll: (filters) => {
    if (Object.keys(filters).length > 0) {
      return Promise.all([Sheet.getIdswithFilters(filters), dbLib.get()])
        .then(([idSheets, db]) => col(db).find({ id: { $in: idSheets } }).toArray())
    }
    return dbLib.get().then((db) => col(db).find().toArray())
  },
  get: (id) => {
    return dbLib.get()
      .then((db) => col(db).findOne({ id: id }))
  },
  updateById: (id, data) => {
    if (data.hasOwnProperty('state') && (!['pending', 'done'].includes(data.state))) delete data.state
    return dbLib.get()
      .then((db) => Promise.all([User.get(data.user_id), Sheet.get(data.sheet_id), col(db).find().toArray()]))
      .then(([user, sheet, visits]) => {
        if (user === null && data.hasOwnProperty('user_id')) return Promise.reject('noUser')
        if (sheet == null && data.hasOwnProperty('sheet_id')) return Promise.reject('noSheet')
        // if (module.exports.checkVisitPending(id, visits) !== undefined) return Promise.reject('existentVisit')
        return dbLib.get()
      })
      .then((db) => {
        if (Object.keys(data).length === 0) return Promise.resolve(col(db).find().toArray())
        return col(db).update({ id: id }, { $set: data })
          .then(() => {
            return Promise.resolve(col(db).find().toArray())
          })
      })
  },
  removeById: (id) => {
    return dbLib.get()
      .then((db) => {
        return col(db).remove({ id: id })
          .then(() => col(db).find().toArray())
      })
  },
  findByAttr: (attr, value) => {
    return util.findByAttr(collection, attr, value)
  },
  checkVisitPending: (sheetId, visits) => {
    const aux = visits.find((visit) => visit.sheet_id === sheetId && visit.state === 'pending')
    if (aux === undefined) return false
    return true
  },
  __emptyCollection__: () => {
    return dbLib.get()
      .then((db) => col(db).remove({}))
  }
}
