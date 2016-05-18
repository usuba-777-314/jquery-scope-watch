/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to bind value to DOM text
   * @class scope.BindWorker
   */
  export class BindWorker {
    /**
     * Bind value to DOM text.
     * Value is parse expression result.
     * @method scope.BindWorker.apply
     * @static
     * @param {scope.Scope} scope
     * @param {*} expression
     * @param {JQuery} $target
     */
    static apply(scope: Scope, expression: any, $target: JQuery) {
      scope.watch(expression, (v) => $target.text(v != null ? v : ''));
    }
  }
}
