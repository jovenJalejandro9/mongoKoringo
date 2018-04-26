const util = require('../lib/utils')
const User = require('../model/user')
const examples = require('../lib/examples')
const dbLib = require('../lib/db')

const attrsState = ['prev_state_id', 'value', 'user_id', 'remote_id', 'remote_collection', 'field_name']
const remoteCollection = ['sheet']
const fieldNames = ['photos_family',
  'photos_house', 'family_inCharge', 'family_information', 'education_center', 'social_situation', 'medical_therapies',
  'medical_diagnose', 'medical_mobility', 'medical_wheel_chair', 'medical_comunication', 'medical_tests', 'medical_treatment', 'medical_relative_disease',
  'home_own_rent', 'home_material', 'home_facilities', 'home_num_rooms', 'home_numBeds', 'home_forniture', 'home_salubrity',
  'economic_familiar_income', 'economic_external_support', 'economic_feeding_center', 'economic_others',
  'general_information', 'manifested_information', 'detected_information', 'warning_information']

const col = db => db.collection('states')

module.exports = {
  create: (data) => {
    return dbLib.get()
      .then((db) => Promise.all([col(db).find({}).toArray(), module.exports.firstNullState(data)]))
      .then(([everyStates, firstNullState]) => {
        if (!util.checkFields(attrsState.slice(1), data)) return Promise.reject('noInfoCreateState')
        if (!remoteCollection.includes(data.remote_collection)) return Promise.reject('noRemoteCollection')
        if (!fieldNames.includes(data.field_name)) return Promise.reject('noFieldName')
        // Comprobar si existe remote collection
        let state = {}
        if (firstNullState !== null) {
          const prevStates = util.nextStates(firstNullState, everyStates)
          data.prev_state_id = prevStates[prevStates.length - 1].id
        } else {
          data.prev_state_id = null
        }
        return User.get(data.user_id)
      })
      .then((user) => {
        if (user === null) return Promise.reject('noUser')
        return util.nextId('states')
      })
      .then((nextId) => {
        state = Object.assign({}, data)
        state.id = nextId
        return dbLib.get()
      })
    .then((db) => col(db).insertOne(util.prepareData(state, attrsState)).then(() => col(db).find().toArray()))
  },
  getAll: () => {
    return dbLib.get()
      .then((db) => col(db).find().toArray())
  },
  get: (id) => {
    return dbLib.get()
      .then((db) => col(db).findOne({ id: id }))
  },
  hidrate: (type, ele) => {
    return dbLib.get()
      .then((db) => Promise.all([col(db).find({ remote_id: ele.id, remote_collection: type }).toArray(), col(db).find({ remote_id: ele.id, remote_collection: type, prev_state_id: null }).toArray()]))
      .then(([everyState, allFirstStates]) => {
        const fullStates = allFirstStates.map((ele) => {
          return util.nextStates(ele, everyState)
        })
        const stateValues = {}
        for (let i = 0; i < fullStates.length; i++) {
          stateValues[fullStates[i][0].field_name] = fullStates[i]
        }
        return Promise.resolve(Object.assign({}, ele, stateValues))
      })
  },
  firstNullState: (data) => {
    return dbLib.get()
      .then((db) => col(db).findOne({ remote_id: data.remote_id, remote_collection: data.remote_collection, field_name: data.field_name, prev_state_id: null }))
  },
  findOneState: (prop, filter) => {
    if (prop === null) return false
    // Last one name selected. It could be an array. In every state we are going to fitler by name
    const stateValue = prop[prop.length - 1].value.name
    if (typeof stateValue === 'boolean') {
      if (stateValue === filter) return true
      return false
    }
    return filter.some((v) => {
      if (stateValue === parseInt(stateValue, 10)) return (stateValue === v)
      return stateValue.indexOf(v) >= 0
    })
  },
  nextStates: (firsState, collection) => {
    return util.nextStates(firsState, collection)
  },
  __emptyCollection__: () => {
    return dbLib.get()
      .then((db) => col(db).remove({}))
  }
}
