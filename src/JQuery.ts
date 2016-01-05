/// <reference path="Scope.ts" />

interface JQueryStatic {

  scope: typeof scope.Scope
}

/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {

  $.scope = Scope;
}
