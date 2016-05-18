/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to bind value attr of DOM
   * @class scope.AttrWorker
   */
  export class AttrWorker {
    /**
     * Bind value attr of DOM.
     * @method scope.AttrWorker.apply
     * @static
     * @param {scope.Scope} scope
     * @param {*} expression
     * @param {JQuery} $target
     * @param {string} attr
     */
    static apply(scope: Scope, expression: any, $target: JQuery, attr: string) {
      scope.watch(expression, (v) => $target.attr(attr, v || null));
    }
  }
}
