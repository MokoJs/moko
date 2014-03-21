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
      expect(user._attrs).to.be.an(Object);
    });
  });

  describe('Model.use', function() {
    it('passes the Moko to the plugin', function(done) {
      expect(User.use).to.be.a('function');
      User.use(plugin);
      function plugin(Moko) {
        expect(Moko).to.be(User);
        done();
      }
    });
  });

  describe('Model.middleware', function() {
    it('adds the middleware', function() {
      function *gen() {}
      User.middleware('initialize', gen);
      expect(User._middlewares.initialize).to.have.length(1);
      expect(User._middlewares.initialize[0]).to.be(gen);
    });
  });

  describe('Model.run', function() {
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
      User.removeMiddleware();
    }));
  });

  describe('Model.attr', function() {
    before(function() {
      User.attr('name');
    });

    it('creates a getter', co(function*() {
      var user = yield new User({name: 'Bob'});
      expect(user.name).to.be('Bob');
    }));
    it('creates a setter', co(function*() {
      var user = yield new User();
      user.name = 'Bob';
      expect(user._attrs.name).to.be('Bob');
    }));

    describe('events', function() {
      it('emits "change" on model', function(done) {
        co(function*() {
          var user = yield new User({name: 'Bob'});
          User.on('change', function(instance, prop, val, old) {
            expect(instance).to.be(user);
            expect(prop).to.be('name');
            expect(val).to.be('Marko');
            expect(old).to.be('Bob');
            User.removeAllListeners();
            done();
          });
          user.name = 'Marko';
        })();
      });

      it('emits "change" on instance', function(done) {
        co(function*() {
          var user = yield new User({name: 'Bob'});
          user.on('change', function(prop, val, old) {
            expect(prop).to.be('name');
            expect(val).to.be('Marko');
            expect(old).to.be('Bob');
            user.removeAllListeners();
            done();
          });
          user.name = 'Marko';
        })();
      });

      it('emits "change <attr>" on model', function(done) {
        co(function*() {
          var user = yield new User({name: 'Bob'});
          User.on('change name', function(instance, val, old) {
            expect(instance).to.be(user);
            expect(val).to.be('Marko');
            expect(old).to.be('Bob');
            User.removeAllListeners();
            done();
          });
          user.name = 'Marko';
        })();
      });

      it('emits "change <attr>" on instance', function(done) {
        co(function*() {
          var user = yield new User({name: 'Bob'});
          user.on('change', function(prop, val, old) {
            expect(val).to.be('Marko');
            expect(old).to.be('Bob');
            user.removeAllListeners();
            done();
          });
          user.name = 'Marko';
        })();
      });
    });
  });
});

describe('Moko', function() {
  describe('middleware hooks', function() {
    beforeEach(function() {
      User = new Moko('User');
    });

    it('emits initialize on model', co(function *() {
      var called;
      function *middleware(instance, attrs) {
        expect(attrs).to.eql({name: 'Bob'});
        attrs.name = 'Steve';
        called = true;
      }
      User.middleware('initialize', middleware);
      var user = yield new User({name: 'Bob'});
      expect(called).to.be(true);
      expect(user._attrs.name).to.be('Steve');
    }));

  });
});
