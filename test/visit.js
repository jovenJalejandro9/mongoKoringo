/* eslint-env mocha */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'
// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const Visit = require('../model/visit')
const Sheet = require('../model/sheet')
const chaiThings = require('chai-things')
const example = require('../lib/examples')

chai.use(chaiHttp)
chai.should()
chai.use(chaiThings)

/*
* Test the Visit
*/

/*
* POST visit
*/
describe('/POST visit', () => {
  beforeEach((done) => {
    Promise.all([Visit.__emptyCollection__(), Sheet.__emptyCollection__()])
      .then(done())
  })
  it('should return a Incorrect token error when trying to create a visit without the compulsory fields', (done) => {
    const visit = {
      date: 'Wed Feb 28'
    }
    chai.request(app)
      .post('/visits')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(visit)
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('A new visit should have at least sheet_id')
        done()
      })
  })
  it('should return a Incorrect token error when trying to create a visit with a wrong sheet_id', (done) => {
    const visit = {
      sheet_id: 12,
      user_id: 1,
      date: 'Wed Feb 28'
    }
    chai.request(app)
      .post('/visits')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(visit)
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('This sheet does not exist')
        done()
      })
  })
  it('should return a Incorrect token error when trying to create a visit with a idSheet associated to another visit', (done) => {
    const sheet = {
      name: 'Jose',
      first_surname: 'Perez',
      address: 'Pueblo Joven 5 de Noviembre 43, Chiclayo',
      zone: 'Chiclayo'
    }
    Sheet
      .create(sheet)
      .then((sheets) => {
        const visit = {
          sheet_id: sheets[0].id
        }
        Visit
          .create(visit)
          .then(() => {
            chai.request(app)
              .post('/visits')
              .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
              .send(visit)
              .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('code')
                res.body.should.have.property('message')
                res.body.should.have.property('message').eql('There is already a visit with this sheet')
                done()
              })
          })
      })
  })

  it('should return a json collection when trying to create an visit with every fields', (done) => {
    const sheet = {
      id: 2,
      name: 'Amparo',
      first_surname: 'Ribola',
      address: 'Pueblo Joven 5 de Noviembre 43, Chiclayo',
      zone: 'Chiclayo'
    }
    Sheet
      .create(sheet)
      .then((sheets) => {
        const visit = {
          user_id: 1,
          sheet_id: sheets[0].id,
          date: 'Wed Feb 28'
        }
        chai.request(app)
          .post('/visits')
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .send(visit)
          .end((err, res) => {
            res.should.have.status(201)
            res.body.should.be.a('array')
            res.body.length.should.be.eq(1)
            done()
          })

      })
  })
})
/*
* GET visit
*/
describe('/GET  visit', () => {
  beforeEach((done) => {
    Promise.all([Visit.__emptyCollection__(), Sheet.__emptyCollection__()])
      .then(() => {
        example.sheet1.zone = 'Illimo'
        return
      })
      .then(Sheet.create(example.sheet1))
      .then(Sheet.create(example.sheet2))
      .then(done())
  })
  it('should return a empty json collection when trying to get the visits when the db is empty', (done) => {
    chai.request(app)
      .get('/visits')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eq(0)
        done()
      })
  })

  it('should return a json collection when trying to get the visit and there is one visit on the DB', (done) => {
    Sheet
      .getAll({})
      .then((sheets) => {
        const visit = {
          sheet_id: sheets[0].id
        }
        Visit
          .create(visit)
          .then(() => {
            chai.request(app)
              .get('/visits')
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
  it('should return a json collection when trying to get the visit filtering by zone=["Illimo"]', (done) => {
    Sheet
      .getAll({})
      .then((sheets) => {
        const visit1 = {
          sheet_id: sheets[0].id
        }
        Visit
          .create(visit1)
          .then(() => {
            const visit2 = {
              sheet_id: sheets[1].id
            }
            Visit
              .create(visit2)
              .then(() => {
                chai.request(app)
                  .get('/visits?zone=["Illimo"]')
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
  })
})
/*
* GET visit/:id
*/
describe('/GET/:id visit', () => {
  beforeEach((done) => {
    Promise.all([Visit.__emptyCollection__(), Sheet.__emptyCollection__()])
      .then(done())
  })
  it('should return an empty json token when trying to get the visits with wrong idVisit', (done) => {
    chai.request(app)
      .get('/visits/22')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('object')
        Object.keys(res.body).length.should.be.eq(0)
        done()
      })
  })
  it('should return a json collection when trying to get the visits with correct idVisit', (done) => {
    const sheet = {
      name: 'Amparo',
      first_surname: 'Ribola',
      address: 'Pueblo Joven 5 de Noviembre 43, Chiclayo',
      zone: 'Chiclayo'
    }
    Sheet
      .create(sheet)
      .then((sheets) => {
        const visit = {
          sheet_id: sheets[0].id
        }
        Visit
          .create(visit)
          .then((visits) => {
            chai.request(app)
              .get('/visits/' + visits[0].id)
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
})
/*
* DELETE visit
*/
describe('/DELETE  visit', () => {
  beforeEach((done) => {
    Promise.all([Visit.__emptyCollection__(), Sheet.__emptyCollection__()])
      .then(done())
  })

  it('should return an empty json collection when trying to delete a visit with a wrong idVisit', (done) => {
    chai.request(app)
      .delete('/visits/22')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(200)
        res.body.should.be.a('array')
        done()
      })
  })
  it('should return a json collection when trying to get the visits just with correct idVisit', (done) => {
    const sheet = {
      name: 'Amparo',
      first_surname: 'Ribola',
      address: 'Pueblo Joven 5 de Noviembre 43, Chiclayo',
      zone: 'Chiclayo'
    }
    Sheet
      .create(sheet)
      .then((sheets) => {
        const visit = {
          user_id: 1,
          date: 'Wed Feb 28'
        }
        visit.sheet_id = sheets[0].id
        Visit
          .create(visit)
          .then((visits) => {
            chai.request(app)
              .delete('/visits/' + visits[0].id)
              .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
              .send()
              .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.be.eq(0)
                done()
              })
          })
      })
  })
})

/*
* PATCH visit/:id
*/
describe('/PATCH/:id visit', () => {
  beforeEach((done) => {
    Promise.all([Visit.__emptyCollection__(), Sheet.__emptyCollection__()])
      .then(Sheet.create(example.sheet1))
      .then(Sheet.create(example.sheet2))
      .then(done())
  })

  it('should return an empty json collection when trying to patch a visits with wrong idVisit', (done) => {
    chai.request(app)
      .patch('/visits/2334')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res) => {
        res.should.have.status(400)
        res.body.should.be.a('object')
        done()
      })
  })

  it('should error token json when trying to patch a visit with a non-existent user_id', (done) => {
    const sheet = {
      name: 'Amparo',
      first_surname: 'Ribola',
      address: 'Pueblo Joven 5 de Noviembre 43, Chiclayo',
      zone: 'Chiclayo'
    }
    Sheet
      .create(sheet)
      .then((sheets) => {
        const visit = {
          sheet_id: sheets[0].id,
          date: 'Wed Feb 28'
        }
        const change = {
          user_id: 1234
        }
        Visit
          .create(visit)
          .then((visits) => {
            chai.request(app)
              .patch('/visits/' + visits[0].id)
              .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
              .send(change)
              .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                done()
              })
          })
      })
  })
  it('should error token json when trying to patch a visit with a non-existent shetId', (done) => {
    const sheet = {
      name: 'Amparo',
      first_surname: 'Ribola',
      address: 'Pueblo Joven 5 de Noviembre 43, Chiclayo',
      zone: 'Chiclayo'
    }
    Sheet
      .create(sheet)
      .then((sheets) => {
        const visit = {
          sheet_id: sheets[0].id,
          date: 'Wed Feb 28'
        }
        const change = {
          sheet_id: 1234
        }
        Visit
          .create(visit)
          .then((visits) => {
            chai.request(app)
              .patch('/visits/' + visits[0].id)
              .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
              .send(change)
              .end((err, res) => {
                res.should.have.status(400)
                res.body.should.be.a('object')
                done()
              })
          })
      })
  })
  it('should error token json when trying to patch a visit with pointing to the same sheet than another', (done) => {
    Sheet
      .__getCollection__()
      .then((sheets) => {
        const visit = {
          sheet_id: sheets[0].id
        }
        const change = {
          sheet_id: visit.sheet_id
        }
        const visit2 = {
          sheet_id: sheets[1].id
        }
        Visit
          .create(visit)
          .then(() => {
            Visit
              .create(visit2)
              .then((visits) => {
                chai.request(app)
                  .patch('/visits/' + visits[1].id)
                  .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
                  .send(change)
                  .end((err, res) => {
                    res.should.have.status(400)
                    res.body.should.be.a('object')
                    done()
                  })
              })
          })
      })
  })
  it('should return a json collection when trying to patch a visit with everything OK', (done) => {
    const sheet = {
      name: 'Amparo',
      first_surname: 'Ribola',
      address: 'Pueblo Joven 5 de Noviembre 43, Chiclayo',
      zone: 'Chiclayo'
    }
    Sheet
      .create(sheet)
      .then((sheets) => {
        const visit = {
          user_id: 1,
          date: 'Wed Feb 28'
        }
        const change = {
        }
        visit.sheet_id = sheets[0].id
        Visit
          .create(visit)
          .then((visits) => {
            chai.request(app)
              .patch('/visits/' + visits[0].id)
              .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
              .send(change)
              .end((err, res) => {
                res.should.have.status(200)
                res.body.should.be.a('array')
                done()
              })
          })
      })
  })
})
