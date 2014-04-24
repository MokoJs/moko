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

exports.primary = function() {
  if(!this.model._primary) throw new Error('primary key not defined');
  return this[this.model._primary];
};

exports.isNew = function() {
  return this.primary() === undefined;
};

exports.save = function *(force) {

  if(!this.model.save || !this.model.update)
    throw new Error("No sync layer provided");

  if(!(yield this.isValid()) && !force)
    throw new Error("validation failed");

  var isNew = this.isNew(),
      self = this,
      data = this._dirty;

  if(isNew) {
    opp = 'save';
    data = yield run('creating')
  } else {
    opp = 'update';
    data = yield run('updating')
  }

  data = yield run('saving');
  var body = yield this.model[opp].call(this);

  function *run(task) {
    data = (yield self.model.run(task, self, data))[1];
    data = yield self.run(task, data);
    return data;
  }

  this.set(body);
};
