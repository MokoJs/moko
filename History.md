
0.1.4 / 2014-06-03 
==================

 * add default attrs value

0.1.3 / 2014-06-02 
==================

 * fix save emitting change events, 
 * fix dirty not getting reset after save
 * make Model.validate chainable
 * add errors property to the validation failed error [closes #2]
 * fix attrs being set even if they weren't defined [closes #3]

0.1.2 / 2014-05-29 
==================

 * version bump co-emitter
 * add utils to moko
 * revert back to not passing dirty, but instead update this._dirty
 * add support for yieldable plugins
 * fix test scope, add isGenerator util
 * add remove method to prototype
 * add allowing redefinition of attrs

0.1.1 / 2014-05-01 
==================

 * add initialize event
 * switch to co-emitter
 * prevent duplicate error messages
 * prevent plugins from being used twice universally
 * fix bug where global plugins would get used before we had a full Moko

0.1.0 / 2014-04-25 
==================

 * Initial Release
