/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to Bind scope value to input value, and bind input value to scope value
   * @class scope.InputWorker
   */
  export class InputWorker {
    /**
     * @private
     * @member scope.InputWorker#scope
     * @type {scope.Scope}
     */
    private scope: Scope;

    /**
     * @private
     * @member scope.InputWorker#expression
     * @type {string}
     */
    private expression: string;

    /**
     * @private
     * @member scope.InputWorker#$input
     * @type {JQuery}
     */
    private $input: JQuery;

    /**
     * @private
     * @member scope.InputWorker#value
     * @type {*}
     */
    private value: any;

    /**
     * @private
     * @member scope.InputWorker#callbacks
     * @type {Array<Function>}
     */
    private callbacks: Array<Function>;

    /**
     * @constructor
     * @param {Scope} scope
     * @param {string} expression
     * @param {JQuery} $input
     */
    constructor(scope: Scope, expression: string, $input: JQuery) {
      this.scope = scope;
      this.expression = expression;
      this.$input = $input;
      this.callbacks = [];
    }

    /**
     * Generate InputWorker instance.
     * Bind scope value to input value, and bind input value to scope value.
     * @param {Scope} scope
     * @param {string} expression
     * @param {JQuery} $input
     */
    public static generate(scope: Scope, expression: string, $input: JQuery): InputWorker {
      var worker = new InputWorker(scope, expression, $input);
      worker.init();
      return worker;
    }

    /**
     * Call callback when change.
     * @param {string|Function} callback
     */
    public change(callback: string|Function) {
      this.callbacks.push(this.compile(callback));
    }

    /**
     * Initialize "input event/watch event".
     * Bind scope value to input value, and bind input value to scope value.
     * @private
     * @method scope.InputWorker#init
     */
    private init() {
      this.scope.watch(this.expression, (newValue: any) => {
        if (!this.isChanged(newValue)) return;
        this.$input.val(newValue);
      });

      var setter = Parser.generate(this.expression).assign;
      var inputCallback = (event: JQueryEventObject) => {
        if (!this.isChanged(this.$input.val())) return;
        setter(this.scope, this.$input.val());
        this.callbacks.forEach((c: Function) => c(event));
        $.scope.apply();
      };
      this.$input.on('change input', inputCallback);
      this.scope.on('destroy', () => this.$input.off('change input', () => {}))
    }

    /**
     * Compile expression to callback, if callback is expression.
     * @method scope.InputWorker#compile
     * @param {string|Function} callback
     * @returns {Function}
     */
    private compile(callback: string|Function): Function {
      return typeof callback === 'string'
        ? Parser.generate(<string>callback).bind(null, this.scope)
        : <Function>callback;
    }

    /**
     * If value was change, return true.
     * Otherwise return false.
     * @method scope.InputWorker#isChanged
     * @param {*} value
     * @return {boolean}
     */
    private isChanged(value: any): boolean {
      if (this.value === value) return false;
      this.value = value;
      return true;
    }
  }
}
