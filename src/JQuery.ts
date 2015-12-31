/// <reference path="Scope.ts" />

interface JQueryStatic {

  scope: typeof scope.Scope
}

module scope {

  $.scope = Scope;
}
