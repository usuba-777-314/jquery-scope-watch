/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to toggle class of DOM
   * @class scope.KlassWorker
   */
  export class KlassWorker {
    /**
     * Add class to DOM, if expression result is true.
     * Otherwise remove class from DOM.
     * @method scope.KlassWorker.apply
     * @static
     * @param {scope.Scope} scope
     * @param {*} expression
     * @param {JQuery} $target
     * @param {string} klass
     */
    static apply(scope: Scope, expression: any, $target: JQuery, klass: string) {
      scope.watch(expression, (f) => f ? $target.addClass(klass) : $target.removeClass(klass));
    }
  }
}
