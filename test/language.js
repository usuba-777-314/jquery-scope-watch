window.Language = (function() {
  'use strict';

  function Language (param) {
    if (!param) return;
    this.id = param.id;
    this.name = param.name;
  }

  Language.data = [
    {id: 1, name: 'JavaScript'},
    {id: 2, name: 'Ruby'},
    {id: 3, name: 'Java'}
  ];

  Language.get = function(id) {
    return Language.data[id - 1] && new Language(Language.data[id - 1]);
  };

  Language.query = function() {
    return Language.data
      .filter(function(d) {return !!d})
      .map(function (d) {return new Language(d)});
  };

  return Language;
})();
