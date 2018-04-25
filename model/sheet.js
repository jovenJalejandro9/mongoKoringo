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
  'general_information', 'manifested_information', 'detected_information', 'warning_information', 'complete']
let collection = [examples.sheet1, examples.sheet2]
let idSheet = collection.length

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
        // idSheet++
        sheet.id = nextId
        sheet.help = false
        sheet.complete = false
        console.log('llegoo')
        return dbLib.get()
      })
      .then((db) => {
        console.log(sheet)
        return col(db).insertOne(util.prepareData(sheet, [...compAttrSheet ,...attrsSheet]))
      })
      .then(() => dbLib.get())
      .then((db) => col(db).find({}).toArray())
      .then((sheetCollection) => Promise.all(sheetCollection.map(sheet => State.hidrate('sheet', sheet))))

    // if (!util.checkFields(attrsSheet.slice(0, 4), data)) {
    //   return Promise.reject('noInfoCreateSheet')
    // }
    // if (module.exports.findOne({name: data.name, first_surname: data.first_surname}) !== undefined) return Promise.reject('participantExist')
    // const sheet = Object.assign({}, data)
    // idSheet++
    // sheet.id = idSheet
    // sheet.help = false
    // sheet.complete = false
    // sheet.timestamp = new Date()
    // collection.push(util.nullComplete(sheet, attrsSheet))
    // return Promise.all(collection.map(ele => State.hidrate('sheet', ele)))
  },
  getAll: (filters) => {
    return dbLib.get()
      .then((db) => col(db).find({}).toArray())
      .then((sheetCollection) => Promise.all(sheetCollection.map(sheet => State.hidrate('sheet', sheet))))
      .then((everySheet) => {
        if (Object.keys(filters).length > 0) {
          const keysFilter = Object.keys(filters)
          console.log(everySheet)
          const newSheetColl = everySheet.filter((sheet) => {
            for (let i = 0; i < keysFilter.length; i++) {
              const filterValues = JSON.parse(filters[keysFilter[i]])
              if (filterStates.includes(keysFilter[i])) {
                console.log(sheet[keysFilter[i]])
                console.log(filterValues)
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
        console.log(sheet)
        if(sheet !== null) return State.hidrate('sheet', sheet)
        return null
      })
    // const sheet = collection.find(ele => ele.id === id)
    // if (sheet === undefined) return Promise.resolve({})
    // return State.hidrate('sheet', sheet)
  },
  updateById: (id, data) => {
    return dbLib.get()
      .then((db) => {
        if(Object.keys(data).length === 0) return Promise.resolve(col(db).find().toArray())
        return col(db).update({id: id}, {$set: data})
      })
      .then(() => dbLib.get())
      .then((db) => col(db).find({}).toArray())
      .then((sheetCollection) => Promise.all(sheetCollection.map(sheet => State.hidrate('sheet', sheet))))

    // return util
    //   .findByAttr(collection, 'id', id)
    //   .then(ele => util.merge(ele, data))
    //   .then(newEle => util.replace(collection, id, newEle))
    //   .then((newcollection) => {
    //     collection = newcollection
    //     return newcollection
    //   })
  },
  removeById: (id) => {
    return dbLib.get()
      .then((db) => col(db).remove({id: id}))
      .then(() => dbLib.get())
      .then((db) => col(db).find({}).toArray())
      .then((sheetCollection) => Promise.all(sheetCollection.map(sheet => State.hidrate('sheet', sheet))))

    // collection = collection.filter((ele) => {
    //   return ele.id !== id
    // })
    // return Promise.resolve(collection)
  },
  findByAttr: (attr, value) => {
    return util.findByAttr(collection, attr, value)
  },
  getIdswithFilters: (filters) => {
    const idSheets = []
    const keysFilter = Object.keys(filters)
    collection.filter((sheet) => {
      for (let i = 0; i < keysFilter.length; i++) {
        const filterValues = JSON.parse(filters[keysFilter[i]])
        if (util.findOne(sheet[keysFilter[i]], filterValues)) {
          idSheets.push(sheet.id)
          return sheet
        }
      }
      return null
    })
    return Promise.resolve(idSheets)
  },
  findOne: (query) => {
    const predicate = (item) => {
      for (const [key, value] of Object.entries(query)) {
        if (item[key] !== value) return false
      }
      return true
    }
    return collection.find(predicate)
  },
  __emptyCollection__: () => {
    collection = []
    return Promise.resolve(collection)
  },
  __getCollection__: () => {
    return Promise.resolve(collection)
  }
}
