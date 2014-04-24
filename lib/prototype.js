/* jshint esnext: true, noyield: true */

/**
 * Module deps
 */

var clone = require('./utils/clone.js');

/**
 * Methods
 */

/**
 * Set content of `attrs` to `this._attrs` at once
 *
 * @param {Object} attrs
 * @api public
 */

exports.set = function(attrs) {
  for(var key in attrs) {
    if(this.model.attrs[key]) {
      this[key] = attrs[key];
    }
  }
};

/**
 * Register error `reason` on `attr`.
 *
 * @param {String} attr
 * @param {String} reason
 * @return {Object} self
 * @api public
 */

exports.error = function(attr, reason) {
  this._errors[attr] = this._errors[attr] || [];
  this._errors[attr].push(reason);
  return this;
};

/**
 * Returns an array of errors for `attr`. 
 * If no `attr` specified, returns all errors.
 * If no errors, returns an empty array.
 *
 * @param {String} attr
 * @return {Mixed} errors
 * @api public
 */

exports.errors = function(attr) {
  if(!attr) return clone(this._errors);
  return this._errors[attr] ? clone(this._errors[attr]) : [];
};

/*
 * Return whether or not the instance is valid.
 * If `attr` is specified, returns whether that attr is valid.
 *
 * @param {String} attr
 * @return {Boolean} valid
 * @api public
 */

exports.isValid = function *(attr) {
  var validators = this.model._validators;
  this._errors = {};
  for(var i = 0, val; val = validators[i]; ++i) {
    yield val(this);
  }

  if(attr) {
    return this.errors(attr).length === 0;
  } else {
    return Object.keys(this.errors()).length === 0;
  }
};

/*
 * Gets/Sets the primary key
 * If primary key cannot be determined, throws an error.
 *
 * @param{Mixed} key
 * @return {Mixed}
 * @api public
 */

exports.primary = function(val) {
  if(!this.model._primary) throw new Error('primary key not defined');
  if(val) {
    this[this.model._primary] = val;
  } else {
    return this[this.model._primary];
  }
};

/* Check whether model is new
 *
 * @return {Boolean}
 * @api public
 */

exports.isNew = function() {
  return this.primary() === undefined;
};

/*
 * Return JSON representation of Object
 *
 * @return {Object} JSON
 * @api public
 */

exports.toJSON = function() {
  var dump = {},
      attrs = this._attrs;

  Object.keys(attrs).forEach(function (key) {
    var val = attrs[key];
    dump[key] = !!val.toJSON ? val.toJSON() : clone(val);
  });

  return dump;
};

/*
 * Call save on the sync layer. Will save invalid if `force` is provided.
 *
 * Runs the following middlewares:
 *   - creating/updating
 *   - saving
 *
 * Emits the following events:
 *   - create/update
 *   - save
 *
 * @param {Boolean} force
 * @api public
 */

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
  this.set(body);

  isNew ? emit('create') : emit('update');
  emit('save');

  function emit(task) {
    self.emit(task);
    self.model.emit(task, self);
  }

  function *run(task) {
    data = (yield self.model.run(task, self, data))[1];
    data = yield self.run(task, data);
    return data;
  }

};
