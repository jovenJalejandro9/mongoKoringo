const util = require('../lib/utils')
const dbLib = require('../lib/db')

const compAttrsUser = ['name', 'first_surname','tel', 'nickname', 'password', 'email', 'birthday', 'studies', 'professions', 'prev_professions', 'prev_volunteering']
const OtherAttrUser = ['address', 'role', 'second_surname', 'drive', 'speak', 'english', 'food']
const col = db => db.collection('users')

module.exports = {
  create: (dataUser) => {
    if (dataUser.hasOwnProperty('role') && (!['admin', 'normal'].includes(dataUser.role))) {
      return Promise.reject('incorrectRole')
    }
    if (!util.checkFields(compAttrsUser, dataUser)) {
      return Promise.reject('noInfoCreateUser')
    }
    const user = Object.assign({}, dataUser)
    if (!user.hasOwnProperty('role')) {
      user.role = 'normal'
    }
    return util.nextId('users')
      .then((nextId) => {
        user.id = nextId
        return dbLib.get()
      })
      .then((db) => col(db).insertOne(util.prepareData(user, [...compAttrsUser,...OtherAttrUser]))
        .then(() => col(db).find().toArray()))
  },
  getAll: (filters) => {
    return dbLib.get()
      .then((db) => {
        const filtersMongo = {}
        if (Object.keys(filters).length !== 0) {
          filtersMongo.$or = []
          keysFilters = Object.keys(filters)
          for (let i = 0; i < keysFilters.length; i++) {
            const or = {}
            if(Array.isArray(filters[keysFilters[i]])){
              or[keysFilters[i]] = { $in: JSON.parse(filters[keysFilters[i]]) }
            } else {
              or[keysFilters[i]] = JSON.parse(filters[keysFilters[i]])
            }
            filtersMongo.$or.push(or)
          }
        }
        return col(db).find(filtersMongo).toArray()
      })
  },
  get: (id) => {
    return dbLib.get()
      .then((db) => col(db).findOne({ id: id }))
  },
  updateById: (id, dataUser) => {
    if (dataUser.hasOwnProperty('role') && dataUser.role !== 'normal' && dataUser.role !== 'admin') {
      return Promise.reject('incorrectRole')
    }
    return dbLib.get()
      .then((db) => {
        if (Object.keys(dataUser).length === 0) return Promise.resolve(col(db).find().toArray())
        return col(db).update({ id: id }, { $set: dataUser })
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
  authenticate: (name, password) => {
    return dbLib.get()
      .then((db) => col(db).find({ name: name, password: password }).limit(1).toArray())
      .then((user) => {
        if (user.length !== 1) return Promise.reject('incorrectLogin')
        return Promise.resolve(user[0])
      })
  },
  findByAttr: (attr, value) => {
    return util.findByAttr('users', attr, value)
  },
  __emptyCollection__: () => {
    return dbLib.get()
      .then((db) => col(db).remove({ role: { $ne: 'root' } }))
  }
}
