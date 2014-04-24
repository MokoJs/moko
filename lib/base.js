var co = require('co'),
    Emitter = require('emitter-component'),
    Middleware = require('co-middleware'),
    clone = require('./utils/clone.js');

/* jshint esnext: true */

module.exports = function(Moko) {
  Emitter(Moko);
  Middleware(Moko);

  Moko.validate = function(gen) {
    Moko._validators.push(gen);
  };

  Moko.attr = function(attr, opts) {
    opts = opts || {};
    Moko.attrs[attr] = opts;
    var primaries = ['_id', 'id'];
    if((~primaries.indexOf(attr) && !Moko._primary) || opts.primary)
      Moko._primary = attr;
    Object.defineProperty(Moko.prototype, attr, {
      get: function() {
        return this._attrs[attr];
      },
      set: function(val) {
        var old = this._attrs[attr];
        val = clone(val);

        var changed = Array.isArray(val) || typeof val == 'object' || old !== val;
        if(changed) {
          this._attrs[attr] = val;
          this._dirty[attr] = val;
          this.model.emit('change', this, attr, val, old);
          this.model.emit('change ' + attr, this, val, old);
          this.emit('change', attr, val, old);
          this.emit('change ' + attr, val, old);
        }
      }
    });
    Moko.emit('attr', attr, opts);
    return Moko;
  };
};
