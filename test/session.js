// During the test the env variable is set to test
process.env.NODE_ENV = 'test'
// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
const app = require('../app')
const User = require('../model/user')

chai.use(chaiHttp)
chai.should()
/*
* Test the Session
*/
describe('/POST session', () => {
  beforeEach((done) => {
    User.__emptyCollection__()
      .then(() => done())
  })

  it('should return a Incorrect token error when trying to login with wrong fields', (done) =>{
    const login = {
      name: 'Peter',
      password: 'batata'
    }
    chai.request(app)
      .post('/session')
   	  .send(login)
      .end((err, res)=>{
        res.should.have.status(401)
        res.body.should.be.a('object')
        res.body.should.have.property('code')
        res.body.should.have.property('message')
        res.body.should.have.property('message').eql('The login is not correct')
        done()
      })
  })
  it('should return a correct token error when trying to init session with a correct root user', (done) => {

    const login = {
      name: 'root',
      password: 'kilombo'
    }
    chai.request(app)
      .post('/session')
      .send(login)
      .end((err, res)=>{
        res.should.have.status(200)
        res.body.should.be.a('object')
        res.body.should.have.property('token')
        done()
      })
  })
  it('should return a correct Token when trying to login with a normal user', (done) =>{
    const user = {
      name: 'Sonia',
      first_surname: 'Lolo',
      second_surname: 'Aria',
      nickname: 'Sonya',
      email: 'sonialolo@gmail.com:',
      password: '69016ee62c6fd731218a3743a585dbfc',
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
    const login = {
      name: 'Sonia',
      password: 'kilombo'
    }
    // We create a new normal user
    User.create(user)
      .then(() =>{
        chai.request(app)
          .post('/session')
          .send(login)
          .end((err, res)=>{
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have.property('token')
            done()
          })
      })
  })
})


