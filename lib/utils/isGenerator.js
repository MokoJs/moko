module.exports = function isGenerator(fn) {
  return /^function\s*\*/.test(fn.toString());
};
