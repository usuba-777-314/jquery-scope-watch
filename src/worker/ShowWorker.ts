/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to show DOM
   * @class scope.ShowWorker
   */
  export class ShowWorker {
    /**
     * Show DOM, if expression result is true.
     * Otherwise hide DOM.
     * @method scope.ShowWorker.apply
     * @static
     * @param {scope.Scope} scope
     * @param {*} expression
     * @param {JQuery} $target
     */
    static apply(scope: Scope, expression: any, $target: JQuery) {
      scope.watch(expression, (f) => f ? $target.show() : $target.hide());
    }
  }
}
