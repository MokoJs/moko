/* jshint esnext: true, noyield: true, proto: true */

var modoBase = require('./base.js'),
    Middleware = require('co-middleware'),
    Emitter = require('emitter-component'),
    co = require('co');

var proto = require('./prototype.js');

module.exports = BuildMoko;

BuildMoko._plugins = [];

BuildMoko.use = function(plugin) {
  BuildMoko._plugins.push(plugin);
};


function BuildMoko(modelName) {
  if(!(this instanceof BuildMoko)) return new BuildMoko(modelName);

  function Moko(attrs) {
    if(Array.isArray(attrs)) { return attrs.map(function(a) { return new Moko(a); }); }
    var self = this;
    return function *() {
      self.model = Moko;
      self._attrs = {};
      self._errors = {};
      self._dirty = {};
      Middleware(self);
      Emitter(self);
      yield self.model.run('initializing', self, attrs);
      for(var prop in attrs) {
        if(attrs.hasOwnProperty(prop)) self._attrs[prop] = attrs[prop];
      }
      return self;
    };
  }


  Moko.modelName = modelName;
  Moko.attrs = {};
  Moko._middlewares = {};
  Moko._validators = [];

  Moko.use = function(plugin) {
    plugin(Moko);
  };

  BuildMoko._plugins.forEach(function(p) {
    Moko.use(p);
  });

  for(var key in proto) {
    if(proto.hasOwnProperty(key)) {
      Moko.prototype[key] = proto[key];
    }
  }


  Moko.__proto__ = Moko.prototype;
  Moko.prototype.__proto__ = BuildMoko.prototype;

  Moko.use(modoBase);

  return Moko;
}
