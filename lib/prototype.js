/* jshint esnext: true, noyield: true */

exports.set = function(attrs) {
  for(var key in attrs) {
    if(this.model.attrs[key]) {
      this[key] = attrs[key];
    }
  }
};

exports.error = function(name, reason) {
  this._errors[name] = this._errors[name] || [];
  this._errors[name].push(reason);
};

exports.errors = function(name) {
  if(!name) return this._errors;
  return this._errors[name] || [];
};

exports.isValid = function *(field) {
  var validators = this.model._validators;
  this._errors = {};
  for(var i = 0, val; val = validators[i]; ++i) {
    yield val(this);
  }

  if(field) {
    return this.errors(field).length === 0;
  } else {
    return Object.keys(this.errors()).length === 0;
  }
};
