/* eslint-env mocha */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'
// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const Sheet = require('../model/sheet')
const State = require('../model/state')
const example = require('../lib/examples')
const chaiThings = require('chai-things')

chai.use(chaiHttp)
const should = chai.should()
chai.use(chaiThings)
/*
* Test the Sheet
*/

/*
* POST sheet
*/
describe('/POST sheet', () => {
  beforeEach((done) => {
    Promise.all([Sheet.__emptyCollection__(), State.__emptyCollection__()])
      .then(Sheet.create(example.sheet1))
      .then(Sheet.getAll({}))
      .then(() => done())
  })

  it('should return a Incorrect token error when trying to create a sheet without the compulsory fields', (done) => {
    const sheet = {
      value: 2
    }
    chai.request(app)
      .post('/sheets')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(sheet)
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('A new sheet should have at least name, first surname, zone and addres')
        done()
      })
  })
  it('should return a Incorrect token error when trying to create a sheet with the same name and lastname', (done) => {
    chai.request(app)
      .post('/sheets')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(example.sheet1)
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('This participant already exist')
        done()
      })
  })
  it('should return a json collection when trying to create a sheet with everything OK', (done) => {
    chai.request(app)
      .post('/sheets')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(example.sheet2)
      .end((err, res) => {
        res.should.have.status(201)
        res.body.should.be.a('array')
        done()
      })
  })
})
/*
* GET sheets
*/
describe('/GET/ sheet', () => {
  beforeEach((done) => {
    Promise.all([Sheet.__emptyCollection__(), State.__emptyCollection__()])
      .then(() => Sheet.create(example.sheet1))
      .then(() => Sheet.create(example.sheet2))
      .then((sheets) => {
        example.state1.remote_id = sheets[0].id
        example.state2.remote_id = sheets[0].id
        return State.create(example.state1)
      })
      .then(() => State.create(example.state2))
      .then(() => done())
  })
  it('should return  an empty json collection when trying to get a collection of sheets and the db does not have sheets', (done) => {
    Sheet.__emptyCollection__()
      .then(() => {
        chai.request(app)
          .get('/sheets')
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .send()
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            Object.keys(res.body).length.should.be.eq(0)
            done()
          })
      })
  })
  it('should return json collection with every sheets when trying to get a collection of sheets with no filters', (done) => {
    chai.request(app)
      .get('/sheets')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        Object.keys(res.body).length.should.be.eq(2)
        done()
      })
  })
  it('should return json collection with every sheets when trying to get a collection of sheets with wrong filters', (done) => {
    chai.request(app)
      .get('/sheets?nonfilter=[ "Autism"]')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        Object.keys(res.body).length.should.be.eq(2)
        done()
      })
  })
  it('should return json collection when trying to get a collection with a normal filter and just one value(name=["Javier"])', (done) => {
    chai.request(app)
      .get('/sheets?name=[ "Javier"]')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        Object.keys(res.body).length.should.be.eq(1)
        done()
      })
  })
  it('should return json collection when trying to get a collection with with normal filter and more than one value(name=["Javier","Jose"])', (done) => {
    chai.request(app)
      .get('/sheets?name=["Javier", "Jose"]')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        Object.keys(res.body).length.should.be.eq(2)
        done()
      })
  })
  it('should return json collection when trying to get a collection with with state filter(medical_diagnose=[Down Sindrome])', (done) => {
    chai.request(app)
      .get('/sheets?medical_diagnose=["Down Sindrome"]')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eq(1)
        done()
      })
  })
  it('should return json collection when trying to get a collection with with state filter and a normal filter(medical_diagnose=[Down Sindrome&name=["Jose"])', (done) => {
    chai.request(app)
      .get('/sheets?medical_diagnose=["Down Sindrome"]&name=["Jose"]')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eq(2)
        done()
      })
  })
})
/*
* GET:id sheet
*/
describe('/GET sheet', () => {
  beforeEach((done) => {
    Promise.all([Sheet.__emptyCollection__(), State.__emptyCollection__()])
      .then(() => Sheet.create(example.sheet1))
      .then(() => Sheet.create(example.sheet2))
      .then((sheets) => {
        example.state1.remote_id = sheets[0].id
        example.state2.remote_id = sheets[0].id
        return State.create(example.state1)
      })
      .then(() => State.create(example.state2))
      .then(() => done())
  })
  it('should return an empty json when trying to get a sheet with a wrong id', (done) => {
    chai.request(app)
      .get('/sheets/23452')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        should.equal(res.body, null)
        done()
      })
  })
  it('should return a sheet json when trying to get a sheet with a good id', (done) => {
    Sheet
      .getAll({})
      .then((sheets) => {
        chai.request(app)
          .get('/sheets/' + sheets[0].id)
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

/*
* PATCH:id sheet
*/
describe('/PATCH sheet', () => {
  beforeEach((done) => {
    Promise.all([Sheet.__emptyCollection__(), State.__emptyCollection__()])
      .then(() => Sheet.create(example.sheet1))
      .then(() => Sheet.create(example.sheet2))
      .then((sheets) => {
        example.state1.remote_id = sheets[0].id
        example.state2.remote_id = sheets[0].id
        return State.create(example.state1)
      })
      .then(() => State.create(example.state2))
      .then(() => done())
  })
  it('should return a json collection with no changes when trying to patch a sheet with a wrong id', (done) => {
    const change = {
      name: 'Raul'
    }
    chai.request(app)
      .patch('/sheets/23452')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(change)
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        done()
      })
  })
  it('should return a json collection with no changes when trying to patch a sheet with a wrong field', (done) => {
    const change = {
      medical_mobility: true
    }
    Sheet
      .getAll({})
      .then((sheets) => {
        chai.request(app)
          .patch('/sheets/' + sheets[0].id)
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .send(change)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            should.equal(res.body[0].medical_mobility, null)
            done()
          })
      })
  })
  it('should return a json collection with the fields updated when trying to patch a sheet with correct fields', (done) => {
    const change = {
      name: 'Raul'
    }
    Sheet
      .getAll({})
      .then((sheets) => {
        chai.request(app)
          .patch('/sheets/' + sheets[0].id)
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .send(change)
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            should.equal(res.body[0].name, 'Raul')
            done()
          })
      })
  })
})

/*
* DELETE:id sheet
*/
describe('/POST sheet', () => {
  beforeEach((done) => {
    Sheet.__emptyCollection__()
      .then(() => {
        State.__emptyCollection__()
          .then(() => {
            Sheet.create(example.sheet1)
              .then(() => {
                Sheet.create(example.sheet2)
                  .then((sheets) => {
                    example.state1.remote_id = sheets[0].id
                    example.state2.remote_id = sheets[0].id
                    State.create(example.state1)
                      .then(() => {
                        State.create(example.state2)
                          .then(() => done())
                      })
                  })
              })
          })
      })
  })
  it('should return a json collection with no eliminations when trying to delete a sheet with a wrong id', (done) => {
    chai.request(app)
      .delete('/sheets/23452')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eq(2)
        done()
      })
  })
  it('should return a json collection with one less element when trying to patch a sheet with a correct field', (done) => {
    Sheet
      .getAll({})
      .then((sheets) => {
        chai.request(app)
          .delete('/sheets/' + sheets[0].id)
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .end((err, res) => {
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eq(1)
            done()
          })
      })
  })
})

