/* eslint-env mocha */
// During the test the env variable is set to test
process.env.NODE_ENV = 'test'
// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const User = require('../model/user')
const example = ('../lib/examples')

chai.use(chaiHttp)
const should = chai.should()

/*
* Test the User
*/

/*
* POST user
*/
describe('/POST user', () => {
  beforeEach((done) => {
    User.__emptyCollection__()
      .then(() => done())
      .catch(done)
  })
  it('should return a Incorrect token error when trying to create an user without the compulsory fields', (done) =>{
    const user = {
      name: 'Esteban',
      password: 'kilombo',
      tel: '300330022',
      address: 'c/ Vinto'
    }
    chai.request(app)
      .post('/users')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(user)
      .end((err, res)=>{
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('A new user need at least name, first_surname, second_surname, nickname, email, birthday, studies,proffessions and prev_volunteering')
        done()
      })
  })
  it('should return a Incorrect token error when trying to create an user with a role differente than normal or admin', (done) =>{
    const user = {
      name: 'Sonia',
      password: 'kilombo',
      first_surname: 'Lolo',
      second_surname: 'Aria',
      nickname: 'Sonya',
      email: 'sonialolo@gmail.com:',
      birthday: '1984-01-12',
      studies: [
        'journalism',
        'psychology'
      ],
      professions: [
        'teacher',
        'psychologist'
      ],
      prev_volunteering: [
        'AMI3'
      ],
      role: 'almirant'
    }
    chai.request(app)
      .post('/users')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(user)
      .end((err, res)=>{
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('Incorrect Role')
        done()
      })
  })
  it('should return a json collection when trying to create an user with at least the compulsory fields', (done) =>{
    const user = {
      name: 'Sonia',
      first_surname: 'Lolo',
      second_surname: 'Aria',
      nickname: 'Sonya',
      email: 'sonialolo@gmail.com:',
      password: 'kilombo',
      birthday: '1984-01-12',
      studies: [
        'journalism',
        'psychology'
      ],
      professions: [
        'teacher',
        'psychologist'
      ],
      prev_volunteering: [
        'AMI3'
      ]
    }
    chai.request(app)
      .post('/users')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(user)
      .end((err, res)=>{
        res.should.have.status(201)
        res.body.should.be.a('array')
        res.body.length.should.be.eq(2)
        res.body[0].should.have.property('id').eql(1)
        done()
      })
  })
})
/*
* GET user
*/
describe('/GET  user', () => {
  beforeEach((done) => {
    User.__emptyCollection__()
      .then(() => done())
      .catch(done)
  })
  const user = {
    name: 'Sonia',
    first_surname: 'Lolo',
    second_surname: 'Aria',
    nickname: 'Sonya',
    email: 'sonialolo@gmail.com:',
    password: 'kilombo',
    birthday: '1984-01-12',
    studies: [
      'journalism',
      'psychology'
    ],
    professions: [
      'teacher',
      'psychologist'
    ],
    prev_volunteering: [
      'AMI3'
    ]
  }
  const user2 = {
    name: 'Arturo',
    first_surname: 'Magallanes',
    second_surname: 'Romero',
    nickname: 'Arturo',
    email: 'arturomaga@gmail.com:',
    password: 'kilombo',
    birthday: '1984-01-12',
    studies: [
      'chef'
    ],
    professions: [
      'chef'
    ],
    prev_volunteering: [
      'AMI3'
    ]
  }
  it('should return a json collection when trying to get the users just with the root on the DB', (done) => {
    chai.request(app)
      .get('/users')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .end((err, res)=>{
        res.should.have.status(200)
        res.body.should.be.a('array')
        res.body.length.should.be.eq(1)
        done()
      })
  })

  it('should return a json collection when trying to get the users just with more on the DB', (done) =>{
    User
      .create(user)
      .then(() => {
        chai.request(app)
          .get('/users')
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .end((err, res)=>{
            res.should.have.status(200)
            res.body.should.be.a('array')
            done()
          })
      })
      .catch(done)

  })
  it('should return a json collection when trying to get the users with a invented filter Ej: color=red', (done) =>{
    User
      .create(user)
      .then(() => {
        chai.request(app)
          .get('/users?color=red')
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .end((err, res)=>{
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eq(2)
            const sonia = res.body.find(auxUser => auxUser.name === 'Sonia')
            sonia.should.exist
            done()
          })
      })
      .catch(done)

  })
  it('should return a json collection when trying to get the users just with an existante filter. Ej: professions=["teacher"]', (done) =>{
    User
      .create(user)
      .then(() =>  {
        chai.request(app)
          .get('/users?professions=["teacher"]')
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .end((err, res)=>{
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eq(1)
            const sonia = res.body.find(auxUser => auxUser.name === 'Sonia')
            sonia.should.exist
            done()
          })
      })
      .catch(done)
  })
  it('should return a json collection when trying to get the users just with an existante filter with some values. Ej: professions=["teacher","chef"]', (done) =>{
    User
      .create(user)
      .then(() =>
        User
          .create(user2)
          .then(() =>  {
            chai.request(app)
              .get('/users?professions=["teacher","chef"]')
              .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
              .end((err, res)=>{
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.be.eq(2)
                const sonia = res.body.find(auxUser => auxUser.name === 'Sonia')
                sonia.should.exist
                done()
              })
          })
      )
      .catch(done)
  })
  it('should return a json collection when trying to get the users with differents correct filters. Ej: professions=["teacher"]&studies=["chef"]', (done) =>{
    User
      .create(user)
      .then(() =>
        User
          .create(user2)
          .then(() =>  {
            chai.request(app)
              .get('/users?studies=["journalism"]&professions=["chef"]')
              .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
              .end((err, res)=>{
                res.should.have.status(200)
                res.body.should.be.a('array')
                res.body.length.should.be.eq(2)
                const sonia = res.body.find(auxUser => auxUser.name === 'Sonia')
                sonia.should.exist
                done()
              })
          })
      )
      .catch(done)
  })
})
/*
* GET user/:id
*/
describe('/GET/:id user', () => {
  beforeEach((done) => {
    User.__emptyCollection__()
      .then(() => done())
      .catch(done)
  })
  it('should return a json collection when trying to get the users with wrong idUser', (done) =>{
    chai.request(app)
      .get('/users/22')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res)=>{
        should.equal(res.body, null)
        done()
      })
  })
  it('should return a json collection when trying to get the users with correct idUser', (done) =>{
    chai.request(app)
      .get('/users/1')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res)=>{
        res.should.have.status(200)
        res.body.should.be.a('object')
        done()
      })
  })
})
/*
* DELETE user
*/
describe('/DELETE  user', () => {
  beforeEach((done) => {
    User.__emptyCollection__()
      .then(() => done())
      .catch(done)
  })
  const user = {
    name: 'Sonia',
    first_surname: 'Lolo',
    second_surname: 'Aria',
    nickname: 'Sonya',
    email: 'sonialolo@gmail.com:',
    password: 'kilombo',
    birthday: '1984-01-12',
    studies: [
      'journalism',
      'psychology'
    ],
    professions: [
      'teacher',
      'psychologist'
    ],
    prev_volunteering: [
      'AMI3'
    ]
  }
  it('should return a json collection when trying to get the users just with wrong idUser', (done) =>{
    chai.request(app)
      .delete('/users/22')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res)=>{
        res.should.have.status(200)
        res.body.should.be.a('array')
        done()
      })
  })
  it('should return a json collection when trying to get the users just with correct idUser', (done) =>{
    User
      .create(user)
      .then((collection) =>  {
        const deleteId = collection[collection.length - 1].id
        chai.request(app)
          .delete('/users/' + deleteId)
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .end((err, res)=>{
            res.should.have.status(200)
            res.body.should.be.a('array')
            done()
          })
      })
      .catch(done)
  })
})

/*
* PATCH user/:id
*/
describe('/PATCH/:id user', () => {
  beforeEach(function setUp(done) {
    User.__emptyCollection__()
      .then(() => done())
      .catch(done)
  })
  const user = {
    name: 'Sonia',
    first_surname: 'Lolo',
    second_surname: 'Aria',
    nickname: 'Sonya',
    email: 'sonialolo@gmail.com:',
    password: 'kilombo',
    birthday: '1984-01-12',
    studies: [
      'journalism',
      'psychology'
    ],
    professions: [
      'teacher',
      'psychologist'
    ],
    prev_volunteering: [
      'AMI3'
    ]
  }
  it('should return a json collection with no modifications when trying to patch the users with a wrong idUser', (done) => {
    chai.request(app)
      .patch('/users/22')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send()
      .end((err, res)=>{
        res.should.have.status(200)
        res.body.should.be.a('array')
        done()
      })
  })
  it('should return a Incorrect token error when trying to patch the users with a wrong role', (done) =>{
    const change = {
      role: 'almirant'
    }
    chai.request(app)
      .patch('/users/20')
      .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .send(change)
      .end((err, res)=>{
        res.should.have.status(400)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('Incorrect Role')
        done()
      })
  })
  it('should return a json collection when trying to patch a user with everything OK', (done) =>{
    const change = {
      name: 'Roberto'
    }
    User
      .create(user)
      .then((collection) => {
        const updateId = collection[collection.length - 1].id
        chai.request(app)
          .patch('/users/' + updateId)
          .set('authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNTIxMDQzMzE5fQ.u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
          .send(change)
          .end((err, res)=>{
            res.should.have.status(200)
            res.body.should.be.a('array')
            res.body.length.should.be.eq(2)
            const roberto = res.body.find(auxUser => auxUser.name === 'Roberto')
            roberto.should.exist
            done()
          })
      })
      .catch(done)
  })
})


