# Moko

Generator-powered, highly extendible models made for use with
[co](https://github.com/visionmedia/co).


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

## Hooks and Events

Moko provides two ways for plugins/applications to monitor the models: Hooks,
and events.

### Hooks

Hooks are [middlewares](http://github.com/rschmukler/co-middleware)
and allow interception/mutation of data before it is used. Hooks are generator 
functions and can therefor be async (using `yield` keyword). Built in hooks
include:

- `initializing` - run when an instance is instantiated
- `creating`, `updating`, and `saving` - run when an instance is saved (always
  `saving` and `updating` or `creating` as appropriate.

Example:

```js
User
  .attr('firstName')
  .attr('lastName')
  .attr('familyMembers')

User.middleware('saving', function*(u) {
  u.familyMembers = yield User.db.count({lastName: u.lastName});
});
```


### Events

Events are emitted *after* something happens on the model. Built in events
include:

- `save`, `create`, `update`
- `change`, and `change <attr>`

Example:

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
