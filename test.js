const chai = require('chai');
const chaihttp = require('chai-http');

const server = require('./app');

// Assertion style
chai.should();

chai.use(chaihttp);
describe('Test API', () => {
  // test GET
  describe('GET /', () => {
    it('it should get all the tasks', (done) => {
      chai.request(server)
        .get('/')
        .end((_err, response) => {
          response.should.have.status(200);
          done();
        });
    });
  });

  // test POST
  describe('POST /translate', () => {
    it('it should POST all the tasks', (done) => {
      const data = {
        speech: 'Shubham',
        language: 'hi',
      };
      chai.request(server)
        .post('/translate')
        .send(data)
        .end((err, response) => {
          response.should.have.status(200);
          // response.should.be.a('object');
          done();
        });
    });
  });
});