/* eslint-env mocha */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'
// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const State = require('../model/state')
const Sheet = require('../model/sheet')
const User = require('../model/user')
const example = require('../lib/examples')
const chaiThings = require('chai-things')

chai.use(chaiHttp)
const should = chai.should()
chai.use(chaiThings)

/*
* Test the State
*/

/*
* POST state
*/
describe('/POST state', () => {
  beforeEach((done) => {
    Promise.all([State.__emptyCollection__(), Sheet.__emptyCollection__()])
      .then(() => Sheet.create(example.sheet1))
      .then(() => User.create(example.user1))
      .then(() => done())
  })
  it('should return a Incorrect token error when trying to create a state without the compulsory fields', (done) => {
    const state = {
      value: {
        start_year: 2017,
        name: 'Jesus de Prada',
        observations: ''
      },
      user_id: 1,
      remote_id: 3,
      remote_collection: 'sheet'
    }
    chai.request(app)
      .post('/states')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(state)
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('A new state need at least a value, user_id, remote_id, remote_collection, field_name')
        done()
      })
  })
  it('should return a Incorrect token error when trying to create a state with a non-exixting remote collection', (done) => {
    const state = Object.assign({}, example.state1)
    state.remote_collection = 'nonColl'
    chai.request(app)
      .post('/states')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(state)
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('This remote collection does not exist')
        done()
      })
  })
  it('should return a Incorrect token error when trying to create a state with a non-exixting field_name', (done) => {
    const state = Object.assign({}, example.state1)
    state.field_name = 'nonFieldName'
    chai.request(app)
      .post('/states')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(state)
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('This fieldName does not exist')
        done()
      })
  })
  it('should return a Incorrect token error when trying to create a state with a non userId', (done) => {
    const state = Object.assign({}, example.state1)
    state.user_id = 234
    chai.request(app)
      .post('/states')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(state)
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('This user does not exist')
        done()
      })
  })
  it('should return a json collection  when trying to create a state with everything OK', (done) => {
    chai.request(app)
      .post('/states')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(example.state1)
      .end((err, res) => {
        res.should.have.status(201)
        res.body.should.be.a('array')
        res.body.length.should.be.eq(1)
        done()
      })
  })
})

/*
* GET states
*/
describe('/GET/ state', () => {
  beforeEach((done) => {
    Promise.all([State.__emptyCollection__(), Sheet.__emptyCollection__()])
      .then(() => Sheet.create(example.sheet1))
      .then(() => User.create(example.user1))
      .then(() => done())
  })
  it('should return  an empty json collection when trying to get a collection of states and the db does not have states', (done) => {
    chai.request(app)
      .get('/states')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        Object.keys(res.body).length.should.be.eq(0)
        done()
      })
  })
  it('should return  a json collection when trying to get a collection of states wtih some states on the db', (done) => {
    State
      .create(example.state1)
      .then(() => {
        chai.request(app)
          .get('/states')
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .send()
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            Object.keys(res.body).length.should.be.eq(1)
            done()
          })
      })
  })
})
/*
* GET states/:id
*/
describe('/GET/:id state', () => {
  beforeEach((done) => {
    Promise.all([State.__emptyCollection__(), Sheet.__emptyCollection__()])
      .then(() => Sheet.create(example.sheet1))
      .then(() => User.create(example.user1))
      .then(() => done())
  })
  it('should return an empty json token when trying to a get a state with wrong idState', (done) => {
    chai.request(app)
      .get('/states/22')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        should.equal(res.body, null)
        done()
      })
  })
  it('should return a json when trying to get the states with correct idState', (done) => {
    const state = {
      value: {
        start_year: 2017,
        name: 'Autism',
        observations: ''
      },
      user_id: 1,
      remote_id: 2,
      remote_collection: 'sheet',
      field_name: 'medical_diagnose'
    }
    State
      .create(state)
      .then((states) => {
        chai.request(app)
          .get('/states/' + states[0].id)
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .send()
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('object')
            done()
          })
      })
  })
})
