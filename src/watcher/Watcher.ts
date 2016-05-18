/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {

  /**
   * Watch a value, and to applied.
   * @class scope.Watcher
   */
  export class Watcher implements IWatcher {

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
     * If the value has been changed, it apply.
     * @method scope.Watcher#call
     */
    call() {

      this.oldValue = this.newValue;
      this.newValue = this.valueGetter();

      if (!this.apply) return;
      if (!this.isChange()) return;

      this.apply(this.newValue, this.oldValue);
    }

    /**
     * Check if the value has been changed.
     * @method scope.Watcher#isChange
     * @private
     * @returns {boolean} Return "true" if the value has been changed, else "false".
     */
    private isChange(): boolean {

      return this.newValue !== this.oldValue;
    }
  }
}
