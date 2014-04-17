var co = require('co'),
    Emitter = require('emitter-component'),
    Middleware = require('co-middleware');

/* jshint esnext: true */

module.exports = function(Moko) {
  Emitter(Moko);
  Middleware(Moko);

  Moko.attr = function(attr, opts) {
    Moko.attrs[attr] = opts || {};
    Object.defineProperty(Moko.prototype, attr, {
      get: function() {
        return this._attrs[attr];
      },
      set: function(val) {
        var old = this._attrs[attr];
        this._attrs[attr] = val;

        var changed = Array.isArray(val) || typeof val == 'object' || old !== val;
        if(changed) {
          this.model.emit('change', this, attr, val, old);
          this.model.emit('change ' + attr, this, val, old);
          this.emit('change', attr, val, old);
          this.emit('change ' + attr, val, old);
        }
      }
    });
    Moko.emit('attr', attr, opts);
  };
};
