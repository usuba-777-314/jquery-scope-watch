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
     * Reference to listeners.
     * @member scope.Scope#listeners
     * @private
     * @type {{}}
     */
    private listeners: {} = {};

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
     * @param {*} expression
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
     * @param {*} expression
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
     * Listens on events of a given type.
     * @method scope.Scope#on
     * @static
     * @param {string} name
     * @param {(args: *, argsN: *) => void} listener
     * @returns {Function} A deregistration function for this apply.
     */
    static on(name: string, listener: (...args: any[]) => void): Function {

      return Scope.root.on(name, listener);
    }

    /**
     * Notice an event 'name' to children scopes.
     * @method scope.Scope#broadcast
     * @param {string} name
     * @param {*} srcArgs, srcArgsN
     */
    static broadcast(name: string, ...srcArgs: any[]) {

      var args = [name];
      srcArgs.forEach((a: any) => args.push(a));
      Scope.root.broadcast.apply(Scope.root, srcArgs);
    }

    /**
     * Notice an event 'name' to parent scopes.
     * @method scope.Scope#emit
     * @param {string} name
     * @param {*} srcArgs, srcArgsN
     */
    static emit(name: string, ...srcArgs: any[]) {

      var args = [name];
      srcArgs.forEach((a: any) => args.push(a));
      Scope.root.emit.apply(Scope.root, srcArgs);
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
      scope.listeners = [];
      scope.destroyed = false;

      this.children.push(scope);

      return scope;
    }

    /**
     * Registers a apply callback to be executed the value changes.
     * @method scope.Scope#watch
     * @param {*} expression
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
     * @param {*} expression
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
     * Listens on events of a given type.
     * @method scope.Scope#on
     * @param {string} name
     * @param {(args: *, argsN: *) => void} listener
     * @returns {Function} A deregistration function for this apply.
     */
    on(name: string, listener: (...args: any[]) => void): Function {

      if (!this.listeners[name]) this.listeners[name] = [];
      this.listeners[name].push(listener);

      return () => {

        var index = this.listeners[name].indexOf(listener);
        if (index === -1) return;
        this.listeners[name].splice(this.listeners[name].indexOf(listener), 1);
      };
    }

    /**
     * Notice an event 'name' to children scopes.
     * @method scope.Scope#broadcast
     * @param {string} name
     * @param {*} args, argsN
     */
    broadcast(name: string, ...args: any[]) {

      if (this.destroyed) return;
      if (this.listeners[name])
        this.listeners[name].forEach((l: Function) => l.apply(null, args));
      this.children.forEach((s: Scope) => s.broadcast(name, args));
    }

    /**
     * Notice an event 'name' to parent scopes.
     * @method scope.Scope#emit
     * @param {string} name
     * @param {*} args, argsN
     */
    emit(name: string, ...args: any[]) {

      if (this.destroyed) return;
      if (this.listeners[name])
        this.listeners[name].forEach((l: Function) => l.apply(null, args));
      this.parent.emit(name, args);
    }

    /**
     * Remove the current scope (and all of its children) from parent scope.
     * @method scope.Scope#destory
     */
    destroy() {

      if (this.destroyed) return;

      var destroy = function(scope) {

        $.extend([], this.children).forEach((s: Scope) => destroy(s));

        scope.destroyed = true;

        if (scope.parent) // If is not the root scope.
          scope.parent.children.splice(scope.parent.children.indexOf(scope), 1);

        scope.parent = null;
        scope.children = null;
        scope.watchers = null;
        scope.listeners = null;
      };

      this.broadcast('destroy');
      destroy(this);
      if (this === Scope.root) Scope._root = undefined;
    }

    /**
     *
     * @method scope.Scope#repeat
     * @param {*} expression
     * @param {string} valueKey
     * @param {(s: Scope) => JQuery} rowGenerator
     * @param {string} primaryKey
     * @returns {JQuery}
     */
    repeat(expression: any,
           valueKey: string,
           rowGenerator: (s: Scope) => JQuery,
           primaryKey: string): JQuery {

      return RepeatWorker.generate(this, expression, valueKey, rowGenerator, primaryKey);
    }

    /**
     * Parse a expression.
     * @method scope.Scope#parse
     * @private
     * @param {string} expression
     * @returns {*} Value after Parsing.
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
