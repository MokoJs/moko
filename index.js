var Builder = module.exports = require('./lib/builder.js');

Builder.utils = {
  clone: require('./utils/clone.js'),
  isGenerator: require('./utils/isGenerator.js'),
  type: require('./utils/type.js')
};
