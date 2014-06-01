/* jshint esnext: true, noyield: true, proto: true */

var mokoBase = require('./base.js'),
    Emitter = require('co-emitter'),
    co = require('co');

var proto = require('./prototype.js'),
    isGenerator = require('./utils/isGenerator.js');

module.exports = BuildMoko;

BuildMoko._plugins = [];

BuildMoko.use = function(plugin) {
  var plugins = BuildMoko._plugins;
  if(!~plugins.indexOf(plugin)) plugins.push(plugin);
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
      Emitter(self);
      yield self.model.emit('initializing', self, attrs);
      for(var prop in attrs) {
        if(attrs.hasOwnProperty(prop) && Moko.attrs[prop]) self._attrs[prop] = attrs[prop];
      }
      self.model.emit('initialize', self);
      return self;
    };
  }


  Moko.modelName = modelName;
  Moko.attrs = {};
  Moko._validators = [];

  Moko.use = function(plugin) {
    if(isGenerator(plugin)) return function *() { yield plugin(Moko) };
    else plugin(Moko);
  };

  for(var key in proto) {
    if(proto.hasOwnProperty(key)) {
      Moko.prototype[key] = proto[key];
    }
  }

  Moko.__proto__ = Moko.prototype;
  Moko.prototype.__proto__ = BuildMoko.prototype;

  Moko.use(mokoBase);

  BuildMoko._plugins.forEach(function(p) {
    Moko.use(p);
  });


  return Moko;
}
