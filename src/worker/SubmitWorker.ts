/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to call callback where submit
   * @class scope.SubmitWorker
   */
  export class SubmitWorker {
    /**
     * Call callback where submit
     * @method scope.SubmitWorker.apply
     * @static
     * @param {scope.Scope} scope
     * @param {JQuery} $target
     * @param {string|Function} _callback
     */
    static apply(scope: Scope, $target: JQuery, _callback: string|Function) {
      var callback = SubmitWorker.compile(scope, _callback);
      var wrapper = (event: JQueryEventObject) => {
        event.preventDefault();
        callback(event);
        $.scope.apply();
      };
      $target.on('submit', wrapper);
      scope.on('destroy', () => $target.off('submit', wrapper));
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
