/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to call callback where click
   * @class scope.ClickWorker
   */
  export class ClickWorker {
    /**
     * Call callback where click
     * @method scope.ClickWorker.apply
     * @static
     * @param {scope.Scope} scope
     * @param {JQuery} $target
     * @param {string|Function} _callback
     */
    static apply(scope: Scope, $target: JQuery, _callback: string|Function) {
      var callback = ClickWorker.compile(scope, _callback);
      var wrapper = (event: JQueryEventObject) => {
        callback(event);
        $.scope.apply();
      };
      $target.on('click', wrapper);
      scope.on('destroy', () => $target.off('click', wrapper));
    }

    /**
     * Compile expression to callback, if callback is expression.
     * @param {Scope} scope
     * @param {string|Function} callback
     * @returns {Function}
     */
    static compile(scope: Scope, callback: string|Function): Function {
      return typeof callback === 'string'
        ? Parser.generate(<string>callback).bind(null, scope)
        : <Function>callback;
    }
  }
}
