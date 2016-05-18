/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {
  /**
   * Worker to Bind scope value to select value, and bind select value to scope value
   * @class scope.SelectWorker
   */
  export class SelectWorker {
    /**
     * @static
     * @private
     * @member scope.SelectWorker.OPTION_VALUE_KEY
     * @type {string}
     */
    private static OPTION_VALUE_KEY: string = '_select_option_value';

    /**
     * @private
     * @member scope.SelectWorker#scope
     * @type {scope.Scope}
     */
    private scope: Scope;

    /**
     * @private
     * @member scope.SelectWorker#expression
     * @type {string}
     */
    private expression: string;

    /**
     * @private
     * @member scope.SelectWorker#$select
     * @type {JQuery}
     */
    private $select: JQuery;

    /**
     * @private
     * @member scope.SelectWorker#dataExpression
     * @type {string}
     */
    private dataExpression: string;

    /**
     * @private
     * @member scope.SelectWorker#key
     * @type {string}
     */
    private valueKey: string;

    /**
     * @private
     * @member scope.SelectWorker#label
     * @type {string}
     */
    private labelKey: string;

    /**
     * @private
     * @member scope.SelectWorker#value
     * @type {*}
     */
    private value: any;

    /**
     * @private
     * @member scope.SelectWorker#callbacks
     * @type {Array<Function>}
     */
    private callbacks: Array<Function>;

    /**
     * @constructor
     * @param {Scope} scope
     * @param {string} expression
     * @param {JQuery} $select
     * @param {string} dataExpression
     * @param {string} valueKey
     * @param {string} labelKey
     */
    constructor(scope: Scope, expression: string, $select: JQuery,
                dataExpression: string, valueKey?: string, labelKey?: string) {
      this.scope = scope;
      this.expression = expression;
      this.$select = $select;
      this.dataExpression = dataExpression;
      this.valueKey = valueKey;
      this.labelKey = labelKey;
      this.value = NaN;
      this.callbacks = [];
    }

    /**
     * Generate SelectWorker instance.
     * Bind scope value to input value, and bind input value to scope value.
     * @param {Scope} scope
     * @param {string} expression
     * @param {JQuery} $select
     * @param {*} dataExpression
     * @param {string} valueKey
     * @param {string} labelKey
     */
    public static generate(scope: Scope, expression: string, $select: JQuery,
                           dataExpression?: any, valueKey?: string, labelKey?: string): SelectWorker {
      var worker = new SelectWorker(scope, expression, $select, dataExpression, valueKey, labelKey);
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
     * Initialize.
     * @private
     * @method scope.SelectWorker#init
     */
    private init() {
      this.render();
      this.bind();
    }

    /**
     * Render options.
     * @private
     * @method scope.SelectWorker#initRender
     */
    private render() {
      this.scope.repeat(this.dataExpression, 'option', (scope: Scope) => {
        var $option = $('<option>').attr({
          value: this.valueKey != null ? scope['option'][this.valueKey] : scope['option'],
          label: this.labelKey != null ? scope['option'][this.labelKey] : scope['option']
        });
        var valueKey = this.valueKey ? 'option.' + this.valueKey : 'option';
        var labelKey = this.labelKey ? 'option.' + this.labelKey : 'option';
        scope.attr(valueKey, $option, 'value');
        scope.attr(labelKey, $option, 'label');
        scope.watch(valueKey, (v: any) => $option.data(SelectWorker.OPTION_VALUE_KEY, v !== undefined ? v : null));
        return $option;
      }, this.valueKey).appendTo(this.$select);

      this.scope.watch(() => {
        if (this.value !== this.getSelectValue()) this.$select.val(this.value);
      });
    }

    /**
     * Bind scope value to input value, and bind input value to scope value.
     * @private
     * @method scope.SelectWorker#bind
     */
    private bind() {
      this.scope.watch(this.expression, (newValue: any) => {
        if (!this.isChanged(newValue)) return;
        this.$select.val(newValue);
      });

      var setter = Parser.generate(this.expression).assign;
      var inputCallback = (event: JQueryEventObject) => {
        if (!this.isChanged(this.getSelectValue())) return;
        setter(this.scope, this.getSelectValue());
        this.callbacks.forEach((c: Function) => c(event));
        $.scope.apply();
      };
      this.$select.on('change input', inputCallback);
      this.scope.on('destroy', () => this.$select.off('change input', () => {}))
    }

    /**
     * Compile expression to callback, if callback is expression.
     * @method scope.SelectWorker#compile
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
     * @method scope.SelectWorker#isChanged
     * @param {*} value
     * @return {boolean}
     */
    private isChanged(value: any): boolean {
      if (this.value === value) return false;
      this.value = value;
      return true;
    }

    /**
     * Return input value.
     * @method scope.SelectWorker#getSelectValue
     * @return {*}
     */
    private getSelectValue(): any {
      return this.$select.find('option:selected').data(SelectWorker.OPTION_VALUE_KEY);
    }
  }
}
