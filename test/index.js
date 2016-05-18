$(function() {
  window.appScope = $.scope.generate();
  var listScope = appScope.generate();
  var showScope = appScope.generate();
  var newScope = appScope.generate();
  var editScope = appScope.generate();

  appScope.MODE = {
    NONE: 'none',
    SHOW: 'show',
    NEW: 'new',
    EDIT: 'edit'
  };

  appScope.init = function() {
    appScope.mode = appScope.MODE.NONE;
    listScope.users = User.query();
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

  $('#list-view .new-user').on('click', function() {
    listScope.showNewUser();
    $.scope.apply();
  });

  listScope.hide('!!users.length', '#list-view .not-found-message');
  listScope.show('!!users.length', '#list-view table');

  var template = $('#list-row-template').html();
  listScope.repeat('users', 'user', function (scope) {
    var $row = $(template);
    scope.watch('user.age < 20', function (childFlg) {
      if (childFlg) $row.addClass('child');
      else $row.removeClass('child');
    });
    scope.bind('user.id', $row.find('.id'));
    scope.bind('user.name', $row.find('.name'));
    scope.bind('user.age', $row.find('.age'));
    $row.find('.show-user').on('click', function() {
      listScope.showUser(scope.user);
      $.scope.apply();
    });
    $row.find('.edit-user').on('click', function() {
      listScope.showEditUser(scope.user);
      $.scope.apply();
    });
    $row.find('.delete-user').on('click', function() {
      listScope.destroyUser(scope.user);
      $.scope.apply();
    });
    return $row;
  }, 'id').appendTo('#list-view table');

  showScope.show('mode === MODE.SHOW', '#show-view');
  showScope.bind('user.id', '#show-view .id');
  showScope.bind('user.name', '#show-view .name');
  showScope.bind('user.age', '#show-view .age');
  showScope.bind('user.memo', '#show-view .memo pre');

  newScope.show('mode === MODE.NEW', '#new-view');
  $('#new-view form')
    .on('submit', function(e) {
      e.preventDefault();
      newScope.create();
      $.scope.apply();
    })
  newScope.watch('user.name', function(v) {if (v !== $('#new-view .name').val()) $('#new-view .name').val(v)});
  $('#new-view .name').on('input change', function() {
    newScope.user.name = $(this).val();
    $.scope.apply();
  });
  newScope.watch('user.age', function(v) {if (v !== $('#new-view .age').val()) $('#new-view .age').val(v)});
  $('#new-view .age').on('input change', function() {
    newScope.user.age = $(this).val();
    $.scope.apply();
  });
  newScope.watch('user.memo', function(v) {if (v !== $('#new-view .memo').val()) $('#new-view .memo').val(v)});
  $('#new-view .memo').on('input change', function() {
    newScope.user.memo = $(this).val();
    $.scope.apply();
  });

  editScope.show('mode === MODE.EDIT', '#edit-view');
  $('#edit-view form')
    .on('submit', function(e) {
      e.preventDefault();
      editScope.update();
      $.scope.apply();
    });
  editScope.bind('user.id', '#edit-view .id');
  editScope.watch('user.name', function(v) {if (v !== $('#edit-view .name').val()) $('#edit-view .name').val(v)});
  $('#edit-view .name').on('input change', function() {
    editScope.user.name = $(this).val();
    $.scope.apply();
  });
  editScope.watch('user.age', function(v) {if (v !== $('#edit-view .age').val()) $('#edit-view .age').val(v)});
  $('#edit-view .age').on('input change', function() {
    editScope.user.age = $(this).val();
    $.scope.apply();
  });
  editScope.watch('user.memo', function(v) {if (v !== $('#edit-view .memo').val()) $('#edit-view .memo').val(v)});
  $('#edit-view .memo').on('input change', function() {
    editScope.user.memo = $(this).val();
    $.scope.apply();
  });

  appScope.init();
  $.scope.apply();
});
