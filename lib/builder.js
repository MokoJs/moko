/* jshint esnext: true, noyield: true, proto: true */

var modoBase = require('./base.js'),
    Middleware = require('co-middleware');
    Emitter = require('emitter-component'),
    co = require('co');

module.exports = BuildModo;

function BuildModo(modelName) {
  if(!(this instanceof BuildModo)) return new BuildModo(modelName);

  function Modo(attrs) {
    var self = this;
    return function *() {
      self.model = Modo;
      self._attrs = {};
      Middleware(self);
      Emitter(self);
      yield self.model.run('initialize', self, attrs);
      for(var prop in attrs) {
        if(attrs.hasOwnProperty(prop)) self._attrs[prop] = attrs[prop];
      }
      return self;
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
