const dbLib = require('./db')

function nextStates(stateValue, [head, ...tail] = []) {
  if (head === undefined) {
    return [stateValue]
  }
  if (stateValue.id === head.prev_state_id) {
    return [stateValue, ...nextStates(head, tail)]
  }
  return [...nextStates(stateValue, tail)]
}

module.exports = {
  replace: (collection, id, element) => {
    const newCollection = collection.map((ele) => {
      if (ele.id === id) {
        found = true
        return element
      }
      return ele
    })
    return Promise.resolve(newCollection)

  },
  findByAttr: (collection, attr, value) => {
    return dbLib.get()
      .then((db) => {
        const filter = {}
        filter[attr] = value
        return db.collection(collection).find(filter).toArray()
      })
  },
  pick: (obj, attrList) => {
    const res = {}
    attrList.forEach((attr) => {
      if (obj.hasOwnProperty(attr)) {
        res[attr] = obj[attr]
      }
    })
    return res
  },
  prepareData: (data, attrs) => {
    data.timestamp = new Date()
    nullData = module.exports.nullComplete(data, attrs)
    return nullData
  },
  checkFields: (attrs, data) => {
    for (let i = attrs.length - 1; i >= 0; i--) {
      if (!data.hasOwnProperty(attrs[i])) {
        return false
      }
    }
    return true
  },
  findLastState: (statesArray, field) => {
    if (statesArray === undefined || !statesArray) return null
    for (let i = statesArray.length - 1; i >= 0; i--) {
      if (statesArray[i].show) {
        return statesArray[i].value[field]
      }
    }
    return null
  },
  nullComplete: (obj, attrList) => {
    attrList.forEach((attr) => {
      if (!obj.hasOwnProperty(attr)) {
        obj[attr] = null
      }
    })
    return obj
  },
  nextStates: (firsState, collection) => {
    return nextStates(firsState, collection)
  },
  findOne: (bigArray, smallArray) => {
    return smallArray.some((v) => {
      return bigArray.indexOf(v) >= 0
    })
  },
  nextId: (col) => {
    return dbLib.get()
      .then((db) => db.collection(col).find().sort({id: -1}).limit(1).toArray())
      .then((elems) => {
        if (elems.length === 0) return Promise.resolve(1)
        return Promise.resolve(elems[0].id + 1)
      })
  }
}
