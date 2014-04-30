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

Moko provides two types of events, function based, and generator based.
Generator based events allow you to "hook" in as middleware alter the data and
yield to async operations, while function based hooks are standard event 
listeners that can react to changes.

#### Built in generator events:

Moko will emit the following events with `yieldable` generators...

- `initializing(attrs)`
- `creating(dirty)` - called before save when new
- `saving(dirty)` - called before save
- `updating(dirty)` - called before save when old

Examples:


```js
User.on('initializing', function*(u, attrs) {
  attrs.name = 'Bob';
  return [u, attrs]; // Must return same as called with for chaining
});

var user = yield new User({name: 'Stephen'});
console.log(user.name) // Logs "Bob";
```

```js
User.on('creating', function*(u, dirty) {
  dirty.createdAt = new Date();
  return [u, attrs];
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

### Built in function events:

Function events are emitted after something happens on the model.

Built in events include:

- `change(attr, newVal, oldVal)`
- `change attr(newVal, oldVal)`
- `save`
- `create`
- `update`


```js
User
  .attr('name')
  .attr('email');

User.on('change name', function(u, name, old) {
  console.log("User changed name from %s to %s", old, name);
});

User.on('create', function(u) {
  emails.sendWelcomeEmail(u.email(), function() { }) // anonymous callback fn
});

co(function*() {
  var user = yield new User({name: 'Bob'});
  user.name = 'Steve';
})();
```

## Resources

- [Moko Plugin Creation
  Guide](https://github.com/MokoJs/moko/wiki/Moko-Plugin-Creation-Guide)
- [Moko Plugin List](https://github.com/MokoJs/moko/wiki/Moko-Plugin-List)
