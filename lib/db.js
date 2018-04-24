const MongoClient = require('mongodb').MongoClient

const state = {
  db: null
}

exports.connect = (url) => {
  if (state.db) return Promise.resolve(state.db)
  return MongoClient.connect(url)
    .then((db) => {
      state.db = db
      return Promise.resolve(state.db)
    })
    .catch(err => Promise.reject(err))
}
exports.get = () => {
  return Promise.resolve(state.db)
}
exports.close = () => {
  if (dtate.db) {
    state.db.close((err) => {
      if (err) return Promise.reject(err)
      state.db = null
      return Promise.resolve()
    })
  }
}
