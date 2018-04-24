process.env.NODE_ENV = 'test'
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const User = require('../model/user')
const config = require('../lib/config')
const chaiThings = require('chai-things')
const jwt = require('jsonwebtoken')

chai.use(chaiHttp)
chai.should()
chai.use(chaiThings)

describe('Checking the privileges', () => {
  beforeEach((done) => {
    User.__emptyUsers__()
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
  it('should return a Incorrect token error when trying to access a private endpoint with an invalid token', (done) =>{
    chai.request(app)
      .get('/users')
      .set('authorization', 'Bearer u25KdsjXHaVU3G3PQgPiFy7KIWbfdIi6NyT6qjIQP3o')
      .set('user', '{"role":"admin"}')
      .end((err, res) => {
        res.should.have.status(401)
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('Incorrect token')
        done()
      })
  })
  it('should return a Incorrect token error when trying to access a private endpoint with no token', (done) =>{
    chai.request(app)
      .get('/users')
      .set('user', '{"role":"admin"}')
      .end((err, res)=>{
        res.should.have.status(401)
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('Incorrect token')
        done()
      })
  })
  it('should return a Incorrect token error when trying to access a private endpoint with a normal user token', (done) =>{
    User
      .create(user)
      .then((collection) => {
        const idUser = collection[collection.length - 1].id
        const token = jwt.sign({id: idUser}, config.secretKey)
        chai.request(app)
          .post('/users')
          .set('authorization', 'Bearer ' + token)
          .end((err, res)=>{
            res.should.have.status(401)
            res.body.should.have.property('code')
            res.body.should.have.property('message')
            res.body.should.have.property('message').eql('Not Authorized')
            done()
          })
      })
      .catch(done)
  })
  it('should return a 201 status value when trying to access a private endpoint with a root user token (We call POST USER )', (done) =>{
    User
      .getAll({})
      .then((collection) => {
        const idUser = collection[0].id
        const token = jwt.sign({id: idUser}, config.secretKey)
        chai.request(app)
          .post('/users/')
          .set('authorization', 'Bearer ' + token)
          .send(user)
          .end((err, res)=>{
            res.should.have.status(201)
            done()
          })
      })
      .catch(done)
  })
})
