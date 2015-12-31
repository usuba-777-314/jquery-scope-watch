/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope) {
    /**
     * Shallow watch the properties of an object, and to applied.
     * @class scope.CollectionWatcher
     */
    var CollectionWatcher = (function () {
        /**
         * @constructor
         * @param {() => any} valueGetter
         * @param {(newValue: any, oldValue: any) => void} apply
         */
        function CollectionWatcher(valueGetter, apply) {
            this.valueGetter = valueGetter;
            this.apply = apply;
            this.newValue = this.oldValue = CollectionWatcher.copy(this.valueGetter());
        }
        /**
         * Shallow copy a value.
         * @method scope.CollectionWatcher.copy
         * @static
         * @private
         * @param {any} value
         * @returns {any} Value after shallow copying.
         */
        CollectionWatcher.copy = function (value) {
            if (!(value != null && typeof value === 'object')) {
                return value;
            }
            if (Array.isArray(value)) {
                var array = [];
                value.forEach(function (v, i) { return array[i] = v; });
                return array;
            }
            var obj = {};
            for (var k in value)
                if (value.hasOwnProperty(k))
                    obj[k] = value[k];
            return obj;
        };
        /**
         * If the value has been changed, it apply.
         * @method scope.CollectionWatcher#call
         */
        CollectionWatcher.prototype.call = function () {
            var value = this.valueGetter();
            this.oldValue = this.newValue;
            this.newValue = CollectionWatcher.copy(this.valueGetter());
            if (!this.isChange())
                return;
            this.apply(value, this.oldValue);
        };
        /**
         * Check if the value has been changed.
         * @method scope.CollectionWatcher#isChange
         * @private
         * @returns {boolean} Return "true" if the value has been changed, else "false".
         */
        CollectionWatcher.prototype.isChange = function () {
            var _this = this;
            if (!(this.newValue != null && typeof this.newValue === 'object')) {
                return this.newValue !== this.oldValue;
            }
            return Object.keys(this.newValue).concat(Object.keys(this.oldValue))
                .some(function (k) { return _this.newValue[k] !== _this.oldValue[k]; });
        };
        return CollectionWatcher;
    })();
    scope.CollectionWatcher = CollectionWatcher;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_1) {
    /**
     * Watch of scope.
     * @class scope.Scope
     */
    var Scope = (function () {
        function Scope() {
            /**
             * Reference to the parent scope.
             * @member scope.Scope#parent
             * @type {scope.Scope}
             */
            this.parent = undefined;
            /**
             * Reference to child scopes.
             * @member scope.Scope#children
             * @type {scope.Scope}
             */
            this.children = [];
            /**
             * Reference to watchers.
             * @member scope.Scope#watchers
             * @private
             * @type {Array}
             */
            this.watchers = [];
            /**
             * "true" after destroy method is called.
             * "false" before that.
             * @member scope.Scope#destroyed
             * @private
             * @type {boolean}
             */
            this.destroyed = false;
        }
        /**
         * Generate a new child scope of the root scope.
         * @method scope.Scope.generate
         * @static
         * @returns {scope.Scope}
         */
        Scope.generate = function () {
            return this.root.generate();
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * @method scope.Scope.watch
         * @static
         * @param {any} expression
         * @param {(newValue: any, oldValue: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.watch = function (expression, apply) {
            return this.root.watch(expression, apply);
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * Shallow watch the properties of an object, and to applied.
         * @method scope.Scope.watchCollection
         * @static
         * @param {any} expression
         * @param {(newValue: any, oldValue: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.watchCollection = function (expression, apply) {
            return this.root.watchCollection(expression, apply);
        };
        /**
         * If the values has been changed, it apply.
         * @method scope.Scope.apply
         * @static
         */
        Scope.apply = function () {
            this.root.apply();
        };
        /**
         * Remove all scopes.
         * @method scope.Scope.destroy
         * @static
         */
        Scope.destroy = function () {
            this.root.destroy();
        };
        /**
         * Generate a new child scope.
         * @method scope.Scope#generate
         * @returns {scope.Scope}
         */
        Scope.prototype.generate = function () {
            var scope = Object.create(this);
            scope.parent = this;
            this.children.push(scope);
            return scope;
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * @method scope.Scope#watch
         * @param {any} expression
         * @param {(newValue: any, oldValue: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.prototype.watch = function (expression, apply) {
            var _this = this;
            var valueGetter;
            switch (typeof expression) {
                case 'string':
                    valueGetter = function () { return _this.parse(expression); };
                    break;
                case 'Function':
                    valueGetter = expression;
                    break;
                default: valueGetter = function () { return expression; };
            }
            var watcher = new scope_1.Watcher(valueGetter, apply);
            this.watchers.push(watcher);
            return function () {
                _this.watchers.splice(_this.watchers.indexOf(watcher), 1);
            };
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * Shallow watch the properties of an object, and to applied.
         * @method scope.Scope#watchCollection
         * @param {any} expression
         * @param {(newValue: any, oldValue: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.prototype.watchCollection = function (expression, apply) {
            var _this = this;
            var valueGetter;
            switch (typeof expression) {
                case 'string':
                    valueGetter = function () { return _this.parse(expression); };
                    break;
                case 'Function':
                    valueGetter = expression;
                    break;
                default: valueGetter = function () { return expression; };
            }
            var watcher = new scope_1.CollectionWatcher(valueGetter, apply);
            this.watchers.push(watcher);
            return function () {
                _this.watchers.splice(_this.watchers.indexOf(watcher), 1);
            };
        };
        /**
         * If the values has been changed, it apply.
         * @method scope.Scope#apply
         */
        Scope.prototype.apply = function () {
            this.watchers.forEach(function (w) { return w.call(); });
            this.children.forEach(function (s) { return s.apply(); });
        };
        /**
         * Remove the current scope (and all of its children) from parent scope.
         * @method scope.Scope#destory
         */
        Scope.prototype.destroy = function () {
            if (this.destroyed)
                return;
            this.destroyed = true;
            $.extend([], this.children).forEach(function (scope) { return scope.destroy(); });
            if (this.parent)
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            this.parent = null;
            this.children = null;
            this.watchers = null;
            if (this === Scope.root)
                Scope._root = undefined;
        };
        /**
         * Parse a expression.
         * @method scope.Scope#parse
         * @private
         * @param {string} expression
         * @returns {any} Value after Parsing.
         */
        Scope.prototype.parse = function (expression) {
            return expression
                .split('.')
                .reduce(function (o, k) { return o && o[k]; }, this);
        };
        Object.defineProperty(Scope, "root", {
            /**
             * Reference to the root scope.
             * @method scope.Scope.root
             * @static
             * @returns {scope.Scope}
             */
            get: function () {
                return Scope._root || (Scope._root = new Scope());
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Scope.prototype, "root", {
            /**
             * Reference to the root scope.
             * @method scope.Scope#root
             * @returns {scope.Scope}
             */
            get: function () {
                return Scope.root;
            },
            enumerable: true,
            configurable: true
        });
        return Scope;
    })();
    scope_1.Scope = Scope;
})(scope || (scope = {}));
/// <reference path="Scope.ts" />
var scope;
(function (scope) {
    $.scope = scope.Scope;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope) {
    /**
     * Watch a value, and to applied.
     * @class scope.Watcher
     */
    var Watcher = (function () {
        /**
         * @constructor
         * @param {() => any} valueGetter
         * @param {(newValue: any, oldValue: any) => void} apply
         */
        function Watcher(valueGetter, apply) {
            this.valueGetter = valueGetter;
            this.apply = apply;
            this.newValue = this.oldValue = this.valueGetter();
        }
        /**
         * If the value has been changed, it apply.
         * @method scope.Watcher#call
         */
        Watcher.prototype.call = function () {
            this.oldValue = this.newValue;
            this.newValue = this.valueGetter();
            if (!this.isChange())
                return;
            this.apply(this.newValue, this.oldValue);
        };
        /**
         * Check if the value has been changed.
         * @method scope.Watcher#isChange
         * @private
         * @returns {boolean} Return "true" if the value has been changed, else "false".
         */
        Watcher.prototype.isChange = function () {
            return this.newValue !== this.oldValue;
        };
        return Watcher;
    })();
    scope.Watcher = Watcher;
})(scope || (scope = {}));
