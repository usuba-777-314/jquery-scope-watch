window.User = (function() {
  'use strict';

  function User (param) {
    if (!param) return;
    this.id = param.id;
    this.name = param.name;
    this.age = param.age;
    this.languageId = param.languageId;
    this.memo = param.memo;
  }

  User.data = [];

  User.get = function(id) {
    return User.data[id - 1] && new User(User.data[id - 1]);
  };

  User.query = function(_conditions) {
    var conditions = _conditions || {};
    return User.data
      .filter(function(d) {return !!d})
      .filter(function(d) {return !conditions.name || d.name.indexOf(conditions.name) != -1})
      .filter(function(d) {return !conditions.age || d.age == conditions.age})
      .filter(function(d) {return !conditions.languageId || d.languageId == conditions.languageId})
      .map(function (d) {return new User(d)})
      .sort(function(a, b) {return b.age - a.age});
  };

  User.prototype.save = function() {
    this.id = User.data.length + 1;
    User.data.push({
      id: this.id,
      name: this.name,
      age: this.age,
      languageId: this.languageId,
      memo: this.memo
    });
    return this;
  };

  User.prototype.update = function() {
    User.data[this.id - 1] = {
      id: this.id,
      name: this.name,
      age: this.age,
      languageId: this.languageId,
      memo: this.memo
    };

    return this;
  };

  User.prototype.destroy = function () {
    User.data[this.id - 1] = undefined;
    return this;
  };

  Object.defineProperty(User.prototype, 'language', {
    get: function() {
      return this.languageId != null ? Language.get(this.languageId) : undefined;
    },
    enumerable: true
  });

  return User;
})();
