/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {

  /**
   * Parser for expression
   * @class scope.Parser
   */
  export class Parser {
    private static SCOPE: string = 'scope';
    /**
     * Generate parser instance.
     * @param _expression
     * @return {}
     */
    public static generate(_expression: string): IParser {
      var expression = Parser.compile(_expression);
      return (scope: Scope): any => {
        try {
          eval('var ' + Parser.SCOPE + ' = scope');
          return eval(expression);
        } catch (e) {/* Kill exception */}
      }
    }
    
    private static compile(expression: string): string {
      return expression.replace(/[a-zA-Z$_][a-zA-Z$_0-9\.]*/g, (str) => Parser.SCOPE + '.' + str);
    }
  }
}
