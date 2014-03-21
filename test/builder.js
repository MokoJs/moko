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
});
