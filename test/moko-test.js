/* jshint esnext: true, noyield: true*/

var expect = require('expect.js'),
    co = require('co');

var Moko = require('../'),
    User = new Moko('User');

User.attr('_id');

describe('Moko Base Methods', function() {

  describe("Constructor", function() {
    var user;
    beforeEach(co(function *() {
      user = yield new User();
    }));

    it('initializes attrs', function() {
      expect(user._attrs).to.be.an(Object);
    });

    it('supports arrays', co(function *() {
      var users = yield new User([{name: 'Bobby'}, {name: 'Sam'}]);
      expect(users).to.be.a(Array);
      users.forEach(function() {
        expect(users[0]).to.be.a(User);
        expect(users[1]).to.be.a(User);
      });
    }));
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
      User.middleware('initializing', gen);
      expect(User._middlewares.initializing).to.have.length(1);
      expect(User._middlewares.initializing[0]).to.be(gen);
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
      User.middleware('initializing', genOne);
      User.middleware('initializing', genTwo);
      yield User.run('initializing');
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

    it('returns the Model', function() {
      var Person = new Moko('Person');
      expect(Person.attr('name')).to.be(Person);
    });

    it('sets primary', function() {
      var Person = new Moko('Person').attr('id'),
          Another = new Moko('Person').attr('_id'),
          Again = new Moko('Person').attr('random', { primary: true });

      expect(Person._primary).to.be('id');
      expect(Another._primary).to.be('_id');
      expect(Again._primary).to.be('random');
    });

    it('emits the attr event', function(done) {
      User.on('attr', function(attr, opts) {
        expect(attr).to.be('test');
        expect(opts).to.eql({a: 1});
        done();
      });
      User.attr('test', {a: 1});
    });

    it('adds the attr to Model.attrs', function() {
      expect(User.attrs.name).to.eql({});
    });

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
          user.on('change name', function(val, old) {
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

  describe('Model.validate', function() {
    it('adds the validator to Model._validators', function() {
      var validator = function *() {
      };
      User.validate(validator);
      expect(User._validators).to.have.length(1);
      expect(User._validators[0]).to.be(validator);
      User._validators = [];
    });
  });

  describe('instance methods', function() {
    describe('#set', function() {
      it('sets multiple attributes', co(function*() {
        var user = yield new User();
        user.set({name: 'bob'});
        expect(user.name).to.be('bob');
      }));

      it('ignores attrs not in the schema', co(function*() {
        var user = yield new User();
        user.set({name: 'bob', age: 20});
        expect(user.name).to.be('bob');
        expect(user.age).to.be(undefined);
      }));
    });

    describe('#error', function() {
      it('adds the error', co(function *() {
        var user = yield new User();
        user.error('name', 'cant be blank');
        expect(user._errors).to.have.property('name');
        expect(user._errors.name).to.have.length(1);
      }));
    });

    describe('#errors', function() {
      it('returns all errors if no key specified', co(function *() {
        var user = yield new User();
        user.error('name', 'cant be blank');
        expect(user.errors()).to.have.key('name');
      }));

      it('returns the errors array for the key', co(function *() {
        var user = yield new User();
        user.error('name', 'cant be blank');
        expect(user.errors('name')).to.eql(['cant be blank']);
      }));

      it('returns an empty array if there are no errors', co(function *() {
        var user = yield new User();
        expect(user.errors('name')).to.have.length(0);
      }));
    });

    describe('#isValid', function() {
      it('runs the validators', co(function *() {
        var User = Moko('User'),
            user = yield new User();

        var count = 0;

        User.validate(function *(u) {
          count++;
          expect(u).to.be(user);
          u.error('name', 'cant be blank');
        });
        yield user.isValid();
        expect(count).to.be(1);
      }));

      it('returns true if no errors', co(function*() {
        var user = yield new User();
        expect(yield user.isValid()).to.be(true);
      }));
      
      it('returns false if errors', co(function*() {
        var User = new Moko();
        User.validate(function *() {
          user.error('name', 'dumb');
        });
        var user = yield new User();
        expect(yield user.isValid()).to.be(false);
      }));

      it('supports lookup on a specific field', co(function *() {
        var User = new Moko('User');
        User.validate(function *() {
          user.error('name', 'dumb');
        });
        var user = yield new User();
        expect(yield user.isValid('brobob')).to.be(true);
        expect(yield user.isValid('name')).to.be(false);
      }));
    });

    describe('#primary()', function() {
      it('throws an error if primary is not determined', co(function *() {
        var User = new Moko('User');
        var user = yield new User();
        expect(user.primary).to.throwError('primary key is not defined');
      }));

      it('returns the primary', co(function *() {
        var user = yield new User({_id: 1});
        expect(user.primary()).to.be(1);
      }));
    });

    describe('#isNew()', function() {
      it('returns true if primary() is set', co(function *() {
        var user = yield new User();
        expect(user.isNew()).to.be(true);
      }));
      it('returns false if primary() is not set', co(function *() {
        var user = yield new User({_id: 1});
        expect(user.isNew()).to.be(false);
      }));
    });

    describe('#save', function() {
      var User;
      beforeEach(function () {
        User = new Moko('User').attr('_id');
      });

      it('throws an error if no sync layer', co(function*() {
        var Person = Moko('Person');
        var user = yield new Person();
        try {
          yield user.save();
          expect(false).to.be(true); // shouldnt get here
        } catch(e) {
          expect(e.message).to.be("No sync layer provided");
        }
      }));

      it('throws an error if the model is invalid', co(function*() {
        var Person = new Moko('Person');
        Person.save = function *() {};
        Person.update = function *() {};

        var user = yield new Person();
        Person.validate(function *(p) {
          p.error('name', 'bad name');
        });

        try {
          yield user.save();
          expect(false).to.be(true); // shouldnt get here
        } catch(e) {
          expect(e.message).to.be("validation failed");
        }
      }));

      it('calls Model.save when valid and new', co(function *() {
        var called = false;
        User.save = function *() {
          called = true;
        };
        User.update = function *() { };
        var user = yield new User();
        yield user.save();
        expect(called).to.be(true);
      }));

      it('calls Model.update when valid and old', co(function *() {
        var called = false;

        var User = new Moko('User');
        User.save = function *() {};
        User.update = function *() {
          called = true;
        };

        User.attr('_id');

        var user = yield new User({_id: 1});
        yield user.save();
        expect(called).to.be(true);
      }));

      it('calls allows skipping of validations', co(function *() {
        var called = false;
        var User = new Moko('User').attr('_id');
        User.save = function *() { called = true; };
        User.update = function *() {};
        User.validate(function *(u) {
          u.error('name', 'invalid');
        });
        var user = yield new User();
        yield user.save(true);
        
      }));
    });
  });
});

describe('Moko', function() {
  describe('middleware hooks', function() {
    beforeEach(function() {
      User = new Moko('User');
    });

    it('runs "initializing" middleware on model', co(function *() {
      var called;
      function *middleware(instance, attrs) {
        expect(attrs).to.eql({name: 'Bob'});
        attrs.name = 'Steve';
        called = true;
      }
      User.middleware('initializing', middleware);
      var user = yield new User({name: 'Bob'});
      expect(called).to.be(true);
      expect(user._attrs.name).to.be('Steve');
    }));

  });
});
