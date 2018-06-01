const util = require('../lib/utils')
const State = require('../model/state')
const examples = require('../lib/examples')
const dbLib = require('../lib/db')

const filterStates = ['family_inCharge', 'family_information', 'education_center',
  'medical_therapies', 'medical_diagnose', 'medical_mobility', 'medical_wheel_chair', 'medical_comunication',
  'medical_tests', 'medical_treatment', 'home_own_rent', 'home_material', 'economic_familiar_income', 'economic_external_support']
const compAttrSheet = ['name', 'first_surname', 'zone', 'address']
const attrsSheet = ['second_surname', 'birthday', 'id_number', 'photos_family',
  'photos_house', 'family_inCharge', 'family_information', 'education_center', 'social_situation', 'medical_therapies',
  'medical_diagnose', 'medical_mobility', 'medical_wheel_chair', 'medical_comunication', 'medical_tests', 'medical_treatment', 'medical_relative_disease',
  'home_own_rent', 'home_material', 'home_facilities', 'home_num_rooms', 'home_numBeds', 'home_forniture', 'home_salubrity',
  'economic_familiar_income', 'economic_external_support', 'economic_feeding_center', 'economic_others',
  'general_information', 'manifested_information', 'detected_information', 'warning_information', 'complete', 'urgent_comment', 'important_comment','money_comment', 'noSponsored', 'wheel_chair']

const col = db => db.collection('sheets')

module.exports = {
  create: (data) => {
    const sheet = Object.assign({}, data)
    return dbLib.get()
      .then((db) => col(db).findOne({name: data.name, first_surname: data.first_surname}))
      .then((existantUser) => {
        if (existantUser !== null) return Promise.reject('participantExist')
        return util.nextId('sheets')
      })
      .then((nextId) => {
        if (!util.checkFields(compAttrSheet, data)) {
          return Promise.reject('noInfoCreateSheet')
        }
        sheet.id = nextId
        return dbLib.get()
      })
      .then((db) => {
        return col(db).insertOne(util.prepareData(sheet, [...compAttrSheet ,...attrsSheet]))
      })
      .then(() => dbLib.get())
      .then((db) => col(db).find({}).toArray())
      .then((sheetCollection) => Promise.all(sheetCollection.map(sheet => State.hidrate('sheet', sheet))))

  },
  getAll: (filters) => {
    return dbLib.get()
    .then((db) => col(db).find({}).toArray())
    .then((sheetCollection) => Promise.all(sheetCollection.map(sheet => State.hidrate('sheet', sheet))))
    .then((everySheet) => {
        if (Object.keys(filters).length > 0) {
          const keysFilter = Object.keys(filters)
          const newSheetColl = everySheet.filter((sheet) => {
            for (let i = 0; i < keysFilter.length; i++) {
              const filterValues = JSON.parse(filters[keysFilter[i]])
              if (filterStates.includes(keysFilter[i])) {
                if (State.findOneState(sheet[keysFilter[i]], filterValues)) {
                  return sheet
                }
              } else {
                if (util.findOne(sheet[keysFilter[i]], filterValues)) {
                  return sheet
                }
              }
            }
            return null
          })
          return Promise.resolve(newSheetColl)
        }
        return Promise.resolve(everySheet)
      })
  },
  get: (id) => {
    return dbLib.get()
      .then((db) => col(db).findOne({id: id}))
      .then((sheet) => {
        if(sheet !== null) return State.hidrate('sheet', sheet)
        return null
      })
  },
  updateById: (id, data) => {
    console.log(data)
    return dbLib.get()
      .then((db) => {
        if(Object.keys(data).length === 0) return Promise.resolve(col(db).find().toArray())
        return col(db).update({id: id}, {$set: data})
      })
      .then(() => dbLib.get())
      .then((db) => col(db).find({}).toArray())
      .then((sheetCollection) => Promise.all(sheetCollection.map(sheet => State.hidrate('sheet', sheet))))
  },
  removeById: (id) => {
    return dbLib.get()
      .then((db) => col(db).remove({id: id}))
      .then(() => dbLib.get())
      .then((db) => col(db).find({}).toArray())
      .then((sheetCollection) => Promise.all(sheetCollection.map(sheet => State.hidrate('sheet', sheet))))
  },
  findByAttr: (attr, value) => {
    return util.findByAttr(collection, attr, value)
  },
  getIdswithFilters: (filters) => {
    const keysFilters = Object.keys(filters) 
    return dbLib.get()
    .then((db) => {
      const filtersMongo = {}
      if(keysFilters.length !== 0) {
        filtersMongo.$or = []
        keysFilter = Object.keys(filters)
        for( let i = 0; i < keysFilter.length; i++) {
          const or = {}
          or[keysFilters[i]] = { $in: JSON.parse(filters[keysFilters[i]]) }
          filtersMongo.$or.push(or)
        }
      }
      return col(db).find(filtersMongo).toArray()
    })
    .then(sheetsFiltered => Promise.resolve(sheetsFiltered.map(ele => ele.id)))
  },
  __emptyCollection__: () => {
    return dbLib.get()
      .then((db) => col(db).remove({}))
  },
  __getCollection__: () => {
    return dbLib.get()
      .then((db) => col(db).find().toArray())
  }
}