$(function() {
  window.appScope = $.scope.generate();
  var conditionsScope = appScope.generate();
  var listScope = appScope.generate();
  var showScope = appScope.generate();
  var newScope = appScope.generate();
  var editScope = appScope.generate();

  appScope.MODE = {NONE: 'none', SHOW: 'show', NEW: 'new', EDIT: 'edit'};

  appScope.init = function() {
    conditionsScope.conditions = {};
    appScope.mode = appScope.MODE.NONE;
    listScope.users = User.query();
  };

  appScope.search = function() {
    listScope.users = User.query(conditionsScope.conditions);
  };

  appScope.showNewUser = function() {
    appScope.mode = appScope.MODE.NEW;
    newScope.user = new User({name: 'Taro Yamada', age: '19'});
  };

  appScope.showUser = function(user) {
    appScope.mode = appScope.MODE.SHOW;
    showScope.user = user;
  };

  appScope.showEditUser = function(user) {
    appScope.mode = appScope.MODE.EDIT;
    editScope.user = User.get(user.id);
  };

  appScope.destroyUser = function(user) {
    user.destroy();
    appScope.init();
  };

  newScope.create = function() {
    newScope.user.save();
    appScope.init();
    appScope.showUser(newScope.user);
  };

  editScope.update = function() {
    editScope.user.update();
    appScope.init();
    appScope.showUser(editScope.user);
  };

  conditionsScope.input('conditions.name', '#conditions-view .name').change('search()');
  conditionsScope.input('conditions.age', '#conditions-view .age').change('search()');

  listScope.hide('!!users.length', '#list-view .not-found-message');
  listScope.show('!!users.length', '#list-view .list');
  var template = $('#list-row-template').html();
  listScope.repeat('users', 'user', function (scope) {
    var $row = $(template);
    scope.klass('user.age < 20', $row, 'child');
    scope.bind('user.id', $row.find('.id'));
    scope.bind('user.name', $row.find('.name'));
    scope.bind('user.age', $row.find('.age'));
    scope.click($row.find('.show-user'), 'showUser(user)');
    scope.click($row.find('.edit-user'), 'showEditUser(user)');
    scope.click($row.find('.delete-user'), 'destroyUser(user)');
    return $row;
  }, 'id').appendTo('#list-view .list');
  listScope.click('#list-view .new-user', 'showNewUser()');

  showScope.show('mode === MODE.SHOW', '#show-view');
  showScope.bind('user.id', '#show-view .id');
  showScope.bind('user.name', '#show-view .name');
  showScope.bind('user.age', '#show-view .age');
  showScope.bind('user.memo', '#show-view .memo pre');

  newScope.show('mode === MODE.NEW', '#new-view');
  newScope.submit('#new-view form', 'create()');
  newScope.input('user.name', '#new-view .name');
  newScope.input('user.age', '#new-view .age');
  newScope.input('user.memo', 'input change');

  editScope.show('mode === MODE.EDIT', '#edit-view');
  editScope.submit('#edit-view form', 'update()');
  editScope.bind('user.id', '#edit-view .id');
  editScope.input('user.name', '#edit-view .name');
  editScope.input('user.age', '#edit-view .age');
  editScope.input('user.memo', '#edit-view .memo');

  appScope.init();
  $.scope.apply();
});
