/* jshint esnext: true, noyield: true, proto: true */

var modoBase = require('./base.js'),
    co = require('co');

module.exports = BuildModo;

function BuildModo(modelName) {
  if(!(this instanceof BuildModo)) return new BuildModo(modelName);

  function Modo(attrs) {
    return function(done) {
      var self = this;
      this.model = Modo;
      this.attrs = {};
      this._middlewares = {};
      co(function *() {
        yield self.model.run('initialize', attrs);
      })(function(err) {
        if(done) {
          done(err, self);
        } else {
          if(err) throw err;
        }
      });
    };
  }

  Modo.modelName = modelName;
  Modo._middlewares = {};
  Modo.use = function(plugin) {
    plugin(Modo);
  };

  Modo.__proto__ = Modo.prototype;
  Modo.prototype.__proto__ = BuildModo.prototype;

  Modo.use(modoBase);

  return Modo;
}
