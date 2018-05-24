const UserController = require('../controller/user')
const Session = require('../controller/session')
const VisitController = require('../controller/visit')
const StateController = require('../controller/state')
const SheetController = require('../controller/sheet')
const middleware = require('../lib/middleware')

// API Server Endpoints
module.exports = function routes(router) {
  // Session group
  router.post('/session', Session.createToken)
  // User Group
  router.post('/users',middleware.isAuthenticated, middleware.hasPrivileges,UserController.create)
  router.get('/users', middleware.isAuthenticated, UserController.getAll)
  router.get('/users/:id', middleware.isAuthenticated, UserController.get)
  router.patch('/users/:id', middleware.isAuthenticated, middleware.hasPrivileges, UserController.update)
  router.delete('/users/:id', middleware.isAuthenticated, middleware.hasPrivileges, UserController.delete)
  // Visit Group
  router.post('/visits', VisitController.create)
  router.get('/visits', middleware.isAuthenticated, VisitController.getAll)
  router.get('/visits/:id', middleware.isAuthenticated, VisitController.get)
  router.patch('/visits/:id', middleware.isAuthenticated, VisitController.update)
  router.delete('/visits/:id', middleware.isAuthenticated, VisitController.delete)
  // Sheet Group
  router.post('/sheets', middleware.isAuthenticated, SheetController.create)
  router.get('/sheets', middleware.isAuthenticated, SheetController.getAll)
  router.get('/sheets/:id', middleware.isAuthenticated, SheetController.get)
  router.patch('/sheets/:id', middleware.isAuthenticated, SheetController.update)
  router.delete('/sheets/:id', middleware.isAuthenticated, SheetController.delete)
  // State Group
  router.post('/states', middleware.isAuthenticated, StateController.create)
  router.get('/states', middleware.isAuthenticated, StateController.getAll)
  router.get('/states/:id', middleware.isAuthenticated, StateController.get)
}
