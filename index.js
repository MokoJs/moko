var Builder = module.exports = require('./lib/builder.js');

Builder.utils = {
  clone: require('./lib/utils/clone.js'),
  isGenerator: require('./lib/utils/isGenerator.js'),
  type: require('./lib/utils/type.js')
};
