$(function() {
  'use strict';

  var User = (function() {

    function User (param) {

      if (!param) return;
      this.userId = param.userId;
      this.name = param.name;
      this.age = param.age;
    }

    User.data = [];

    User.get = function(userId) {

      return User.data[userId - 1] && new User(User.data[userId - 1]);
    };

    User.query = function() {

      return User.data
        .filter(function(d) { return !!d; })
        .map(function (d) { return new User(d); })
        .sort(function(a, b) { return b.age - a.age; });
    };

    User.destroy = function(userId) {

      delete User.data[userId - 1];
    };

    User.prototype.save = function() {

      this.userId = User.data.length + 1;

      User.data.push({
        userId: this.userId,
        name: this.name,
        age: this.age
      });

      return this;
    };

    User.prototype.update = function() {

      User.data[this.userId - 1] = {
        userId: this.userId,
        name: this.name,
        age: this.age
      };

      return this;
    };

    User.prototype.destroy = function () {

      User.data[this.userId - 1] = undefined;

      return this;
    };

    return User;
  })();

  var AppController = (function() {

    function AppController(scope) {

      this.scope = scope;
      this.scope.appController = this;

      this.listController = new ListController(this.scope.generate());
    }

    AppController.prototype.showNew = function() {

      this.showController = this.editController = null;
      this.newController = new NewController(this.scope.generate());

      this.scope.apply();
    };

    AppController.prototype.show = function(user) {

      this.newController = this.editController = null;
      this.showController = new ShowController(this.scope.generate(), user.userId);

      this.scope.apply();
    };

    AppController.prototype.showEdit = function(user) {

      this.showController = this.newController = null;
      this.editController = new EditController(this.scope.generate(), user.userId);

      this.scope.apply();
    };

    AppController.prototype.destroy = function(user) {

      this.showController = this.newController = this.editController = null;
      user.destroy();

      this.scope.apply();

      this.refresh();
    };

    AppController.prototype.refresh = function () {

      this.listController.refresh();
    };

    return AppController;
  })();

  var ListController = (function() {

    function ListController(scope) {

      this.scope = scope;
      this.scope.listController = this;

      this.users = User.query();
    }

    ListController.prototype.refresh = function () {

      this.users = User.query();
      this.scope.apply();
    };

    return ListController;
  })();

  var ShowController = (function() {

    function ShowController(scope, userId) {

      this.scope = scope;
      this.scope.showController = this;

      this.user = User.get(userId);
    }

    return ShowController;
  })();

  var NewController = (function() {

    function NewController(scope) {

      this.scope = scope;
      this.scope.newController = this;

      this.user = new User({name: 'Taro Yamada', age: '19'});
    }

    NewController.prototype.create = function() {

      this.user.name = this.scope.$nameInput.val();
      this.user.age = this.scope.$ageInput.val();

      this.user.save();
      this.scope.appController.show(this.user);

      this.scope.appController.refresh();
    };

    return NewController;
  })();

  var EditController = (function() {

    function EditController(scope, userId) {

      this.scope = scope;
      this.scope.editController = this;

      this.user = User.get(userId);
    }

    EditController.prototype.update = function() {

      this.user.name = this.scope.$nameInput.val();
      this.user.age = this.scope.$ageInput.val();

      this.user.update();
      this.scope.appController.show(this.user);

      this.scope.appController.refresh();
    };

    return EditController;
  })();

  var AppView = (function() {

    function AppView(scope, elem) {

      this.scope = scope;
      this.elem = elem;
    }

    AppView.render = function (scope, elem) {

      var appView = new AppView(scope, elem);
      appView.render();

      return elem;
    };

    AppView.prototype.render = function () {

      var _this = this;

      this.elem.append([
        $('<button>New</button>')
          .on('click', function() { _this.scope.appController.showNew(); }),
        ListView.render(this.scope.appController.listController.scope, $('<div>')),
        this.generateShow(),
        this.generateNew(),
        this.generateEdit()
      ]);
    };

    AppView.prototype.generateShow = function () {

      var startComment = document.createComment('start show');
      var endComment = document.createComment('end show');

      var $view;
      this.scope.watch('appController.showController', function(newCtrl, ctrl) {

        if (ctrl) {
          ctrl.scope.destroy();
          $view.remove();
        }

        if (!newCtrl) return;
        $view = ShowView.render(newCtrl.scope, $('<div>'));
        $(startComment).after($view);
      });

      return $([startComment, endComment]);
    };

    AppView.prototype.generateNew = function () {

      var startComment = document.createComment('start new');
      var endComment = document.createComment('end new');

      var $view;
      this.scope.watch('appController.newController', function(newCtrl, ctrl) {

        if (ctrl) {
          ctrl.scope.destroy();
          $view.remove();
        }

        if (!newCtrl) return;
        $view = NewView.render(newCtrl.scope, $('<div>'));
        $(startComment).after($view);
      });

      return $([startComment, endComment]);
    };

    AppView.prototype.generateEdit = function () {

      var startComment = document.createComment('start edit');
      var endComment = document.createComment('end edit');

      var $view;
      this.scope.watch('appController.editController', function(newCtrl, ctrl) {

        if (ctrl) {
          ctrl.scope.destroy();
          $view.remove();
        }

        if (!newCtrl) return;
        $view = EditView.render(newCtrl.scope, $('<div>'));
        $(startComment).after($view);
      });

      return $([startComment, endComment]);
    };

    return AppView;
  })();

  var ListView = (function() {

    function ListView(scope, elem) {

      this.scope = scope;
      this.elem = elem;
    }

    ListView.render = function(scope, elem) {

      var listView = new ListView(scope, elem);
      listView.render();

      return elem;
    };
    
    ListView.prototype.render = function () {

      var $notFoundMessage = $('<p>Users are not found.</p>');
      var $table = $('<table border="1">').append([this.generateListHeader(), this.generateList()]);
      this.elem.append([$notFoundMessage, $table]);

      this.scope.watch('listController.users.length', function(size) {

        if (!size) {
          $notFoundMessage.show();
          $table.hide();
          return;
        }

        $notFoundMessage.hide();
        $table.show();
      });
    };

    ListView.prototype.generateListHeader = function () {

      return $('<tr>').append([
        $('<td>Id</td>'),
        $('<td>Name</td>'),
        $('<td>Age</td>'),
        $('<td>')
      ]);
    };

    ListView.prototype.generateList = function () {

      return this.scope.repeat('listController.users', 'user',
        this.generateRow.bind(this), 'userId');
    };

    ListView.prototype.generateRow = function(scope) {

      var $name = $('<td>');
      scope.watch('user.name', function (name) { $name.text(name); });
      var $age = $('<td>');
      scope.watch('user.age', function (age) { $age.text(age); });

      return $('<tr>').append([
        $('<td>').text(scope.user.userId),
        $name,
        $age,
        $('<td>').append([
          $('<button>Show</button>')
            .on('click', function() { scope.appController.show(scope.user) }),
          $('<button>Edit</button>')
            .on('click', function() { scope.appController.showEdit(scope.user) }),
          $('<button>Delete</button>')
            .on('click', function() { scope.appController.destroy(scope.user) })
        ])
      ]);
    };

    return ListView;
  })();

  var ShowView = (function() {

    function ShowView(scope, elem) {

      this.scope = scope;
      this.elem = elem;
    }

    ShowView.render = function(scope, elem) {

      var showView = new ShowView(scope, elem);
      showView.render();

      return elem;
    };

    ShowView.prototype.render = function () {

      $('<dl>')
        .append([
          $('<dt>Id</dt>'),
          $('<dt>').text(this.scope.showController.user.userId),
          $('<dt>Name</dt>'),
          $('<dt>').text(this.scope.showController.user.name),
          $('<dt>Age</dt>'),
          $('<dt>').text(this.scope.showController.user.age)
        ])
        .appendTo(this.elem);
    };

    return ShowView;
  })();

  var NewView = (function() {

    function NewView(scope, elem) {

      this.scope = scope;
      this.elem = elem;
    }

    NewView.render = function(scope, elem) {

      var showView = new NewView(scope, elem);
      showView.render();

      return elem;
    };

    NewView.prototype.render = function () {

      var _this = this;

      this.scope.$nameInput = $('<input type="text">').val(this.scope.newController.user.name);
      this.scope.$ageInput = $('<input type="number">').val(this.scope.newController.user.age);

      $('<form>')
        .on('submit', function(e) { e.preventDefault(); })
        .on('submit', function() { _this.scope.newController.create(); })
        .append([
          $('<dl>').append([
            $('<dt>Name</dt>'),
            $('<dt>').append(this.scope.$nameInput),
            $('<dt>Age</dt>'),
            $('<dt>').append(this.scope.$ageInput)
          ]),
          $('<button>Create</button>')
        ])
        .appendTo(this.elem);
    };

    return NewView;
  })();

  var EditView = (function() {

    function EditView(scope, elem) {

      this.scope = scope;
      this.elem = elem;
    }

    EditView.render = function(scope, elem) {

      var showView = new EditView(scope, elem);
      showView.render();

      return elem;
    };

    EditView.prototype.render = function () {

      var _this = this;

      this.scope.$nameInput = $('<input type="text">').val(this.scope.editController.user.name);
      this.scope.$ageInput = $('<input type="number">').val(this.scope.editController.user.age);

      $('<form>')
        .on('submit', function(e) { e.preventDefault(); })
        .on('submit', function() { _this.scope.editController.update(); })
        .append([
          $('<dl>').append([
            $('<dt>Id</dt>'),
            $('<dt>').append(this.scope.editController.user.userId),
            $('<dt>Name</dt>'),
            $('<dt>').append(this.scope.$nameInput),
            $('<dt>Age</dt>'),
            $('<dt>').append(this.scope.$ageInput)
          ]),
          $('<button>Update</button>')
        ])
        .appendTo(this.elem);
    };

    return EditView;
  })();

  var appController = new AppController($.scope.generate());
  AppView.render(appController.scope, $('#app'));

  $.scope.apply();
});
