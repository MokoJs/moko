/* jshint esnext: true, noyield: true*/

var expect = require('expect.js'),
    co = require('co');

var Moko = require('../'),
    User = new Moko('User');

describe('Moko Base Methods', function() {

  describe("Constructor", function() {
    var user;
    beforeEach(co(function *() {
      user = yield new User();
    }));

    it('initializes attrs', function() {
      expect(user.attrs).to.be.an(Object);
    });
  });

  describe('Moko.use', function() {
    it('passes the Moko to the plugin', function(done) {
      expect(User.use).to.be.a('function');
      User.use(plugin);
      function plugin(Moko) {
        expect(Moko).to.be(User);
        done();
      }
    });
  });

  describe('Moko.middleware', function() {
    it('adds the middleware', function() {
      function *gen() {}
      User.middleware('initialize', gen);
      expect(User._middlewares.initialize).to.have.length(1);
      expect(User._middlewares.initialize[0]).to.be(gen);
    });
  });

  describe('Moko.run', function() {
    it('runs all the middlewares of given name', co(function *() {
      var called, calledTwo;
      function *genOne(args) {
        called = true;
        return true;
      }
      function *genTwo(args) {
        calledTwo = true;
        return true;
      }
      User.middleware('initialize', genOne);
      User.middleware('initialize', genTwo);
      yield User.run('initialize');
      expect(called).to.be(true);
      expect(calledTwo).to.be(true);
    }));
  });
});

describe('Moko', function() {
  describe('middleware hooks', function() {
    beforeEach(function() {
      User = new Moko('User');
    });
    it('emits initialize', co(function *() {
      var called;
      function *middleware(attrs) {
        expect(attrs).to.eql({name: 'Bob'});
        called = true;
      }
      User.middleware('initialize', middleware);
      var user = yield new User({name: 'Bob'});
      expect(called).to.be(true);
    }));
  });
});
