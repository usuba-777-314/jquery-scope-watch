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

  listScope.watch('users.length', function (length) {
    if (length) $('#list-view .not-found-message').hide();
    else $('#list-view .not-found-message').show();
  });
  listScope.watch('users.length', function (length) {
    if (length) $('#list-view table').show();
    else $('#list-view table').hide();
  });

  var template = $('#list-row-template').html();
  listScope.repeat('users', 'user', function (scope) {
    var $row = $(template);
    scope.watch('user.age', function (age) {
      if (age < 20) $row.addClass('child');
      else $row.removeClass('child');
    });
    scope.watch('user.id', function(v) {$row.find('.id').text(v || '')});
    scope.watch('user.name', function(v) {$row.find('.name').text(v || '')});
    scope.watch('user.age', function(v) {$row.find('.age').text(v || '')});
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

  showScope.watch('mode', function (mode) {
    if (mode === showScope.MODE.SHOW) $('#show-view').show();
    else $('#show-view').hide();
  });
  showScope.watch('user.id', function(v) {$('#show-view .id').text(v || '')});
  showScope.watch('user.name', function(v) {$('#show-view .name').text(v || '')});
  showScope.watch('user.age', function(v) {$('#show-view .age').text(v || '')});
  showScope.watch('user.memo', function(v) {$('#show-view .memo pre').text(v || '')});

  newScope.watch('mode', function (mode) {
    if (mode === newScope.MODE.NEW) $('#new-view').show();
    else $('#new-view').hide();
  });
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

  editScope.watch('mode', function (mode) {
    if (mode === editScope.MODE.EDIT) $('#edit-view').show();
    else $('#edit-view').hide();
  });
  $('#edit-view form')
    .on('submit', function(e) {
      e.preventDefault();
      editScope.update();
      $.scope.apply();
    })
  editScope.watch('user.id', function(v) {$('#edit-view .id').text(v || '')});
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
