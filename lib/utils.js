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
  nullComplete: (obj, attrList) => {
    attrList.forEach((attr) => {
      if (!obj.hasOwnProperty(attr)) {
        obj[attr] = null
      }
    })
    return obj
  },
  findOne: (bigArray, smallArray) => {
    return smallArray.some((v) => {
      return bigArray.indexOf(v) >= 0
    })
  },
  nextStates: (firsState, collection) => {
    return nextStates(firsState, collection)
  },
  nextId: (col) => {
    return dbLib.get()
      .then((db) => db.collection(col).findOne({$query: {}, $orderby: {id: -1}}))
      .then((ele) => {
        if (ele === null) return Promise.resolve(1)
        return Promise.resolve(ele.id + 1)
      })
  }
}
