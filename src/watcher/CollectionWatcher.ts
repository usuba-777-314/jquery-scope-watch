/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {

  /**
   * Shallow watch the properties of an object, and to applied.
   * @class scope.CollectionWatcher
   */
  export class CollectionWatcher implements IWatcher {

    /**
     * New value.
     * @member scope.Watcher#newValue
     * @private
     * @type {*}
     */
    private newValue: any;

    /**
     * Old value.
     * @member scope.Watcher#oldValue
     * @private
     * @type {*}
     */
    private oldValue: any;

    /**
     * @constructor
     * @param {() => any} valueGetter
     * @param {(newValue: any, oldValue: any) => void} apply
     */
    constructor(private valueGetter: () => any,
                private apply: (newValue: any, oldValue: any) => void) {

    }

    /**
     * Shallow copy a value.
     * @method scope.CollectionWatcher.copy
     * @static
     * @private
     * @param {*} value
     * @returns {*} Value after shallow copying.
     */
    private static copy(value: any): any {

      if (!(value != null && typeof value === 'object')) {
        return value;
      }

      if (Array.isArray(value)) {
        var array = <any[]>[];
        for (var k in value) if (value.hasOwnProperty(k)) array[k] = value[k];
        return array;
      }

      var obj = <any>{};
      for (var k in value) if (value.hasOwnProperty(k)) obj[k] = value[k];
      return obj;
    }

    /**
     * If the value has been changed, it apply.
     * @method scope.CollectionWatcher#call
     */
    call() {

      var value = this.valueGetter();

      this.oldValue = this.newValue;
      this.newValue = CollectionWatcher.copy(this.valueGetter());

      if (!this.isChange()) return;

      this.apply(value, this.oldValue);
    }

    /**
     * Check if the value has been changed.
     * @method scope.CollectionWatcher#isChange
     * @private
     * @returns {boolean} Return "true" if the value has been changed, else "false".
     */
    private isChange(): boolean {

      if (this.newValue == null || this.oldValue == null)
        return this.newValue != this.oldValue;

      if (typeof this.newValue !== 'object' || typeof this.oldValue !== 'object')
        return this.newValue !== this.oldValue;

      return Object.keys(this.newValue).concat(Object.keys(this.oldValue))
        .some((k: string) => this.newValue[k] !== this.oldValue[k]);
    }
  }
}
