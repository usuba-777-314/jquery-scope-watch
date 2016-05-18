/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to hide DOM
   * @class scope.HideWorker
   */
  export class HideWorker {
    /**
     * Hide DOM, if expression result is true.
     * Otherwise show DOM.
     * @method scope.HideWorker.apply
     * @static
     * @param {scope.Scope} scope
     * @param {*} expression
     * @param {JQuery} $target
     */
    static apply(scope: Scope, expression: any, $target: JQuery) {
      scope.watch(expression, (f) => f ? $target.hide() : $target.show());
    }
  }
}
