/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {

  /**
   * Watch of scope.
   * @class scope.Scope
   */
  export class Scope {

    /**
     * Reference to the root scope.
     * @member scope.Scope._root
     * @static
     * @private
     * @type {scope.Scope}
     */
    private static _root: Scope;

    /**
     * Reference to the parent scope.
     * @member scope.Scope#parent
     * @type {scope.Scope}
     */
    parent: Scope = undefined;

    /**
     * Reference to child scopes.
     * @member scope.Scope#children
     * @type {scope.Scope}
     */
    children: Scope[] = [];

    /**
     * Reference to watchers.
     * @member scope.Scope#watchers
     * @private
     * @type {Array}
     */
    private watchers: any[] = [];

    /**
     * "true" after destroy method is called.
     * "false" before that.
     * @member scope.Scope#destroyed
     * @private
     * @type {boolean}
     */
    private destroyed: boolean = false;

    /**
     * Generate a new child scope of the root scope.
     * @method scope.Scope.generate
     * @static
     * @returns {scope.Scope}
     */
    static generate(): Scope {

      return Scope.root.generate();
    }

    /**
     * Registers a apply callback to be executed the value changes.
     * @method scope.Scope.watch
     * @static
     * @param {any} expression
     * @param {(newValue: any, oldValue: any) => void} apply
     * @returns {Function} A deregistration function for this apply.
     */
    static watch(expression: any,
                 apply: (newValue: any, oldValue: any) => void): Function {

      return Scope.root.watch(expression, apply);
    }

    /**
     * Registers a apply callback to be executed the value changes.
     * Shallow watch the properties of an object, and to applied.
     * @method scope.Scope.watchCollection
     * @static
     * @param {any} expression
     * @param {(newValue: any, oldValue: any) => void} apply
     * @returns {Function} A deregistration function for this apply.
     */
    static watchCollection(expression: any,
                           apply: (newValue: any, oldValue: any) => void): Function {

      return Scope.root.watchCollection(expression, apply);
    }

    /**
     * If the values has been changed, it apply.
     * @method scope.Scope.apply
     * @static
     */
    static apply() {

      Scope.root.apply();
    }

    /**
     * Remove all scopes.
     * @method scope.Scope.destroy
     * @static
     */
    static destroy() {

      Scope.root.destroy();
    }

    /**
     * Generate a new child scope.
     * @method scope.Scope#generate
     * @returns {scope.Scope}
     */
    generate(): Scope {

      var scope = <Scope>Object.create(this);

      scope.parent = this;
      scope.children = [];
      scope.watchers = [];
      scope.destroyed = false;

      this.children.push(scope);

      return scope;
    }

    /**
     * Registers a apply callback to be executed the value changes.
     * @method scope.Scope#watch
     * @param {any} expression
     * @param {(newValue: any, oldValue: any) => void} apply
     * @returns {Function} A deregistration function for this apply.
     */
    watch(expression: any,
          apply: (newValue: any, oldValue: any) => void): Function {

      var valueGetter: () => any;
      switch (typeof expression) {
        case 'string': valueGetter = () => this.parse(<string>expression); break;
        case 'function': valueGetter = <() => any>expression; break;
        default: valueGetter = () => expression;
      }

      var watcher = new Watcher(valueGetter, apply);
      this.watchers.push(watcher);

      return () => {

        this.watchers.splice(this.watchers.indexOf(watcher), 1);
      };
    }

    /**
     * Registers a apply callback to be executed the value changes.
     * Shallow watch the properties of an object, and to applied.
     * @method scope.Scope#watchCollection
     * @param {any} expression
     * @param {(newValue: any, oldValue: any) => void} apply
     * @returns {Function} A deregistration function for this apply.
     */
    watchCollection(expression: any,
                    apply: (newValue: any, oldValue: any) => void): Function {

      var valueGetter: () => any;
      switch (typeof expression) {
        case 'string': valueGetter = () => this.parse(<string>expression); break;
        case 'function': valueGetter = <() => any>expression; break;
        default: valueGetter = () => expression;
      }

      var watcher = new CollectionWatcher(valueGetter, apply);
      this.watchers.push(watcher);

      return () => {

        this.watchers.splice(this.watchers.indexOf(watcher), 1);
      };
    }

    /**
     * If the values has been changed, it apply.
     * @method scope.Scope#apply
     */
    apply() {

      if (this.destroyed) return;
      this.watchers.forEach((w: IWatcher) => w.call());
      this.children.forEach((s: Scope) => s.apply());
    }

    /**
     * Remove the current scope (and all of its children) from parent scope.
     * @method scope.Scope#destory
     */
    destroy() {

      if (this.destroyed) return;
      this.destroyed = true;

      $.extend([], this.children).forEach((scope: Scope) => scope.destroy());

      if (this.parent) // If is not the root scope.
        this.parent.children.splice(this.parent.children.indexOf(this), 1);

      this.parent = null;
      this.children = null;
      this.watchers = null;

      if (this === Scope.root) Scope._root = undefined;
    }

    /**
     *
     * @method scope.Scope#repeat
     * @param {any} expression
     * @param {string} valueKey
     * @param {(s: Scope) => JQuery} rowGenerator
     * @param {string} primaryKey
     * @returns {JQuery}
     */
    repeat(expression: any,
           valueKey: string,
           rowGenerator: (s: Scope) => JQuery,
           primaryKey: string): JQuery {

      return Repeater.generate(this, expression, valueKey, rowGenerator, primaryKey);
    }

    /**
     * Parse a expression.
     * @method scope.Scope#parse
     * @private
     * @param {string} expression
     * @returns {any} Value after Parsing.
     */
    private parse(expression: string): any {

      return expression
        .split('.')
        .reduce((o: {}, k: string) => o && o[k], this);
    }

    /**
     * Reference to the root scope.
     * @method scope.Scope.root
     * @static
     * @returns {scope.Scope}
     */
    static get root(): Scope {

      return Scope._root || (Scope._root = new Scope());
    }

    /**
     * Reference to the root scope.
     * @method scope.Scope#root
     * @returns {scope.Scope}
     */
    get root(): Scope {

      return Scope.root;
    }
  }
}
