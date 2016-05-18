/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
declare module scope {

  /**
   * Parser instance
   * @interface
   */
  interface IParser {
    /**
     * Return result that parse expression.
     * @param {Scope} scope
     * @return {*} parse result
     */
    (scope: Scope): any;
  }
}
