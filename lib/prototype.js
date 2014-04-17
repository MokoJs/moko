exports.set = function(attrs) {
  for(var key in attrs) {
    if(this.model.attrs[key]) {
      this[key] = attrs[key];
    }
  }
};
