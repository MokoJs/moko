# Moko

Generator-powered, highly extendible models made for use with
[co](https://github.com/visionmedia/co).

[![Build Status](https://api.travis-ci.org/MokoJs/moko.png)](http://travis-ci.org/MokoJs/moko)


## Installation

```
npm install moko
```

## Example Usage

```js
var moko = require('moko'),
    validators = require('moko-validators'),
    mongo = require('moko-mongo');

var User = require('moko');

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

## Philosophy

`moko` is the spiritual successor to
[modella](http://github.com/modella/modella), updated for use with upcoming ECMA
6 generators.

`moko` provides bare-bones models. By providing powerful hooks and events,
plugins are able to greatly extend functionality.

## Events

Moko provides two types of events, `async` (powered by generators) and `sync`
(powered by functions). `async` events happen before an operation and allow you to mutate the data,
while `sync` events allow you to react to changes. In general, `async` events
end with `ing` (eg. `saving`, `creating`, `initializing`).

Plugin authors are also encouraged to emit their own events to make it easy for
users to hook into the plugins. See the guide below.

#### Built in async events:

Moko will emit the following async events. Notice that you must use generators
for async events, although your generators do not necessarily need to yield
themselves.

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

#### Built in sync events:

Function events are emitted after something happens on the model.

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

## Resources

- [Moko Plugin Creation
  Guide](https://github.com/MokoJs/moko/wiki/Moko-Plugin-Creation-Guide)
- [Moko Plugin List](https://github.com/MokoJs/moko/wiki/Moko-Plugin-List)
