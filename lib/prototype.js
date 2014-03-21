var clone = require('clone');

function Modo() {}

module.exports = function() {
  return clone(Modo.prototype);
};
