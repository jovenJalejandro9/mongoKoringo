const util = require('../lib/utils')
const State = require('../model/state')
const examples = require('../lib/examples')

const filterStates = ['family_inCharge', 'family_information', 'education_center',
  'medical_therapies', 'medical_diagnose', 'medical_mobility', 'medical_wheel_chair', 'medical_comunication',
  'medical_tests', 'medical_treatment', 'home_own_rent', 'home_material', 'economic_familiar_income', 'economic_external_support']
const attrsSheet = ['name', 'first_surname', 'zone', 'address', 'second_surname', 'birthday', 'id_number', 'photos_family',
  'photos_house', 'family_inCharge', 'family_information', 'education_center', 'social_situation', 'medical_therapies',
  'medical_diagnose', 'medical_mobility', 'medical_wheel_chair', 'medical_comunication', 'medical_tests', 'medical_treatment', 'medical_relative_disease',
  'home_own_rent', 'home_material', 'home_facilities', 'home_num_rooms', 'home_numBeds', 'home_forniture', 'home_salubrity',
  'economic_familiar_income', 'economic_external_support', 'economic_feeding_center', 'economic_others',
  'general_information', 'manifested_information', 'detected_information', 'warning_information', 'complete']
let collection = [examples.sheet1, examples.sheet2]
let idSheet = collection.length

module.exports = {
  create: (data) => {
    if (!util.checkFields(attrsSheet.slice(0, 4), data)) {
      return Promise.reject('noInfoCreateSheet')
    }
    if (module.exports.findOne({name: data.name, first_surname: data.first_surname}) !== undefined) return Promise.reject('participantExist')
    const sheet = Object.assign({}, data)
    idSheet++
    sheet.id = idSheet
    sheet.help = false
    sheet.complete = false
    sheet.timestamp = new Date()
    collection.push(util.nullComplete(sheet, attrsSheet))
    return Promise.all(collection.map(ele => State.hidrate('sheet', ele)))
  },
  getAll: (filters) => {
    return Promise.all(collection.map(sheet => State.hidrate('sheet', sheet)))
      .then((everySheet) => {
        if (Object.keys(filters).length > 0) {
          const keysFilter = Object.keys(filters)
          const newSheetColl = everySheet.filter((sheet) => {
            for (let i = 0; i < keysFilter.length; i++) {
              const filterValues = JSON.parse(filters[keysFilter[i]])
              if (filterStates.includes(keysFilter[i])) {
                if (util.findOneState(sheet[keysFilter[i]], filterValues)) {
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
    const sheet = collection.find(ele => ele.id === id)
    if (sheet === undefined) return Promise.resolve({})
    return State.hidrate('sheet', sheet)
  },
  updateById: (id, data) => {
    return util
      .findByAttr(collection, 'id', id)
      .then(ele => util.merge(ele, data))
      .then(newEle => util.replace(collection, id, newEle))
      .then((newcollection) => {
        collection = newcollection
        return newcollection
      })
  },
  removeById: (id) => {
    collection = collection.filter((ele) => {
      return ele.id !== id
    })
    return Promise.resolve(collection)
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
