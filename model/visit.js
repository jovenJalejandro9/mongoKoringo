// const util = require('../lib/utils')
// const User = require('../model/user')
// const Sheet = require('../model/sheet')
// const attrsVisit = ['sheet_id', 'user_id', 'date', 'state']
// let collection = []
// let idVisit = collection.length
// module.exports = {
//   create: (data) => {
//     if (!util.checkFields(attrsVisit.slice(0, -3), data)) {
//       return Promise.reject('noInfoCreateVisit')
//     }
//     return Sheet
//       .get(data.sheet_id)
//       .then((sheet) => {
//         if (Object.keys(sheet).length === 0) return Promise.reject('noSheet')
//         if (module.exports.checkVisitPending(data.sheet_id) !== undefined) return Promise.reject('existentVisit')
//         const visit = Object.assign({}, data)
//         idVisit++
//         visit.id = idVisit
//         visit.timestamp = util.getDate()
//         visit.state = 'pending'
//         collection.push(util.nullComplete(visit, attrsVisit))
//         return Promise.resolve(collection)
//       })
//   },
//   getAll: (filters) => {
//     if (Object.keys(filters).length > 0) {
//       return Sheet
//         .getIdswithFilters(filters)
//         .then(idSheets => {
//           const newVisitCollection = collection.filter(visit => {
//             return idSheets.includes(visit.sheet_id)
//           })
//           return Promise.resolve(newVisitCollection)
//         })
//     }
//     return Promise.resolve(collection)
//   },
//   get: (id) => {
//     const visit = collection.find((ele) => {
//       return ele.id === id
//     })
//     if (visit === undefined) return Promise.resolve({})
//     return Promise.resolve(visit)
//   },
//   updateById: (id, data) => {
//     if (data.hasOwnProperty('state' && data.state !== ('pending' || 'done'))) delete data.state
//     return User
//       .get(data.user_id)
//       .then((user) => {
//         if (Object.keys(user).length === 0 && data.hasOwnProperty('user_id')) return Promise.reject('noUser')
//         return Sheet
//           .get(data.sheet_id)
//           .then((sheet) => {
//             if (Object.keys(sheet).length === 0 && data.hasOwnProperty('sheet_id')) return Promise.reject('noUser')
//             if (module.exports.checkVisitPending(data.sheet_id) !== undefined) return Promise.reject('existentVisit')
//             return util
//               .findByAttr(collection, 'id', id)
//               .then(ele => util.merge(ele, data))
//               .then(newEle => util.replace(collection, id, newEle))
//               .then((newcollection) => {
//                 collection = newcollection
//                 return newcollection
//               })
//           })
//       })
//   },
//   removeById: (id) => {
//     collection = collection.filter((ele) => {
//       return ele.id !== id
//     })
//     return Promise.resolve(collection)
//   },
//   findByAttr: (attr, value) => {
//     return util.findByAttr(collection, attr, value)
//   },
//   checkVisitPending: (sheetId) => {
//     const aux = collection.find((visit) => visit.sheet_id === sheetId && visit.state === 'pending')
//     return aux
//   },
//   __emptyCollection__: () => {
//     collection = []
//     return Promise.resolve(collection)
//   },
//   __getVisits__: () => {
//     return Promise.resolve(collection)
//   }
// }
