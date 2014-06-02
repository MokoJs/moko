# Moko

Generator-powered, highly extendible models made for use with
[co](https://github.com/visionmedia/co).

[![Build Status](https://api.travis-ci.org/MokoJs/moko.png)](http://travis-ci.org/MokoJs/moko)


# Installation

```
npm install moko
```

# Example Usage

```js
var moko = require('moko'),
    validators = require('moko-validators'),
    mongo = require('moko-mongo');

var User = moko('User');

User
  .attr('_id')
  .attr('name',  { required: true })
  .attr('email', { format: 'email' })

User
  .use(validators)
  .use(mongo('localhost:27017/moko-test'));

co(function*() {
  var user = yield new User();
  user.name = 'Ryan';
  user.email = 'ryan@slingingcode.com';
  yield user.save();
  console.log(user._id);
})();

```

# Table of Contents

- [Philosophy](#philosophy)
- [Events](#events)
- [API Documentation](#api-documentation)
  - [Creating and Configuring Models](#creating-and-configuring-models)

# Philosophy

`moko` is the spiritual successor to
[modella](http://github.com/modella/modella), updated for use with ECMA
6 generators.

`moko` provides bare-bones models and an API to extend them. Plugins are mixed
into models adding functionality as needed. Plugins are easy to write (see the [Moko Plugin Creation 
Guide](https://github.com/MokoJs/moko/wiki/Moko-Plugin-Creation-Guide)) and
readily shared within the moko community (see the [Moko Plugin List](https://github.com/MokoJs/moko/wiki/Moko-Plugin-List))

The organization is open for those who would like to join. Simply reach out to
[Ryan](mailto:ryan@slingingcode.com) and say hi!

# Events

Moko provides two types of events, `async` (powered by generators) and `sync`
(powered by functions). `async` events happen before an operation and allow you to mutate the data,
while `sync` events allow you to react to changes. In general, `async` events
end with `ing` (eg. `saving`, `creating`, `initializing`).

Plugin authors are also encouraged to emit their own events to make it easy for
users to hook into the plugins.

### Built in async events:

Moko will emit the following async events. Notice that you must **use
generators** for async events, although your generators do not necessarily 
need to yield themselves.

- `initializing(attrs)` - called when a model is first initialzed
- `saving(dirty)` - called before save
- `creating(dirty)` - called before save when the model did not exist prior
- `updating(dirty)` - called before save when the model did exist prior

Examples:


```js
User.on('initializing', function*(user, attrs) {
  attrs.name = 'Bob';
});

var user = yield new User({name: 'Stephen'});
console.log(user.name) // Logs "Bob";
```

```js
User.on('creating', function*(user, attrs) {
  attrs.createdAt = new Date();
});

var user = yield new User({name: 'Stephen'});
yield user.save();
```

```js
User.on('saving', function*(u, dirty) {
  var others = yield User.find({name: u.name}).count();
  if(others) throw new Error('Will not save with non-unique name');
});
```

### Built in sync events:

**Function** (not generator) events are emitted after something happens on the model.

Built in events include:

- `initialize(instance)` - called after an instance is done initializing
- `change(attr, newVal, oldVal)` - called when an attr changes
- `change attr(newVal, oldVal)` - called when `attr` changes
- `save` - called after save
- `create` - called after save when model did not exist prior
- `update` - called after save when model did exist prior


```js
User
  .attr('name')
  .attr('email');

User.on('change name', function(user, name, old) {
  console.log("User changed name from %s to %s", old, name);
});


co(function*() {
  var user = yield new User({name: 'Bob'});
  user.name = 'Steve';
})();
```

Fire and forget email sending on user-creation.
```js
User.on('create', function(user) {
  emails.sendWelcomeEmail(u.email, function() { }) // anonymous callback fn
});
```

# API Documentation

## Creating and Configuring Models

### Model Creation

To create a Model, simply call `moko` with the name of the model. If preferred
you can also call `new Moko(name)`.

```js
var moko = require('moko');

var User = moko('User');

User instanceof moko // true
console.log(User.modelName) // => 'User'

// or

var Person = new moko('Person');
```

### Model Configuration

All model configuration methods are chainable.

#### Model.attr(name, opts)

Defines attribute `name` on instances, adding `change` events. (see
[events](#events) below)

`opts` is an object that can be used by plugins.

```js
var User = moko('User');

User
  .attr('name', { required: true })
  .attr('age',  { type: Number });
```

#### Model.validate(fn*)

Adds a validator `fn*(instance)` which can add errors to an instance.

```js
var User = moko('User');.attr('name');

var requireNameSteve = function*(user) {
  if(user.name != 'Steve') user.error('name', 'must be steve');
};

User.validate(requireNameSteve);
```

#### Model.use(plugin)

Configures a model to use a plugin. See the [list of
plugins](https://github.com/MokoJs/moko/wiki/Moko-Plugin-List) or the [plugin
creation guide](https://github.com/MokoJs/moko/wiki/Moko-Plugin-Creation-Guide)
to get started writing your own.

```js
var mongo = require('moko-mongo'),
    validators = require('moko-validators'),
    timestamps = require('moko-timestamps');

var db = yield mongo('mongodb://localhost:27017/moko-test');

User
 .use(db)
 .use(validators)
 .use(timestamps);
```

#### Event Methods

A moko Model mixes in [co-emitter](htts://github.com/rschmukler/co-emitter), see
the full documentation for details. It exposes the following methods:

- `on(event, fn*)` - add a listener for an event
- `once(event, fn*)` - add a one-time listener for an event
- `emit(event, ...args)` - emit an event with `...args`
- `off(event, listener)` - remove a listener for an event
- `removeAllListeners` - removes all listeners
- `hasListeners(event)` - check whether an event has listeners
- `listeners(event)` - get an array of listeners for an event



# Resources

- [Moko Plugin Creation
  Guide](https://github.com/MokoJs/moko/wiki/Moko-Plugin-Creation-Guide)
- [Moko Plugin List](https://github.com/MokoJs/moko/wiki/Moko-Plugin-List)
