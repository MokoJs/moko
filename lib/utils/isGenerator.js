module.exports = function isGenerator(fn) {
  return fn && fn.constructor && 'GeneratorFunction' == fn.constructor.name;
};
