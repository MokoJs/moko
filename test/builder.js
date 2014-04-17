var Moko = require('../'),
    expect = require('expect.js');

describe('Moko Builder', function() {
  it('returns a Moko', function() {
    var User = new Moko('User');
    expect(User).to.be.a(Moko);
  });

  it('has an optional new keyword', function() {
    var User = Moko('User');
    expect(User).to.be.a(Moko);
  });

  it('sets the Moko name', function() {
    var User = new Moko('User');
    expect(User.modelName).to.be('User');
  });

  it('sets the attrs to an empty object', function() {
    var User = new Moko('User');
    expect(User.attrs).to.eql({});
  });

  it('sets the validators to an empty array', function() {
    var User = new Moko('User');
    expect(User._validators).to.eql([]);
  });

  describe('use', function() {
    it('adds it to the Moko builder-plugins', function() {
      expect(Moko._plugins).to.be.an(Array);
    });

    it('always uses the plugin', function() {
      var count = 0;
      Moko.use(function(Model) {
        count++;
      });

      Moko('User');
      Moko('Person');

      expect(count).to.be(2);
    });
  });
});
